/**
 * The Commercial range, grouped the way the client organises it.
 *
 * THREE GROUPS: Automotive, Airline and Institutional Laundry. This one list
 * drives the header's Commercial mega-menu, the /commercial page and a page
 * per product, the same arrangement as lib/hospitality.ts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE LINE HAS A SPECIFICATION ON THE PRODUCT SHEET: Shop Towel. `productSlugs`
 * names its catalogue entry in lib/product-data.ts. Microfiber Towel and the
 * six Airline lines are made but not on the sheet, so their pages say
 * "Specification on request" and quote by name rather than borrowing figures
 * from a neighbouring line — a Galley/Bar Towel page showing the Bar Mop's
 * weight would be a specification nobody at Souwel wrote.
 *
 * INSTITUTIONAL LAUNDRY HOLDS NO PRODUCTS OF ITS OWN. Its two lines are the
 * Hospitality and Health-Care ranges, supplied to the laundries that serve
 * them, so they carry an `href` to those ranges instead of a page here.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DELIBERATELY FREE OF ANY product-data IMPORT, for the same reason as
 * lib/hospitality.ts: the header builds its menu from this file.
 */

export type CommercialItem = {
  /** As the client writes it — the menu label, the card and the page title. */
  name: string;
  slug: string;
  /** Catalogue entries this line is. Empty: not on the sheet. */
  productSlugs: string[];
  /** The paragraph under the title on the line's page, or on its card. */
  intro: string;
  /** Set when the line is another range rather than a product page here. */
  href?: string;
};

export type CommercialGroup = {
  slug: string;
  title: string;
  /** One line under the group's heading on /commercial. */
  description: string;
  items: CommercialItem[];
};

export const COMMERCIAL_BASE = "/commercial";

const ON_REQUEST =
  "This line is not on our published specification sheet yet, so construction, sizes and colours are confirmed with your quotation.";

export const COMMERCIAL_GROUPS: CommercialGroup[] = [
  {
    slug: "automotive",
    title: "Automotive",
    description: "Cloths for the workshop, the detailing bay and the rental fleet.",
    items: [
      {
        name: "Microfiber Towel",
        slug: "microfiber-towel",
        productSlugs: [],
        intro: `Microfiber towels for the workshop and the detailing bay. ${ON_REQUEST}`,
      },
      {
        name: "Shop Towel",
        slug: "shop-towel",
        productSlugs: ["shop-towel"],
        intro:
          "The workshop and rental cloth: a 75/25 blend at 14″×14″, surged on the edges so it survives being laundered and reissued, in four shades.",
      },
    ],
  },
  {
    slug: "airline",
    title: "Airline",
    description: "Textiles for the cabin, the galley and the hangar.",
    items: [
      {
        name: "Passenger Wash Cloth",
        slug: "passenger-wash-cloth",
        productSlugs: [],
        intro: `Wash cloths for the passenger cabin. ${ON_REQUEST}`,
      },
      {
        name: "Tableware",
        slug: "tableware",
        productSlugs: [],
        intro: `Table textiles for onboard meal service. ${ON_REQUEST}`,
      },
      {
        name: "Cabin Crew Galley Towel",
        slug: "cabin-crew-galley-towel",
        productSlugs: [],
        intro: `Towels for cabin crew working the galley. ${ON_REQUEST}`,
      },
      {
        name: "Galley/Bar Towel",
        slug: "galley-bar-towel",
        productSlugs: [],
        intro: `Towels for the galley and the bar cart. ${ON_REQUEST}`,
      },
      {
        name: "Kitchen Towel",
        slug: "kitchen-towel",
        productSlugs: [],
        intro: `Kitchen towels for airline catering. ${ON_REQUEST}`,
      },
      {
        name: "Maintenance Towel",
        slug: "maintenance-towel",
        productSlugs: [],
        intro: `Towels for aircraft maintenance and ground crews. ${ON_REQUEST}`,
      },
    ],
  },
  {
    slug: "institutional-laundry",
    title: "Institutional Laundry",
    description:
      "Linen built for the commercial laundry cycle: our Hospitality and Health-Care ranges, supplied to the laundries that serve them.",
    items: [
      {
        name: "Hospitality",
        slug: "hospitality",
        productSlugs: [],
        intro: "Bed, bath, table, kitchen and spa linen for hotels and resorts.",
        href: "/hospitality",
      },
      {
        name: "Health-Care",
        slug: "health-care",
        productSlugs: [],
        intro: "Towels, blankets, gowns and bed linen for wards, nurseries and treatment rooms.",
        href: "/health-care",
      },
    ],
  },
];

/** Every line with a page of its own here — the two range links excluded. */
export const COMMERCIAL_ITEMS: { group: CommercialGroup; item: CommercialItem }[] =
  COMMERCIAL_GROUPS.flatMap((group) =>
    group.items.filter((item) => !item.href).map((item) => ({ group, item }))
  );

const BY_SLUG = new Map(COMMERCIAL_ITEMS.map((entry) => [entry.item.slug, entry]));
const BY_NAME = new Map(
  COMMERCIAL_GROUPS.flatMap((group) => group.items.map((item) => [item.name, item] as const))
);

export function getCommercialItem(slug: string) {
  return BY_SLUG.get(slug);
}

/** The line a menu label names, for the header's links and the quote form. */
export function commercialItemByName(name: string): CommercialItem | undefined {
  return BY_NAME.get(name);
}

export function commercialItemHref(item: CommercialItem): string {
  return item.href ?? `${COMMERCIAL_BASE}/${item.slug}`;
}
