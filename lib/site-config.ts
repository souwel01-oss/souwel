/**
 * Static site configuration shared across marketing surfaces.
 * Category slugs here MUST match the seeded Category.slug values in prisma/seed.ts.
 */
import { hasProductPage } from "@/lib/product-slugs";

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

/**
 * Product ranges per category. These drive the header's mega-menu.
 *
 * GENERATED FROM THE CATALOGUE, NOT TYPED BY HAND. The names and the grouping
 * both come from lib/product-data.ts, where each product carries every sector
 * the client's sheet lists it under. That is why a product appears in more than
 * one column here -- a Bath Towel really is specified for health-care,
 * hospitality and institutional laundry, and a menu that picked one of the
 * three would hide it from the buyers looking in the other two.
 *
 * ALL FOUR CATEGORIES HAVE LISTS NOW. They did not before, and the two without
 * one fell through to a plain link with no menu.
 *
 * Title case rather than the SHEET'S uppercase: the nav labels above are
 * uppercase because they are one or two short words, but a column of seventeen
 * all-caps product names is genuinely slower to read -- caps strip the
 * word-shape the eye scans by.
 *
 * Kept as plain strings, and kept in this file, because the header imports it.
 * Importing product-data here would drag every product's specification table
 * into the client bundle to render a list of names.
 */
export const CATEGORY_PRODUCTS: Partial<Record<string, string[]>> = {
  hospitality: [
    "Chevron Blanket",
    "Spectrum Spread Blanket",
    "Spectrum Links Spread Blanket",
    "Serpentine Blanket",
    "Saloon Towel",
    "Huck Towel",
    "Napkin",
    "Bistro Napkin",
    "Kitchen Towel Herringbone",
    "Kitchen Towel Checks",
    "Glass Towel",
    "Dish Towel",
    "Bar Mop",
    "Bath Mat",
    "Hand Towel",
    "Bath Towel",
    "Wash Cloth",
  ],
  "health-care": [
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
  "institutional-laundry": [
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
  "commercial-automotive": ["Shop Towel", "Drop Cloth"],
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
 * Products with a real detail page go there. Anything without one falls back to
 * an anchor on its category page — which is itself still unbuilt, so that branch
 * is a placeholder for a placeholder. It stays because it is the honest target:
 * that is where the content is planned to live.
 *
 * The slug list comes from lib/product-slugs, which both this file and
 * lib/product-data import. It is deliberately a separate module: the header
 * cannot import product-data without dragging every product's specification
 * blob into the client bundle, and duplicating the list here is what this
 * arrangement exists to prevent.
 */
export function productHref(categorySlug: string, name: string) {
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
  ...CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.name })),
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
export const MAIN_NAV = [
  ...CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.shortName })),
  { href: "/contact", label: "Contact Us" },
];

export const FOOTER_LINKS = {
  Categories: CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.name })),
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
