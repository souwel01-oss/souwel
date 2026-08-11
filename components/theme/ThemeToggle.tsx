"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { useTheme } from "next-themes";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle.
 *
 * ONE SHAPE, NOT TWO ICONS. The sun and the moon are the same circle: a second
 * circle rides in from the top-right and is punched out of it by an SVG mask,
 * which turns the disc into a crescent, while eight rays retract into the
 * centre. Crossfading two separate glyphs is the usual approach and it always
 * reads as a swap; this reads as the same object changing state, which is what
 * the change actually is.
 *
 * The mask id is per-instance (useId): the toggle renders in both the header
 * and the dashboard, and duplicate SVG ids in one document silently make every
 * copy use the first one's mask.
 */

const RAYS = [
  [12, 1.6, 12, 3.6],
  [12, 20.4, 12, 22.4],
  [1.6, 12, 3.6, 12],
  [20.4, 12, 22.4, 12],
  [4.6, 4.6, 6.1, 6.1],
  [17.9, 17.9, 19.4, 19.4],
  [4.6, 19.4, 6.1, 17.9],
  [17.9, 6.1, 19.4, 4.6],
] as const;

/** How long globals.css keeps the colour crossfade alive. Must match .theme-anim. */
const CROSSFADE_MS = 320;

export function ThemeToggle({ className, tone = "auto" }: { className?: string; tone?: "auto" | "onDark" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const root = useRef<HTMLButtonElement>(null);
  const maskId = useId();
  const crossfadeTimer = useRef<number | undefined>(undefined);

  /**
   * The server has no idea which theme this visitor uses, so the SVG is always
   * rendered in its sun state and corrected after hydration. Reading
   * `resolvedTheme` during render instead would produce markup that disagrees
   * with the pre-paint script on every dark-mode visit.
   */
  const mounted = useHydrated();

  const isDark = mounted && resolvedTheme === "dark";

  /** False until the toggle has settled once, so the correcting pass is instant. */
  const hasAnimated = useRef(false);

  useGSAP(
    () => {
      if (!mounted) return;

      const dark = resolvedTheme === "dark";
      // First run after mount jumps straight to the correct state — animating
      // it would play a toggle the visitor never pressed.
      const instant = !hasAnimated.current || prefersReducedMotion();
      hasAnimated.current = true;

      const d = instant ? 0 : 0.42;

      gsap.to("[data-sun-cutter]", {
        attr: dark ? { cx: 18, cy: 6 } : { cx: 28, cy: -6 },
        duration: d,
        ease: EASE.out,
      });

      gsap.to("[data-sun-core]", {
        attr: { r: dark ? 9.2 : 5.4 },
        duration: d,
        ease: EASE.out,
      });

      gsap.to("[data-ray]", {
        opacity: dark ? 0 : 1,
        scale: dark ? 0.2 : 1,
        transformOrigin: "12px 12px",
        duration: instant ? 0 : 0.32,
        ease: dark ? EASE.soft : EASE.bounce,
        stagger: { each: instant ? 0 : 0.022, from: dark ? "end" : "start" },
      });

      // A quarter turn on the way into night, unwound on the way back. Small
      // enough to register as weight rather than as a spin.
      gsap.to("[data-dial]", {
        rotate: dark ? -25 : 0,
        transformOrigin: "12px 12px",
        duration: instant ? 0 : 0.5,
        ease: EASE.out,
      });
    },
    { scope: root, dependencies: [resolvedTheme, mounted] }
  );

  const toggle = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    // Turn the page-wide colour transition on only for the length of the swap.
    // Left on permanently it makes every hover state feel like it is lagging.
    if (!prefersReducedMotion()) {
      const html = document.documentElement;
      html.classList.add("theme-anim");
      window.clearTimeout(crossfadeTimer.current);
      crossfadeTimer.current = window.setTimeout(
        () => html.classList.remove("theme-anim"),
        CROSSFADE_MS + 60
      );
    }

    setTheme(next);
  }, [resolvedTheme, setTheme]);

  useEffect(() => () => window.clearTimeout(crossfadeTimer.current), []);

  return (
    <button
      ref={root}
      type="button"
      onClick={toggle}
      // Before mount we genuinely do not know the current theme, so the label
      // cannot promise which way the button goes.
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      className={cn(
        // 44px hit area on touch, visually smaller. Below that the control is
        // a coin-toss to tap on a phone.
        "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        tone === "onDark"
          ? "text-ivory/70 hover:text-accent-gold hover:bg-white/10"
          : "text-foreground/70 hover:text-primary hover:bg-muted",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[19px] overflow-visible"
        fill="none"
      >
        <mask id={maskId}>
          <rect x="-4" y="-4" width="32" height="32" fill="white" />
          {/* The cutter. Parked well outside the disc in light mode so it
              takes no bite out of the sun; rides in to carve the crescent. */}
          <circle data-sun-cutter cx="28" cy="-6" r="8.4" fill="black" />
        </mask>

        <g data-dial>
          <circle
            data-sun-core
            cx="12"
            cy="12"
            r="5.4"
            fill="currentColor"
            mask={`url(#${maskId})`}
          />

          <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            {RAYS.map(([x1, y1, x2, y2]) => (
              <line data-ray key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        </g>
      </svg>
    </button>
  );
}
