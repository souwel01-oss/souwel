/**
 * Single source of truth for motion timing.
 *
 * Every animation on the site pulls its duration, easing and stagger from here.
 * That is what stops a large animation surface from drifting into a dozen
 * slightly-different feels — and it means retuning the whole site is one edit.
 *
 * The CSS side of the system (globals.css `--dur-*` / `--ease-out`) mirrors
 * these values; keep the two in step when changing either.
 */

/** GSAP easing strings. `out` is the house curve — matches CSS --ease-out. */
export const EASE = {
  /** Default. Fast start, long settle. */
  out: "power3.out",
  /** Gentler; for small or frequent movements. */
  soft: "power2.out",
  /** Most dramatic; hero-scale reveals only. */
  cinematic: "expo.out",
  /** Slight overshoot; buttons and badges scaling in. */
  bounce: "back.out(1.7)",
  /** Symmetric; loops and continuous motion. */
  inOut: "power2.inOut",
} as const;

export const DUR = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
  /** Hero-only. Anything this long elsewhere reads as sluggish. */
  cinematic: 1.15,
} as const;

export const STAGGER = {
  /** Per character. */
  char: 0.018,
  /** Per word. */
  word: 0.05,
  /** Per card or list item. */
  item: 0.08,
  /** Per major block. */
  block: 0.14,
} as const;

/**
 * Where an element must reach before it animates. Deliberately generous — a
 * reveal that fires the instant a sliver appears looks like a glitch, and one
 * that waits for the element to be centred feels broken on tall sections.
 */
export const START = "top 85%";

/** Distance, in px, for translate-based reveals. */
export const SHIFT = 40;
