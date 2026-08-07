"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Interaction wrapper for the two hero call-to-action buttons.
 *
 * Owns hover, focus and press motion in GSAP, plus a slow idle glow on the
 * primary. Both variants share one duration and one curve so they read as the
 * same control at different weights.
 *
 * WHY THE MOTION IS ON A WRAPPER AND NOT ON THE BUTTON. The button base class
 * carries Tailwind's `transition-all`, which includes `transform`. GSAP writes
 * transform on every frame, and a CSS transition re-eases every one of those
 * writes — the result lags the pointer and looks mushy rather than crisp. The
 * button keeps its own transitions for the states CSS still owns (focus ring,
 * the 1px active nudge); scale lives out here where nothing competes for it.
 *
 * Colour is the exception: the secondary's fill and border ARE animated by
 * GSAP, so that button is marked `transition-none!` in its own class list. See
 * the note in HeroContent.
 *
 * TOUCH. Hover handlers are bound only behind `(hover: hover) and (pointer:
 * fine)`. On a touch screen `pointerenter` fires on tap and never gets a
 * matching `pointerleave`, which is exactly how buttons end up stuck in their
 * hover state after being tapped. Press feedback is bound unconditionally, so
 * touch users get the tactile part without inheriting the stuck part.
 */

/** One curve, one duration, both buttons. */
const EASE = "power2.out";
const DUR = 0.22;
/** Press has to feel instant or it reads as lag rather than feedback. */
const DUR_PRESS = 0.1;
const PRESS_SCALE = 0.97;

/**
 * Hover response.
 *
 * These started at scale 1.04 with no lift, which measured correctly and was
 * still effectively invisible in use — 4% on a 48px-tall button is under two
 * pixels of growth, and growth alone gives the eye nothing to track. The lift
 * is what makes it read: vertical movement against a fixed baseline is far
 * easier to notice than a size change, and it costs no extra layout.
 */
const HOVER_SCALE = 1.06;
const HOVER_LIFT = -3;

type Variant = "primary" | "secondary";

