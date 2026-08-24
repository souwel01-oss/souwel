"""Generate lib/product-data.ts and lib/product-slugs.ts from the client's
product sheet.

    python scripts/generate-catalog.py     # run from the repo root

SOURCE: docs/source/product-sheet.pdf (and .xlsx), supplied by the client.
Every variant row in the table below is transcribed from it by hand.

WHY A GENERATOR RATHER THAN A HAND-EDITED .ts. Twenty-four products share four
sectors, three unit-of-measure conventions and a lot of repeated construction
detail, and the same facts have to appear in the variants table, the key-facts
strip, the specification table, the slug list and the header's mega-menu. Typed
out five times they drift; derived once they cannot.

BLANK CELLS STAY BLANK. Where the sheet gives no blend, size or stitching, this
writes an em dash and the page renders an em dash. Do not fill one in with a
plausible figure -- that is how a specification nobody confirmed ends up in a
buyer's hands.

To change the catalogue: edit the table in this file, re-run it, then run
`npx prettier --write lib/product-data.ts lib/product-slugs.ts`. The mega-menu
lists in lib/site-config.ts are written by hand from the printed summary this
emits.
"""

import io
import json

NONE = "\u2014"  # em dash, for a cell the sheet leaves blank

HC, HOSP, LAUN, COMM = "health-care", "hospitality", "institutional-laundry", "commercial-automotive"

