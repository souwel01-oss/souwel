/**
 * The Towel range, transcribed from the client's "BATH TOWELS" sheet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP. Every blend, hem, weight and
 * stock code below is copied from that sheet. Nothing here was inferred,
 * rounded, converted or filled in from a neighbouring row.
 *
 * THE STOCK CODES ARE THE CLIENT'S OWN. An earlier version of this file
 * generated SW-<construction>-<size> codes because the extract we had carried
 * no SKU column. The full sheet does — one code per construction per size —
 * so those invented codes are gone and a buyer quoting BT2754CRH back at
 * Souwel is quoting Souwel's own code. The code is also what the order list
 * and the quote link are keyed on, because it is the one value that is
 * one-per-orderable-line by construction.
 *
 * WEIGHTS ARE VERBATIM, INCLUDING THE UNIT. The sheet writes "1 LBS",
 * "12.5 LBS", "6.4 LBS", and "600 GSM" for the one row it measures that way.
 *
 * THE POUND FIGURES ARE PER DOZEN — the sheet itself does not say so, and the
 * client confirmed it when asked. That is why they are stored verbatim and
 * the basis is carried separately on `weightPer`: the figure is the client's,
 * the sentence around it is ours. Every surface prints the two together,
 * because "12.5 LBS" on its own reads as the weight of one bath towel, which
 * would be absurd, and a buyer costing a tender off it would be out by twelve.
 *
 * THE GSM FIGURE IS NOT PER DOZEN. Grams per square metre is a density of
 * cloth, not a weight of a bundle, so the Sauna Bath Towel's `weightPer` is
 * null and it prints alone.
 *
 * A MISSING SIZE IS A MISSING SIZE. Where the sheet's cell is blank there is
 * no line for it and the size is not offered. Cabana Pool Towels is a pool
 * towel and nothing else; Sauna Bath Towel is its own 40X80 and nothing else.
 * Never borrow the figure from the row above to fill a gap.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TWO ROWS SHARE THE NAME "CLASSIC TERRY TOWELS" and are different products —
 * one is 100% cotton, the other an 80/20 blend. They are modelled as two
 * products with one `family`, which is what drives the chooser page that
 * stands between the range listing and either detail page.
 */

import { roundUpToCase } from "@/lib/case-pack";

export type TerrySizeKey = "wash-cloth" | "hand-towel" | "bath-towel" | "bath-mat" | "pool-towel";

export type TerrySize = {
  key: TerrySizeKey;
  /** The sheet's own column heading, in title case. */
  name: string;
  /** Finished size, exactly as the sheet writes it. */
  dimensions: string;
  /** Dozens per case, from the note above the sheet's column heading. */
  dozenPerCase: number;
};

/** The size columns, in sheet order. */
export const TERRY_SIZES: TerrySize[] = [
  { key: "wash-cloth", name: "Wash Cloth", dimensions: '13"X13"', dozenPerCase: 15 },
  { key: "hand-towel", name: "Hand Towel", dimensions: '16"X27"', dozenPerCase: 10 },
  { key: "bath-towel", name: "Bath Towel", dimensions: '27"X54"', dozenPerCase: 3 },
  // The sheet heads this column "BATH MATT"; the product is a bath mat.
  { key: "bath-mat", name: "Bath Mat", dimensions: '20"X30"', dozenPerCase: 4 },
  { key: "pool-towel", name: "Pool Towel", dimensions: '30"X60"', dozenPerCase: 2 },
];

/**
 * The sheet prints "100% COTTON" above the BATH MATT column, not against any
 * one row — the mat is cotton whatever the towel beside it is woven from.
 * Which is also why both Classic Terry constructions carry the SAME bath mat
 * code, BM2030CRH: it is literally the same mat.
 */
export const BATH_MAT_NOTE = "Bath mats are 100% cotton on every construction.";

/** One orderable line: a size, its weight, and the client's code for it. */
export type TerryLine = {
  /** The client's own stock code. Unique within the product. */
  sku: string;
  /** The sheet column this sits in, or null for a bespoke one-off size. */
  sizeKey: TerrySizeKey | null;
  /** "Bath Towel", or "Pool Towel — Blue" where the sheet names a colour. */
  name: string;
  dimensions: string;
  /** Verbatim from the sheet, including the unit it chose. */
  weight: string;
  /** What that figure is per. Null where it is a density rather than a bundle. */
  weightPer: "dozen" | null;
  /** Dozens per case, where the sheet's column heading gives one. */
  dozenPerCase: number | null;
};

