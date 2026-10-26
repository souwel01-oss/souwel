import { NOT_SPECIFIED, PRODUCTS } from "@/lib/product-data";

/**
 * The one line under a range card's title, for a line made of catalogue
 * builds: composition and size for a one-build line, read off the catalogue's
 * own derived facts; a count for a line of several builds, whose figures
 * differ and would not survive being joined onto one line. Null for a line
 * with no builds, which the card renders as "Specification on request".
 */
export function catalogueSummary(productSlugs: string[]): string | null {
  const products = productSlugs.map((slug) => PRODUCTS[slug]).filter(Boolean);
  if (products.length === 0) return null;
  if (products.length > 1) return `${products.length} builds on our product sheet`;

  const fact = (label: string) =>
    products[0].keyFacts.find((f) => f.label === label)?.value ?? NOT_SPECIFIED;
  const parts = [fact("Composition"), fact("Finished size")].filter((v) => v !== NOT_SPECIFIED);
  return parts.length ? parts.join(" · ") : null;
}
