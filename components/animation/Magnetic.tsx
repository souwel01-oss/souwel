"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";

/**
 * Magnetic hover — the element leans toward the pointer, then springs back.
 *
 * Pointer-type gated, not width gated. On a touch device there is no hover
 * state to lean into, and a `pointer: coarse` check is the honest test for
 * that; a breakpoint would wrongly enable this on a small laptop and wrongly
 * disable it on a large tablet.
 *
 * quickTo() rather than a tween per mousemove: it reuses one tween instance
 * and just retargets it, so a fast pointer does not queue up dozens of
 * competing tweens on the same element.
 */
export function Magnetic({
  children,
  /** How far the element may travel, as a fraction of the cursor offset. */
  strength = 0.28,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: EASE.out });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: EASE.out });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);

      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref, dependencies: [strength] }
  );

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
