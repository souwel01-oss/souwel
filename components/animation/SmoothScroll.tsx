"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker.
 *
 * The three lines that matter, and why:
 *
 *   lenis.on("scroll", ScrollTrigger.update)
 *     Lenis moves the page with a transform, so the browser's native scroll
 *     event no longer describes where things are. Without this, every
 *     ScrollTrigger fires at the wrong moment.
 *
 *   gsap.ticker.add(t => lenis.raf(t * 1000))
 *     One rAF loop for the whole page instead of two competing ones. Running
 *     Lenis on its own rAF alongside GSAP's produces visible jitter, because
 *     the scroll position and the tweens are computed in different frames.
 *
 *   gsap.ticker.lagSmoothing(0)
 *     GSAP normally "catches up" after a slow frame by jumping time forward.
 *     With a smooth-scroll library that reads as the page lurching.
 *
 * Reduced motion: Lenis is never started. Native scrolling is what those users
 * asked for, and hijacking it is the exact thing the preference exists to stop.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Long, flat curve — the tail is what makes it feel expensive rather
      // than floaty. Shorter durations feel cheap; longer feel unresponsive.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have momentum scrolling that people expect;
      // overriding it fights muscle memory and hurts more than it helps.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
