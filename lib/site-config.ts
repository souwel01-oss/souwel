/**
 * Static site configuration shared across marketing surfaces.
 * Category slugs here MUST match the seeded Category.slug values in prisma/seed.ts.
 */

export const SITE = {
  name: "Souwel",
  tagline: "Textile manufacturing, engineered for business",
  blurb:
    "Souwel manufactures premium textiles for hospitality, health-care, institutional laundry, and commercial/automotive sectors — built to withstand commercial-grade use.",
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
    description:
      "Bed linen, towels, and table textiles engineered for hotels, resorts, and food service.",
    accent: "#6D1A2A",
    imageAlt: "Hotel bed made up in crisp white linen",
  },
  {
    slug: "health-care",
    name: "Health-Care",
    shortName: "Health-Care",
    description:
      "Medical-grade textiles for hospitals and clinics, built for repeated high-temperature laundering.",
    accent: "#2D4A22",
    imageAlt: "Stack of clean white medical-grade towels",
  },
  {
    slug: "institutional-laundry",
    name: "Institutional/Laundry",
    shortName: "Institutional",
    description:
      "High-durability textiles specified for industrial laundry cycles and institutional volume.",
    accent: "#8B4513",
    imageAlt: "Folded white towels stacked on a laundry rack",
  },
  {
    slug: "commercial-automotive",
    name: "Commercial/Automotive",
    shortName: "Commercial",
    description:
      "Technical fabrics and upholstery textiles for commercial fit-out and automotive interiors.",
    accent: "#4A5C2F",
    imageAlt: "Plain white technical textile laid flat",
  },
];

/**
 * Product ranges per category, as supplied by the client.
 *
 * These drive the header's mega-menu. Rendered in title case rather than the
 * uppercase they were given in: the nav labels above are uppercase because they
 * are three or four short words, but a column of fourteen all-caps product names
 * is genuinely slower to read — caps strip the word-shape the eye scans by.
 *
 * ASSUMPTION: the health-care list arrived with "BED LINENS PILLOW COVERS" on a
 * single line, where every other entry was one per line. Read as two items, a
 * line break having been lost — "Bed Linens" and "Pillow Covers" are distinct
 * products, and Hospitality lists its combined form separately as
 * "Duvet/Pillow Covers". Say the word if it was meant as one item.
 *
 * Only two categories have lists so far; the other two fall through to a plain
 * link with no menu, which is why this is a partial record rather than a map
 * that must cover every slug.
 */
export const CATEGORY_PRODUCTS: Partial<Record<string, string[]>> = {
  "health-care": [
    "Bed Linens",
    "Pillow Covers",
    "Terry Towels",
    "Patient Gowns",
    "Scrub Suits",
    "Lab Coats",
    "Bath Blankets",
    "Baby Blankets",
    "Thermal Blankets",
    "Surgical Towels (Lint Free)",
    "Water Proof Flat Pads",
  ],
  hospitality: [
    "Bedding Linens",
    "Terry Towels",
    "Pillow",
    "Pool and Beach Towels",
    "Duvet/Pillow Covers",
    "Barmops",
    "Kitchen Towels",
    "Duvet Comforters",
    "Salon and Spa",
    "Table Covers / Napkins",
    "Mattress Protector",
    "Terry Grill Pads",
    "Glass Towel",
    "Bib Apron",
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
 * Products with a real detail page go there. The rest fall back to an anchor on
 * their category page, which is where they will live once that page is built.
 *
 * Deliberately NOT "point everything at /products/<slug>". Only one of the
 * twenty-five products has a page today, and routing the other twenty-four at a
 * route that returns 404 would trade one kind of dead link for a worse one — at
 * least the category anchor is where the content is actually planned to be.
 *
 * The lookup lives here rather than importing lib/product-data directly into
 * the header so the nav does not pull the full specification blob of every
 * product into the client bundle. Keep the two in step.
 */
const PRODUCTS_WITH_PAGES = new Set(["bedding-linens"]);

export function productHref(categorySlug: string, name: string) {
  const slug = productSlug(name);
  return PRODUCTS_WITH_PAGES.has(slug)
    ? `/products/${slug}`
    : `/categories/${categorySlug}#${slug}`;
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
 */
export const LIVE_ROUTES: { href: string; label: string }[] = [
  { href: "/", label: "Homepage" },
  { href: "/products/bedding-linens", label: "Bedding Linens" },
];

/** Not yet built. Kept beside LIVE_ROUTES so the gap is visible in one place. */
export const PLANNED_ROUTES = [
  "/about",
  "/contact",
  "/quote",
  ...CATEGORIES.map((c) => `/categories/${c.slug}`),
] as const;

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
 */
export const MAIN_NAV = [
  ...CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.shortName })),
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

export const FOOTER_LINKS = {
  Categories: CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.name })),
  "Useful Links": [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/quote", label: "Request a Quote" },
    { href: "/register", label: "Create an Account" },
    { href: "/login", label: "Customer Login" },
  ],
  Manufacturing: [
    { href: "/about#capabilities", label: "Our Capabilities" },
    { href: "/about#quality", label: "Quality Standards" },
    { href: "/about#sustainability", label: "Sustainability" },
    { href: "/about#coverage", label: "Global Coverage" },
  ],
} as const;
