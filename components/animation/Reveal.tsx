"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, SHIFT, START, STAGGER } from "@/lib/animation/config";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance. One component, several house styles.
 *
 * Sections use DIFFERENT variants so the page does not feel like the same
 * animation on repeat, but they all share the timing scale from
 * lib/animation/config, so it still reads as one system.
 *
 * Three properties this component is careful about:
 *
 * 1. NO LAYOUT SHIFT. Every variant animates transform / opacity / filter /
 *    clip-path only. Nothing here can move a neighbour, so CLS stays at zero.
 *
 * 2. FIRES ONCE. `once: true` on the trigger. Content that re-animates every
 *    time it scrolls back into view is the fastest way to make a site tiring.
 *
 * 3. FAILS VISIBLE. The initial hidden state is applied by GSAP at runtime, not
 *    by a CSS class. If the JS never runs — old browser, script blocked, a
 *    thrown error upstream — the content is simply there, at full opacity.
 *    An earlier CSS-first version of this could strand a whole section at
 *    opacity 0, which is a far worse failure than no animation.
 */

export type RevealVariant =
  "fade-up" | "fade-left" | "fade-right" | "scale" | "blur" | "clip" | "mask" | "rotate";

type Props = {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Seconds to wait after the trigger fires. */
  delay?: number;
  duration?: number;
  /**
   * Animate direct children in sequence instead of the wrapper as a whole.
   * Use for card grids and link lists.
   */
  stagger?: boolean;
  /** Seconds between staggered children. */
  staggerAmount?: number;
  /**
   * Give every child its own ScrollTrigger instead of one on the wrapper.
   *
   * Only for grids tall enough that a single trigger would fire the bottom rows
   * while they are still screens away. For a tight list the opposite happens:
   * per-child triggers split the group, and a visitor who stops scrolling
   * mid-list sees two rows filled in and two blank. Requires `stagger`.
   */
  batch?: boolean;
  className?: string;
  as?: "div" | "section" | "ul" | "li" | "span";
  /**
   * Marks the wrapper as something focus mode should blur. Declared explicitly
   * rather than spreading `...rest`, so the component keeps a closed prop list.
   */
  "data-focus-dim"?: boolean;
};

/** from-state per variant. `to` is always the natural resting state. */
const FROM: Record<RevealVariant, gsap.TweenVars> = {
  "fade-up": { opacity: 0, y: SHIFT },
  "fade-left": { opacity: 0, x: -SHIFT },
  "fade-right": { opacity: 0, x: SHIFT },
  scale: { opacity: 0, scale: 0.92 },
  blur: { opacity: 0, filter: "blur(14px)", y: SHIFT * 0.5 },
  clip: { clipPath: "inset(0 0 100% 0)", y: SHIFT * 0.4 },
  mask: { clipPath: "inset(0 100% 0 0)" },
  rotate: { opacity: 0, rotate: -3, y: SHIFT * 0.7, transformOrigin: "left bottom" },
};

const TO: Record<RevealVariant, gsap.TweenVars> = {
  "fade-up": { opacity: 1, y: 0 },
  "fade-left": { opacity: 1, x: 0 },
  "fade-right": { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  blur: { opacity: 1, filter: "blur(0px)", y: 0 },
  clip: { clipPath: "inset(0 0 0% 0)", y: 0 },
  mask: { clipPath: "inset(0 0% 0 0)" },
  rotate: { opacity: 1, rotate: 0, y: 0 },
};

/**
 * Wiped from every revealed element once its tween finishes.
 *
 * Not just cosmetic. GSAP leaves the end state inline, and an inline
 * `transform: translate(0px, 0px)` is still a transform — it creates a stacking
 * context, which silently traps any z-index the element sets later. The product
 * tiles need to lift above their neighbours on hover, and could not while this
 * was left behind. Clearing also drops GSAP's `will-change` and the sub-pixel
 * blur ghost some GPUs keep after a filter tween.
 *
 * Safe because every variant's `to` state IS the element's natural resting
 * state, so removing the inline styles changes nothing visually.
 */
const CLEAR = "transform,opacity,filter,clipPath,willChange";

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = DUR.base,
  stagger = false,
  staggerAmount = STAGGER.item,
  batch = false,
  className,
  as: Tag = "div",
  "data-focus-dim": focusDim,
}: Props) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      // Reduced motion: no entrance at all. Not a faster entrance — none.
      // Content is already at its resting state, so there is nothing to do.
      if (prefersReducedMotion()) return;

      const ease = variant === "clip" || variant === "mask" ? EASE.cinematic : EASE.out;

      // Named `items`, not `children`: the prop of that name is the React tree.
      const items = stagger ? Array.from(root.children) : [];
      if (stagger && items.length === 0) return;

      // Tall grids go through ScrollTrigger.batch rather than one tween with a
      // stagger. A single trigger fires when the CONTAINER hits the start line,
      // so on a three-screen grid the last row animates while it is still two
      // screens away and the visitor arrives to find it already finished.
      // batch() gives every child its own trigger and groups whichever ones
      // cross together, so each row animates as it is actually reached.
      if (stagger && batch) {
        gsap.set(items, FROM[variant]);

        ScrollTrigger.batch(items, {
          start: START,
          once: true,
          onEnter: (batched) =>
            gsap.to(batched, {
              ...TO[variant],
              duration,
              delay,
              ease,
              stagger: staggerAmount,
              clearProps: CLEAR,
              // A child that scrolls past mid-tween must not be left half-lit.
              overwrite: true,
            }),
        });
        return;
      }

      // Everything else: one trigger on the wrapper. For a stagger that means
      // the whole group is treated as a unit, which is what a short list wants.
      gsap.fromTo(stagger ? items : root, FROM[variant], {
        ...TO[variant],
        stagger: stagger ? staggerAmount : 0,
        duration,
        delay,
        ease,
        clearProps: CLEAR,
        scrollTrigger: {
          trigger: root,
          start: START,
          once: true,
        },
      });
    },
    { scope, dependencies: [variant, delay, duration, stagger, staggerAmount, batch] }
  );

  return (
    // @ts-expect-error -- polymorphic tag; ref type varies with `as`
    <Tag ref={scope} className={cn(className)} data-focus-dim={focusDim ? "" : undefined}>
      {children}
    </Tag>
  );
}
