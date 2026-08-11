"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, STAGGER } from "@/lib/animation/config";
import { cn } from "@/lib/utils";

/**
 * Entrance for a portal page.
 *
 * Wraps the page's content and staggers anything marked `data-portal-item`.
 * No ScrollTrigger: a dashboard is short, the whole thing is above the fold on
 * a laptop, and scroll-triggered reveals on a data screen mean a customer
 * scrolls to an empty region and waits for their own numbers to appear.
 *
 * `clearProps` at the end matters — leaving a transform on the card would give
 * every child its own containing block, which quietly breaks `position: fixed`
 * inside it and creates a new stacking context the dropdown then cannot escape.
 */
export function PortalPage({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-portal-item]", {
        opacity: 0,
        y: 18,
        duration: DUR.base,
        ease: EASE.out,
        stagger: STAGGER.item,
        clearProps: "opacity,transform",
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className={cn("mx-auto w-full max-w-5xl", className)}>
      {children}
    </div>
  );
}

/**
 * The portal's card.
 *
 * `glass-card` (globals.css) over the layout's gradient field. `interactive`
 * adds a lift on hover — used only on cards that actually lead somewhere, so
 * the movement stays a signal rather than decoration on everything.
 */
export function Card({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      data-portal-item
      className={cn(
        "glass-card rounded-2xl",
        interactive &&
          "transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-30px_rgb(10_37_64/0.6)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border/50 flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <h2 className="font-heading text-foreground text-[1.05rem] leading-snug">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
