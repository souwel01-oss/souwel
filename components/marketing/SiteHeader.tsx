"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { CATEGORY_PRODUCTS, MAIN_NAV, SITE, productHref } from "@/lib/site-config";
import { CategoryMegaMenu } from "@/components/marketing/CategoryMegaMenu";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";
import { DrawerAuth, HeaderAuth } from "@/components/auth/HeaderAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

/** Category slug a nav href points at, or null if it is not a category link. */
function slugOf(href: string) {
  const m = /^\/categories\/([a-z0-9-]+)$/.exec(href);
  return m?.[1] ?? null;
}

/**
 * Hover intent, in milliseconds.
 *
 * OPEN is short but non-zero: without it, dragging the pointer across the nav
 * to reach Contact fires every menu on the way past. CLOSE is much longer and
 * is the more important of the two — the panel sits BELOW the bar, so the
 * pointer has to leave the trigger to reach it, and a menu that closes the
 * instant you head for its contents is unusable.
 */
const OPEN_DELAY = 90;
const CLOSE_DELAY = 220;

/**
 * Site header (FR-007a): logo, category + Contact nav, Register link.
 *
 * THE BAR IS TOKEN-DRIVEN, NOT PAINTED NAVY. It was `bg-navy text-ivory` on
 * every surface, which meant the site's own theme toggle could not reach it —
 * a light bar in dark mode, or here, a white bar in light mode, was simply not
 * expressible. It now reads --card / --foreground like every other surface, so
 * it is white on the light theme and brand navy on the dark one, and the
 * mega-menu and drawer below follow the same tokens.
 *
 * ONE THING THIS FIXED FOR FREE: the supplied wordmark is #0030F0, which
 * measures 6.8:1 on white and 1.8:1 on navy (see SouwelLogo). The header was
 * the logo's WORST placement on the site; on white it is its best.
 *
 * Desktop nav is a flat strip of uppercase labels; the current page is marked
 * by a gold rule on the bar's bottom edge (see .nav-link::after). The links
 * still stretch to full bar height so that rule lands on the edge itself
 * rather than floating above it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  /** Which category's mega-menu is open, or null. Owned here, not by the tab —
   *  see the note at the top of CategoryMegaMenu for why. */
  const [menu, setMenu] = useState<string | null>(null);
  /** Mobile drawer: which category's product list is expanded. */
  const [drawerOpen, setDrawerOpen] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  /** The hamburger/X button, so Escape can hand focus back to it. */
  const drawerToggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  /** "/" must match exactly, or it would be current on every page. */
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const schedule = useCallback((next: string | null) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setMenu(next),
      next === null ? CLOSE_DELAY : OPEN_DELAY
    );
  }, []);

  /** Immediate, for keyboard and Escape — a delay there is just lag. */
  const setNow = useCallback((next: string | null) => {
    window.clearTimeout(timer.current);
    setMenu(next);
  }, []);

  // Route change closes both menus. Next navigates on the client, so without
  // this the panel stays open over the page you just navigated to — and a back
  // or forward gesture has no click handler to hang this off, so it cannot live
  // on the links.
  //
  // Adjusted during render rather than in an effect: React's own pattern for
  // "reset state when a prop changes". In an effect this renders the stale open
  // menu once before closing it, and trips the cascading-render lint rule.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenu(null);
    setOpen(false);
  }

  // Cancelling the pending hover timer belongs in an effect, not in the render
  // adjustment above: without it, a timer scheduled a moment before the click
  // fires after the reset and reopens the panel on the new page. Clearing a
  // timer is a genuine external-system sync — there is no setState here, so it
  // cannot cascade.
  useEffect(() => {
    window.clearTimeout(timer.current);
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (menu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Return focus to the trigger before closing. Without this, dismissing
      // the panel from inside it drops focus onto <body> and the next Tab
      // starts from the top of the document.
      const trigger = document.querySelector<HTMLElement>(
        "nav[aria-label='Main'] a[aria-expanded='true']"
      );
      setNow(null);
      trigger?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, setNow]);

  /**
   * Escape closes the mobile drawer.
   *
   * The desktop mega-menu above has done this all along; the drawer had no
   * handler, so once it was open the ONLY way out was to find the X. Escape is
   * the standard dismiss for anything that covers the page, and a visitor who
   * presses it and sees nothing happen reasonably concludes the page is stuck.
   *
   * Focus returns to the toggle, which is the same button in its closed state,
   * so the next Tab continues from the header rather than restarting at the top
   * of the document.
   */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setDrawerOpen(null);
      drawerToggle.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * ArrowDown from a trigger moves focus into its panel.
   *
   * This is not a nicety, it is the only way in. The panel has to be a sibling
   * of the whole header bar to span the full width, so in DOM order it comes
   * after every other tab, Sign In and Register. Tabbing from a trigger
   * therefore lands on the NEXT tab — and since focusing a tab with no menu
   * closes the panel, a keyboard user could open the menu and never once reach
   * its contents. Measured exactly that: Tab from Hospitality went to
   * Health-Care, never into the panel.
   *
   * ArrowDown is the conventional key for opening a disclosure downward, and
   * `aria-expanded` on the trigger is what tells a screen reader there is
   * something to open.
   */
  const wantPanelFocus = useRef(false);

  const focusPanel = useCallback(() => {
    document.querySelector<HTMLElement>("[data-mm='root'] a")?.focus();
  }, []);

  useEffect(() => {
    if (menu === null || !wantPanelFocus.current) return;
    wantPanelFocus.current = false;
    // Deferred a frame: the panel is `inert` until this render commits, and an
    // inert element cannot take focus.
    const id = requestAnimationFrame(focusPanel);
    return () => cancelAnimationFrame(id);
  }, [menu, focusPanel]);

  return (
    <header
      className={cn(
        // Sticky + z-50 keeps the bar above the hero's background video at every
        // scroll position. The hero sets `isolate`, so its internal z-indexes are
        // contained and can never paint over this.
        "sticky top-0 z-50 w-full",
        // blur-md, not blur-xl: the bar is already 93-97% opaque, so a 24px
        // radius buys nothing visible and costs a full-width backdrop pass on
        // every scrolled frame.
        "bg-card/95 text-foreground backdrop-blur-md",
        // A white bar needs the shadow to separate from an ivory page; the
        // dark one has the gold hairline doing that job already.
        "nav-bar shadow-sm transition-shadow duration-200 dark:shadow-none"
      )}
      // Focus-out is handled at the header, not at the nav strip: the panel is
      // a sibling of the nav (it has to be, to span the full width), so tabbing
      // from a trigger into its own menu leaves the nav. Scoping the check here
      // means focus can move anywhere inside the header without closing, and
      // leaving the header entirely closes.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setNow(null);
      }}
      // Backstop. A pointer that exits the header fast enough to skip the
      // trigger's own leave event — off the top of the window, say — would
      // otherwise leave the panel hanging open.
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        schedule(null);
      }}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-stretch justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        {/* The supplied wordmark replaces the placeholder gold "S" plate and
            serif lockup that stood in for it. `.nav-mark` — the travelling
            gloss that ran across that plate — goes with it: it was a highlight
            written for a flat gold chip, and sweeping it across the client's
            artwork would be animating their logo, which is not ours to do. */}
        {/* aria-current matters more here now that MAIN_NAV has no "Home" tab.
            With that tab gone, the homepage had no element marked as current at
            all, so a screen-reader user got no "you are here" signal anywhere in
            the header. The logo is the home link, so it carries it. */}
        <Link
          href="/"
          className="group flex shrink-0 items-center"
          aria-label={`${SITE.name} home`}
          aria-current={isCurrent("/") ? "page" : undefined}
        >
          <SouwelLogo
            height={26}
            priority
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Desktop nav — full-height tab strip. */}
        <div className="hidden items-stretch xl:flex">
          <nav aria-label="Main" className="flex items-stretch">
            {MAIN_NAV.map((item) => {
              const current = isCurrent(item.href);
              const slug = slugOf(item.href);
              const hasMenu = slug !== null && (CATEGORY_PRODUCTS[slug]?.length ?? 0) > 0;
              const expanded = hasMenu && menu === slug;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  // The trigger stays a real link to the category page. The menu
                  // is an enhancement on top of it, never the only way in — and
                  // that is also what makes the touch story work, since a tap
                  // just follows the link.
                  aria-expanded={hasMenu ? expanded : undefined}
                  onPointerEnter={(e) => {
                    // Touch fires pointerenter on tap with no matching leave,
                    // which would pin the panel open over the page being
                    // navigated to.
                    if (e.pointerType !== "mouse") return;
                    schedule(hasMenu ? slug : null);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "mouse") return;
                    schedule(null);
                  }}
                  onFocus={() => setNow(hasMenu ? slug : null)}
                  onKeyDown={(e) => {
                    if (!hasMenu || e.key !== "ArrowDown") return;
                    e.preventDefault(); // or the page scrolls instead
                    if (menu === slug) {
                      // Already open — focusing the trigger opened it. Setting
                      // the same state again is a no-op in React, so the effect
                      // below never runs and focus would never move. Measured
                      // exactly that: ArrowDown left focus on the trigger.
                      focusPanel();
                    } else {
                      wantPanelFocus.current = true;
                      setNow(slug);
                    }
                  }}
                  className={cn(
                    "nav-link flex items-center gap-1.5 px-3.5 text-[11.5px] font-semibold tracking-[0.11em] whitespace-nowrap uppercase",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                    current || expanded
                      ? "nav-current text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {hasMenu && (
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-3 transition-transform duration-300 ease-[var(--ease-out)]",
                        expanded && "rotate-180"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop actions — theme toggle, then either Sign In/Register or the
            signed-in account menu. HeaderAuth owns that decision; see the note
            at the top of it for why the session is read on the client. */}
        <div className="hidden shrink-0 items-center xl:flex">
          <HeaderAuth />
        </div>

        {/* Mobile: theme toggle stays on the bar rather than being buried in
            the drawer — it is a display preference, wanted at the moment the
            screen is too bright, not after opening a navigation menu. */}
        <div className="flex items-center gap-1 xl:hidden">
          <ThemeToggle tone="auto" />
          <button
            type="button"
            ref={drawerToggle}
            onClick={() => setOpen((v) => !v)}
            className="hover:bg-muted self-center rounded-md p-2.5"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Travelling highlight on the bar's gold hairline. A real element rather
          than another pseudo on .nav-bar: it needs its own overflow clip, and
          putting that on <header> would also clip the mobile drawer. */}
      <span aria-hidden className="nav-shine" />

      {/* Mega-menu. Sibling of the bar, so it can span the full content width.
          Desktop only — on touch the tab is just a link, and the drawer below
          carries the same lists. */}
      <div className="hidden xl:block">
        <CategoryMegaMenu
          slug={menu}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            window.clearTimeout(timer.current);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== "mouse") return;
            schedule(null);
          }}
        />
      </div>

      {/* Mobile drawer */}
      <div id="mobile-nav" hidden={!open} className="bg-card border-border border-t xl:hidden">
        <nav
          aria-label="Mobile"
          className="mx-auto flex w-full max-w-7xl flex-col px-4 py-3 sm:px-6"
        >
          {/* Categories with a product list get a disclosure rather than the
              mega-menu: hover does not exist here, and a 14-item panel dropped
              over a 390px screen is not a menu, it is a page. The row still
              navigates; the chevron is a separate control that only expands. */}
          {MAIN_NAV.map((item) => {
            const current = isCurrent(item.href);
            const slug = slugOf(item.href);
            const products = slug ? CATEGORY_PRODUCTS[slug] : undefined;
            const expanded = slug !== null && drawerOpen === slug;

            return (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      // py-3.5 keeps each row past the 44px touch-target floor.
                      "flex-1 rounded-md px-3 py-3.5 text-xs font-semibold tracking-[0.11em] uppercase transition-colors",
                      current
                        ? "nav-row-current text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>

                  {products?.length ? (
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(expanded ? null : slug)}
                      aria-expanded={expanded}
                      aria-controls={`drawer-${slug}`}
                      aria-label={`${expanded ? "Hide" : "Show"} ${item.label} products`}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted grid size-11 shrink-0 place-items-center rounded-md transition-colors"
                    >
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "size-4 transition-transform duration-300 ease-[var(--ease-out)]",
                          expanded && "rotate-180"
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                {/* `slug &&` is redundant at runtime — products only exists
                    when slug does — but it is what narrows the type for
                    productHref below. */}
                {slug && products?.length ? (
                  <ul
                    id={`drawer-${slug}`}
                    hidden={!expanded}
                    className="border-border mb-1 ml-3 grid grid-cols-1 gap-y-0.5 border-l pl-4 sm:grid-cols-2"
                  >
                    {products.map((name) => (
                      <li key={name}>
                        <Link
                          href={productHref(slug, name)}
                          onClick={() => setOpen(false)}
                          className="text-muted-foreground hover:text-foreground flex items-center gap-2.5 py-2.5 text-sm"
                        >
                          <span
                            aria-hidden
                            className="bg-primary/50 size-1.5 shrink-0 rounded-full"
                          />
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}

          <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
            <DrawerAuth onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      </div>
    </header>
  );
}
