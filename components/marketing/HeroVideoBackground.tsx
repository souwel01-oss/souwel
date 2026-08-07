"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Full-bleed YouTube background video for the hero.
 *
 * Deliberate constraints, in priority order:
 *
 * 1. LCP and main thread — the poster <Image> paints immediately and is the LCP
 *    element. The YouTube player costs ~1.2MB and, measured on this page, ~900ms
 *    of main-thread blocking, so when it mounts is the single biggest
 *    performance decision on the homepage. See MOUNT GATES below.
 * 2. Contrast — the source footage is pale fabric. A navy scrim is layered on
 *    top so hero text keeps its WCAG AA ratio regardless of the frame behind it.
 *    Do not weaken the scrim without re-measuring contrast.
 * 3. prefers-reduced-motion — the player is never mounted at all; those visitors
 *    get the still poster, which is the whole point of the preference.
 *
 * Playback is autoplay + loop + muted + inline, with no controls of any kind:
 * the iframe is built with controls=0 and disablekb=1, takes tabIndex={-1} so it
 * is not reachable by keyboard, and sits under a pointer-events-none wrapper so
 * clicks pass straight through to the page.
 *
 * NOTE — WCAG 2.2.2: this was previously accompanied by a pause/play button,
 * because auto-playing motion that runs longer than five seconds is supposed to
 * be pausable. That button was removed by explicit request. The reduced-motion
 * branch below is now the only accommodation left, and it only helps visitors
 * who have set that OS preference. See the note in the commit/PR description.
 */

type Props = {
  videoId: string;
  /** Describes the footage for assistive tech. */
  label: string;
};

/** How long the player is held invisible after mounting, in ms.
 *
 *  `controls=0` removes YouTube's control BAR, but the embed still paints its
 *  own loading chrome — a centre play/pause cluster — for a moment before
 *  playback begins. On a hero that is supposed to have no visible controls at
 *  all, that cluster is plainly visible, sitting in the middle of the headline.
 *
 *  So the iframe fades up only once playback is actually under way. The poster
 *  underneath is a frame of the same footage, so there is nothing to see during
 *  the wait and nothing to shift when it ends.
 *
 *  The number is empirical — without `enablejsapi` there is no playback event to
 *  listen for, and enabling it purely to time a fade would mean shipping the
 *  YouTube iframe API for one callback. 1100ms was not enough; the chrome was
 *  still on screen at 62% opacity. Measured this value against the real embed.
 *
 *  KNOWN, ACCEPTED: a brief darkening as the player composites in. Sampling mean
 *  brightness of the least-scrimmed corner of the hero, the poster reads ~78 and
 *  there is a single sub-400ms dip to ~44 at the instant the iframe reaches full
 *  opacity, then it settles at ~75.
 *
 *  Deferring the mount behind the intro gate is what exposed this — the fade used
 *  to complete at ~2.4s, underneath an overlay that does not clear until ~3.05s,
 *  so the overlay was hiding it rather than this timer being right.
 *
 *  Do not try to fix it by raising this number. Tested at 3400ms: the dip moved
 *  with the fade instead of disappearing, which places it at the iframe's first
 *  composite rather than at buffering, and left the hero on a static poster for
 *  six seconds for no gain. Some of it may not even be real — a cross-origin
 *  iframe captured mid-composite is exactly the case where a screenshot shows
 *  black that a viewer never sees. Reverted to the value measured against the
 *  control chrome, which is the thing this delay actually exists for. */
const PLAYER_FADE_DELAY = 2200;

/**
 * Below this viewport width the player is never mounted — the poster is the
 * whole hero background on phones and small tablets.
 *
 * This is a real design decision, not a silent downgrade, and the reason it is
 * defensible is the scrim. Two layers sit over this footage: a horizontal
 * gradient from 95% to 60% navy, plus a flat 35% navy wash. On the left, where
 * the copy sits, that is ~97% opaque — the video is essentially invisible
 * there. Only the right-hand end of the hero ever shows about a quarter of the
 * frame, and a phone hero is almost entirely the heavy left end.
 *
 * So on a phone the embed costs ~1.2MB of cellular data and ~900ms of blocking
 * on a slower CPU, to move pixels that are ~97% covered. Raise this to 0 to put
 * the player back on every screen.
 */
