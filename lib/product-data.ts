/**
 * The product catalogue.
 *
 * ============================================================================
 * SOURCE: the client's own product sheet ("Umaid-souwel products - Sheet1").
 * Every figure in the `variants` table below is transcribed from it.
 * ============================================================================
 *
 * This file previously held twenty-four INVENTED products with invented GSM,
 * thread counts, minimum order quantities and lead times. They read as fact and
 * were not Souwel's specifications. They are gone. What replaced them is the
 * real range, and the discipline that matters now is the opposite one: do not
 * add a field back just because the layout has room for it.
 *
 * WHERE THE SHEET IS BLANK, SO IS THIS FILE. Several rows arrive without a
 * blend, a finished size or a stitching note -- the Huck Towel, the Drop Cloth,
 * two of the three Herringbone Thermal shades. Those cells carry an em dash and
 * the page renders the em dash. A buyer reading "—" asks; a buyer reading an
 * invented "100% cotton" does not, and finds out at delivery.
 *
 * NO PRICE FIELD, AND THERE MUST NEVER BE ONE. This is a quote-driven B2B
 * catalogue: pricing exists only on QuoteItem, readable by Sales and Admin.
 *
 * NO MOQ AND NO LEAD TIME. The sheet gives neither, so neither appears. The
 * quote form is where a buyer finds out.
 *
 * `keyFacts` AND `specifications` ARE DERIVED, NOT AUTHORED. They are computed
 * from `variants` at the bottom of this file, so the summary strip, the
 * specification table and the variants table can never disagree with each
 * other. Edit a variant row and all three follow.
 *
 * `care` IS EMPTY ON EVERY PRODUCT and the page omits the section. Laundering
 * temperatures and cycle counts are the figures an institutional buyer leans on
 * hardest, and the sheet supplies none. Same rule as `certifications`: an empty
 * section is a gap, an invented one is a false claim.
 *
 * PHOTOGRAPHY IS STILL A GAP. There are eight source photographs for
 * twenty-four products, so pages share imagery. Reuse is survivable;
 * MISLABELLING IS NOT -- every `alt` describes what is actually in the frame,
 * not what the page is about. Keep it that way when real photography arrives.
 */

import { PRODUCT_PAGE_SLUGS } from "@/lib/product-slugs";

export type SpecGroup = {
  title: string;
  rows: { label: string; value: string }[];
};

/**
 * One line of the client's sheet: a colour or finish, and the construction it
 * is supplied in. A product is the set of its variants.
 */
export type VariantRow = {
  colour: string;
  size: string;
  weight: string;
  blend: string;
  stitching: string;
};

/** A cell the supplied sheet leaves blank. Rendered as-is. */
export const NOT_SPECIFIED = "—";

type AuthoredProduct = {
  slug: string;
  name: string;
  /** Must match a slug in CATEGORIES. The product's home category. */
  categorySlug: string;
  /** Every sector the sheet lists it under -- category pages filter on this. */
  sectors: string[];
  /** Unit of measure, as the sheet states it. */
  uom: string;
  shortDescription: string;
  description: string;
  heroImageUrl: string;
  heroImageAlt: string;
  galleryImageUrls: { src: string; alt: string }[];
  variants: VariantRow[];
  customisation: { title: string; detail: string }[];
  care: string[];
  certifications: string[];
};

export type ProductDetail = AuthoredProduct & {
  keyFacts: { label: string; value: string }[];
  specifications: SpecGroup[];
};

const SECTOR_LABEL: Record<string, string> = {
  "health-care": "Health-Care",
  hospitality: "Hospitality",
  "institutional-laundry": "Institutional Laundry",
  "commercial-automotive": "Commercial / Automotive",
};