/**
 * The weight as it should be read aloud — "12.5 LBS per dozen", or just
 * "600 GSM" where the figure is a density. Used by the picker, the table and
 * the quote message so the three cannot describe the same number differently.
 */
export function terryWeightLabel(line: { weight: string; weightPer: "dozen" | null }): string {
  return line.weightPer === "dozen" ? `${line.weight} per dozen` : line.weight;
}

export type TerryProduct = {
  slug: string;
  /** As the sheet names it. Two products share this string on purpose. */
  name: string;
  /** Groups the same-named entries. Unique per name. */
  family: string;
  blend: string;
  hem: string;
  lines: TerryLine[];
};

const SIZE = new Map(TERRY_SIZES.map((s) => [s.key, s]));

/**
 * A line in one of the sheet's five standard size columns. The name,
 * finished size and case pack all belong to the COLUMN, so they are read from
 * TERRY_SIZES rather than retyped against every row — nine rows × four sizes
 * of hand-copied dimensions is nine chances to mistype one.
 */
function std(sizeKey: TerrySizeKey, weight: string, sku: string): TerryLine {
  const size = SIZE.get(sizeKey)!;
  return {
    sku,
    sizeKey,
    name: size.name,
    dimensions: size.dimensions,
    weight,
    // Every figure in the sheet's five size columns is a pound weight, and
    // every pound weight on this sheet is per dozen.
    weightPer: "dozen",
    dozenPerCase: size.dozenPerCase,
  };
}

/**
 * The nine rows of the sheet, in sheet order.
 *
 * ONLY CABANA POOL TOWELS HAS A PHOTOGRAPH OF ITS OWN. The other eight show
 * the client's range shots of their terry, the same way the rest of the
 * Hospitality listing falls back — see lib/hospitality-photos.ts for why the
 * shoot cannot be matched to these rows yet. A card with a real weight table
 * and a range photograph is honest; an invented weight would not be.
 */