# colour, size, weight, blend, stitching
P = [
    dict(
        slug="surgical-towel", name="Surgical Towel",
        sectors=[HC], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        allColour=True,
        short="Lint-free cotton surgical towel, four-side hemmed, supplied by the dozen.",
        desc="A theatre-grade cotton towel cut to 18\u2033\u00d733\u2033 and hemmed on all four sides. Supplied in the four stock shades below, and in any colour to order \u2014 colour-coding by procedure or department is the usual reason buyers ask.",
        variants=[
            ("Jade", '18"\u00d733"', "2.50 lbs", "100% cotton", "Four side hemmed"),
            ("Blue", '18"\u00d733"', "2.50 lbs", "100% cotton", "Four side hemmed"),
            ("Misty", '18"\u00d733"', "2.50 lbs", "100% cotton", "Four side hemmed"),
            ("White", '18"\u00d733"', "2.50 lbs", "100% cotton", "Four side hemmed"),
        ],
    ),
    dict(
        slug="hyperbaric-blanket", name="Hyperbaric Blanket",
        sectors=[HC], uom="PCS",
        image="bed-sheets.jpg", alt="Bed made up in white sheets and pillows",
        short="100% cotton hyperbaric blanket, bleached white with a centre print, double stitched.",
        desc="A single-construction blanket for hyperbaric use: all-cotton, 70\u2033\u00d790\u2033, bleached white with a centre print, and double stitched rather than selvage-finished.",
        variants=[
            ("Bleached white with centre print", '70"\u00d790"', "2 lbs", "100% cotton", "Double stitched"),
        ],
    ),
    dict(
        slug="chevron-blanket", name="Chevron Blanket",
        sectors=[HC, HOSP], uom="PCS",
        image="duvet-covers.jpg", alt="White duvet cover draped across a bed",
        allColour=True,
        short="100% polyester chevron-weave blanket in four stock shades, selvage and hemmed.",
        desc="A polyester chevron blanket at 70\u2033\u00d790\u2033 and 3 lbs, selvage down the sides and hemmed top and bottom. Four stock shades, and any colour to order \u2014 which is what makes it work across both a ward and a guest floor.",
        variants=[
            ("Blue", '70"\u00d790"', "3 lbs", "100% poly", "Selvage / hemmed top and bottom"),
            ("Grey", '70"\u00d790"', "3 lbs", "100% poly", "Selvage / hemmed top and bottom"),
            ("Tan", '70"\u00d790"', "3 lbs", "100% poly", "Selvage / hemmed top and bottom"),
            ("White", '70"\u00d790"', "3 lbs", "100% poly", "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="spectrum-spread-blanket", name="Spectrum Spread Blanket",
        sectors=[HC, HOSP], uom="PCS",
        image="duvet-covers.jpg", alt="White duvet cover draped across a bed",
        short="55/45 blend spread blanket at 74\u2033\u00d7104\u2033, in beige, cappuccino beige and multi colour.",
        desc="A wide spread blanket in a 55/45 blend, cut generously at 74\u2033\u00d7104\u2033 so it drops properly over a made bed. Selvage sides, hemmed top and bottom.",
        variants=[
            ("Beige", '74"\u00d7104"', "3.5 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("Cappuccino beige", '74"\u00d7104"', "3.5 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("Multi colour", '74"\u00d7104"', "3.5 lbs", "55/45", "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="spectrum-links-spread-blanket", name="Spectrum Links Spread Blanket",
        sectors=[HC, HOSP], uom="PCS",
        image="duvet-covers.jpg", alt="White duvet cover draped across a bed",
        short="Links-pattern spread blanket, supplied in a 55/45 blend and in 100% polyester.",
        desc="The links pattern in two builds: a 55/45 blend at 74\u2033\u00d7108\u2033 in teal, purple and white, and an all-polyester version at 74\u2033\u00d7104\u2033 in blue. Both selvage at the sides and hemmed top and bottom.",
        variants=[
            ("Teal / purple / white", '74"\u00d7108"', "3.75 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("Blue", '74"\u00d7104"', "3.5 lbs", "100% poly", "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="serpentine-blanket", name="Serpentine Blanket",
        sectors=[HC, HOSP], uom="PCS",
        image="pillow-covers.jpg", alt="White pillows on a made bed",
        short="55/45 serpentine-weave blanket in white, 66\u2033\u00d790\u2033.",
        desc="The lighter blanket in the range at 2.30 lbs, in a 55/45 blend and a 66\u2033\u00d790\u2033 cut. White only, selvage sides, hemmed top and bottom.",
        variants=[
            ("White", '66"\u00d790"', "2.30 lbs", "55/45", "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="herringbone-thermal-blanket", name="Herringbone Thermal Blanket",
        sectors=[HC], uom="PCS",
        image="bed-sheets.jpg", alt="Bed made up in white sheets and pillows",
        short="Open herringbone thermal blanket in beige, celery and blue.",
        desc="A thermal herringbone weave in a 55/45 blend, cut long at 70\u2033\u00d7108\u2033. Beige is the fully specified build; celery and blue are stocked shades whose construction detail is not on the supplied sheet.",
        variants=[
            ("Beige", '70"\u00d7108"', "3 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("Celery", NONE, NONE, NONE, "Selvage / hemmed top and bottom"),
            ("Blue", NONE, NONE, NONE, "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="bath-blanket", name="Bath Blanket",
        sectors=[HC, LAUN], uom="PCS",
        image="bed-sheets.jpg", alt="Bed made up in white sheets and pillows",
        short="70\u2033\u00d790\u2033 bath blanket in bleached white and two striped builds.",
        desc="Three builds on one 70\u2033\u00d790\u2033 cut: a 55/45 bleached white, a 55/45 white with blue stripes, and a heavier 85/15 natural with blue stripes. Selvage sides, hemmed top and bottom.",
        variants=[
            ("Bleached white", '70"\u00d790"', "2 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("White with blue stripes", '70"\u00d790"', "2 lbs", "55/45", "Selvage / hemmed top and bottom"),
            ("Natural with blue stripes", '70"\u00d790"', "2.5 lbs", "85/15", "Selvage / hemmed top and bottom"),
        ],
    ),
    dict(
        slug="baby-blanket", name="Baby Blanket",
        sectors=[HC, LAUN], uom="DZ",
        image="pillow-covers.jpg", alt="White pillows on a made bed",
        short="All-cotton baby blankets in printed and woven-dyed patterns, four sizes.",
        desc="Four all-cotton builds for a nursery: the two 36\u2033\u00d740\u2033 prints, a lighter 30\u2033\u00d740\u2033 printed stripe, and a woven dyed stripe at 36\u2033\u00d736\u2033. The prints are four-side hemmed; the woven stripe is plain hemmed.",
        variants=[
            ("Baby foot print", '36"\u00d740"', "7 lbs", "100% cotton", "Four side hemmed"),
            ("Duck print", '36"\u00d740"', "7 lbs", "100% cotton", "Four side hemmed"),
            ("Printed pink / blue stripes", '30"\u00d740"', "3 lbs", "100% cotton", "Four side hemmed"),
            ("Woven dyed stripes", '36"\u00d736"', "4 lbs", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="saloon-towel", name="Saloon Towel",
        sectors=[HOSP], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="All-cotton multi-colour saloon towel, 16\u2033\u00d728\u2033.",
        desc="The salon and spa towel: 100% cotton, 16\u2033\u00d728\u2033, 3 lbs to the dozen, hemmed, and supplied multi-colour rather than as a single shade.",
        variants=[
            ("Multi colour", '16"\u00d728"', "3 lbs", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="huck-towel", name="Huck Towel",
        sectors=[HC, HOSP], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="White huck towel at 20 oz to the dozen.",
        desc="A plain white huck towel supplied by the dozen at 20 oz. The supplied sheet gives the weight and the colour; blend, finished size and stitching are not stated on it.",
        variants=[
            ("White", NONE, "20 oz", NONE, NONE),
        ],
    ),
    dict(
        slug="shop-towel", name="Shop Towel",
        sectors=[LAUN, COMM], uom="2500 PCS/CASE",
        image="industrial-aprons.jpg", alt="White workwear textile laid flat",
        short="75/25 surged shop towel, 14\u2033\u00d714\u2033, by the 2,500-piece case.",
        desc="The workshop and rental cloth: a 75/25 blend at 14\u2033\u00d714\u2033, surged on the edges so it survives being laundered and reissued. Sold by the case of 2,500 pieces, in four shades.",
        variants=[
            ("Red", '14"\u00d714"', "150 lbs", "75/25", "Surged"),
            ("White", '14"\u00d714"', "150 lbs", "75/25", "Surged"),
            ("Natural", '14"\u00d714"', "150 lbs", "75/25", "Surged"),
            ("Green", '14"\u00d714"', "150 lbs", "75/25", "Surged"),
        ],
    ),
    dict(
        slug="drop-cloth", name="Drop Cloth",
        sectors=[COMM], uom="PCS",
        image="industrial-aprons.jpg", alt="White workwear textile laid flat",
        short="Painters' drop cloth in 8 oz and 10 oz weights.",
        desc="Supplied for the painting trade in two weights. The supplied sheet lists the weights and the unit only \u2014 blend, size, colour and stitching are not stated on it.",
        variants=[
            ("Painters' grade", NONE, "8 oz", NONE, NONE),
            ("Painters' grade", NONE, "10 oz", NONE, NONE),
        ],
    ),
    dict(
        slug="napkin", name="Napkin",
        sectors=[HOSP], uom="DZ",
        image="napkins.jpg", alt="Folded white linen napkin fabric in soft light",
        short="100% polyester table napkin, 20\u2033\u00d720\u2033, in black and white.",
        desc="A square polyester napkin at 20\u2033\u00d720\u2033 and 25 oz to the dozen, four-side hemmed. Black and white \u2014 the two shades a banqueting operation actually runs.",
        variants=[
            ("Black", '20"\u00d720"', "25 oz", "100% polyester", "Four side hemmed"),
            ("White", '20"\u00d720"', "25 oz", "100% polyester", "Four side hemmed"),
        ],
    ),
    dict(
        slug="bistro-napkin", name="Bistro Napkin",
        sectors=[HOSP, LAUN], uom="DZ",
        image="napkins.jpg", alt="Folded white linen napkin fabric in soft light",
        short="All-cotton bistro napkin with a burgundy stripe, 15\u2033\u00d725\u2033.",
        desc="The striped cotton bistro cloth at 15\u2033\u00d725\u2033 and 24 oz to the dozen, hemmed. One shade: burgundy stripe.",
        variants=[
            ("Burgundy stripe", '15"\u00d725"', "24 oz", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="kitchen-towel-herringbone", name="Kitchen Towel Herringbone",
        sectors=[HOSP, LAUN], uom="DZ",
        image="bar-mops.jpg", alt="Rolled white cotton bar mops stacked together",
        short="Herringbone kitchen towel, 15\u2033\u00d725\u2033, with a coloured centre stripe.",
        desc="A cotton herringbone kitchen towel at 24 oz to the dozen, identified on the line by its centre stripe. Three stripe options; the green-stripe build is listed on the supplied sheet without its blend or finished size.",
        variants=[
            ("Bleached white, blue/pink centre stripe", '15"\u00d725"', "24 oz", "100% cotton", "Hemmed"),
            ("White, blue centre stripe", '15"\u00d725"', "24 oz", "100% cotton", "Hemmed"),
            ("White, green centre stripe", NONE, "24 oz", NONE, NONE),
        ],
    ),
    dict(
        slug="kitchen-towel-checks", name="Kitchen Towel Checks",
        sectors=[HOSP, LAUN], uom="DZ",
        image="bar-mops.jpg", alt="Rolled white cotton bar mops stacked together",
        short="All-cotton check kitchen towel, 15\u2033\u00d725\u2033, in beige, pink and blue.",
        desc="The checked cotton kitchen towel at 15\u2033\u00d725\u2033 and 1.75 lbs to the dozen, hemmed. Three checks, so a kitchen can colour-code by station.",
        variants=[
            ("Beige", '15"\u00d725"', "1.75 lbs", "100% cotton", "Hemmed"),
            ("Pink", '15"\u00d725"', "1.75 lbs", "100% cotton", "Hemmed"),
            ("Blue", '15"\u00d725"', "1.75 lbs", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="glass-towel", name="Glass Towel",
        sectors=[HOSP, LAUN], uom="DZ",
        image="bar-mops.jpg", alt="Rolled white cotton bar mops stacked together",
        short="All-cotton glass towel, white with red stripes, 16\u2033\u00d728\u2033.",
        desc="The dedicated glass cloth: 100% cotton at 16\u2033\u00d728\u2033 and 24 oz to the dozen, hemmed, and marked with red stripes so it does not get mixed into the general kitchen pile.",
        variants=[
            ("White with red stripes", '16"\u00d728"', "24 oz", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="dish-towel", name="Dish Towel",
        sectors=[HOSP, LAUN], uom="DZ",
        image="bar-mops.jpg", alt="Rolled white cotton bar mops stacked together",
        short="All-cotton dish towel with twin green stripes, 36 oz to the dozen.",
        desc="A heavy cotton dish towel at 36 oz to the dozen \u2014 the heaviest cloth in the kitchen range \u2014 hemmed and marked with twin green stripes. The supplied sheet does not state a finished size.",
        variants=[
            ("Twin green stripes", NONE, "36 oz", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="bar-mop", name="Bar Mop",
        sectors=[HOSP, LAUN], uom="DZ",
        image="bar-mops.jpg", alt="Rolled white cotton bar mops stacked together",
        short="16\u2033\u00d719\u2033 bar mop at 32 oz, in five centre-stripe colours.",
        desc="The bar and service cloth: 16\u2033\u00d719\u2033, 32 oz to the dozen, hemmed. Mostly all-cotton, with a blue-and-gold build in an 85/15 blend. The centre stripe is how a rental operation tells one account's stock from another's.",
        variants=[
            ("White, blue & gold centre stripe", '16"\u00d719"', "32 oz", "85/15", "Hemmed"),
            ("White, blue centre stripe", '16"\u00d719"', "32 oz", "100% cotton", "Hemmed"),
            ("White, green centre stripe", '16"\u00d719"', "32 oz", "100% cotton", "Hemmed"),
            ("White, gold centre stripe", '16"\u00d719"', "32 oz", "100% cotton", "Hemmed"),
            ("White, dark/light green centre stripe", '16"\u00d719"', "32 oz", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="bath-mat", name="Bath Mat",
        sectors=[HOSP], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="All-cotton bath mat in a 20\u2033\u00d730\u2033 double frame and a 22\u2033\u00d736\u2033 single frame.",
        desc="Two builds of the same cotton mat: the 20\u2033\u00d730\u2033 double frame at 6.5 lbs to the dozen, and the larger 22\u2033\u00d736\u2033 single frame at 10 lbs. Both white, both hemmed.",
        variants=[
            ("White, double frame", '20"\u00d730"', "6.5 lbs", "100% cotton", "Hemmed"),
            ("White, single frame", '22"\u00d736"', "10 lbs", "100% cotton", "Hemmed"),
        ],
    ),
    dict(
        slug="hand-towel", name="Hand Towel",
        sectors=[HC, HOSP, LAUN], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="86/14 hand towel with a dobby border, 16\u2033\u00d730\u2033.",
        desc="An 86/14 hand towel at 16\u2033\u00d730\u2033 and 3 lbs to the dozen, hemmed with a dobby border. White, and specified across all three institutional sectors.",
        variants=[
            ("White, dobby border", '16"\u00d730"', "3 lbs", "86/14", "Hemmed"),
        ],
    ),
    dict(
        slug="bath-towel", name="Bath Towel",
        sectors=[HC, HOSP, LAUN], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="86/14 bath towel in three sizes, from 24\u2033\u00d748\u2033 to 27\u2033\u00d754\u2033.",
        desc="One 86/14 construction across three cuts, so a property can run a standard room towel and a larger suite towel off the same specification. The two smaller sizes carry a double cam border.",
        variants=[
            ("White, double cam border", '24"\u00d748"', "8 lbs", "86/14", "Hemmed"),
            ("White, double cam border", '24"\u00d750"', "10 lbs", "86/14", "Hemmed"),
            ("White", '27"\u00d754"', "12 lbs", "86/14", "Hemmed"),
        ],
    ),
    dict(
        slug="wash-cloth", name="Wash Cloth",
        sectors=[HC, HOSP, LAUN], uom="DZ",
        image="towels.jpg", alt="Stack of folded white towels",
        short="Wash cloth in an 86/14 dobby-border build and an all-cotton 12\u2033\u00d712\u2033.",
        desc="Two builds: the 13\u2033\u00d713\u2033 in an 86/14 blend with a dobby border, and a plain all-cotton 12\u2033\u00d712\u2033 at 1 lb to the dozen. Both white and hemmed.",
        variants=[
            ("White, dobby border", '13"\u00d713"', "1.5 lbs", "86/14", "Hemmed"),
            ("White", '12"\u00d712"', "1 lbs", "100% cotton", "Hemmed"),
        ],
    ),
]

SECTOR_LABEL = {
    HC: "Health-Care",
    HOSP: "Hospitality",
    LAUN: "Institutional Laundry",
    COMM: "Commercial / Automotive",
}

UOM_PROSE = {
    "DZ": "Sold by the dozen.",
    "PCS": "Sold by the piece.",
    "2500 PCS/CASE": "Sold by the case of 2,500 pieces.",
}


def uniq(values):
    seen, out = set(), []
    for v in values:
        if v == NONE or v in seen:
            continue
        seen.add(v)
        out.append(v)
    return out


def js(value):
    return json.dumps(value, ensure_ascii=False)


HEADER = '''/**
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
 * the page renders the em dash. A buyer reading "\u2014" asks; a buyer reading an
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
export const NOT_SPECIFIED = "\u2014";

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

'''

FOOTER = '''
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
'''


def gallery_for(p):
    """Hero plus a fabric close-up. Deliberately short: there are eight
    photographs for twenty-four products, and padding a gallery with unrelated
    linen would mislabel it."""
    hero = (f"/images/products/{p['image']}", p["alt"])
    other = ("/images/products/other-textile.jpg", "Close-up of plain white woven textile")
    return [hero] if p["image"] == "other-textile.jpg" else [hero, other]


def customisation_for(p):
    colours = uniq([v[0] for v in p["variants"]])
    sizes = uniq([v[1] for v in p["variants"]])
    blends = uniq([v[3] for v in p["variants"]])
    out = []

    sep = "; " if any("," in c for c in colours) else ", "
    colour_detail = "Supplied in " + sep.join(colours) + "."
    if p.get("allColour"):
        colour_detail += " The sheet lists this line as available in all colours, so tell us the shade you run."
    out.append({"title": "Colours and finishes", "detail": colour_detail})

    if sizes:
        size_detail = (
            "Finished at " + sizes[0] + "."
            if len(sizes) == 1
            else "Run in " + ", ".join(sizes) + "."
        )
    else:
        size_detail = "Finished size is not stated on the supplied sheet \u2014 ask and we will confirm it."
    if len(blends) > 1:
        size_detail += " Available in " + " and ".join(blends) + "."
    out.append({"title": "Sizes and builds", "detail": size_detail})

    out.append(
        {
            "title": "How it ships",
            "detail": UOM_PROSE.get(p["uom"], "Sold by " + p["uom"] + ".")
            + " Volumes and lead times are confirmed on the quote.",
        }
    )
    return out


def emit():
    lines = [HEADER, "const AUTHORED: AuthoredProduct[] = ["]
    for p in P:
        gal = gallery_for(p)
        lines.append("  {")
        lines.append(f"    slug: {js(p['slug'])},")
        lines.append(f"    name: {js(p['name'])},")
        lines.append(f"    categorySlug: {js(p['sectors'][0])},")
        lines.append(f"    sectors: {js(p['sectors'])},")
        lines.append(f"    uom: {js(p['uom'])},")
        lines.append(f"    shortDescription: {js(p['short'])},")
        lines.append(f"    description: {js(p['desc'])},")
        lines.append(f"    heroImageUrl: {js(gal[0][0])},")
        lines.append(f"    heroImageAlt: {js(gal[0][1])},")
        lines.append("    galleryImageUrls: [")
        for src, alt in gal:
            lines.append(f"      {{ src: {js(src)}, alt: {js(alt)} }},")
        lines.append("    ],")
        lines.append("    variants: [")
        for colour, size, weight, blend, stitch in p["variants"]:
            lines.append(
                f"      {{ colour: {js(colour)}, size: {js(size)}, weight: {js(weight)}, "
                f"blend: {js(blend)}, stitching: {js(stitch)} }},"
            )
        lines.append("    ],")
        lines.append("    customisation: [")
        for c in customisation_for(p):
            lines.append(f"      {{ title: {js(c['title'])}, detail: {js(c['detail'])} }},")
        lines.append("    ],")
        lines.append("    care: [],")
        lines.append("    certifications: [],")
        lines.append("  },")
    lines.append("];")
    lines.append(FOOTER)
    io.open("lib/product-data.ts", "w", encoding="utf-8", newline="\n").write("\n".join(lines))

    # --- slugs, grouped by home category so the list reads like the catalogue
    by_cat = {}
    for p in P:
        by_cat.setdefault(p["sectors"][0], []).append(p["slug"])

    slug_lines = [
        '''/**
 * The slugs that have a real product detail page — the single source of truth.
 *
 * WHY THIS IS ITS OWN MODULE. Two consumers need this list and neither can
 * import the other:
 *
 *   - lib/product-data.ts holds the full specification for every product. The
 *     header must not import it, or the nav drags every spec table of every
 *     product into the client bundle.
 *   - lib/site-config.ts is imported by the header, so it must stay small.
 *
 * This file holds only strings, so importing it costs the client bundle
 * nothing. lib/product-data.ts asserts at build time that its own keys match
 * this list exactly, so the two cannot drift apart unnoticed.
 *
 * Grouped by HOME category. Several products are specified for more than one
 * sector — see `sectors` in product-data — and appear on every category page
 * they serve. The grouping here is only to keep the list readable.
 */
export const PRODUCT_PAGE_SLUGS = ['''
    ]
    for cat, label in (
        (HC, "Health-Care"), (HOSP, "Hospitality"),
        (LAUN, "Institutional Laundry"), (COMM, "Commercial / Automotive"),
    ):
        if cat not in by_cat:
            continue
        slug_lines.append(f"  // {label}")
        for s in by_cat[cat]:
            slug_lines.append(f"  {js(s)},")
    slug_lines.append("] as const;")
    slug_lines.append('''
export type ProductPageSlug = (typeof PRODUCT_PAGE_SLUGS)[number];

const SLUG_SET: ReadonlySet<string> = new Set(PRODUCT_PAGE_SLUGS);

export function hasProductPage(slug: string): boolean {
  return SLUG_SET.has(slug);
}''')
    io.open("lib/product-slugs.ts", "w", encoding="utf-8", newline="\n").write("\n".join(slug_lines) + "\n")

    # --- mega-menu lists for site-config
    menu = {}
    for cat in (HOSP, HC, LAUN, COMM):
        names = [p["name"] for p in P if cat in p["sectors"]]
        menu[cat] = names
    io.open(
        "C:/Users/udesign/AppData/Local/Temp/claude/d--vibe-code-Souwel/2b6fab33-e362-485c-97c3-b9ea650f52a5/scratchpad/menu.json",
        "w", encoding="utf-8",
    ).write(json.dumps(menu, indent=2, ensure_ascii=False))

    print(f"products: {len(P)}")
    for cat, names in menu.items():
        print(f"  {cat}: {len(names)}")


emit()
