/**
 * Static site configuration shared across marketing surfaces.
 * Category slugs here MUST match the seeded Category.slug values in prisma/seed.ts.
 */
import { hasProductPage } from "@/lib/product-slugs";
import { HOSPITALITY_GROUPS, hospitalityItemByName } from "@/lib/hospitality";

export const SITE = {
  name: "Souwel",
  tagline: "Textile manufacturing, engineered for business",
  blurb:
    "Souwel manufactures and distributes quality textiles for hospitality, healthcare, institutional laundry, and commercial businesses nationwide: built to last, priced fairly, and delivered with genuine care.",
} as const;

export type CategoryNavItem = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  /** Accent tone for this range — used for the card glow. */
  accent: string;
  /**
   * Alt text for the card photograph. The image itself is derived from `slug`
   * (public/images/categories/<slug>.jpg), so adding a category means adding a
   * file with the matching name.
   */
  imageAlt: string;
};

export const CATEGORIES: CategoryNavItem[] = [
  {
    slug: "hospitality",
    name: "Hospitality",
    shortName: "Hospitality",
    description: "Linens made for the moments guests remember most.",
    accent: "#6D1A2A",
    imageAlt: "Hotel bed made up in crisp white linen",
  },
  {
    slug: "health-care",
    name: "Health-Care",
    shortName: "Health-Care",
    description: "Comfort and reliability, ready for every shift, every patient.",
    accent: "#2D4A22",
    imageAlt: "Stack of clean white medical-grade towels",
  },
  {
    slug: "institutional-laundry",
    name: "Institutional Laundry",
    shortName: "Laundry",
    description: "Consistent quality that holds up, order after order.",
    accent: "#8B4513",
    imageAlt: "Folded white towels stacked on a laundry rack",
  },
  {
    slug: "commercial-automotive",
    name: "Commercial / Automotive",
    shortName: "Commercial",
    description: "Hard-working textiles for hard-working spaces.",
    accent: "#4A5C2F",
    imageAlt: "Plain white technical textile laid flat",
  },
];

export type ProductGroup = {
  /** Heading shown above this block. Null renders the list with no heading. */
  title: string | null;
  items: string[];
  /**
   * Where this block sits in the mega-menu's three-column grid, 1-based.
   *
   * Only grouped categories carry it. A flat category leaves both undefined and
   * its single list flows into balanced columns instead — see the note on the
   * grid in components/marketing/CategoryMegaMenu.tsx.
   */
  col?: number;
  row?: number;
};

/**
 * The client's arrangement of the five Hospitality blocks in the mega-menu:
 * one row, one column each, in this order.
 *
 * SET BY HAND, BECAUSE NO RULE PRODUCES IT. This is the order the client reads
 * the range in, not the order the source list happens to be written in, so it is
 * written down rather than derived — and a new group added to
 * HOSPITALITY_GROUPS needs an entry here or the grid will place it wherever it
 * fits. Note that a sixth group would also need a wider column set in
 * components/marketing/CategoryMegaMenu.tsx; five is what the panel fits.
 */
const HOSPITALITY_MENU_PLACEMENT: Record<string, { col: number; row: number }> = {
  "bed-linen": { col: 1, row: 1 },
  "bath-linen": { col: 2, row: 1 },
  "kitchen-linen": { col: 3, row: 1 },
  "table-linen": { col: 4, row: 1 },
  "pool-fitness-spa-salon": { col: 5, row: 1 },
};

/**
 * Product ranges per category. These drive the header's mega-menu and the
 * mobile drawer.
 *
 * GROUPED, NOT FLAT. Hospitality carries thirty-one lines organised under five
 * headings the client uses internally — Bed, Bath, Table, Kitchen, and the
 * leisure floor. Thirty-one names in one alphabetised column is a list you read
 * end to end; under five headings it is a list you skim to the one heading you
 * came for. The other three categories have a single untitled group, which
 * renders exactly as the flat list did.
 *
 * HOSPITALITY IS DERIVED FROM lib/hospitality.ts, which is also what builds the
 * /hospitality landing page and its five listing pages. Typing the names here
 * as well would put the same thirty-one strings in two files, and the drift
 * would be silent: the menu would offer a product the listing page had dropped.
 *
 * Title case rather than the product sheet's uppercase: the nav labels above
 * are uppercase because they are one or two short words, but a column of
 * seventeen all-caps product names is genuinely slower to read — caps strip the
 * word-shape the eye scans by.
 *
 * Kept as plain strings, and kept in this file, because the header imports it.
 * Importing product-data here would drag every product's specification table
 * into the client bundle to render a list of names. lib/hospitality.ts is safe
 * to import for the same reason: it holds no specifications either.
 */