/** Distinct values in source order, with blanks dropped. */
function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (value === NOT_SPECIFIED || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

/**
 * Comma-joined, unless a member already contains a comma — then semicolons.
 * "White, double cam border" and "White" comma-joined read as three separate
 * finishes rather than two, which is a wrong answer rendered confidently.
 */
function join(values: string[]): string {
  if (!values.length) return NOT_SPECIFIED;
  return values.join(values.some((v) => v.includes(",")) ? "; " : ", ");
}

/**
 * The four-figure strip under the hero. Composition, size and weight come
 * straight off the variants; "Sold by" is the sheet's own UOM column, which is
 * the figure a trade buyer checks first and the one a consumer-shaped layout
 * usually drops.
 */
function deriveKeyFacts(p: AuthoredProduct) {
  return [
    { label: "Composition", value: join(uniq(p.variants.map((v) => v.blend))) },
    { label: "Finished size", value: join(uniq(p.variants.map((v) => v.size))) },
    { label: "Weight", value: join(uniq(p.variants.map((v) => v.weight))) },
    { label: "Sold by", value: p.uom },
  ];
}

function deriveSpecifications(p: AuthoredProduct): SpecGroup[] {
  return [
    {
      title: "Construction",
      rows: [
        { label: "Composition", value: join(uniq(p.variants.map((v) => v.blend))) },
        { label: "Weight", value: join(uniq(p.variants.map((v) => v.weight))) },
        { label: "Stitching", value: join(uniq(p.variants.map((v) => v.stitching))) },
        { label: "Unit of measure", value: p.uom },
      ],
    },
    {
      title: "Range",
      rows: [
        { label: "Finished sizes", value: join(uniq(p.variants.map((v) => v.size))) },
        { label: "Colours and finishes", value: join(uniq(p.variants.map((v) => v.colour))) },
        {
          label: "Specified for",
          value: join(p.sectors.map((s) => SECTOR_LABEL[s] ?? s)),
        },
      ],
    },
  ];
}

const AUTHORED: AuthoredProduct[] = [
  {
    slug: "surgical-towel",
    name: "Surgical Towel",
    categorySlug: "health-care",
    sectors: ["health-care"],
    uom: "DZ",
    shortDescription: "Lint-free cotton surgical towel, four-side hemmed, supplied by the dozen.",
    description:
      "A theatre-grade cotton towel cut to 18″×33″ and hemmed on all four sides. Supplied in the four stock shades below, and in any colour to order — colour-coding by procedure or department is the usual reason buyers ask.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Jade",
        size: '18"×33"',
        weight: "2.50 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "Blue",
        size: '18"×33"',
        weight: "2.50 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "Misty",
        size: '18"×33"',
        weight: "2.50 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "White",
        size: '18"×33"',
        weight: "2.50 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail:
          "Supplied in Jade, Blue, Misty, White. The sheet lists this line as available in all colours, so tell us the shade you run.",
      },
      { title: "Sizes and builds", detail: 'Finished at 18"×33".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "hyperbaric-blanket",
    name: "Hyperbaric Blanket",
    categorySlug: "health-care",
    sectors: ["health-care"],
    uom: "PCS",
    shortDescription:
      "100% cotton hyperbaric blanket, bleached white with a centre print, double stitched.",
    description:
      "A single-construction blanket for hyperbaric use: all-cotton, 70″×90″, bleached white with a centre print, and double stitched rather than selvage-finished.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "Bed made up in white sheets and pillows",
    galleryImageUrls: [
      { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Bleached white with centre print",
        size: '70"×90"',
        weight: "2 lbs",
        blend: "100% cotton",
        stitching: "Double stitched",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Bleached white with centre print." },
      { title: "Sizes and builds", detail: 'Finished at 70"×90".' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "chevron-blanket",
    name: "Chevron Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality"],
    uom: "PCS",
    shortDescription:
      "100% polyester chevron-weave blanket in four stock shades, selvage and hemmed.",
    description:
      "A polyester chevron blanket at 70″×90″ and 3 lbs, selvage down the sides and hemmed top and bottom. Four stock shades, and any colour to order — which is what makes it work across both a ward and a guest floor.",
    heroImageUrl: "/images/products/duvet-covers.jpg",
    heroImageAlt: "White duvet cover draped across a bed",
    galleryImageUrls: [
      { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Blue",
        size: '70"×90"',
        weight: "3 lbs",
        blend: "100% poly",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Grey",
        size: '70"×90"',
        weight: "3 lbs",
        blend: "100% poly",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Tan",
        size: '70"×90"',
        weight: "3 lbs",
        blend: "100% poly",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "White",
        size: '70"×90"',
        weight: "3 lbs",
        blend: "100% poly",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail:
          "Supplied in Blue, Grey, Tan, White. The sheet lists this line as available in all colours, so tell us the shade you run.",
      },
      { title: "Sizes and builds", detail: 'Finished at 70"×90".' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "spectrum-spread-blanket",
    name: "Spectrum Spread Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality"],
    uom: "PCS",
    shortDescription:
      "55/45 blend spread blanket at 74″×104″, in beige, cappuccino beige and multi colour.",
    description:
      "A wide spread blanket in a 55/45 blend, cut generously at 74″×104″ so it drops properly over a made bed. Selvage sides, hemmed top and bottom.",
    heroImageUrl: "/images/products/duvet-covers.jpg",
    heroImageAlt: "White duvet cover draped across a bed",
    galleryImageUrls: [
      { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Beige",
        size: '74"×104"',
        weight: "3.5 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Cappuccino beige",
        size: '74"×104"',
        weight: "3.5 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Multi colour",
        size: '74"×104"',
        weight: "3.5 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail: "Supplied in Beige, Cappuccino beige, Multi colour.",
      },
      { title: "Sizes and builds", detail: 'Finished at 74"×104".' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "spectrum-links-spread-blanket",
    name: "Spectrum Links Spread Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality"],
    uom: "PCS",
    shortDescription:
      "Links-pattern spread blanket, supplied in a 55/45 blend and in 100% polyester.",
    description:
      "The links pattern in two builds: a 55/45 blend at 74″×108″ in teal, purple and white, and an all-polyester version at 74″×104″ in blue. Both selvage at the sides and hemmed top and bottom.",
    heroImageUrl: "/images/products/duvet-covers.jpg",
    heroImageAlt: "White duvet cover draped across a bed",
    galleryImageUrls: [
      { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Teal / purple / white",
        size: '74"×108"',
        weight: "3.75 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Blue",
        size: '74"×104"',
        weight: "3.5 lbs",
        blend: "100% poly",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Teal / purple / white, Blue." },
      {
        title: "Sizes and builds",
        detail: 'Run in 74"×108", 74"×104". Available in 55/45 and 100% poly.',
      },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "serpentine-blanket",
    name: "Serpentine Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality"],
    uom: "PCS",
    shortDescription: "55/45 serpentine-weave blanket in white, 66″×90″.",
    description:
      "The lighter blanket in the range at 2.30 lbs, in a 55/45 blend and a 66″×90″ cut. White only, selvage sides, hemmed top and bottom.",
    heroImageUrl: "/images/products/pillow-covers.jpg",
    heroImageAlt: "White pillows on a made bed",
    galleryImageUrls: [
      { src: "/images/products/pillow-covers.jpg", alt: "White pillows on a made bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White",
        size: '66"×90"',
        weight: "2.30 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White." },
      { title: "Sizes and builds", detail: 'Finished at 66"×90".' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "herringbone-thermal-blanket",
    name: "Herringbone Thermal Blanket",
    categorySlug: "health-care",
    sectors: ["health-care"],
    uom: "PCS",
    shortDescription: "Open herringbone thermal blanket in beige, celery and blue.",
    description:
      "A thermal herringbone weave in a 55/45 blend, cut long at 70″×108″. Beige is the fully specified build; celery and blue are stocked shades whose construction detail is not on the supplied sheet.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "Bed made up in white sheets and pillows",
    galleryImageUrls: [
      { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Beige",
        size: '70"×108"',
        weight: "3 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Celery",
        size: "—",
        weight: "—",
        blend: "—",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Blue",
        size: "—",
        weight: "—",
        blend: "—",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Beige, Celery, Blue." },
      { title: "Sizes and builds", detail: 'Finished at 70"×108".' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "bath-blanket",
    name: "Bath Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "institutional-laundry"],
    uom: "PCS",
    shortDescription: "70″×90″ bath blanket in bleached white and two striped builds.",
    description:
      "Three builds on one 70″×90″ cut: a 55/45 bleached white, a 55/45 white with blue stripes, and a heavier 85/15 natural with blue stripes. Selvage sides, hemmed top and bottom.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "Bed made up in white sheets and pillows",
    galleryImageUrls: [
      { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Bleached white",
        size: '70"×90"',
        weight: "2 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "White with blue stripes",
        size: '70"×90"',
        weight: "2 lbs",
        blend: "55/45",
        stitching: "Selvage / hemmed top and bottom",
      },
      {
        colour: "Natural with blue stripes",
        size: '70"×90"',
        weight: "2.5 lbs",
        blend: "85/15",
        stitching: "Selvage / hemmed top and bottom",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail: "Supplied in Bleached white, White with blue stripes, Natural with blue stripes.",
      },
      { title: "Sizes and builds", detail: 'Finished at 70"×90". Available in 55/45 and 85/15.' },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "baby-blanket",
    name: "Baby Blanket",
    categorySlug: "health-care",
    sectors: ["health-care", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "All-cotton baby blankets in printed and woven-dyed patterns, four sizes.",
    description:
      "Four all-cotton builds for a nursery: the two 36″×40″ prints, a lighter 30″×40″ printed stripe, and a woven dyed stripe at 36″×36″. The prints are four-side hemmed; the woven stripe is plain hemmed.",
    heroImageUrl: "/images/products/pillow-covers.jpg",
    heroImageAlt: "White pillows on a made bed",
    galleryImageUrls: [
      { src: "/images/products/pillow-covers.jpg", alt: "White pillows on a made bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Baby foot print",
        size: '36"×40"',
        weight: "7 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "Duck print",
        size: '36"×40"',
        weight: "7 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "Printed pink / blue stripes",
        size: '30"×40"',
        weight: "3 lbs",
        blend: "100% cotton",
        stitching: "Four side hemmed",
      },
      {
        colour: "Woven dyed stripes",
        size: '36"×36"',
        weight: "4 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail:
          "Supplied in Baby foot print, Duck print, Printed pink / blue stripes, Woven dyed stripes.",
      },
      { title: "Sizes and builds", detail: 'Run in 36"×40", 30"×40", 36"×36".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "saloon-towel",
    name: "Saloon Towel",
    categorySlug: "hospitality",
    sectors: ["hospitality"],
    uom: "DZ",
    shortDescription: "All-cotton multi-colour saloon towel, 16″×28″.",
    description:
      "The salon and spa towel: 100% cotton, 16″×28″, 3 lbs to the dozen, hemmed, and supplied multi-colour rather than as a single shade.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Multi colour",
        size: '16"×28"',
        weight: "3 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Multi colour." },
      { title: "Sizes and builds", detail: 'Finished at 16"×28".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "huck-towel",
    name: "Huck Towel",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality"],
    uom: "DZ",
    shortDescription: "White huck towel at 20 oz to the dozen.",
    description:
      "A plain white huck towel supplied by the dozen at 20 oz. The supplied sheet gives the weight and the colour; blend, finished size and stitching are not stated on it.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [{ colour: "White", size: "—", weight: "20 oz", blend: "—", stitching: "—" }],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White." },
      {
        title: "Sizes and builds",
        detail: "Finished size is not stated on the supplied sheet — ask and we will confirm it.",
      },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "shop-towel",
    name: "Shop Towel",
    categorySlug: "institutional-laundry",
    sectors: ["institutional-laundry", "commercial-automotive"],
    uom: "2500 PCS/CASE",
    shortDescription: "75/25 surged shop towel, 14″×14″, by the 2,500-piece case.",
    description:
      "The workshop and rental cloth: a 75/25 blend at 14″×14″, surged on the edges so it survives being laundered and reissued. Sold by the case of 2,500 pieces, in four shades.",
    heroImageUrl: "/images/products/industrial-aprons.jpg",
    heroImageAlt: "White workwear textile laid flat",
    galleryImageUrls: [
      { src: "/images/products/industrial-aprons.jpg", alt: "White workwear textile laid flat" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      { colour: "Red", size: '14"×14"', weight: "150 lbs", blend: "75/25", stitching: "Surged" },
      { colour: "White", size: '14"×14"', weight: "150 lbs", blend: "75/25", stitching: "Surged" },
      {
        colour: "Natural",
        size: '14"×14"',
        weight: "150 lbs",
        blend: "75/25",
        stitching: "Surged",
      },
      { colour: "Green", size: '14"×14"', weight: "150 lbs", blend: "75/25", stitching: "Surged" },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Red, White, Natural, Green." },
      { title: "Sizes and builds", detail: 'Finished at 14"×14".' },
      {
        title: "How it ships",
        detail:
          "Sold by the case of 2,500 pieces. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "drop-cloth",
    name: "Drop Cloth",
    categorySlug: "commercial-automotive",
    sectors: ["commercial-automotive"],
    uom: "PCS",
    shortDescription: "Painters' drop cloth in 8 oz and 10 oz weights.",
    description:
      "Supplied for the painting trade in two weights. The supplied sheet lists the weights and the unit only — blend, size, colour and stitching are not stated on it.",
    heroImageUrl: "/images/products/industrial-aprons.jpg",
    heroImageAlt: "White workwear textile laid flat",
    galleryImageUrls: [
      { src: "/images/products/industrial-aprons.jpg", alt: "White workwear textile laid flat" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      { colour: "Painters' grade", size: "—", weight: "8 oz", blend: "—", stitching: "—" },
      { colour: "Painters' grade", size: "—", weight: "10 oz", blend: "—", stitching: "—" },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Painters' grade." },
      {
        title: "Sizes and builds",
        detail: "Finished size is not stated on the supplied sheet — ask and we will confirm it.",
      },
      {
        title: "How it ships",
        detail: "Sold by the piece. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "napkin",
    name: "Napkin",
    categorySlug: "hospitality",
    sectors: ["hospitality"],
    uom: "DZ",
    shortDescription: "100% polyester table napkin, 20″×20″, in black and white.",
    description:
      "A square polyester napkin at 20″×20″ and 25 oz to the dozen, four-side hemmed. Black and white — the two shades a banqueting operation actually runs.",
    heroImageUrl: "/images/products/napkins.jpg",
    heroImageAlt: "Folded white linen napkin fabric in soft light",
    galleryImageUrls: [
      {
        src: "/images/products/napkins.jpg",
        alt: "Folded white linen napkin fabric in soft light",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Black",
        size: '20"×20"',
        weight: "25 oz",
        blend: "100% polyester",
        stitching: "Four side hemmed",
      },
      {
        colour: "White",
        size: '20"×20"',
        weight: "25 oz",
        blend: "100% polyester",
        stitching: "Four side hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Black, White." },
      { title: "Sizes and builds", detail: 'Finished at 20"×20".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "bistro-napkin",
    name: "Bistro Napkin",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "All-cotton bistro napkin with a burgundy stripe, 15″×25″.",
    description:
      "The striped cotton bistro cloth at 15″×25″ and 24 oz to the dozen, hemmed. One shade: burgundy stripe.",
    heroImageUrl: "/images/products/napkins.jpg",
    heroImageAlt: "Folded white linen napkin fabric in soft light",
    galleryImageUrls: [
      {
        src: "/images/products/napkins.jpg",
        alt: "Folded white linen napkin fabric in soft light",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Burgundy stripe",
        size: '15"×25"',
        weight: "24 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Burgundy stripe." },
      { title: "Sizes and builds", detail: 'Finished at 15"×25".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "kitchen-towel-herringbone",
    name: "Kitchen Towel Herringbone",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "Herringbone kitchen towel, 15″×25″, with a coloured centre stripe.",
    description:
      "A cotton herringbone kitchen towel at 24 oz to the dozen, identified on the line by its centre stripe. Three stripe options; the green-stripe build is listed on the supplied sheet without its blend or finished size.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Rolled white cotton bar mops stacked together",
    galleryImageUrls: [
      {
        src: "/images/products/bar-mops.jpg",
        alt: "Rolled white cotton bar mops stacked together",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Bleached white, blue/pink centre stripe",
        size: '15"×25"',
        weight: "24 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, blue centre stripe",
        size: '15"×25"',
        weight: "24 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, green centre stripe",
        size: "—",
        weight: "24 oz",
        blend: "—",
        stitching: "—",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail:
          "Supplied in Bleached white, blue/pink centre stripe; White, blue centre stripe; White, green centre stripe.",
      },
      { title: "Sizes and builds", detail: 'Finished at 15"×25".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "kitchen-towel-checks",
    name: "Kitchen Towel Checks",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "All-cotton check kitchen towel, 15″×25″, in beige, pink and blue.",
    description:
      "The checked cotton kitchen towel at 15″×25″ and 1.75 lbs to the dozen, hemmed. Three checks, so a kitchen can colour-code by station.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Rolled white cotton bar mops stacked together",
    galleryImageUrls: [
      {
        src: "/images/products/bar-mops.jpg",
        alt: "Rolled white cotton bar mops stacked together",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Beige",
        size: '15"×25"',
        weight: "1.75 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "Pink",
        size: '15"×25"',
        weight: "1.75 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "Blue",
        size: '15"×25"',
        weight: "1.75 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Beige, Pink, Blue." },
      { title: "Sizes and builds", detail: 'Finished at 15"×25".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "glass-towel",
    name: "Glass Towel",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "All-cotton glass towel, white with red stripes, 16″×28″.",
    description:
      "The dedicated glass cloth: 100% cotton at 16″×28″ and 24 oz to the dozen, hemmed, and marked with red stripes so it does not get mixed into the general kitchen pile.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Rolled white cotton bar mops stacked together",
    galleryImageUrls: [
      {
        src: "/images/products/bar-mops.jpg",
        alt: "Rolled white cotton bar mops stacked together",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White with red stripes",
        size: '16"×28"',
        weight: "24 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White with red stripes." },
      { title: "Sizes and builds", detail: 'Finished at 16"×28".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "dish-towel",
    name: "Dish Towel",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "All-cotton dish towel with twin green stripes, 36 oz to the dozen.",
    description:
      "A heavy cotton dish towel at 36 oz to the dozen — the heaviest cloth in the kitchen range — hemmed and marked with twin green stripes. The supplied sheet does not state a finished size.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Rolled white cotton bar mops stacked together",
    galleryImageUrls: [
      {
        src: "/images/products/bar-mops.jpg",
        alt: "Rolled white cotton bar mops stacked together",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "Twin green stripes",
        size: "—",
        weight: "36 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in Twin green stripes." },
      {
        title: "Sizes and builds",
        detail: "Finished size is not stated on the supplied sheet — ask and we will confirm it.",
      },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "bar-mop",
    name: "Bar Mop",
    categorySlug: "hospitality",
    sectors: ["hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "16″×19″ bar mop at 32 oz, in five centre-stripe colours.",
    description:
      "The bar and service cloth: 16″×19″, 32 oz to the dozen, hemmed. Mostly all-cotton, with a blue-and-gold build in an 85/15 blend. The centre stripe is how a rental operation tells one account's stock from another's.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Rolled white cotton bar mops stacked together",
    galleryImageUrls: [
      {
        src: "/images/products/bar-mops.jpg",
        alt: "Rolled white cotton bar mops stacked together",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White, blue & gold centre stripe",
        size: '16"×19"',
        weight: "32 oz",
        blend: "85/15",
        stitching: "Hemmed",
      },
      {
        colour: "White, blue centre stripe",
        size: '16"×19"',
        weight: "32 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, green centre stripe",
        size: '16"×19"',
        weight: "32 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, gold centre stripe",
        size: '16"×19"',
        weight: "32 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, dark/light green centre stripe",
        size: '16"×19"',
        weight: "32 oz",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail:
          "Supplied in White, blue & gold centre stripe; White, blue centre stripe; White, green centre stripe; White, gold centre stripe; White, dark/light green centre stripe.",
      },
      {
        title: "Sizes and builds",
        detail: 'Finished at 16"×19". Available in 85/15 and 100% cotton.',
      },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "bath-mat",
    name: "Bath Mat",
    categorySlug: "hospitality",
    sectors: ["hospitality"],
    uom: "DZ",
    shortDescription: "All-cotton bath mat in a 20″×30″ double frame and a 22″×36″ single frame.",
    description:
      "Two builds of the same cotton mat: the 20″×30″ double frame at 6.5 lbs to the dozen, and the larger 22″×36″ single frame at 10 lbs. Both white, both hemmed.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White, double frame",
        size: '20"×30"',
        weight: "6.5 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
      {
        colour: "White, single frame",
        size: '22"×36"',
        weight: "10 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      {
        title: "Colours and finishes",
        detail: "Supplied in White, double frame; White, single frame.",
      },
      { title: "Sizes and builds", detail: 'Run in 20"×30", 22"×36".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "hand-towel",
    name: "Hand Towel",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "86/14 hand towel with a dobby border, 16″×30″.",
    description:
      "An 86/14 hand towel at 16″×30″ and 3 lbs to the dozen, hemmed with a dobby border. White, and specified across all three institutional sectors.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White, dobby border",
        size: '16"×30"',
        weight: "3 lbs",
        blend: "86/14",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White, dobby border." },
      { title: "Sizes and builds", detail: 'Finished at 16"×30".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "bath-towel",
    name: "Bath Towel",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "86/14 bath towel in three sizes, from 24″×48″ to 27″×54″.",
    description:
      "One 86/14 construction across three cuts, so a property can run a standard room towel and a larger suite towel off the same specification. The two smaller sizes carry a double cam border.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White, double cam border",
        size: '24"×48"',
        weight: "8 lbs",
        blend: "86/14",
        stitching: "Hemmed",
      },
      {
        colour: "White, double cam border",
        size: '24"×50"',
        weight: "10 lbs",
        blend: "86/14",
        stitching: "Hemmed",
      },
      { colour: "White", size: '27"×54"', weight: "12 lbs", blend: "86/14", stitching: "Hemmed" },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White, double cam border; White." },
      { title: "Sizes and builds", detail: 'Run in 24"×48", 24"×50", 27"×54".' },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
  {
    slug: "wash-cloth",
    name: "Wash Cloth",
    categorySlug: "health-care",
    sectors: ["health-care", "hospitality", "institutional-laundry"],
    uom: "DZ",
    shortDescription: "Wash cloth in an 86/14 dobby-border build and an all-cotton 12″×12″.",
    description:
      "Two builds: the 13″×13″ in an 86/14 blend with a dobby border, and a plain all-cotton 12″×12″ at 1 lb to the dozen. Both white and hemmed.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stack of folded white towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
    ],
    variants: [
      {
        colour: "White, dobby border",
        size: '13"×13"',
        weight: "1.5 lbs",
        blend: "86/14",
        stitching: "Hemmed",
      },
      {
        colour: "White",
        size: '12"×12"',
        weight: "1 lbs",
        blend: "100% cotton",
        stitching: "Hemmed",
      },
    ],
    customisation: [
      { title: "Colours and finishes", detail: "Supplied in White, dobby border; White." },
      {
        title: "Sizes and builds",
        detail: 'Run in 13"×13", 12"×12". Available in 86/14 and 100% cotton.',
      },
      {
        title: "How it ships",
        detail: "Sold by the dozen. Volumes and lead times are confirmed on the quote.",
      },
    ],
    care: [],
    certifications: [],
  },
];

export const PRODUCTS: Record<string, ProductDetail> = Object.fromEntries(
  AUTHORED.map((p) => [
    p.slug,
    { ...p, keyFacts: deriveKeyFacts(p), specifications: deriveSpecifications(p) },
  ])
);

/**
 * Build-time drift guard. lib/product-slugs.ts is imported by the header and
 * the sitemap and cannot import this file; this assertion is what keeps the two
 * lists identical. A product added here and forgotten there would be linked
 * from nowhere and absent from the sitemap -- silently.
 */
{
  const authored = new Set(Object.keys(PRODUCTS));
  const declared = new Set<string>(PRODUCT_PAGE_SLUGS);
  const missing = [...declared].filter((s) => !authored.has(s));
  const extra = [...authored].filter((s) => !declared.has(s));
  if (missing.length || extra.length) {
    throw new Error(
      `product-data / product-slugs drift. Missing here: ${missing.join(", ") || "none"}. ` +
        `Missing from PRODUCT_PAGE_SLUGS: ${extra.join(", ") || "none"}.`
    );
  }
}

export function getProduct(slug: string): ProductDetail | undefined {
  return PRODUCTS[slug];
}
