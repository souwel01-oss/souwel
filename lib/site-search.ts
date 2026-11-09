import { HOSPITALITY_GROUPS, hospitalityItemHref } from "@/lib/hospitality";
import { TERRY_PRODUCTS, terryProductHref } from "@/lib/terry-towels";
import { BED_LINEN_PRODUCTS, bedLinenProductHref } from "@/lib/bed-linen";
import { FB_PRODUCTS, fbProductHref } from "@/lib/food-beverage";
import { SPA_SALON_PRODUCTS, spaSalonProductHref } from "@/lib/spa-salon";
import { HEALTH_CARE_LINES, healthCareLineHref } from "@/lib/health-care";
import {
  BATH_ROBE_BASE,
  BATH_ROBE_PRODUCTS,
  ECONOMY_TOWEL_PRODUCTS,
  HEALTH_CARE_PRODUCTS,
  economyTowelHref,
  healthCareProductHref,
} from "@/lib/health-care-sheet";
import { COMMERCIAL_ITEMS, commercialItemHref } from "@/lib/commercial";
import { plainName } from "@/lib/display-name";

/**
 * The site's search index: every range line and product page, built from the
 * same data the pages are built from, so a new product is searchable the moment
 * it has a page. Server-side only; /api/search serves it a few results at a
 * time rather than shipping all of this to every visitor's browser.
 */

export type SearchEntry = {
  title: string;
  /** Where it sits: "Bed Linen", "Health-Care · Towels". */
  section: string;
  /** The blend, for a product that has one. */
  detail: string | null;
  href: string;
  /** Lower-cased text the query is matched against. */
  haystack: string;
};

function entry(
  title: string,
  section: string,
  href: string,
  detail: string | null = null,
  extra: string[] = []
): SearchEntry {
  return {
    title,
    section,
    detail,
    href,
    haystack: [title, section, detail ?? "", ...extra].join(" ").toLowerCase(),
  };
}

/** Every stock code on a product, wherever its sheet keeps them. */
function skus(p: object): string[] {
  const rows = ["sizes", "lines", "colours"].flatMap(
    (k) => ((p as Record<string, unknown>)[k] as { sku?: string }[] | undefined) ?? []
  );
  return rows.map((r) => r.sku).filter((v): v is string => Boolean(v));
}

function build(): SearchEntry[] {
  const out: SearchEntry[] = [];

  for (const group of HOSPITALITY_GROUPS) {
    for (const item of group.items) {
      out.push(entry(item.name, `Hospitality · ${group.title}`, hospitalityItemHref(group, item)));
    }
  }
  for (const p of TERRY_PRODUCTS) {
    out.push(
      entry(plainName(p.name, p.blend), "Hospitality · Terry Towels", terryProductHref(p), p.blend, skus(p))
    );
  }
  for (const p of BED_LINEN_PRODUCTS) {
    out.push(
      entry(plainName(p.name, p.blend), "Hospitality · Bed Linen", bedLinenProductHref(p), p.blend, skus(p))
    );
  }
  for (const p of FB_PRODUCTS) {
    out.push(
      entry(plainName(p.name, p.blend), "Hospitality · Food & Beverage", fbProductHref(p), p.blend, skus(p))
    );
  }
  for (const p of SPA_SALON_PRODUCTS) {
    out.push(entry(p.name, "Hospitality · Spa Salon", spaSalonProductHref(p), null, skus(p)));
  }
  for (const p of ECONOMY_TOWEL_PRODUCTS) {
    out.push(
      entry(p.name, "Hospitality · Economy bath towels", economyTowelHref(p), p.blend, p.variants.map((v) => v.sku))
    );
  }
  for (const p of BATH_ROBE_PRODUCTS) {
    out.push(
      entry(p.name, "Hospitality · Bath robes", `${BATH_ROBE_BASE}/${p.slug}`, p.blend, p.variants.map((v) => v.sku))
    );
  }

  for (const line of HEALTH_CARE_LINES) {
    out.push(entry(line.name, "Health-Care", healthCareLineHref(line)));
    for (const p of HEALTH_CARE_PRODUCTS[line.slug] ?? []) {
      out.push(
        entry(p.name, `Health-Care · ${line.name}`, healthCareProductHref(line.slug, p), p.blend, p.variants.map((v) => v.sku))
      );
    }
  }

  for (const { group, item } of COMMERCIAL_ITEMS) {
    out.push(entry(item.name, `Commercial · ${group.title}`, commercialItemHref(item)));
  }

  // One result per page.
  const seen = new Set<string>();
  return out.filter((e) => (seen.has(e.href) ? false : (seen.add(e.href), true)));
}

let index: SearchEntry[] | null = null;

export function searchSite(query: string, limit = 8): Omit<SearchEntry, "haystack">[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  index ??= build();

  return index
    .filter((e) => terms.every((t) => e.haystack.includes(t)))
    .sort((a, b) => {
      const rank = (e: SearchEntry) => (e.title.toLowerCase().startsWith(terms[0]) ? 0 : 1);
      return rank(a) - rank(b) || a.title.length - b.title.length;
    })
    .slice(0, limit)
    .map(({ haystack: _h, ...rest }) => rest);
}
