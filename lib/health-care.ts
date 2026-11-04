/**
 * The Health-Care range's CATEGORIES, as the client's "Health Care Category
 * Structure" sheet heads them in red.
 *
 * NINE CATEGORIES, IN THE SHEET'S ORDER. This one list drives the header's
 * Health-Care menu, the /health-care listing page and a page per category, so
 * the three cannot drift, the same arrangement as lib/hospitality.ts. Each
 * category page shows a card per product; the products, with their stock codes,
 * are in lib/health-care-sheet.ts.
 *
 * Pillow Case, Flannel Blanket and the hyperbaric towel and sheets are no
 * longer lines of their own: the sheet lists them as products under Hyperbaric
 * Use Only.
 *
 * DELIBERATELY FREE OF ANY product IMPORT, for the same reason as
 * lib/hospitality.ts: lib/site-config.ts builds the header menu from this
 * file, and the header must not ship every specification to the browser.
 */

export type HealthCareLine = {
  /** As the client writes it — the menu label, the card and the page title. */
  name: string;
  slug: string;
  /** The paragraph under the title on the line's own page. */
  intro: string;
  /**
   * Drawn in red in the menu. Hyperbaric Use Only, at the client's request:
   * it is the one line that must never be mistaken for general stock.
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
    intro:
      "Terry for the ward and the patient bathroom: wash cloths, a hand towel and bath towels in three sizes, all 85% cotton / 15% polyester. Open a product for its weights and stock codes.",
  },
  {
    name: "Sheets 55/45",
    slug: "sheets",
    intro:
      "Bed sheets, fitted sheets, knitted fitted sheets and pillow cases for patient beds. Open a product for its sizes and stock codes.",
  },
  {
    name: "Bath Blankets",
    slug: "bath-blanket",
    intro:
      "Bath blankets in natural, white and blue stripe, 70″×90″, in two or three weights. Open a product for its weights and stock codes.",
  },
  {
    name: "Spread Blanket / Snag Free Blanket",
    slug: "spread-blanket",
    intro:
      "Spread blankets for the top of a patient bed, in ten builds and a range of shades. Open a product for its blend, size, weight and stock codes.",
  },
  {
    name: "Patient Gown",
    slug: "patient-gown",
    intro:
      "Patient gowns in compass, multistripe, snow flake, demure and leaf prints. Open a print for its stock code.",
  },
  {
    name: "IV Gown",
    slug: "iv-gown",
    intro: "IV gowns in snow flake and diamond prints. Open a print for its stock code.",
  },
  {
    name: "Absorbent Towels",
    slug: "absorbent-towel",
    intro: "All-cotton absorbent towels, 18″×33″, in white and three shades of green and blue.",
  },
  {
    name: "Hyperbaric Use Only",
    slug: "hyperbaric-use-only",
    intro:
      "Towel, sheets, pillow case and flannel blanket for hyperbaric use, all 100% cotton and marked “Hyperbaric Use Only”.",
    alert: true,
  },
  {
    name: "Baby Receiving Blanket",
    slug: "receiving-blanket",
    intro:
      "All-cotton receiving blankets for the nursery, in printed, woven-stripe, hands, foot print and duck designs.",
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
