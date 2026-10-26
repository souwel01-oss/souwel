/**
 * Catalogue products as orderable rows, for the pages that take the Terry
 * Towels page's shape: /products/[slug], /health-care/[line] and
 * /commercial/[item].
 *
 * ONE ROW PER VARIANT, ACROSS EVERY BUILD A PAGE COVERS. Health-Care's Towels
 * line is four catalogue entries (bath, hand, wash and huck towel). On its
 * page they become one list of seven rows, in the same way that one Terry
 * construction is a list of sizes.
 *
 * WHAT VARIES IS WHAT IS CHOSEN; WHAT DOES NOT IS STATED ONCE. A column that
 * holds the same value on every row (Blend on Absorbent Towel, Size on Shop
 * Towel) becomes a fixed fact in the "Build your request" panel. Only the
 * columns that differ go into the table and onto the picker's buttons. A page
 * with a single row has nothing to choose, so it gets no buttons at all.
 *
 * THE ROW CODE IS NOT A STOCK CODE, AND THE PAGE NEVER SHOWS IT. The client's
 * sheet prints no stock codes for these products, but the quote list needs a
 * key for each row (see components/hospitality/RangeOrderList.tsx). Each row
 * is keyed by a code derived from its own figures. The code stays the same as
 * long as the row does. When the sheet changes a row, its code changes too,
 * so a saved list drops that row instead of quoting the old figures. That is
 * the same thing RangeOrderList does with a SKU the sheet no longer lists.
 *
 * Imports lib/product-data.ts, so only server components and the quote page
 * should import this file.
 */

import { NOT_SPECIFIED, PRODUCTS, type VariantRow } from "@/lib/product-data";
import { caseNote, roundUpToCase, type QuantityUnit } from "@/lib/case-pack";

type Field = "type" | "colour" | "size" | "weight" | "blend" | "stitching" | "uom";

const FIELDS: Field[] = ["type", "colour", "size", "weight", "blend", "stitching", "uom"];

const FIELD_LABEL: Record<Field, string> = {
  type: "Product type",
  colour: "Colour / finish",
  size: "Size",
  weight: "Weight",
  blend: "Blend",
  stitching: "Stitching",
  uom: "Sold by",
};

type CatalogueRow = VariantRow & {
  code: string;
  productSlug: string;
  type: string;
  uom: string;
};

/** One row as the picker and the table draw it. Plain strings only. */
export type OrderSpecRow = {
  code: string;
  /** One value per entry in `OrderSpec.columns`. */
  cells: string[];
  /** The picker button: its title, then up to two smaller lines. */
  title: string;
  detail: string[];
  /** Every varying value in one line, for the picker's readout and the quote list. */
  summary: string;
  /** What the quantity counts: dozens for a DZ line, pieces otherwise. */
  unit: QuantityUnit;
  /** What a quantity goes up in, in `unit`: the case where the sheet gives one, else 1. */
  step: number;
  stepNote: string;
};

export type OrderSpec = {
  /** What the picker's choice is called: "Product type", "Colour / finish"… */
  choiceLabel: string;
  /** Values every row shares, shown once. Blank cells are left out. */
  facts: { label: string; value: string }[];
  /** Column headings for the varying values. The first is the row header. */
  columns: string[];
  rows: OrderSpecRow[];
};

/**
 * Hashes a row's figures into a short code: the FNV-1a hash, written in base 36.
 * It only needs to be stable and unique on one page, which the collision check
 * in catalogueRows makes sure of.
 */
function rowCode(slug: string, v: VariantRow): string {
  const text = [slug, v.colour, v.size, v.weight, v.blend, v.stitching].join("|");
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `C${hash.toString(36).toUpperCase()}`;
}

function catalogueRows(productSlugs: string[]): CatalogueRow[] {
  const seen = new Set<string>();
  const rows: CatalogueRow[] = [];
  for (const slug of productSlugs) {
    const product = PRODUCTS[slug];
    if (!product) continue;
    product.variants.forEach((variant, i) => {
      let code = rowCode(slug, variant);
      if (seen.has(code)) code = `${code}${i}`;
      seen.add(code);
      rows.push({ ...variant, code, productSlug: slug, type: product.name, uom: product.uom });
    });
  }
  return rows;
}