export const TERRY_PRODUCTS: TerryProduct[] = [
  {
    slug: "classic-terry-towels-100-cotton",
    name: "Classic Terry Towels",
    family: "classic-terry-towels",
    blend: "100% Cotton",
    hem: "Reinforced",
    lines: [
      std("wash-cloth", "1 LBS", "WC1313CRH"),
      std("hand-towel", "3 LBS", "HT1627CRH"),
      std("bath-towel", "12.5 LBS", "BT2754CRH"),
      std("bath-mat", "6.4 LBS", "BM2030CRH"),
    ],
  },
  {
    slug: "classic-terry-towels-80-20-poly",
    name: "Classic Terry Towels",
    family: "classic-terry-towels",
    blend: "80% Cot / 20% Poly",
    hem: "Reinforced",
    lines: [
      std("wash-cloth", "1.5 LBS", "WC1313BRH"),
      std("hand-towel", "4 LBS", "HT1627BRH"),
      std("bath-towel", "13 LBS", "BT2754BRH"),
      // BM2030CRH, the same code as the 100% cotton row above — see BATH_MAT_NOTE.
      std("bath-mat", "6.4 LBS", "BM2030CRH"),
    ],
  },
  {
    slug: "classic-dobby-towels",
    name: "Classic Dobby Towels",
    family: "classic-dobby-towels",
    blend: "90% Cot / 10% Poly",
    hem: "Plain",
    lines: [
      std("wash-cloth", "1.5 LBS", "WC1313CDB"),
      std("hand-towel", "3 LBS", "HT1627CDB"),
      std("bath-towel", "15 LBS", "BT2754CDB"),
      std("bath-mat", "10 LBS", "BM2030C10"),
    ],
  },
  {
    slug: "dobby-towels",
    name: "Dobby Towels",
    family: "dobby-towels",
    blend: "86% Cot / 14% Poly",
    hem: "Plain",
    lines: [
      std("wash-cloth", "1.5 LBS", "WC1313FDB"),
      std("hand-towel", "3 LBS", "HT1627FDB"),
      std("bath-towel", "15 LBS", "BT2754FDB"),
      std("bath-mat", "10 LBS", "BM2030C10"),
    ],
  },
  {
    slug: "plain-quad-cam-towel",
    name: "Plain Quad Cam Towel",
    family: "plain-quad-cam-towel",
    blend: "100% Cotton",
    hem: "Plain",
    lines: [
      // The sheet's wash cloth code for this row reads WC1313CDC while its
      // hand and bath towels read CQC. Transcribed as written rather than
      // tidied into the pattern — a stock code is not ours to correct.
      std("wash-cloth", "1.5 LBS", "WC1313CDC"),
      std("hand-towel", "4 LBS", "HT1627CQC"),
      std("bath-towel", "15 LBS", "BT2754CQC"),
      std("bath-mat", "10 LBS", "BM2030C10"),
    ],
  },
  {
    slug: "pique-weave-towel",
    name: "Pique Weave Towel",
    family: "pique-weave-towel",
    blend: "86% Cot / 14% Poly",
    hem: "Plain",
    lines: [
      std("wash-cloth", "1.5 LBS", "WC1313PQB"),
      std("hand-towel", "4 LBS", "HT1627PQB"),
      std("bath-towel", "15 LBS", "BT2754PQB"),
      std("bath-mat", "10 LBS", "BM2030PQC"),
    ],
  },
  {
    slug: "piano-key-towel",
    name: "Piano Key Towel",
    family: "piano-key-towel",
    blend: "100% Cotton All Ring",
    hem: "Plain",
    lines: [
      std("wash-cloth", "1.5 LBS", "WC1313PIANO"),
      std("hand-towel", "4.5 LBS", "HT1627PIANO"),
      std("bath-towel", "18 LBS", "BT2754PIANO"),
      std("bath-mat", "10 LBS", "BM2030PIANO"),
    ],
  },
  {
    // A pool towel and nothing else, and the one row on the sheet with a
    // colour choice: two codes for the same size, one blue and one yellow.
    // They are two lines rather than one with a note, because they are two
    // codes and a buyer orders one or the other.
    slug: "cabana-pool-towels",
    name: "Cabana Pool Towels",
    family: "cabana-pool-towels",
    blend: "100% Cotton",
    hem: "Blue or Yellow",
    lines: [
      { ...std("pool-towel", "18 LBS", "PT3060CBNB"), name: "Pool Towel — Blue" },
      { ...std("pool-towel", "18 LBS", "PT3060CBNY"), name: "Pool Towel — Yellow" },
    ],
  },
  {
    // The one row measured in GSM rather than pounds, in a size that is not
    // one of the sheet's five columns. Both are left exactly as written.
    slug: "sauna-bath-towel",
    name: "Sauna Bath Towel",
    family: "sauna-bath-towel",
    blend: "100% Cotton",
    hem: "Plain",
    lines: [
      {
        sku: "BTS4080WHT",
        sizeKey: null,
        name: "Sauna Bath Towel",
        dimensions: "40X80",
        weight: "600 GSM",
        // A density, not a bundle weight — see the note at the top.
        weightPer: null,
        dozenPerCase: null,
      },
    ],
  },
];

/** Where the range lives. One constant so the links cannot drift. */
export const TERRY_BASE = "/hospitality/terry-towels";

const BY_SLUG = new Map(TERRY_PRODUCTS.map((p) => [p.slug, p]));

export function getTerryProduct(slug: string): TerryProduct | undefined {
  return BY_SLUG.get(slug);
}

/** The members of a family, in sheet order. Length > 1 means it needs a chooser. */
export function getTerryFamily(family: string): TerryProduct[] {
  return TERRY_PRODUCTS.filter((p) => p.family === family);
}

