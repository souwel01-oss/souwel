"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, STAGGER } from "@/lib/animation/config";
import { cn } from "@/lib/utils";

/**
 * Entrance for a CRM page.
 *
 * Faster and shorter than the customer portal's — 12px and 0.45s against the
 * portal's 18px. Staff open these screens dozens of times a day, and an
 * animation that is pleasant on a first visit is a tax on the fortieth.
 *
 * `clearProps` removes the transform when it lands. A lingering transform makes
 * every child its own containing block, which breaks `position: fixed` inside
 * the page and traps the user menu's dropdown in a new stacking context.
 */
export function CrmPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-crm-item]", {
        opacity: 0,
        y: 12,
        duration: DUR.base * 0.75,
        ease: EASE.out,
        stagger: STAGGER.item * 0.7,
        clearProps: "opacity,transform",
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className={cn("mx-auto w-full max-w-[84rem]", className)}>
      {children}
    </div>
  );
}

/**
 * A CRM panel.
 *
 * `plain` is the default and it is opaque on purpose. The brief asks for
 * glassmorphism on stat cards, headers and buttons and clarity in the tables —
 * a translucent pane behind a dense grid of numbers puts a gradient underneath
 * every digit and drops the effective contrast of the whole table. Glass is
 * opt-in here and used on the stat row only.
 */
export function Panel({
  children,
  className,
  glass = false,
}: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div
      data-crm-item
      className={cn(
        "rounded-2xl",
        glass ? "glass-card" : "bg-card border-border/70 border shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border/60 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-heading text-foreground text-[1.05rem] leading-snug">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-[12.5px] leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