/**
 * Turns the sheet's unit of measure into a quantity unit and step. "DZ" and
 * "2500 PCS/CASE" are the only units the sheet uses besides plain pieces. A
 * DZ line is counted in dozens, as the towel range is. The sheet gives these
 * lines no case figure, so they go up a dozen at a time. The shop towel's
 * 2,500-piece case is its minimum, so it goes up in whole cases. See
 * lib/case-pack.ts.
 */
function stepFor(uom: string): { unit: QuantityUnit; step: number; stepNote: string } {
  const unit: QuantityUnit = uom.trim().toUpperCase() === "DZ" ? "dz" : "pcs";
  const perCase = /^(\d+)\s*PCS\s*\/\s*CASE$/i.exec(uom.trim());
  const step = perCase ? Number(perCase[1]) : 1;
  return { unit, step, stepNote: caseNote(step, unit) };
}

/**
 * The page's rows, split into facts and choices. Returns null when no product
 * in `productSlugs` has a row, which means the line has no specification yet.
 */
export function orderSpec(productSlugs: string[]): OrderSpec | null {
  const rows = catalogueRows(productSlugs);
  if (rows.length === 0) return null;

  const varies = (f: Field) => new Set(rows.map((r) => r[f])).size > 1;
  const varying = FIELDS.filter(varies);

  // The product's name is the page title when there is only one, so it is
  // neither a fact nor a column.
  const facts = FIELDS.filter((f) => f !== "type" && !varying.includes(f))
    .map((f) => ({ label: FIELD_LABEL[f], value: rows[0][f] }))
    .filter((fact) => fact.value !== NOT_SPECIFIED);

  // A single row varies in nothing. Its colour still names it, so it becomes
  // the row header, the way Bar Mop — Ribbed lists its one colour.
  const columns: Field[] = varying.length ? varying : ["colour"];
  const head = columns[0];
  const chipExtras = (["colour", "size"] as Field[]).filter(
    (f) => f !== head && varying.includes(f)
  );

  return {
    choiceLabel: FIELD_LABEL[head],
    facts,
    columns: columns.map((f) => FIELD_LABEL[f]),
    rows: rows.map((row) => ({
      code: row.code,
      cells: columns.map((f) => row[f]),
      title: row[head],
      detail: chipExtras.map((f) => row[f]).filter((v) => v !== NOT_SPECIFIED),
      summary: columns
        .map((f) => row[f])
        .filter((v) => v !== NOT_SPECIFIED)
        .join(" · "),
      ...stepFor(row.uom),
    })),
  };
}

/* ───────────────────────────────────────────────────────────────────────────
   The quote page's side
   ─────────────────────────────────────────────────────────────────────────── */

export type CatalogueOrderItem = { slug: string; quantity: number; notes: string };

/**
 * Parses a `CODE:qty,…` payload against the page's own rows. Only codes the
 * page actually has are kept; an unknown code, a repeat or a junk quantity is
 * dropped rather than repaired. The rule is the same as parseTerryLines.
 *
 * Each row becomes a line item on the request, with the row's figures as its
 * notes. That way Sales can price the rows separately, and the figures come
 * from the catalogue rather than from the URL. `lineName` is the client's name
 * for the page. When it differs from the catalogue's name (Absorbent Towel
 * against Surgical Towel), it goes into the notes so the buyer recognises what
 * they asked for.
 */
export function parseCatalogueLines(
  productSlugs: string[],
  lineName: string,
  raw: string | undefined
): CatalogueOrderItem[] {
  if (!raw) return [];
  const rows = catalogueRows(productSlugs);
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const seen = new Set<string>();
  const out: CatalogueOrderItem[] = [];

  for (const part of raw.split(",").slice(0, rows.length)) {
    const [code, qty] = part.split(":");
    const row = byCode.get(code);
    if (!row || seen.has(code)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(code);

    const figures = [row.colour, row.size, row.weight, row.blend, row.stitching]
      .filter((v) => v !== NOT_SPECIFIED)
      .join(" · ");
    const { unit, step } = stepFor(row.uom);
    // The unit goes in the notes, because the line item's quantity is a bare number.
    const counted = `quantity in ${unit === "dz" ? "dozens" : "pieces"}`;
    out.push({
      slug: row.productSlug,
      quantity: roundUpToCase(n, step),
      notes: `${lineName === row.type ? figures : `${lineName}: ${figures}`} (${counted})`,
    });
  }

  return out;
}
