/**
 * The Health-Care range, as the client names it.
 *
 * THIRTEEN LINES, IN THE CLIENT'S ORDER. This one list drives the header's
 * Health-Care menu, the /health-care listing page and a page per line, so the
 * three cannot drift — the same arrangement as lib/hospitality.ts. Two of them,
 * Hyperbaric Towel and Hyperbaric Sheet, sit under Hyperbaric Use Only in the
 * menu (see `subLabel`); everywhere else they are lines like any other.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SIX LINES HAVE A SPECIFICATION ON THE PRODUCT SHEET. SEVEN DO NOT.
 *
 * `productSlugs` names the catalogue entries in lib/product-data.ts that a line
 * is made of — the builds the client's sheet actually specifies. The client's
 * names and the sheet's do not always agree, and the mapping is written down
 * here rather than renaming either side:
 *
 *   Absorbent Towel      → Surgical Towel (same four shades, same cut)
 *   Receiving Blanket    → Baby Blanket
 *   Hyperbaric Use Only  → Hyperbaric Blanket
 *   Spread Blanket       → the five spread-blanket weaves on the sheet
 *   Towels               → bath, hand, wash and huck towel
 *
 * Sheets, Patient Gown, IV Gown, Hyperbaric Towel, Hyperbaric Sheet, Pillow
 * Case and Flannel Blanket are made but not on the sheet. Their pages say "Specification on request" and quote by
 * name, rather than borrowing figures from a neighbouring line.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DELIBERATELY FREE OF ANY product-data IMPORT, for the same reason as
 * lib/hospitality.ts: lib/site-config.ts builds the header menu from this
 * file, and the header must not ship every specification table to the browser.
 * The pages, which are server components, join `productSlugs` themselves.
 */

export type HealthCareLine = {
  /** As the client writes it — the menu label, the card and the page title. */
  name: string;
  slug: string;
  /** Catalogue entries this line is, in display order. Empty: not on the sheet. */
  productSlugs: string[];
  /** The paragraph under the title on the line's own page. */
  intro: string;
  /**
   * Drawn in red in the menu. Hyperbaric Use Only, at the client's request:
   * it is the one line that must never be mistaken for general stock. Its
   * Towel and Sheet sub-lines stay in the normal colour, also at the client's
   * request.
   */
  alert?: boolean;
  /**
   * Drawn in the menu indented under the line above it, with this shorter
   * label: "Towel" under Hyperbaric Use Only. The card and the page keep the
   * full name, because they have no parent line next to them to give the
   * context.
   */
  subLabel?: string;
};

export const HEALTH_CARE_BASE = "/health-care";

export const HEALTH_CARE_LINES: HealthCareLine[] = [
  {
    name: "Towels",
    slug: "towels",
    productSlugs: ["bath-towel", "hand-towel", "wash-cloth", "huck-towel"],
    intro:
      "Terry for the ward and the patient bathroom: bath towels in three cuts, a dobby-border hand towel, wash cloths in two builds and a plain white huck towel. Every figure below is taken from our product sheet.",
  },
  {
    name: "Sheets",
    slug: "sheets",
    productSlugs: [],
    intro:
      "Sheeting for patient beds. This line is not on our published specification sheet yet, so construction and sizes are confirmed with your quotation. Tell us the mattress you are fitting and how you launder.",
  },
  {
    name: "Bath Blanket",
    slug: "bath-blanket",
    productSlugs: ["bath-blanket"],
    intro:
      "A 70″×90″ bath blanket in bleached white and two blue-striped builds, selvage at the sides and hemmed top and bottom.",
  },
  {
    name: "Spread Blanket / Snag-Free Blanket",
    slug: "spread-blanket",
    productSlugs: [
      "chevron-blanket",
      "spectrum-spread-blanket",
      "spectrum-links-spread-blanket",
      "serpentine-blanket",
      "herringbone-thermal-blanket",
    ],
    intro:
      "Spread blankets for the top of a patient bed, in five weaves: chevron, spectrum, spectrum links, serpentine and herringbone. Each weave below has its own blend, size, weight and shades.",
  },
  {
    name: "Receiving Blanket",
    slug: "receiving-blanket",
    productSlugs: ["baby-blanket"],
    intro:
      "All-cotton receiving blankets for the nursery, in footprint and duck prints, a printed pink and blue stripe, and a woven dyed stripe.",
  },
  {
    name: "Absorbent Towel",
    slug: "absorbent-towel",
    productSlugs: ["surgical-towel"],
    intro:
      "An all-cotton absorbent towel, 18″×33″ and hemmed on all four sides, in jade, blue, misty and white. Our product sheet lists it as Surgical Towel.",
  },
  {
    name: "Patient Gown",
    slug: "patient-gown",
    productSlugs: [],
    intro:
      "Patient gowns in multi-stripe blue, multi-stripe green and snowflake prints. This line is not on our published specification sheet yet, so fabric and sizes are confirmed with your quotation.",
  },
  {
    name: "IV Gown / Examination Gown",
    slug: "iv-gown",
    productSlugs: [],
    intro:
      "Gowns for IV access and patient examination. This line is not on our published specification sheet yet, so fabric, closures and sizes are confirmed with your quotation.",
  },
  {
    name: "Hyperbaric Use Only",
    slug: "hyperbaric-use-only",
    productSlugs: ["hyperbaric-blanket"],
    intro:
      "An all-cotton 70″×90″ blanket for hyperbaric use, bleached white and printed “Hyperbaric Use Only” across the centre. Double stitched.",
    alert: true,
  },
  {
    name: "Hyperbaric Towel",
    slug: "hyperbaric-towel",
    productSlugs: [],
    intro:
      "Towels for hyperbaric use. This line is not on our published specification sheet yet, so construction, sizes and marking are confirmed with your quotation.",
    subLabel: "Towel",
  },
  {
    name: "Hyperbaric Sheet",
    slug: "hyperbaric-sheet",
    productSlugs: [],
    intro:
      "Sheets for hyperbaric use. This line is not on our published specification sheet yet, so construction, sizes and marking are confirmed with your quotation.",
    subLabel: "Sheet",
  },
  {
    name: "Pillow Case",
    slug: "pillow-case",
    productSlugs: [],
    intro:
      "Pillow cases for patient pillows. This line is not on our published specification sheet yet, so construction and sizes are confirmed with your quotation.",
  },
  {
    name: "Flannel Blanket",
    slug: "flannel-blanket",
    productSlugs: [],
    intro:
      "Flannel blankets. This line is not on our published specification sheet yet, so construction, sizes and colours are confirmed with your quotation.",
  },
];

const BY_SLUG = new Map(HEALTH_CARE_LINES.map((line) => [line.slug, line]));
const BY_NAME = new Map(HEALTH_CARE_LINES.map((line) => [line.name, line]));

export function getHealthCareLine(slug: string): HealthCareLine | undefined {
  return BY_SLUG.get(slug);
}

/** The line a menu label names, for the header's links and the quote form. */
export function healthCareLineByName(name: string): HealthCareLine | undefined {
  return BY_NAME.get(name);
}

export function healthCareLineHref(line: HealthCareLine): string {
  return `${HEALTH_CARE_BASE}/${line.slug}`;
}