export function HeroCta({
  variant,
  children,
  className,
}: {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const face = el.querySelector<HTMLElement>("[data-cta='face']");
      const glow = el.querySelector<HTMLElement>("[data-cta='glow']");
      const fill = el.querySelector<HTMLElement>("[data-cta='fill']");
      const arrow = el.querySelector<HTMLElement>("[data-cta='arrow']");
      const btn = el.querySelector<HTMLElement>("a,button");
      if (!face || !btn) return;

      let hovered = false;
      let pressed = false;

      // Captured, not hard-coded: leave() has to return the button to whatever
      // the stylesheet says, and GSAP cannot tween a property back to "unset".
      const restColor = getComputedStyle(btn).color;
      const restBorder = getComputedStyle(btn).borderColor;

      // The primary's resting state is a slow breath rather than nothing, so
      // the button has some presence before anyone points at it. Low amplitude
      // and a long period on purpose — at this size a faster or wider pulse
      // stops being ambient and starts being a distraction.
      const idle = glow
        ? gsap.to(glow, {
            opacity: 0.6,
            scale: 1.1,
            duration: 2.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          })
        : null;

      // Scale is resolved in one place so hover and press cannot disagree about
      // what the current resting size is — pressing while hovered has to land
      // at press scale, and releasing has to go back to hover scale, not 1.
      const settle = () => {
        const scale = pressed ? PRESS_SCALE : hovered ? HOVER_SCALE : 1;
        // Pressing puts the button back down on the surface; that drop from the
        // hover lift is most of what sells the press as a physical one.
        const y = pressed ? 0 : hovered ? HOVER_LIFT : 0;
        gsap.to(face, {
          scale,
          y,
          duration: pressed ? DUR_PRESS : DUR,
          ease: EASE,
          overwrite: "auto",
        });
      };

      const enter = () => {
        if (hovered) return;
        hovered = true;
        settle();
        if (glow) {
          idle?.pause();
          gsap.to(glow, {
            opacity: 1,
            scale: 1.3,
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
          });
        }
        if (fill) {
          gsap.to(fill, {
            // 0.15, not 0.18. The brighter fill measured better on screen but
            // dropped the champagne label to 4.43:1 — just under AA. The gold
            // halo below is doing the work of making the hover obvious anyway,
            // so the fill does not need to carry it. Re-measure if either
            // changes; they trade against each other.
            backgroundColor: "rgba(255,255,255,0.15)",
            // Gold halo, so the outlined button gets a visible response of its
            // own rather than only a fill that is easy to miss against a busy
            // hero video. Tweening box-shadow is cheap here: one small element,
            // once per hover, not in a loop.
            boxShadow: "0 0 26px -4px rgba(201,168,76,0.6)",
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
          });
          gsap.to(btn, {
            // Champagne, to separate this control from the blue primary beside
            // it. NOT the Warm Gold token (#C9A84C) or a light mix of it: the
            // hover fill lightens the backdrop, so warm text on it loses
            // contrast just as the button becomes active. Measured against the
            // real hovered backdrop, #E6CE84 came out at 3.9:1 — under AA for
            // 16px text — where this lands at 5.0:1. Re-measure if the fill
            // opacity below changes.
            color: "#F7E7CE",
            borderColor: "rgba(255,255,255,0.7)",
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
          });
        }
        if (arrow) gsap.to(arrow, { x: 7, duration: DUR, ease: EASE, overwrite: "auto" });
      };

      const leave = () => {
        if (!hovered) return;
        hovered = false;
        settle();
        if (glow) {
          gsap.to(glow, {
            opacity: 0.3,
            scale: 1,
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
            onComplete: () => {
              // Restarted from the top so the breath always resumes from the
              // same phase; resuming mid-cycle produced a visible jump.
              idle?.restart(true);
            },
          });
        }
        if (fill) {
          gsap.to(fill, {
            backgroundColor: "rgba(255,255,255,0)",
            boxShadow: "0 0 0 0 rgba(201,168,76,0)",
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
          });
          gsap.to(btn, {
            color: restColor,
            borderColor: restBorder,
            duration: DUR,
            ease: EASE,
            overwrite: "auto",
          });
        }
        if (arrow) gsap.to(arrow, { x: 0, duration: DUR, ease: EASE, overwrite: "auto" });
      };

      const down = () => {
        pressed = true;
        settle();
      };
      const up = () => {
        if (!pressed) return;
        pressed = false;
        settle();
      };

      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (canHover) {
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
      }

      // Keyboard parity. `:focus-visible` rather than plain focus, so a tap
      // that incidentally focuses the link does not leave it lit up.
      const onFocusIn = () => {
        if (btn.matches(":focus-visible")) enter();
      };
      el.addEventListener("focusin", onFocusIn);
      el.addEventListener("focusout", leave);

      el.addEventListener("pointerdown", down);
      // pointerup alone is not enough: a drag off the button, a cancelled
      // gesture, or a scroll that steals the pointer all end without one, and
      // the button would stay pressed.
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("pointerleave", up);

      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focusin", onFocusIn);
        el.removeEventListener("focusout", leave);
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        el.removeEventListener("pointerleave", up);
        idle?.kill();
      };
    },
    { scope: root, dependencies: [variant] }
  );

  return (
    <span ref={root} className={`relative inline-block ${className ?? ""}`}>
      {variant === "primary" ? (
        // Blurred plate behind the button. Animating opacity and scale on a
        // separate layer is what keeps the glow on the compositor — tweening
        // box-shadow on the button itself repaints it every frame instead.
        // No z-index: positioned siblings paint in DOM order, so `face` covers
        // this simply by coming after it. A negative z-index would push it
        // behind the hero's own backdrop instead of behind the button.
        <span
          aria-hidden
          data-cta="glow"
          className="bg-primary pointer-events-none absolute inset-0 rounded-lg opacity-[0.28] blur-[14px]"
        />
      ) : (
        // Fill and edge for the outlined button, as one layer clipped to the
        // button's own shape.
        <span
          aria-hidden
          data-cta="fill"
          className="pointer-events-none absolute inset-0 rounded-lg"
        />
      )}

      <span data-cta="face" className="relative block">
        {children}
      </span>
    </span>
  );
}
