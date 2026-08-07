"use client";

import { useRef, useState } from "react";
// `gsap` itself is no longer imported: the dissolve moved to CSS, so all that
// is left here is ScrollTrigger.refresh() and useGSAP for scoped cleanup.
import { ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { INTRO_DONE } from "@/lib/animation/intro";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";

/**
 * Branded intro overlay.
 *
 * Full-screen fabric footage, the wordmark fades and scales up over it, a short
 * hold, then the whole thing dissolves away and the homepage is live underneath.
 *
 * WHY A LOCAL <video> AND NOT THE HERO'S YOUTUBE EMBED. The hero background is
 * a YouTube iframe, and that embed needs roughly two seconds before it paints
 * anything — the hero fades it in on a 2200ms timer for exactly that reason.
 * This whole sequence is under three seconds, so an iframe would still be blank
 * when the overlay was already dissolving. A small local MP4 starts on the first
 * frames it receives.
 *
 * THE FILE IS KEPT DELIBERATELY SMALL — 232KB, 1280x720, 3.2s. It was 520KB and
 * 4.5s, and that cost real time: because `preload="auto"` pulls it down at the
 * very start of the page, it competed with the CSS and fonts on the critical
 * path. Blocking it in a controlled run moved first contentful paint from 1320ms
 * to 596ms. Two things made the shrink free rather than a trade:
 *   - the sequence ends at ~3.05s and the video loops, so the last 1.3s of a
 *     4.5s file could never be seen by anyone
 *   - it plays under a 55% ivory scrim and dissolves through an 8px blur, so
 *     the extra bitrate was being spent on detail nothing could resolve
 * Compared frames from both encodes side by side before committing to this.
 *
 * WHY IT DOES NOT COST LCP — this is not a loader. Nothing is being waited on;
 * the homepage renders underneath at full speed and this only covers it. The
 * video is `preload="auto"` because it has under three seconds to be useful,
 * but it is never blocking: the poster is the fallback for every case where the
 * footage is not ready, unsupported, or refused.
 *
 * Gates, all decided by the pre-paint script in app/layout.tsx:
 *   - homepage only        (an intro on /login is just a delay)
 *   - not prefers-reduced-motion
 *   - never on client-side route changes — the script runs on document load
 *
 * There is deliberately NO once-per-session gate: this plays on every load and
 * every refresh, by request. That is also why the sequence is kept under three
 * seconds — a repeat visitor sees it every single time.
 *
 * Two independent failsafes clear it: a timeout in that same script at 4.5s,
 * and a CSS animation at 4.7s if even setTimeout never fires.
 */

/**
 * THESE TWO NUMBERS MIRROR THE CSS — they do not drive it.
 *
 * The dissolve is a CSS animation on `.intro-video` (see globals.css), because
 * a JS timeline cannot start until React has hydrated, and that made slower
 * devices wait longer: walking the site on a 4x-throttled CPU, the page painted
 * at ~0.5s and was then held behind the overlay until 3.9s, against ~3.0s on a
 * fast machine. Punishing the slow device is exactly backwards.
 *
 * JS now only listens for the animation to end and cleans up. If these values
 * drift from the CSS the animationend listener still fires correctly and only
 * the INTRO_DONE hand-off timing would be off, so keep them in step.
 */
const DISSOLVE_AT = 2.0;

/** Length of the cross-fade out. Matches the `intro-out` duration in CSS. */
const DISSOLVE = 0.8;

export function IntroVideo() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // Removed from the DOM once finished, not merely hidden — a leftover fixed
  // full-screen node is the kind of thing that turns up months later
  // swallowing clicks.
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.hasAttribute("data-intro")) return;

      // `autoPlay` on the element covers the normal case. This is the backstop
      // for browsers that decline the attribute but allow a muted programmatic
      // play; a rejection is fine and expected, and leaves the poster showing.
      video.current?.play().catch(() => {});

      const finish = () => {
        // This one attribute hides the overlay, releases the scroll lock and
        // stops the CSS failsafe. It comes off before React unmounts so there
        // is no frame where the finished overlay is still painted.
        html.removeAttribute("data-intro");
        setDone(true);
        // Scroll was locked while the overlay was up, so every ScrollTrigger
        // start point was measured against a locked page.
        ScrollTrigger.refresh();
      };

      // Hand the page over as the dissolve STARTS, not when it ends, so the
      // hero's entrance plays through the fade and the page reads as arriving
      // rather than waiting. Anchored to navigation start, matching the CSS
      // animation-delay; if hydration already overran it this is 0 and the
      // hand-off happens immediately, which is correct — the overlay is on its
      // way out either way.
      const release = () => {
        window.dispatchEvent(new Event(INTRO_DONE));
        // Clicks pass through the moment the overlay starts leaving.
        if (root.current) root.current.style.pointerEvents = "none";
      };
      const releaseIn = Math.max(0, DISSOLVE_AT * 1000 - performance.now());
      const releaseTimer = window.setTimeout(release, releaseIn);

      // The CSS animation is the source of truth for when the overlay is gone.
      // Listening for it rather than running our own timer means the two can
      // never disagree, however long hydration took to get here.
      const onEnd = (e: AnimationEvent) => {
        if (e.animationName === "intro-out") finish();
      };
      root.current?.addEventListener("animationend", onEnd);

      // Backstop, in case this component mounts after the animation has already
      // ended and the event was missed entirely — on a slow enough device that
      // is a real possibility, and without this the overlay would sit at
      // opacity 0 still holding the scroll lock until the 4.5s script failsafe.
      const sweep = window.setTimeout(
        finish,
        Math.max(0, (DISSOLVE_AT + DISSOLVE) * 1000 + 150 - performance.now())
      );

      // Cleanup releases timers and listeners and NOTHING ELSE. It deliberately
      // does not touch `data-intro`: React runs effects twice on mount in
      // development, and an earlier version stripped the attribute in cleanup,
      // so the first teardown killed the intro part-way and the second run then
      // saw no attribute and bailed. The sequence never played.
      return () => {
        window.clearTimeout(releaseTimer);
        window.clearTimeout(sweep);
        root.current?.removeEventListener("animationend", onEnd);
      };
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div ref={root} className="intro-video" aria-hidden>
      {/* muted is not optional — browsers refuse to autoplay audible media, and
          playsInline stops iOS taking it fullscreen. `poster` is the static
          fallback for a failed load, a missing codec, or a refused autoplay. */}
      <video
        ref={video}
        className="intro-video-media"
        src="/videos/intro.mp4"
        poster="/videos/intro-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      />

      <span aria-hidden className="intro-video-scrim" />

      {/* The supplied wordmark, with "Textile" set beneath it rather than
          inside it — the artwork reads "SOUWEL" only, and adding a word to a
          client's logo is not something to do silently. This keeps the lockup
          the brief asked for while leaving the mark itself untouched. */}
      <div className="intro-word">
        <SouwelLogo height={64} priority />
        <span className="intro-word-sub">Textile</span>
      </div>
    </div>
  );
}
