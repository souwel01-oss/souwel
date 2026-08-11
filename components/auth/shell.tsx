"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, STAGGER } from "@/lib/animation/config";

/**
 * Entrance for an auth screen.
 *
 * Deliberately small: 14px and 400ms, staggered across a handful of blocks.
 * A sign-in page is somewhere people arrive with an intention already formed,
 * often for the second time today — a cinematic reveal here is a toll booth.
 *
 * `prefersReducedMotion` is checked before the timeline is built rather than
 * inside it, so nothing is ever set to opacity 0 for a visitor who has asked
 * for stillness. Gating only the tween would leave the from-state applied and
 * the page blank.
 */
export function useAuthEntrance(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from("[data-auth-item]", {
        opacity: 0,
        y: 14,
        duration: DUR.base,
        ease: EASE.out,
        stagger: STAGGER.item,
        clearProps: "opacity,transform",
      });
    },
    { scope }
  );
}

export function AuthHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <header data-auth-item>
      <p className="text-premium text-[11px] font-semibold tracking-[0.16em] uppercase">
        {eyebrow}
      </p>
      <h1 className="font-heading text-foreground mt-2.5 text-[2rem] leading-tight">{title}</h1>
      {subtitle ? (
        <p className="text-muted-foreground mt-2.5 text-[14px] leading-relaxed">{subtitle}</p>
      ) : null}
    </header>
  );
}

/**
 * "or" rule between the social buttons and the password form.
 *
 * The word sits IN the rule rather than above it. Two stacked groups of
 * controls with only whitespace between them read as one list, and people
 * reliably try to type an email into a form they have already skipped past.
 */
export function OrDivider() {
  return (
    <div data-auth-item className="my-6 flex items-center gap-4" aria-hidden>
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        or
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