export const CATEGORY_PRODUCTS: Partial<Record<string, ProductGroup[]>> = {
  hospitality: HOSPITALITY_GROUPS.map((g) => ({
    title: g.title,
    items: g.items.map((i) => i.name),
    ...HOSPITALITY_MENU_PLACEMENT[g.slug],
  }))
    // ROW-MAJOR, so the DOM order is the order the grid is read in. The blocks
    // are placed explicitly, which means source order and visual order are free
    // to disagree — and if they did, a keyboard user would tab from the bottom
    // of the middle column back up to the top of the right one. Sorting here
    // costs nothing and keeps the two in step.
    .sort((a, b) => (a.row ?? 99) - (b.row ?? 99) || (a.col ?? 99) - (b.col ?? 99)),
  "health-care": [
    {
      title: null,
      items: [
        "Surgical Towel",
        "Hyperbaric Blanket",
        "Chevron Blanket",
        "Spectrum Spread Blanket",
        "Spectrum Links Spread Blanket",
        "Serpentine Blanket",
        "Herringbone Thermal Blanket",
        "Bath Blanket",
        "Baby Blanket",
        "Huck Towel",
        "Hand Towel",
        "Bath Towel",
        "Wash Cloth",
      ],
    },
  ],
  "institutional-laundry": [
    {
      title: null,
      items: [
        "Bath Blanket",
        "Baby Blanket",
        "Shop Towel",
        "Bistro Napkin",
        "Kitchen Towel Herringbone",
        "Kitchen Towel Checks",
        "Glass Towel",
        "Dish Towel",
        "Bar Mop",
        "Hand Towel",
        "Bath Towel",
        "Wash Cloth",
      ],
    },
  ],
  "commercial-automotive": [
    {
      title: null,
      items: ["Shop Towel", "Drop Cloth"],
    },
  ],
};

/** URL-safe slug for a product name, e.g. "Duvet/Pillow Covers" -> "duvet-pillow-covers". */
export function productSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Where a product name in the nav should link.
 *
 * Three targets, in order:
 *
 *   1. A product with a real detail page goes to it. Twenty-four do.
 *   2. A Hospitality line without one goes to its listing page, anchored to its
 *      own card — /hospitality/bath-linen#bath-robes. That anchor RESOLVES: the
 *      listing page renders a card for every line in the group, specification
 *      or not.
 *   3. Anything else falls back to an anchor on its category page.
 *
 * Branch 2 exists because twenty of the thirty-one Hospitality lines are not on
 * the client's product sheet and so have no detail page. Before it they all
 * pointed at /categories/hospitality#something, which lands on the right page
 * and then does nothing, because that page has no such anchor. A link that
 * quietly fails to move is worse than one that 404s: nobody reports it.
 *
 * The slug list comes from lib/product-slugs, which both this file and
 * lib/product-data import. It is deliberately a separate module: the header
 * cannot import product-data without dragging every product's specification
 * blob into the client bundle, and duplicating the list here is what this
 * arrangement exists to prevent.
 */
export function productHref(categorySlug: string, name: string) {
  const hospitality = hospitalityItemByName(name);
  if (hospitality) {
    const { group, item } = hospitality;
    return item.productSlug
      ? `/products/${item.productSlug}`
      : `/hospitality/${group.slug}#${item.slug}`;
  }

  const slug = productSlug(name);
  return hasProductPage(slug) ? `/products/${slug}` : `/categories/${categorySlug}#${slug}`;
}

