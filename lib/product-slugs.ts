/**
 * The slugs that have a real product detail page — the single source of truth.
 *
 * WHY THIS IS ITS OWN MODULE. Two consumers need this list and neither can
 * import the other:
 *
 *   - lib/product-data.ts holds the full specification blob for every product.
 *     The header must not import it, or the nav drags every spec table of every
 *     product into the client bundle.
 *   - lib/site-config.ts is imported by the header, so it must stay small.
 *
 * The list used to be duplicated: `PRODUCTS_WITH_PAGES` in site-config and the
 * keys of `PRODUCTS` in product-data, with a comment asking whoever edited one
 * to remember the other. That was survivable at one product. At twenty-four it
 * is a guaranteed drift bug, and the failure is silent in the worst direction —
 * a product that HAS a page keeps being linked to a category anchor that does
 * not exist yet, so the nav quietly 404s.
 *
 * This file holds only strings, so importing it costs the client bundle
 * nothing. lib/product-data.ts asserts at build time that its own keys match
 * this list exactly, so the two cannot drift apart unnoticed.
 */
export const PRODUCT_PAGE_SLUGS = [
  // Hospitality
  "bedding-linens",
  "terry-towels",
  "pillow",
  "pool-and-beach-towels",
  "duvet-pillow-covers",
  "barmops",
  "kitchen-towels",
  "duvet-comforters",
  "salon-and-spa",
  "table-covers-napkins",
  "mattress-protector",
  "terry-grill-pads",
  "glass-towel",
  "bib-apron",
  // Health-Care
  "bed-linens",
  "pillow-covers",
  "patient-gowns",
  "scrub-suits",
  "lab-coats",
  "bath-blankets",
  "baby-blankets",
  "thermal-blankets",
  "surgical-towels-lint-free",
  "water-proof-flat-pads",
] as const;

export type ProductPageSlug = (typeof PRODUCT_PAGE_SLUGS)[number];

const SLUG_SET: ReadonlySet<string> = new Set(PRODUCT_PAGE_SLUGS);

export function hasProductPage(slug: string): boolean {
  return SLUG_SET.has(slug);
}
