"use client";

import { useRef } from "react";
import { ClipboardList, FileSpreadsheet, Package, Users } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import { cn } from "@/lib/utils";

/**
 * Stat card with a counted-up figure.
 *
 * THE FINAL VALUE IS IN THE SERVER HTML, and the animation counts toward it.
 * Rendering 0 and letting GSAP fill it in would mean the real number does not
 * exist until JavaScript runs — so a scraper, a failed bundle, or a screen
 * reader that has already announced the node all get "0 users". The tween
 * overwrites textContent from the same starting number the server printed.
 *
 * `aria-hidden` on the animating span with the real figure in an adjacent
 * sr-only node: without it a screen reader can announce a rapidly-changing
 * number, which is noise. The visual count-up is decoration; the value is not.
 */
/**
 * THE ICON IS NAMED, NOT PASSED.
 *
 * The obvious signature is `icon: LucideIcon` and the caller passing `Users`.
 * It does not work: this is a Client Component and the overview page is a
 * Server Component, so the icon would have to cross that boundary as a prop —
 * and a React component is a function, which React refuses to serialise. The
 * page rendered a 500 with "Functions cannot be passed directly to Client
 * Components".
 *
 * A string crosses fine, so the mapping lives here where the icons are already
 * in the client bundle.
 */
const ICONS = {
  users: Users,
  leads: FileSpreadsheet,
  quotes: ClipboardList,
  orders: Package,
} as const;

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "blue",
  delay = 0,
}: {
  label: string;
  value: number;
  icon: keyof typeof ICONS;
  hint?: string;
  accent?: "blue" | "gold";
  delay?: number;
}) {
  const Icon = ICONS[icon];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current?.querySelector<HTMLElement>("[data-count]");
      if (!el) return;

      const proxy = { n: 0 };
      const format = new Intl.NumberFormat("en-US");

      gsap.to(proxy, {
        n: value,
        duration: Math.min(1.1, 0.45 + value * 0.012),
        delay,
        ease: EASE.out,
        onUpdate: () => {
          el.textContent = format.format(Math.round(proxy.n));
        },
        // A tween that is interrupted mid-flight must still land on the truth.
        onComplete: () => {
          el.textContent = format.format(value);
        },
      });
    },
    { scope: root, dependencies: [value, delay] }
  );

  return (
    <div
      ref={root}
      data-crm-item
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl p-5",
        "transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)]",
        "hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-30px_rgb(10_37_64/0.55)]"
      )}
    >
      {/* Accent glow. Sits behind the content and is clipped by the card, so it
          reads as light inside the surface rather than a coloured border. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full blur-2xl"
        style={{
          background:
            accent === "gold"
              ? "radial-gradient(circle, rgb(201 168 76 / 0.30), transparent 68%)"
              : "radial-gradient(circle, rgb(11 151 255 / 0.26), transparent 68%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-[12.5px] leading-snug font-medium">{label}</p>
        <Icon
          aria-hidden
          className={cn("size-4 shrink-0", accent === "gold" ? "text-premium" : "text-primary")}
        />
      </div>

      <p className="font-heading text-foreground relative mt-3 text-[2rem] leading-none tabular-nums">
        <span data-count aria-hidden>
          {new Intl.NumberFormat("en-US").format(value)}
        </span>
        <span className="sr-only">{value}</span>
      </p>

      {hint ? <p className="text-muted-foreground relative mt-2 text-[12px]">{hint}</p> : null}
    </div>
  );
}