/**
 * Routes that actually resolve today.
 *
 * MAIN_NAV and FOOTER_LINKS below describe the site as it is DESIGNED — they
 * point at /about, /contact, /quote and the four category pages, none of which
 * are built yet. That is fine for the header and footer, which are a map of the
 * finished site. It is not fine anywhere a broken link is actively harmful:
 *
 *   - sitemap.xml, where submitting 404s costs crawl budget and credibility
 *   - the 404 page's own "helpful links", which have exactly one job and fail
 *     it completely if they lead to another 404
 *
 * So those two read from here instead. Move an entry up as its route is built;
 * the two consumers then pick it up with no further edits.
 *
 * PRODUCT PAGES ARE NOT LISTED HERE, deliberately. There are twenty-four of
 * them and the two consumers want different things from that fact:
 *   - sitemap.xml wants every one, so it composes this list with
 *     PRODUCT_PAGE_SLUGS itself
 *   - the 404 page wants a short set of ways out; twenty-four product links
 *     under "helpful links" is a catalogue, not help
 */
export const LIVE_ROUTES: { href: string; label: string }[] = [
  { href: "/", label: "Homepage" },
  ...CATEGORIES.map((c) => ({ href: categoryHref(c.slug), label: c.name })),
  // Hospitality's five listing pages. They are real routes with their own
  // metadata, and leaving them out of the sitemap would hide thirty-one
  // products behind a page that only links to them client-side.
  ...HOSPITALITY_GROUPS.map((g) => ({
    href: `/hospitality/${g.slug}`,
    label: `Hospitality — ${g.title}`,
  })),
  { href: "/quote", label: "Request a Quote" },
  { href: "/contact", label: "Contact Us" },
];

/** Not yet built. Kept beside LIVE_ROUTES so the gap is visible in one place. */
export const PLANNED_ROUTES = ["/about"] as const;

/**
 * Header navigation. Uses each category's `shortName`, not `name`: the header
 * renders uppercase with wide letter-spacing, and the full labels
 * ("Institutional/Laundry", "Commercial/Automotive") overflow the bar at that
 * treatment. The footer still links them by their full names.
 *
 * THERE IS DELIBERATELY NO "HOME" ENTRY. The logo is the home link — that is a
 * universal convention, it already carries an explicit `aria-label` saying so,
 * and it is present on every breakpoint including behind the open mobile
 * drawer, which renders below the bar rather than over it. A "Home" tab beside
 * it is the same destination twice, and it spends the widest slot in the bar on
 * the one place a visitor can always already reach.
 *
 * THERE IS NO "ABOUT" ENTRY EITHER, by the client's decision. /about is still
 * reached from the footer and from the hero's second button, so the route is
 * not orphaned — it is simply not one of the six tabs competing for the bar.
 */
/**
 * Hospitality is the one category with a landing page of its own rather than a
 * /categories/ page — five ranges, a video band and thirty-one lines needed
 * more room than the shared category template gives. `categoryHref` keeps that
 * exception in one place so the header, the footer, the sitemap and the 404's
 * helpful links cannot disagree about where Hospitality lives.
 */
export function categoryHref(slug: string) {
  return slug === "hospitality" ? "/hospitality" : `/categories/${slug}`;
}

export const MAIN_NAV = [
  ...CATEGORIES.map((c) => ({ href: categoryHref(c.slug), label: c.shortName })),
  { href: "/contact", label: "Contact Us" },
];

export const FOOTER_LINKS = {
  Categories: CATEGORIES.map((c) => ({ href: categoryHref(c.slug), label: c.name })),
  "Useful Links": [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/quote", label: "Request Quote" },
    // One entry, not the previous "Create an Account" plus "Customer Login".
    // /register already links to sign-in for anyone who has an account, so two
    // rows here were two doors into the same room.
    { href: "/register", label: "Customer Account / Register" },
  ],
  Manufacturing: [
    { href: "/about#capabilities", label: "Our Capabilities" },
    { href: "/about#quality", label: "Quality Standards" },
    { href: "/about#sustainability", label: "Sustainability" },
    { href: "/about#coverage", label: "Global Coverage" },
  ],
} as const;
