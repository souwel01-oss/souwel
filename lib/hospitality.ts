/**
 * The Hospitality range, grouped the way the client organises it.
 *
 * FIVE GROUPS, THIRTY-ONE LINES. This drives three surfaces from one list: the
 * header's Hospitality mega-menu, the /hospitality landing page, and the
 * product listing page for each group. They cannot drift because there is
 * nothing to keep in sync.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ELEVEN OF THE THIRTY-ONE HAVE A SPECIFICATION. THE OTHER TWENTY DO NOT.
 *
 * `productSlug` points at an entry in lib/product-data.ts — the catalogue built
 * from the client's product sheet. Where it is null, the line is a product the
 * client sells that is NOT on that sheet: no blend, no size, no weight, no
 * colours. Those cards say "Specification on request" and route to the quote
 * form rather than borrowing figures from a neighbouring product.
 *
 * That is the whole discipline of this file. A Bath Robe card showing
 * "86/14, 24″×48″" because Bath Towel happens to sit next to it would be a
 * specification nobody at Souwel wrote, presented to a buyer as fact. Send the
 * spec sheet for the missing twenty and they fill in with no code change beyond
 * a `productSlug`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DELIBERATELY FREE OF ANY product-data IMPORT. lib/site-config.ts derives the
 * mega-menu from this file, and site-config is imported by the header — pulling
 * product-data in behind it would ship every product's specification table to
 * the browser to render a list of names. The listing pages, which are server
 * components, do the join themselves.
 */

export type HospitalityItem = {
  name: string;
  /** Anchor id on the listing page, and the card's own key. */
  slug: string;
  /**
   * The catalogue entry this line is, when we have its specification.
   * Null means the client sells it but it is not on the supplied sheet.
   */
  productSlug: string | null;
  /**
   * An explicit destination, for a line that is a RANGE rather than a product.
   *
   * Terry Towels is the only one today: seven constructions on the client's
   * towel sheet, each made in up to four sizes. It cannot be a `productSlug`
   * because there is no single product behind it, and it must not fall through
   * to the anchor-on-the-listing-page default, because the thing it opens is a
   * listing page of its own. When this is set it wins over both.
   */
  href?: string;
  /**
   * Call to action for this line's card on the listing page. A range opens;
   * a product is quoted. Defaults to the quote form.
   */
  ctaLabel?: string;
  /**
   * Overrides `name` in the mega-menu and mobile drawer only. Defaults to
   * `name` everywhere else — the Bath Linen listing card, the breadcrumb, the
   * /hospitality/terry-towels page itself all keep saying "Terry Towels";
   * only the nav's list of names is shorter. Indexed into BY_NAME below
   * alongside `name`, so a link built from this label still resolves.
   */
  menuLabel?: string;
};

export type HospitalityGroup = {
  slug: string;
  /** As the client writes it — used as the mega-menu heading and the card. */
  title: string;
  /** One line under the card image on /hospitality. */
  description: string;
  /** Longer intro at the top of the listing page. */
  intro: string;
  image: { src: string; alt: string };
  /** Photographs the cards in this group fall back to, in order. */
  fallbackImages: { src: string; alt: string }[];
  items: HospitalityItem[];
};

