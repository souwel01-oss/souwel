import {
  BATH_ROBE_BASE,
  BATH_ROBE_PRODUCTS,
  ECONOMY_BASE,
  ECONOMY_TOWEL_PRODUCTS,
  type HcProduct,
} from "@/lib/health-care-sheet";
import { healthCareProductShots } from "@/lib/health-care-photos";
import { BATH_ROBE_PRODUCT_PHOTOS, LINE_PHOTOS, type Shot } from "@/lib/hospitality-photos";

/**
 * The Hospitality lines that open a page of product cards taken from a client
 * sheet, each product with a page of its own: Economy bath towels and Bath
 * robes, both under Bath Linen.
 *
 * ONE ENTRY PER LINE, so the listing page and the product page are written once
 * (app/(marketing)/hospitality/[group]/[item]) and a third line of this kind is
 * an entry here and nothing else. Server-side only: it imports the photographs.
 */

export type SheetLine = {
  group: string;
  item: string;
  /** The line's name, for the heading, the breadcrumb and the tab title. */
  name: string;
  base: string;
  /** The paragraph under the heading. */
  intro: string;
  /** The meta description. */
  description: string;
  /** What the figures come from, e.g. "Economy bath towels sheet". */
  sourceName: string;
  products: HcProduct[];
  shots: (product: HcProduct) => Shot[];
};

export const SHEET_LINES: SheetLine[] = [
  {
    group: "bath-linen",
    item: "economy-bath-towels",
    name: "Economy bath towels",
    base: ECONOMY_BASE,
    intro:
      "Staff towels for motels, gyms and theme parks. Single cam, double cam and full terry towels come in a run of sizes, plus a blue-striped pool towel. Open one for its weights and stock codes.",
    description:
      "Staff towels for motels, gyms and theme parks: single cam, double cam and full terry towels in a run of sizes, and a blue-striped pool towel.",
    sourceName: "Economy bath towels sheet",
    products: ECONOMY_TOWEL_PRODUCTS,
    shots: (product) => healthCareProductShots("towels", product.slug),
  },
  {
    group: "bath-linen",
    item: "bath-robes",
    name: "Bath robes",
    base: BATH_ROBE_BASE,
    intro:
      "Bath robes for the guest room and the spa, all 100% cotton: a standard terry robe in kimono and shawl collars and two sizes, and waffle and honeycomb robes. Open one for its stock code.",
    description:
      "100% cotton bath robes: standard terry in kimono and shawl collars, standard and X large, plus waffle and honeycomb robes.",
    sourceName: "bath robe sheet",
    products: BATH_ROBE_PRODUCTS,
    shots: (product) => BATH_ROBE_PRODUCT_PHOTOS[product.slug] ?? LINE_PHOTOS["bath-robes"],
  },
];

export function getSheetLine(group: string, item: string): SheetLine | undefined {
  return SHEET_LINES.find((l) => l.group === group && l.item === item);
}

export function sheetLineProductHref(line: SheetLine, product: HcProduct): string {
  return `${line.base}/${product.slug}`;
}
