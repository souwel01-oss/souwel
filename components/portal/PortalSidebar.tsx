"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";
import { PORTAL_NAV } from "@/components/portal/nav";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Portal sidebar (desktop) and bottom bar (mobile).
 *
 * TWO PRESENTATIONS OF ONE LIST, not two navigations. The items come from
 * PORTAL_NAV in both cases, so they cannot drift apart — the usual failure
 * being a link added to the sidebar and forgotten on the phone.
 *
 * On mobile it is a fixed bottom bar rather than a hamburger: three
 * destinations is under the five-item ceiling where a bottom bar stops working,
 * and it puts the whole portal one thumb-reach away instead of behind a menu.
 */
export function PortalSidebar() {
  const pathname = usePathname();
  const root = useRef<HTMLElement>(null);

  const isCurrent = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-side-item]", {
        opacity: 0,
        x: -12,
        duration: 0.45,
        ease: EASE.out,
        stagger: 0.06,
        clearProps: "opacity,transform",
      });
    },
    { scope: root }
  );

  return (
    <>
      {/* ---- Desktop rail ------------------------------------------------ */}
      <aside
        ref={root}
        className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex"
      >
        <div data-side-item className="px-6 py-7">
          <Link
            href="/"
            aria-label="Souwel home"
            className="focus-visible:ring-sidebar-ring inline-flex rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <SouwelLogo height={22} plate />
          </Link>
        </div>

        <nav aria-label="Portal" className="flex flex-1 flex-col gap-1 px-3">
          {PORTAL_NAV.map(({ href, label, icon: Icon }) => {
            const current = isCurrent(href);
            return (
              <Link
                key={href}
                href={href}
                data-side-item
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13.5px] font-medium transition-colors",
                  current
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                {/* Gold marker on the current item. The rail is one flat colour,
                    so a background tint alone is a weak "you are here" — this is
                    the same gold rule the marketing header uses. */}
                <span
                  aria-hidden
                  className={cn(
                    "bg-premium absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r transition-opacity duration-300",
                    current ? "opacity-100" : "opacity-0"
                  )}
                />
                <Icon aria-hidden className="size-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div data-side-item className="border-sidebar-border border-t px-3 py-4">
          <Link
            href="/"
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* ---- Mobile bottom bar ------------------------------------------- */}
      <nav
        aria-label="Portal"
        className="bg-sidebar border-sidebar-border fixed inset-x-0 bottom-0 z-40 flex border-t lg:hidden"
        // Keeps the bar clear of the iOS home indicator, which otherwise sits
        // directly on top of the middle item.
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PORTAL_NAV.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-semibold tracking-[0.06em] transition-colors",
                current ? "text-premium" : "text-sidebar-foreground/55"
              )}
            >
              <Icon aria-hidden className="size-5" />
              {/* The sidebar's labels are written for a 256px rail; two of them
                  do not fit under a phone-width icon. */}
              {label.replace("Manage My ", "").replace("My ", "")}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
