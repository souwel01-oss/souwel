"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, START, STAGGER } from "@/lib/animation/config";
import { whenIntroDone } from "@/lib/animation/intro";
import { cn } from "@/lib/utils";

/**
 * Headline animation built on GSAP's SplitText.
 *
 * This used to be hand-rolled on split-type, with about forty lines of
 * scaffolding around it. SplitText does all of that in the library, correctly:
 *
 * 1. FONTS. `autoSplit` re-splits once webfonts finish loading. Splitting
 *    against a fallback face measures the wrong glyph widths, so every
 *    character jumps when the real face swaps in — a genuine layout shift.
 *
 * 2. RESIZE. `autoSplit` also re-splits when the element's width changes, which
 *    matters for line splits: lines measured at 1440px are wrong at 900px, and
 *    the old version left them stale until a remount.
 *
 * 3. ACCESSIBILITY. `aria: "auto"` puts the real sentence in aria-label on this
 *    element and marks every generated span aria-hidden, so screen readers read
 *    a sentence rather than spelling it out. That is why there is no longer an
 *    inner wrapper span — the plugin handles what the wrapper was there for.
 *
 * 4. CLEANUP. Animations are created inside `onSplit` and RETURNED, so SplitText
 *    owns them: on re-split it reverts the old tween and syncs the new one to
 *    the same progress instead of restarting the headline mid-scroll.
 *
 * What is still ours: the variants, and the guarantee that nothing here can
 * strand text at opacity 0. Reduced motion returns before any split happens,
 * and `onSplit` un-hides the element on its very first line.
 */

export type SplitVariant = "chars" | "words" | "lines" | "blur-chars" | "mask-lines" | "spacing";

type Props = {
  /** Plain text only — markup would be destroyed by the split. */
  text: string;
  variant?: SplitVariant;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Play on mount rather than on scroll. For above-the-fold copy. */
  immediate?: boolean;
};

/** Which split unit each variant animates. Drives both `type` and the stagger. */
const UNIT: Record<SplitVariant, "chars" | "words" | "lines"> = {
  chars: "chars",
  "blur-chars": "chars",
  spacing: "chars",
  words: "words",
  lines: "lines",
  "mask-lines": "lines",
};

const FROM: Record<SplitVariant, gsap.TweenVars> = {
  chars: { opacity: 0, yPercent: 60, rotate: 2 },
  words: { opacity: 0, yPercent: 60, rotate: 2 },
  lines: { opacity: 0, yPercent: 60, rotate: 2 },
  "blur-chars": { opacity: 0, filter: "blur(12px)", y: 18 },
  "mask-lines": { yPercent: 115 },
  spacing: { opacity: 0, letterSpacing: "0.35em" },
};

const TO: Record<SplitVariant, gsap.TweenVars> = {
  chars: { opacity: 1, yPercent: 0, rotate: 0 },
  words: { opacity: 1, yPercent: 0, rotate: 0 },
  lines: { opacity: 1, yPercent: 0, rotate: 0 },
  "blur-chars": { opacity: 1, filter: "blur(0px)", y: 0 },
  "mask-lines": { yPercent: 0 },
  spacing: { opacity: 1, letterSpacing: "0em" },
};

export function SplitReveal({
  text,
  variant = "words",
  delay = 0,
  className,
  as: Tag = "h2",
  immediate = false,
}: Props) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el || prefersReducedMotion()) return;

      const unit = UNIT[variant];

      // `immediate` headings are above the fold, which is exactly what the
      // intro curtain covers. Scroll-triggered ones need no gate: the curtain
      // is long gone before anything below the fold is reached.
      const cancels: Array<() => void> = [];

      const split = SplitText.create(el, {
        // Split only what is animated. Chars still need words alongside them,
        // or the browser is free to break a line mid-word.
        type: unit === "chars" ? "words,chars" : unit,
        // mask-lines wants each line clipped by its own box, so the text rises
        // from behind a hard edge rather than merely fading. The plugin builds
        // those wrappers; the old version set overflow on the lines by hand.
        mask: variant === "mask-lines" ? "lines" : undefined,
        autoSplit: true,
        aria: "auto",
        onSplit(self) {
          // Un-hide on the first split, before anything can go wrong below.
          // The .anim-ready gate hides this element pre-hydration to stop the
          // SSR paint flashing; this is what lifts it.
          gsap.set(el, { opacity: 1 });

          const parts = unit === "chars" ? self.chars : unit === "words" ? self.words : self.lines;
          if (!parts?.length) return;

          const tween = gsap.fromTo(parts, FROM[variant], {
            ...TO[variant],
            duration: variant === "mask-lines" ? DUR.slow : DUR.base,
            ease: EASE.cinematic,
            delay,
            stagger: unit === "chars" ? STAGGER.char : unit === "words" ? STAGGER.word : 0.11,
            clearProps: "filter,letterSpacing",
            scrollTrigger: immediate ? undefined : { trigger: el, start: START, once: true },
          });

          if (immediate) {
            tween.pause();
            cancels.push(whenIntroDone(() => tween.play()));
          }

          return tween;
        },
      });

      return () => {
        cancels.forEach((cancel) => cancel());
        split.revert();
      };
    },
    { scope, dependencies: [text, variant, delay, immediate] }
  );

  return (
    // @ts-expect-error -- polymorphic tag; ref type varies with `as`
    <Tag ref={scope} data-anim-hide className={cn(className)}>
      {text}
    </Tag>
  );
}
