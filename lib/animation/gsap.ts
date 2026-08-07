"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Central GSAP entry point.
 *
 * Plugins are registered exactly once, here, rather than in each component.
 * Registering repeatedly is harmless but makes it easy to lose track of what is
 * actually loaded, and it scatters the "does this bundle pull in ScrollTrigger"
 * question across the codebase.
 *
 * Everything that animates should import gsap FROM THIS MODULE, never from
 * "gsap" directly, so the registration is guaranteed to have run.
 *
 * SplitText is GSAP's own text splitter. It ships in the public `gsap` package
 * and needs no licence key — the old Club GSAP paywall is gone. It replaced
 * split-type here because it solves, in the library, three things we were
 * hand-rolling: waiting for fonts, re-splitting when the line box changes, and
 * the aria-label / aria-hidden pairing that keeps split text readable.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/**
 * True when the visitor has asked for reduced motion.
 *
 * Read at animation setup time rather than stored in state: these components
 * build GSAP timelines imperatively, and the branch is needed before the first
 * paint of the animation, not on a later re-render.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
