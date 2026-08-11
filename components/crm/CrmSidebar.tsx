"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";
import { CRM_NAV } from "@/components/crm/nav";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import { roleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * CRM sidebar: a fixed rail on desktop, an overlay drawer below `lg`.
 *
 * A DRAWER RATHER THAN THE PORTAL'S BOTTOM BAR, because the two navigations
 * are different shapes of problem. The customer portal has three destinations
 * and a bottom bar puts all of them one thumb away. The CRM has five, and
 * staff arrive on a laptop and occasionally on a tablet — five icon-and-label
 * pairs do not survive a 360px bottom bar, and truncating them turns
 * "Leads & Quotes" into "Leads".
 */
export function CrmSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rail = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const close = useCallback(() => setOpen(false), []);

  // Route change closes the drawer, or it stays open over the page it just
  // navigated to. Adjusted during render — React's own pattern for resetting
  // state when a prop changes — rather than in an effect that would render the
  // open drawer once before closing it.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    // The page behind an overlay drawer must not scroll under it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-rail-item]", {
        opacity: 0,
        x: -12,
        duration: 0.4,
        ease: EASE.out,
        stagger: 0.05,
        clearProps: "opacity,transform",
      });
    },
    { scope: rail }
  );

  useGSAP(
    () => {
      if (!open || !drawer.current || prefersReducedMotion()) return;
      const tl = gsap.timeline();
      tl.from(drawer.current, { xPercent: -100, duration: 0.34, ease: EASE.out }).from(
        drawer.current.querySelectorAll("[data-drawer-item]"),
        { opacity: 0, x: -10, duration: 0.26, ease: EASE.soft, stagger: 0.04 },
        "-=0.18"
      );
      return () => void tl.kill();
    },
    { dependencies: [open] }
  );

  const items = CRM_NAV.map(({ href, label, icon: Icon }) => ({
    href,
    label,
    Icon,
    current: isCurrent(href),
  }));

  return (
    <>
      {/* ---- Desktop rail ------------------------------------------------ */}
      <aside
        ref={rail}
        className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex"
      >
        <div data-rail-item className="px-6 py-6">
          <Link
            href="/"
            aria-label="Souwel home"
            className="focus-visible:ring-sidebar-ring inline-flex rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <SouwelLogo height={22} plate />
          </Link>
          <p className="text-premium mt-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {roleLabel(role)} · CRM
          </p>
        </div>

        <nav aria-label="CRM" className="flex flex-1 flex-col gap-1 px-3">
          {items.map(({ href, label, Icon, current }) => (
            <Link
              key={href}
              href={href}
              data-rail-item
              aria-current={current ? "page" : undefined}
              className={cn(navItem, current ? navItemCurrent : navItemIdle)}
            >
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
          ))}
        </nav>

        <div data-rail-item className="border-sidebar-border border-t px-3 py-4">
          <Link
            href="/"
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* ---- Mobile trigger ---------------------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="crm-drawer"
        className="text-foreground hover:bg-muted focus-visible:ring-ring fixed top-3 left-3 z-40 grid size-11 place-items-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
      >
        <Menu aria-hidden className="size-5" />
        <span className="sr-only">Open CRM navigation</span>
      </button>

      {/* ---- Mobile drawer ------------------------------------------------ */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={close}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />
          <div
            ref={drawer}
            id="crm-drawer"
            className="bg-sidebar text-sidebar-foreground border-sidebar-border absolute inset-y-0 left-0 flex w-[17rem] flex-col border-r"
          >
            <div data-drawer-item className="flex items-center justify-between px-5 py-5">
              <SouwelLogo height={20} plate />
              <button
                type="button"
                onClick={close}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground grid size-11 place-items-center rounded-lg hover:bg-white/10"
              >
                <X aria-hidden className="size-5" />
                <span className="sr-only">Close navigation</span>
              </button>
            </div>

            <nav aria-label="CRM" className="flex flex-1 flex-col gap-1 px-3">
              {items.map(({ href, label, Icon, current }) => (
                <Link
                  key={href}
                  href={href}
                  data-drawer-item
                  aria-current={current ? "page" : undefined}
                  // py-3.5 keeps every row past the 44px touch floor.
                  className={cn(
                    navItem,
                    "py-3.5",
                    current ? navItemCurrent : navItemIdle
                  )}
                >
                  <Icon aria-hidden className="size-[18px] shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <div data-drawer-item className="border-sidebar-border border-t px-3 py-4">
              <Link
                href="/"
                className="text-sidebar-foreground/50 flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-[12px] font-semibold tracking-[0.1em] uppercase"
              >
                <ArrowLeft aria-hidden className="size-3.5" />
                Back to site
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const navItem =
  "group relative flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13.5px] font-medium transition-colors";
const navItemCurrent = "bg-sidebar-accent text-sidebar-accent-foreground";
const navItemIdle =
  "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground";