const PLAYER_MIN_WIDTH = 1024;

/**
 * When the player mounts, in seconds from navigation start.
 *
 * Sits just past first contentful paint (measured at ~430-500ms on this page)
 * so the embed never competes for the first frame, and early enough that it has
 * the whole intro to load. See the reasoning in the effect below.
 */
const MOUNT_AT = 0.8;

/** True when the visitor has asked for less data, or is on a slow connection. */
function connectionIsExpensive(): boolean {
  // Non-standard but widely supported on the Android/Chrome side, which is
  // exactly where a 1.2MB decorative embed hurts most. Absent on Safari and
  // Firefox, where this simply returns false and nothing changes.
  const c = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!c) return false;
  if (c.saveData) return true;
  return c.effectiveType === "slow-2g" || c.effectiveType === "2g" || c.effectiveType === "3g";
}

export function HeroVideoBackground({ videoId, label }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // MOUNT GATES. Each one is a case where the player's cost is certain and
    // its benefit is not.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < PLAYER_MIN_WIDTH) return;
    if (connectionIsExpensive()) return;

    let cancelIdle: (() => void) | undefined;

    // MOUNT JUST AFTER FIRST PAINT — not on load, and not after the intro.
    //
    // Both extremes were measured and both were wrong.
    //
    // Mounting immediately (the original) put ~1.2MB of YouTube on the wire in
    // the window the browser needed for first paint: blocking the embed in a
    // controlled run cut FCP from 1320ms to 824ms and main-thread blocking from
    // 1047ms to 120ms.
    //
    // Waiting for the intro to finish (the overcorrection) fixed that but made
    // the hero itself feel dead. Timing the hero's own elements: heading
    // readable at 431ms, intro cleared at ~2970ms — and the video did not
    // appear until 4676ms. Nearly five seconds of still poster on the one
    // section that is meant to be alive.
    //
    // The right window is between the two. First paint is done by ~500ms, so
    // from there the embed costs nothing anyone is waiting on, and it gets the
    // whole length of the intro to boot — main-thread work spent behind an
    // overlay the visitor cannot interact with, and which is now a CSS
    // animation on the compositor, so that work cannot jank it either.
    //
    // Anchored to navigation start rather than to whenever this effect happens
    // to run, so slow hydration cannot push it late again.
    const start = () => setMounted(true);

    const kick = window.setTimeout(
      () => {
        // A short idle window so it lands between frames rather than on top of
        // one. The timeout is deliberately small: the schedule above is the
        // decision, and requestIdleCallback is only smoothing it.
        const ric = (window as Window).requestIdleCallback as
          typeof window.requestIdleCallback | undefined;

        if (typeof ric === "function") {
          const id = ric(start, { timeout: 300 });
          cancelIdle = () => window.cancelIdleCallback?.(id);
        } else {
          start();
        }
      },
      Math.max(0, MOUNT_AT * 1000 - performance.now())
    );

    return () => {
      window.clearTimeout(kick);
      cancelIdle?.();
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => setVisible(true), PLAYER_FADE_DELAY);
    return () => window.clearTimeout(id);
  }, [mounted]);

  // autoplay + mute is a pair: browsers refuse to autoplay unmuted media.
  // loop needs `playlist` set to the same id — that is how the YouTube embed
  // expresses a single-video loop. controls=0 and disablekb=1 remove the
  // player's own UI and keyboard handling.
  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}` +
    `&playsinline=1&modestbranding=1&rel=0&disablekb=1`;

  return (
    <>
      <div
        aria-hidden
        className="hero-video-frame pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Poster — paints first (LCP), and is the fallback on slow connections
            or while the player is still loading. object-cover, never distorted. */}
        <Image
          src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* 16:9 player, center-cropped to fill the hero box with no gaps or
            distortion. Sizing lives in .hero-video-cover (container units). */}
        {mounted && (
          <div
            className={`hero-video-cover transition-opacity duration-700 ease-[var(--ease-out)] ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <iframe
              className="h-full w-full"
              src={src}
              title={label}
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        )}
      </div>

      {/* Contrast scrim. Heavier on the left, where the copy sits.
          Measured to keep hero text at AA over the brightest frames. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A2540]/95 via-[#0A2540]/80 to-[#0A2540]/60"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0A2540]/35" />
    </>
  );
}