const IMG = {
  bed: { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
  duvet: { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
  pillow: { src: "/images/products/pillow-covers.jpg", alt: "White pillows on a made bed" },
  towels: { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
  barmops: {
    src: "/images/products/bar-mops.jpg",
    alt: "Rolled white cotton bar mops stacked together",
  },
  napkins: {
    src: "/images/products/napkins.jpg",
    alt: "Folded white linen napkin fabric in soft light",
  },
  weave: {
    src: "/images/products/other-textile.jpg",
    alt: "Close-up of plain white woven textile",
  },
} as const;

export const HOSPITALITY_GROUPS: HospitalityGroup[] = [
  {
    slug: "bed-linen",
    title: "Bed Linen",
    description: "Sheeting, covers and protectors specified for a commercial laundry cycle.",
    intro:
      "Everything that goes on the bed, from the sheet against the mattress to the cover a guest sees. Specified once and supplied to the same build across every property in a group.",
    image: IMG.bed,
    fallbackImages: [IMG.bed, IMG.duvet, IMG.pillow],
    // Six lines, matching the client's "HOSPITALITY SHEETS" sheet exactly —
    // see lib/bed-linen.ts. Flat sheets, fitted sheets, pillow case and duvet
    // cover each cover several sheet rows (different thread count, design or
    // quality) and so open a listing of their own; mattress protector and
    // pillow protector are one row each and open straight to a product page,
    // the same way Terry Towels' single-member families do.
    items: [
      {
        name: "Flat sheets",
        slug: "flat-sheets",
        productSlug: null,
        href: "/hospitality/bed-linen/flat-sheets",
        ctaLabel: "View the range",
      },
      {
        name: "Fitted sheets",
        slug: "fitted-sheets",
        productSlug: null,
        href: "/hospitality/bed-linen/fitted-sheets",
        ctaLabel: "View the range",
      },
      {
        name: "Pillow case",
        slug: "pillow-case",
        productSlug: null,
        href: "/hospitality/bed-linen/pillow-case",
        ctaLabel: "View the range",
      },
      {
        name: "Duvet cover",
        slug: "duvet-cover",
        productSlug: null,
        href: "/hospitality/bed-linen/duvet-cover",
        ctaLabel: "View the range",
      },
      {
        name: "Mattress protector",
        slug: "mattress-protector",
        productSlug: null,
        href: "/hospitality/bed-linen/mattress-protector",
        ctaLabel: "View details",
      },
      {
        name: "Pillow protector",
        slug: "pillow-protector",
        productSlug: null,
        href: "/hospitality/bed-linen/pillow-protector",
        ctaLabel: "View details",
      },
    ],
  },
  {
    slug: "bath-linen",
    title: "Bath Linen",
    description: "Terry from washcloth to bath sheet, built to hold its pile through the wash.",
    intro:
      "The linen a guest actually handles. Weights run from a 1 lb washcloth to a 12 lb bath towel, so a property can set a standard room and a suite off one specification.",
    image: IMG.towels,
    fallbackImages: [IMG.towels, IMG.weave],
    items: [
      // Terry Towels replaces the three separate washcloth / hand towel / bath
      // towel lines. Those were one line each with one specification; the
      // client's towel sheet has seven constructions, each made in up to four
      // of those sizes, so the size is a choice made INSIDE a construction
      // rather than the thing being chosen. See lib/terry-towels.ts.
      {
        name: "Terry Towels",
        slug: "terry-towels",
        productSlug: null,
        href: "/hospitality/terry-towels",
        ctaLabel: "View the range",
        menuLabel: "Towel",
      },
      { name: "Bath robes", slug: "bath-robes", productSlug: null },
      { name: "Bath mats", slug: "bath-mats", productSlug: "bath-mat" },
      { name: "Economy bath towels", slug: "economy-bath-towels", productSlug: null },
    ],
  },
  {
    slug: "table-linen",
    title: "Table Linen",
    description: "Napery for banqueting and covers, in cotton and polyester.",
    intro:
      "Table dressing for a room that turns over several times a night. Both fibres are here because they launder differently and a banqueting operation usually runs each for a different service.",
    image: IMG.napkins,
    fallbackImages: [IMG.napkins, IMG.weave],
    items: [
      { name: "Plain napkins", slug: "plain-napkins", productSlug: null },
      { name: "Bistro napkins", slug: "bistro-napkins", productSlug: "bistro-napkin" },
      { name: "Momi napkins", slug: "momi-napkins", productSlug: null },
      { name: "Polyester napkin", slug: "polyester-napkin", productSlug: "napkin" },
      { name: "100% cotton napkin", slug: "cotton-napkin", productSlug: null },
      { name: "Table cloths", slug: "table-cloths", productSlug: null },
    ],
  },
  {
    slug: "kitchen-linen",
    title: "Kitchen Linen",
    description: "Service cloths marked by stripe, so a kitchen can colour-code by station.",
    intro:
      "The working cloths behind the pass. Every line carries its own stripe, which is how a kitchen keeps the glass cloth out of the general pile and how a rental operation tells one account's stock from another's.",
    image: IMG.barmops,
    fallbackImages: [IMG.barmops, IMG.weave],
    items: [
      { name: "Dish towels", slug: "dish-towels", productSlug: "dish-towel" },
      {
        name: "Kitchen towels – checks",
        slug: "kitchen-towels-checks",
        productSlug: "kitchen-towel-checks",
      },
      {
        name: "Kitchen towels – herringbone",
        slug: "kitchen-towels-herringbone",
        productSlug: "kitchen-towel-herringbone",
      },
      { name: "Glass/tea towels", slug: "glass-tea-towels", productSlug: "glass-towel" },
      { name: "Bar mops", slug: "bar-mops", productSlug: "bar-mop" },
    ],
  },
  {
    slug: "pool-fitness-spa-salon",
    title: "Pool, Fitness, Spa & Salon",
    description: "Towelling for the wet areas, where colour and bleach resistance matter most.",
    intro:
      "The leisure floor asks more of a towel than a bathroom does: chlorine, sun, tint and heat. These lines are specified for that, and several are supplied multi-colour rather than white.",
    image: IMG.towels,
    fallbackImages: [IMG.towels, IMG.weave],
    items: [
      {
        // On the client's BATH TOWELS sheet rather than a pool one, so its
        // specification lives with the towel range — but it is a pool towel
        // and this is where a buyer looks for it, so the line points at the
        // same product page from both places rather than being listed twice
        // or sent to an empty quote form.
        name: "Cabana pool towels",
        slug: "cabana-pool-towels",
        productSlug: null,
        href: "/hospitality/terry-towels/cabana-pool-towels",
        ctaLabel: "View details",
      },
      { name: "Economy pool towels", slug: "economy-pool-towels", productSlug: null },
      // The four lines the client's salon sheet specifies — see
      // lib/spa-salon.ts. Each is one size in several colours, so each is a
      // single product page rather than a listing.
      {
        name: "Bath sheets",
        slug: "bath-sheets",
        productSlug: null,
        href: "/hospitality/pool-fitness-spa-salon/bath-sheet",
        ctaLabel: "View details",
      },
      {
        name: "Spa/salon towels",
        slug: "spa-salon-towels",
        productSlug: "saloon-towel",
        href: "/hospitality/pool-fitness-spa-salon/salon-towel",
        ctaLabel: "View details",
      },
      { name: "Fitness towels", slug: "fitness-towels", productSlug: null },
      {
        name: "Hair wash/dye towels",
        slug: "hair-wash-dye-towels",
        productSlug: null,
        href: "/hospitality/pool-fitness-spa-salon/hair-wash-dye-towel",
        ctaLabel: "View details",
      },
      {
        name: "Spa sheets",
        slug: "spa-sheets",
        productSlug: null,
        href: "/hospitality/pool-fitness-spa-salon/spa-sheet",
        ctaLabel: "View details",
      },
    ],
  },
];

export function getHospitalityGroup(slug: string): HospitalityGroup | undefined {
  return HOSPITALITY_GROUPS.find((g) => g.slug === slug);
}

/** The group an item belongs to, for building a link to it from anywhere. */
export function findHospitalityItem(
  itemSlug: string
): { group: HospitalityGroup; item: HospitalityItem } | undefined {
  for (const group of HOSPITALITY_GROUPS) {
    const item = group.items.find((i) => i.slug === itemSlug);
    if (item) return { group, item };
  }
  return undefined;
}

/**
 * Indicative swatch colours for the shades the product sheet names.
 *
 * INDICATIVE, NOT A DYE REFERENCE, and the listing page says so under the grid.
 * The sheet gives colour NAMES ("misty", "cappuccino beige") and no colour
 * standard, so these are a reader's approximation to make a row of swatches
 * scannable. A buyer matching an existing stock colour works from a physical
 * sample, which is what the quote conversation is for.
 *
 * Matched on words rather than on the whole string, because the sheet writes
 * compound shades — "White with blue stripes", "White, blue & gold centre
 * stripe". The FIRST word that matches wins, so "White with blue stripes"
 * resolves to white, which is what the cloth actually looks like from a metre
 * away.
 */
const SWATCHES: [string, string][] = [
  ["bleached white", "#FCFBF8"],
  ["white", "#FFFFFF"],
  ["jade", "#00A67E"],
  ["misty", "#C6CED3"],
  ["cappuccino", "#C0AC93"],
  ["beige", "#D8CBB2"],
  ["natural", "#E4DCCB"],
  ["celery", "#C3CFA5"],
  ["teal", "#1F7A8C"],
  ["purple", "#6B4E8E"],
  ["burgundy", "#6D1A2A"],
  // The salon sheet spells it "Bergundy". The colour name is the client's to
  // correct, not ours, so the spelling is kept and the swatch matched to it.
  ["bergundy", "#6D1A2A"],
  ["black", "#1A1A1A"],
  ["grey", "#8C9296"],
  ["gray", "#8C9296"],
  ["tan", "#C8A97E"],
  ["blue", "#2C5F9E"],
  ["green", "#3F7A4E"],
  ["pink", "#E3B7C0"],
  ["red", "#B03A32"],
  ["gold", "#C9A84C"],
  ["duck", "#F2D98B"],
  ["multi", "#B9A6C9"],
];

export function swatchColour(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [needle, hex] of SWATCHES) {
    if (lower.includes(needle)) return hex;
  }
  return null;
}

/**
 * Where a Hospitality line lives, looked up by its display name.
 *
 * BY NAME, NOT BY SLUGIFYING THE NAME. The mega-menu renders labels, and three
 * of these labels do not survive a round trip through a slugifier:
 * "Kitchen towels – checks" carries an en dash, "Glass/tea towels" a slash,
 * "100% cotton napkin" a digit-and-percent opening. Deriving the target from
 * the label would send two of the thirty-one to an anchor that does not exist,
 * and it would do it silently.
 */
const BY_NAME = new Map<string, { group: HospitalityGroup; item: HospitalityItem }>(
  HOSPITALITY_GROUPS.flatMap((group) =>
    group.items.flatMap((item) => {
      const entry = [item.name, { group, item }] as const;
      // A menuLabel is a second way to spell the same item — the mega-menu
      // renders it instead of `name`, and productHref calls this lookup with
      // whatever string it rendered. Without this second key, a link built
      // from the shortened label would fail to resolve.
      return item.menuLabel ? [entry, [item.menuLabel, { group, item }] as const] : [entry];
    })
  )
);

export function hospitalityItemByName(name: string) {
  return BY_NAME.get(name);
}
