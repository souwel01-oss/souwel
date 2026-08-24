/**
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
export const PRODUCT_PAGE_SLUGS = [
  // Health-Care
  "surgical-towel",
  "hyperbaric-blanket",
  "chevron-blanket",
  "spectrum-spread-blanket",
  "spectrum-links-spread-blanket",
  "serpentine-blanket",
  "herringbone-thermal-blanket",
  "bath-blanket",
  "baby-blanket",
  "huck-towel",
  "hand-towel",
  "bath-towel",
  "wash-cloth",
  // Hospitality
  "saloon-towel",
  "napkin",
  "bistro-napkin",
  "kitchen-towel-herringbone",
  "kitchen-towel-checks",
  "glass-towel",
  "dish-towel",
  "bar-mop",
  "bath-mat",
  // Institutional Laundry
  "shop-towel",
  // Commercial / Automotive
  "drop-cloth",
] as const;

export type ProductPageSlug = (typeof PRODUCT_PAGE_SLUGS)[number];

const SLUG_SET: ReadonlySet<string> = new Set(PRODUCT_PAGE_SLUGS);

export function hasProductPage(slug: string): boolean {
  return SLUG_SET.has(slug);
}
