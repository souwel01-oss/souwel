"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_PRODUCTS,
  categoryHref,
  productHref,
  type ProductGroup,
} from "@/lib/site-config";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Full-width mega-menu for the header's category tabs.
 *
 * ONE SHARED PANEL, NOT ONE PER TAB. The panel spans the whole content width,
 * so it cannot be a child of the trigger it belongs to — an absolutely
 * positioned child would be anchored to a 120px tab. Ownership of `slug`
 * therefore lives in SiteHeader, and this renders whichever category is open.
 * The reward for that is the cross-fade: moving from Hospitality to Health-Care
 * re-staggers the list in place instead of closing one panel and opening
 * another, which is the difference between a menu and two menus.
 *
 * THE PANEL STAYS MOUNTED. It is emptied only after the close animation
 * finishes, via `content` below — unmounting on `slug === null` would blank the
 * panel on the first frame of the close and you would watch it collapse empty.
 *
 * MOTION — a downward clip-path wipe, not a fade or a height tween. Height
 * animates layout on every frame; opacity alone reads as a sheet of glass
 * appearing from nowhere. The wipe reads as the panel being drawn out from under
 * the bar, which is what a menu attached to a bar should do. A gold hairline
 * runs the width just ahead of it, so the edge of the wipe is a lit line rather
 * than a moving boundary between two dark colours.
 *
 * ACCESSIBILITY — every trigger keeps its own link to the category page, so the
 * menu is an enhancement rather than the only route in. The panel is
 * `inert` while closed, which removes its links from the tab order and from
 * assistive tech in one attribute; `aria-hidden` alone would leave them
 * focusable. Escape and focus-out are handled by SiteHeader, which owns state.
 */

/** Timing shared with the trigger's own hover intent. */
const OPEN_DUR = 0.42;
const CLOSE_DUR = 0.22;

/**
 * Written out rather than interpolated. Tailwind reads class names out of the
 * source as literal strings, so a template like `col-start-${n}` compiles to
 * nothing at all and the block silently lands wherever the grid puts it.
 */
const COL_START: Record<number, string> = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
};
const ROW_START: Record<number, string> = {
  1: "row-start-1",
  2: "row-start-2",
};

