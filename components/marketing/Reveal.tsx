"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper: fades + slides its children in once, when they first
 * enter the viewport. The observer disconnects on first intersection, so the
 * effect never repeats or re-fires on scroll-back.
 *
 * Safety notes:
 * - Content starts at opacity 0, so if the observer never ran the section would
 *   be invisible. Two guards prevent that: `prefers-reduced-motion` forces the
 *   final state in CSS, and a <noscript> rule in the root layout reveals
 *   everything when JS is unavailable.
 * - Elements already on screen at mount intersect immediately, so above-the-fold
 *   content is not delayed.
 * - Only opacity/transform animate, keeping this off the layout path.
 */

type RevealProps = {
  children: React.ReactNode;
  /** Stagger, in ms, for sibling sections. */
  delay?: number;
  className?: string;
  /** How far into the viewport before revealing. */
  rootMargin?: string;
};

export function Reveal({
  children,
  delay = 0,
  className,
  rootMargin = "0px 0px -12% 0px",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (very old browsers): reveal on the next frame so
    // content is never left stranded at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`reveal ${revealed ? "is-revealed" : ""} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
