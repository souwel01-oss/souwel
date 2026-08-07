"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient background treatment for the dark navy sections (hero, video, footer).
 *
 * Slowly drifting radial "orbs" in Brand Blue and Warm Gold, and nothing else.
 * An earlier version also layered a fine grid pattern and a glowing dot field
 * over this; both were removed at the client's request because the 1px rules
 * read as visible boxes against the navy rather than as texture.
 *
 * Deliberate choices:
 * - Orbs are radial-gradient backgrounds, NOT `filter: blur()` on solid circles.
 *   A large blur radius is one of the most expensive things you can ask a mobile
 *   GPU to composite every frame; a gradient is free and looks identical here.
 * - Parallax is a single passive scroll listener, rAF-coalesced, gated behind an
 *   IntersectionObserver so it does no work while the section is off screen. It
 *   writes one CSS variable; the transforms themselves stay on the compositor.
 * - Everything is decorative: aria-hidden, pointer-events-none, and it never
 *   carries content or contrast-critical colour.
 *
 * Reduced motion: the parallax listener is never attached and the drift/pulse
 * animations are disabled in CSS, leaving the static texture only.
 */

type Variant = "hero" | "section" | "footer";

type Orb = {
  tone: "blue" | "gold";
  /** Inline placement — kept here rather than in CSS so variants stay readable. */
  style: React.CSSProperties;
  /** Which of the three drift keyframes to use, so orbs never move in sync. */
  drift: 1 | 2 | 3;
};

/**
 * Orb placement. Offsets are kept modest and asymmetric on purpose:
 * - modest, because a heavy bleed puts the orb's bright middle right where the
 *   section boundary cuts, and even with the container's fade mask that wastes
 *   most of the glow off-canvas;
 * - asymmetric, because three orbs on a regular grid read as a pattern rather
 *   than as atmosphere.
 * Footer orbs are deliberately smaller — the footer is roughly a third the
 * height of the hero, and hero-sized orbs there flood it instead of glowing.
 */
const ORBS: Record<Variant, Orb[]> = {
  hero: [
    {
      tone: "blue",
      drift: 1,
      style: { width: "clamp(20rem, 58vw, 48rem)", top: "-14%", left: "-6%" },
    },
    {
      tone: "gold",
      drift: 2,
      style: { width: "clamp(15rem, 42vw, 35rem)", bottom: "-16%", right: "-2%" },
    },
    {
      tone: "blue",
      drift: 3,
      style: { width: "clamp(13rem, 34vw, 28rem)", top: "30%", right: "22%" },
    },
  ],
  section: [
    {
      tone: "blue",
      drift: 2,
      style: { width: "clamp(17rem, 48vw, 40rem)", top: "-12%", right: "-4%" },
    },
    {
      tone: "gold",
      drift: 1,
      style: { width: "clamp(14rem, 36vw, 29rem)", bottom: "-14%", left: "2%" },
    },
  ],
  footer: [
    {
      tone: "gold",
      drift: 3,
      style: { width: "clamp(12rem, 30vw, 24rem)", top: "-18%", left: "14%" },
    },
    {
      tone: "blue",
      drift: 1,
      style: { width: "clamp(14rem, 34vw, 28rem)", bottom: "-20%", right: "4%" },
    },
  ],
};

export function Atmosphere({ variant = "section" }: { variant?: Variant }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let onScreen = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // -0.5 .. 0.5 as the section's midpoint crosses the viewport midpoint.
      const progress =
        (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight || 1);
      // Background drifts against the scroll direction, slower than content.
      el.style.setProperty("--atmo-y", `${(progress * 52).toFixed(1)}px`);
    };

    const schedule = () => {
      if (onScreen && !frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) schedule();
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="atmosphere">
      <div className="atmo-layer atmo-layer-back">
        {ORBS[variant].map((orb, i) => (
          <span
            key={i}
            className={`atmo-orb atmo-orb-${orb.tone} atmo-drift-${orb.drift}`}
            style={orb.style}
          />
        ))}
      </div>
    </div>
  );
}