/** Every family slug that holds more than one product, so it needs a chooser page. */
export function terryFamiliesNeedingChooser(): string[] {
  const counts = new Map<string, number>();
  for (const p of TERRY_PRODUCTS) counts.set(p.family, (counts.get(p.family) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n > 1).map(([slug]) => slug);
}

/**
 * Where a card for this product points.
 *
 * A PRODUCT IN A MULTI-MEMBER FAMILY POINTS AT THE CHOOSER, not straight at
 * itself. Both Classic Terry cards carry the same name, and sending each one
 * to its own detail page would mean the buyer picks a blend from a grid
 * before they have been shown that there is a choice to make. The chooser is
 * the page that puts the two side by side.
 */
export function terryProductHref(product: TerryProduct): string {
  return getTerryFamily(product.family).length > 1
    ? `${TERRY_BASE}/${product.family}`
    : `${TERRY_BASE}/${product.slug}`;
}

/** The size names this product is made in, once each, in sheet order. */
export function terrySizeNames(product: TerryProduct): string[] {
  const keyed = new Set(product.lines.map((l) => l.sizeKey).filter(Boolean));
  const named = TERRY_SIZES.filter((s) => keyed.has(s.key)).map((s) => s.name);
  const bespoke = product.lines.filter((l) => l.sizeKey === null).map((l) => l.name);
  return [...named, ...bespoke];
}

/** Whether this product offers a bath matt, so the page can show BATH_MAT_NOTE. */
export function hasBathMat(product: TerryProduct): boolean {
  return product.lines.some((l) => l.sizeKey === "bath-mat");
}

/**
 * The one-line summary a listing card shows under the title.
 *
 * Blend first, because it is the only thing separating the two Classic Terry
 * entries, and the brief asks for that difference to be unmissable.
 */
export function terryCardSummary(product: TerryProduct): string {
  return `${product.blend} · ${product.hem} hem · ${terrySizeNames(product).join(", ")}`;
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * QUANTITIES ARE IN DOZENS AND ROUND UP TO A FULL CASE. The sheet's dozens per
 * case is a minimum as well as a pack, so a wash cloth packed 15 dz to a case
 * is ordered in 15s and 20 becomes 30. A line the sheet gives no case figure
 * for (the Sauna Bath Towel) rounds to the whole dozen only. See
 * lib/case-pack.ts.
 */
export function terryCaseStep(line: { dozenPerCase: number | null }): number {
  return line.dozenPerCase ?? 1;
}

export type TerryOrderLine = { sku: string; quantity: number };

/**
 * `?lines=` — the buyer's list, keyed on the client's own stock codes.
 *
 * `BT2754CRH:504,WC1313CRH:120`. Codes and quantities only: no names, no
 * weights. Everything a member of staff reads is rebuilt from this file after
 * the codes are checked, so nothing a visitor can type reaches the lead. See
 * readTerryRequest in app/(marketing)/quote/page.tsx.
 */
export function encodeTerryLines(lines: TerryOrderLine[]): string {
  return lines.map((l) => `${l.sku}:${l.quantity}`).join(",");
}

export type TerryOrderRow = TerryLine & { quantity: number };

/**
 * Parses `?lines=`, keeping only codes THIS product is made in. An unknown
 * code, a duplicate or a junk quantity is dropped rather than repaired — a
 * request that half-parsed is worse than one that arrives empty and makes the
 * buyer say what they meant.
 */
export function parseTerryLines(product: TerryProduct, raw: string | undefined): TerryOrderRow[] {
  if (!raw) return [];
  const offered = new Map(product.lines.map((l) => [l.sku, l]));
  const seen = new Set<string>();
  const out: TerryOrderRow[] = [];

  for (const part of raw.split(",").slice(0, product.lines.length)) {
    const [sku, qty] = part.split(":");
    const line = offered.get(sku);
    if (!line || seen.has(sku)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(sku);
    out.push({ ...line, quantity: roundUpToCase(n, terryCaseStep(line)) });
  }

  return out;
}

/**
 * The one line the Bath Linen card shows for the range as a whole.
 *
 * Derived, not written down. "Nine constructions" typed into a second file is
 * a number that goes stale the first time the client sends another row.
 */
export function terryRangeSummary(): string {
  const sizes = new Set(TERRY_PRODUCTS.flatMap((p) => p.lines.map((l) => l.sizeKey ?? l.name)));
  return `${TERRY_PRODUCTS.length} constructions · ${sizes.size} sizes`;
}

/**
 * The range listing, one card per FAMILY rather than one per sheet row.
 *
 * The sheet has nine rows but only eight products a buyer would name: Classic
 * Terry Towels appears twice, once per blend. Two cards carrying the same
 * title in one grid reads as a duplicate — the difference between them is a
 * line of body text, which is not where a buyer looks first. So the family
 * gets one card and both blends are listed inside it, and the choice is made
 * on the chooser page where the two are side by side.
 *
 * A single-member family keeps the fuller summary — blend, hem and the sizes
 * it is made in. A multi-member one lists blend and hem per member instead:
 * the sizes differ between them, so one combined size list would describe
 * neither.
 */
export type TerryListingEntry = {
  key: string;
  name: string;
  href: string;
  /** One line per member. A single-member family has exactly one. */
  lines: string[];
};

export function terryListingEntries(): TerryListingEntry[] {
  const seen = new Set<string>();
  const entries: TerryListingEntry[] = [];

  for (const product of TERRY_PRODUCTS) {
    if (seen.has(product.family)) continue;
    seen.add(product.family);

    const members = getTerryFamily(product.family);
    entries.push({
      key: product.family,
      name: product.name,
      href: terryProductHref(product),
      lines:
        members.length > 1
          ? members.map((m) => `${m.blend} · ${m.hem} hem`)
          : [terryCardSummary(product)],
    });
  }

  return entries;
}