export function CategoryMegaMenu({
  slug,
  onPointerEnter,
  onPointerLeave,
}: {
  slug: string | null;
  /** Supplied by the header so the pointer can travel from tab into panel
   *  without the close timer firing on the way. */
  onPointerEnter?: React.PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLDivElement>;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Last non-null category, so the panel still has something to draw while it
  // animates closed — unmounting on `slug === null` would blank it on the first
  // frame of the close.
  //
  // Adjusted during render, which is React's own pattern for deriving state
  // from a changed prop. The two alternatives both fail: setState in an effect
  // renders the empty panel once before filling it (and trips the
  // cascading-render rule), and a ref written during render is not tracked, so
  // the panel would not re-render when the category changes.
  const [content, setContent] = useState<string | null>(slug);
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    if (slug) setContent(slug);
  }

  const category = CATEGORIES.find((c) => c.slug === content) ?? null;
  const groups = content ? (CATEGORY_PRODUCTS[content] ?? []) : [];

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !category) return;

      const open = slug !== null;
      const panel = el.querySelector<HTMLElement>("[data-mm='panel']");
      const sweep = el.querySelector<HTMLElement>("[data-mm='sweep']");
      const items = gsap.utils.toArray<HTMLElement>("[data-mm='item']", el);
      const aside = el.querySelector<HTMLElement>("[data-mm='aside']");
      if (!panel) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: open ? 1 : 0 });
        gsap.set(panel, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set([...items, aside].filter(Boolean), { opacity: 1, y: 0, filter: "none" });
        return;
      }

      const tl = gsap.timeline();

      if (open) {
        tl.set(el, { visibility: "visible", pointerEvents: "auto" })
          .to(el, { opacity: 1, duration: 0.12, ease: "none" }, 0)
          .fromTo(
            panel,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: OPEN_DUR, ease: "power3.out" },
            0
          )
          // The lit edge runs slightly ahead of the wipe, so it reads as the
          // thing pulling the panel down rather than a decoration sitting on it.
          .fromTo(
            sweep,
            { scaleX: 0, opacity: 1 },
            { scaleX: 1, duration: OPEN_DUR * 0.8, ease: "power2.out" },
            0
          )
          .fromTo(
            aside,
            { opacity: 0, x: -14 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" },
            0.08
          )
          .fromTo(
            items,
            { opacity: 0, y: 12, filter: "blur(5px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.4,
              ease: "power3.out",
              // Small per-item offset — fourteen items at the usual 0.08 would
              // still be arriving a second after the panel finished opening.
              stagger: 0.028,
              clearProps: "filter",
            },
            0.1
          );
      } else {
        tl.to(sweep, { opacity: 0, duration: CLOSE_DUR * 0.6, ease: "none" }, 0)
          .to(
            panel,
            { clipPath: "inset(0% 0% 100% 0%)", duration: CLOSE_DUR, ease: "power2.in" },
            0
          )
          .to(el, { opacity: 0, duration: CLOSE_DUR, ease: "power2.in" }, 0)
          .set(el, { visibility: "hidden", pointerEvents: "none" });
      }

      return () => {
        tl.kill();
      };
    },
    { scope: root, dependencies: [slug, content] }
  );

  return (
    <div
      ref={root}
      data-mm="root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      // Starts hidden and inert; GSAP owns visibility from here.
      className="pointer-events-none invisible absolute inset-x-0 top-full opacity-0"
      // `inert` is the whole job in one attribute: not focusable, not in the
      // a11y tree, not clickable. React 19 supports it as a real boolean prop.
      inert={slug === null}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-mm="panel"
          // Follows the bar it hangs from. It was a fixed navy gradient, which
          // was right when the bar was navy too and is a dark slab dropping out
          // of a white one now. --popover is the token for exactly this: a
          // surface floating above the page, defined once per theme.
          className="bg-popover border-border relative overflow-hidden rounded-b-2xl border border-t-0 shadow-[0_30px_60px_-30px_rgb(10_37_64/0.28)] dark:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.85)]"
        >
          {/* Lit edge across the top of the panel. */}
          <span
            aria-hidden
            data-mm="sweep"
            className="absolute inset-x-0 top-0 h-px origin-left bg-[linear-gradient(90deg,transparent,#C9A84C_18%,#E6CE84_50%,#C9A84C_82%,transparent)] shadow-[0_0_12px_1px_rgb(201_168_76/0.55)]"
          />

          {/* Ambient key light, matching the coverage map's treatment. */}
          <span
            aria-hidden
            className="bg-primary/10 dark:bg-primary/18 pointer-events-none absolute -top-28 left-1/3 h-64 w-[32rem] rounded-full blur-[90px]"
          />

          {category && (
            <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-12 lg:gap-10">
              {/* Left rail — what the range is, and the way through to it.
                  Three columns, not four: at four the image was tall enough to
                  set the panel's height on its own, leaving the product list
                  floating in the top half with a band of empty navy under it. */}
              <div data-mm="aside" className="lg:col-span-3">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                  <Image
                    src={`/images/categories/${category.slug}.jpg`}
                    alt={category.imageAlt}
                    fill
                    sizes="(max-width: 1280px) 0px, 18rem"
                    className="object-cover object-center"
                  />
                  <span
                    aria-hidden
                    // Sinks the photograph into the panel it sits on, so the two
                    // do not meet at a hard edge. That means it has to follow
                    // the panel: a near-black wash designed for a navy panel
                    // read as a bruise across the bottom of the image once the
                    // panel went white.
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(10,37,64,0.16))] dark:bg-[linear-gradient(180deg,transparent_30%,rgba(4,16,29,0.75))]"
                  />
                </div>

                <p className="font-heading text-foreground mt-5 text-xl font-semibold">
                  {category.name}
                </p>
                <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                  {category.description}
                </p>

                <Link
                  href={categoryHref(category.slug)}
                  className="text-primary-strong hover:text-foreground dark:text-accent-gold dark:hover:text-ivory focus-visible:ring-ring mt-5 inline-flex items-center gap-2 rounded-sm text-[11.5px] font-semibold tracking-[0.11em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  View the full range
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Product list. Two columns from lg, three from xl — fourteen
                  items in a single column would run past the fold. */}
              {/* self-center rather than top-aligned: the list is always
                  shorter than the rail beside it, and centring splits that
                  difference instead of pooling all of it at the bottom. */}
              <div className="self-center lg:col-span-9">
                <p className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.2em] uppercase">
                  Products
                </p>

                {/* TWO LAYOUTS, PICKED ON WHETHER THE CATEGORY IS GROUPED.

                    A grouped category (Hospitality) is placed on an explicit
                    grid — one column per block, all on one row, in the client's
                    order. Explicit placement rather than flow because the order
                    is theirs to set and does not follow from item counts; the
                    map lives in lib/site-config.ts.

                    THE COLUMN GAP IS TIGHTER HERE THAN ANYWHERE ELSE ON THE
                    SITE, and it still is not enough. Five columns across this
                    panel leave 153px each at gap-x-5; three labels are longer
                    than that and wrap to two lines — "Duvet insert /
                    comforter" and both "Kitchen towels –" lines — as does the
                    "Pool, Fitness, Spa & Salon" heading. That is the price of
                    one row and it is the client's call, so it is left alone
                    rather than paid for by shrinking the type.

                    Do not try to reclaim the width from the rail beside it:
                    dropping the aside to two columns buys about 20px per
                    column and the longest label needs another 60, so the wraps
                    survive and the range photograph is cramped for nothing.

                    A FLAT CATEGORY STILL POURS. One untitled list of thirteen
                    has no blocks to align, and balanced columns are the right
                    shape for it — the same list it has always been. */}
                {groups.some((g) => g.col) ? (
                  <div className="mt-4 grid grid-cols-5 items-start gap-x-5 gap-y-5">
                    {groups.map((group) => (
                      <div
                        key={group.title ?? "all"}
                        className={`${COL_START[group.col ?? 0] ?? ""} ${
                          ROW_START[group.row ?? 0] ?? ""
                        }`}
                      >
                        <GroupBlock group={group} categorySlug={category.slug} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 gap-x-8 sm:columns-2 xl:columns-3">
                    {groups.map((group) => (
                      <GroupBlock
                        key={group.title ?? "all"}
                        group={group}
                        categorySlug={category.slug}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One heading-and-list block, shared by both layouts above so the grid and the
 * poured columns cannot drift apart in styling.
 */
function GroupBlock({ group, categorySlug }: { group: ProductGroup; categorySlug: string }) {
  return (
    <>
      {group.title ? (
        <h3
          data-mm="item"
          className="text-accent-gold dark:text-accent-gold mb-1.5 text-[10.5px] font-semibold tracking-[0.16em] uppercase"
        >
          {group.title}
        </h3>
      ) : null}

      <ul>
        {group.items.map((name) => (
          <li key={name} data-mm="item">
            <Link
              href={productHref(categorySlug, name)}
              className="group/mm text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {/* Marker picks up the map's lighting language — dim at rest, lit
                  on hover, so the row reads as active without moving anything. */}
              <span
                aria-hidden
                className="bg-primary/40 group-hover/mm:bg-primary size-1.5 shrink-0 rounded-full transition-all duration-200 group-hover/mm:shadow-[0_0_8px_2px_rgb(11_151_255/0.45)]"
              />
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
