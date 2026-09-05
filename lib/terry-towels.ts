/**
 * The Terry Towels range, transcribed from the client's towel sheet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP. Every blend, hem and weight
 * below is copied from "product details - Sheet1". Nothing here was inferred,
 * rounded, converted or filled in, and nothing should be: the sheet is what a
 * buyer will be quoted against.
 *
 * Two consequences worth knowing before editing:
 *
 * 1. WEIGHTS ARE VERBATIM, INCLUDING THE UNIT. The sheet writes "1 LBS",
 *    "12.5 LBS", "6.4 LBS". It does NOT say what the weight is per — a single
 *    towel, a dozen, a case. The trade convention is per dozen and 12.5 lbs for
 *    one bath towel is obviously wrong, but the sheet does not say so, so
 *    neither do we. Ask the client and add the basis here when they answer.
 *
 * 2. A MISSING SIZE IS A MISSING SIZE. Where the sheet's cell is blank the key
 *    is absent from `weights`, and the size is not offered on the product page.
 *    Classic Terry Towels in 80/20 has a hand towel and a bath towel and
 *    nothing else. Do not borrow the figure from the row above to fill a gap.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TWO ROWS SHARE THE NAME "CLASSIC TERRY TOWELS" and are different products —
 * one is 100% cotton, the other an 80/20 blend. They are modelled as two
 * products with one `family`, which is what drives the chooser page that stands
 * between the range listing and either detail page.
 */

export type TerrySizeKey = "wash-cloth" | "hand-towel" | "bath-towel" | "bath-mat" | "pool-towel";

export type TerrySize = {
  key: TerrySizeKey;
  /** The sheet's own column heading, in title case. */
  name: string;
  /** Finished size, exactly as the sheet writes it. */
  dimensions: string;
  /** Two-letter segment of the SKU. See terrySkuFor. */
  code: string;
};

/** The size columns, in sheet order. */
export const TERRY_SIZES: TerrySize[] = [
  { key: "wash-cloth", name: "Wash Cloth", dimensions: '13"x13"', code: "WC" },
  { key: "hand-towel", name: "Hand Towel", dimensions: '16"x27"', code: "HT" },
  { key: "bath-towel", name: "Bath Towel", dimensions: '27"x54"', code: "BT" },
  { key: "bath-mat", name: "Bath Matt", dimensions: '20"x30"', code: "BM" },
  { key: "pool-towel", name: "Pool Towel", dimensions: '30"x60"', code: "PT" },
];

/**
 * A BLANK CELL MEANS THAT CONSTRUCTION IS NOT MADE IN THAT SIZE, and that is
 * the whole rule — no exceptions, including the Pool Towel column.
 *
 * Pool Towel keeps its entry above because the sheet carries the column and its
 * 30"x60" heading, so the size exists as a concept and its SKU segment is
 * settled. But not one of the seven rows has a weight in it, so no construction
 * offers it today and none of them show it. The moment a weight lands in that
 * column for a row, that product starts offering it with no other change.
 *
 * Never borrow a figure from the size beside it to fill a gap.
 */

export type TerryProduct = {
  slug: string;
  /** As the sheet names it. Two products share this string on purpose. */
  name: string;
  /** Groups the two same-named entries. Unique per name. */
  family: string;
  /** Construction segment of the SKU. See terrySkuFor. */
  code: string;
  blend: string;
  hem: string;
  /** Weight per size. A key that is absent is a size we do not offer. */
  weights: Partial<Record<TerrySizeKey, string>>;
};

/**
 * The seven rows of the sheet, in sheet order.
 *
 * NO PHOTOGRAPHY EXISTS FOR THESE SEVEN. The cards and detail pages fall back
 * to the range imagery, the same way the rest of the Hospitality listing does.
 * A card with a real weight table and a stand-in photograph is honest; an
 * invented weight would not be.
 */
export const TERRY_PRODUCTS: TerryProduct[] = [
  {
    slug: "classic-terry-towels-100-cotton",
    code: "CT100",
    name: "Classic Terry Towels",
    family: "classic-terry-towels",
    blend: "100% Cotton",
    hem: "Reinforced",
    weights: {
      "wash-cloth": "1 LBS",
      "hand-towel": "3 LBS",
      "bath-towel": "12.5 LBS",
      "bath-mat": "6.4 LBS",
    },
  },
  {
    slug: "classic-terry-towels-80-20-poly",
    code: "CT8020",
    name: "Classic Terry Towels",
    family: "classic-terry-towels",
    blend: "80% Cot / 20% Poly",
    hem: "Reinforced",
    weights: {
      "hand-towel": "4 LBS",
      "bath-towel": "13 LBS",
    },
  },
  {
    slug: "classic-dobby-towels",
    code: "CD",
    name: "Classic Dobby Towels",
    family: "classic-dobby-towels",
    blend: "90% Cot / 10% Poly",
    hem: "Plain",
    weights: {
      "wash-cloth": "1.5 LBS",
      "hand-towel": "3 LBS",
      "bath-towel": "15 LBS",
      "bath-mat": "10 LBS",
    },
  },
  {
    slug: "dobby-towels",
    code: "DB",
    name: "Dobby Towels",
    family: "dobby-towels",
    blend: "86% Cot / 14% Poly",
    hem: "Plain",
    weights: {
      "wash-cloth": "1.5 LBS",
      "hand-towel": "3 LBS",
      "bath-towel": "15 LBS",
      "bath-mat": "10 LBS",
    },
  },
  {
    slug: "plain-quad-cam-towel",
    code: "QC",
    name: "Plain Quad Cam Towel",
    family: "plain-quad-cam-towel",
    blend: "100% Cotton",
    hem: "Plain",
    weights: {
      "wash-cloth": "1.5 LBS",
      "hand-towel": "4 LBS",
      "bath-towel": "15 LBS",
      "bath-mat": "10 LBS",
    },
  },
  {
    slug: "pique-weave-towel",
    code: "PW",
    name: "Pique Weave Towel",
    family: "pique-weave-towel",
    blend: "86% Cot / 14% Poly",
    hem: "Plain",
    weights: {
      "wash-cloth": "1.5 LBS",
      "hand-towel": "4 LBS",
      "bath-towel": "15 LBS",
    },
  },
  {
    slug: "piano-key-towel",
    code: "PK",
    name: "Piano Key Towel",
    family: "piano-key-towel",
    blend: "100% Cotton All Ring",
    hem: "Plain",
    weights: {
      "wash-cloth": "1.5 LBS",
      "hand-towel": "4.5 LBS",
      "bath-towel": "18 LBS",
      "bath-mat": "10 LBS",
    },
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
 * itself. Both Classic Terry cards carry the same name, and sending each one to
 * its own detail page would mean the buyer picks a blend from a grid before
 * they have been shown that there is a choice to make. The chooser is the page
 * that puts the two side by side.
 */
export function terryProductHref(product: TerryProduct): string {
  return getTerryFamily(product.family).length > 1
    ? `${TERRY_BASE}/${product.family}`
    : `${TERRY_BASE}/${product.slug}`;
}

export type TerryLine = {
  size: TerrySize;
  /** Exactly as the sheet writes it. A size with no weight is not returned. */
  weight: string;
  sku: string;
};

/**
 * The sizes this product is made in, in sheet order, each with its SKU.
 *
 * Driven entirely by which cells the sheet fills in, so the seven products
 * offer four, two, four, four, four, three and four sizes respectively.
 */
export function terrySizesFor(product: TerryProduct): TerryLine[] {
  return TERRY_SIZES.flatMap((size) => {
    const weight = product.weights[size.key];
    return weight ? [{ size, weight, sku: terrySkuFor(product, size) }] : [];
  });
}

/**
 * The stock code for one construction in one size.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THESE CODES ARE OURS, NOT THE CLIENT'S. The towel sheet carries no SKU
 * column. The scheme below is deterministic and readable — SW-<construction>-
 * <size>, so SW-PK-BT is a Piano Key bath towel — but if Souwel already runs
 * stock codes in their own system, THESE ARE THE WRONG ONES and a buyer quoting
 * SW-PK-BT back at them will not match anything.
 *
 * Replace by putting the real code on each product and size in this file; every
 * page reads it from here, so nothing else changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function terrySkuFor(product: TerryProduct, size: TerrySize): string {
  return `SW-${product.code}-${size.code}`;
}

/**
 * The one-line summary a listing card shows under the title.
 *
 * Blend first, because it is the only thing separating the two Classic Terry
 * entries, and the brief asks for that difference to be unmissable.
 */
export function terryCardSummary(product: TerryProduct): string {
  const sizes = terrySizesFor(product)
    .map((s) => s.size.name)
    .join(", ");
  return `${product.blend} · ${product.hem} hem · ${sizes}`;
}

/**
 * The enquiry line a quote request carries for one product in one size.
 *
 * Built here rather than in the query string so nothing a visitor can type ends
 * up in the subject line a member of staff reads — the quote page rebuilds this
 * from the slug and the size key after checking both against this file.
 */
export function terryEnquiryName(product: TerryProduct, size: TerrySize): string {
  return `${product.name} (${product.blend}) — ${size.name} ${size.dimensions}`;
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/** Supplied by the dozen. Mirrored in TerrySpecPicker and the quote page. */
export const TERRY_DOZEN = 12;

export const roundUpToDozen = (n: number) => Math.ceil(n / TERRY_DOZEN) * TERRY_DOZEN;

export type TerryOrderLine = { sizeKey: TerrySizeKey; quantity: number };

/**
 * `?lines=` — the buyer's list, as compactly as it can be written down.
 *
 * `bath-towel:504,wash-cloth:120`. Size keys and quantities only: no names, no
 * weights, no SKUs. Everything a member of staff reads is rebuilt from this
 * file after the keys are checked, so nothing a visitor can type reaches the
 * lead. See readTerryRequest in app/(marketing)/quote/page.tsx.
 */
export function encodeTerryLines(lines: TerryOrderLine[]): string {
  return lines.map((l) => `${l.sizeKey}:${l.quantity}`).join(",");
}

/**
 * Parses `?lines=`, keeping only pairs that name a size THIS product is made
 * in. An unknown key, a duplicate or a junk quantity is dropped rather than
 * repaired — a request that half-parsed is worse than one that arrives empty
 * and makes the buyer say what they meant.
 */
export function parseTerryLines(product: TerryProduct, raw: string | undefined): TerryOrderRow[] {
  if (!raw) return [];
  const offered = new Map(terrySizesFor(product).map((l) => [l.size.key, l]));
  const seen = new Set<string>();
  const out: TerryOrderRow[] = [];

  for (const part of raw.split(",").slice(0, TERRY_SIZES.length)) {
    const [key, qty] = part.split(":");
    const line = offered.get(key as TerrySizeKey);
    if (!line || seen.has(key)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(key);
    out.push({ ...line, quantity: roundUpToDozen(n) });
  }

  return out;
}

export type TerryOrderRow = TerryLine & { quantity: number };

/**
 * The one line the Bath Linen card shows for the range as a whole.
 *
 * Derived, not written down. "Seven constructions" typed into a second file is
 * a number that goes stale the first time the client sends another row.
 */
export function terryRangeSummary(): string {
  const sizes = new Set(TERRY_PRODUCTS.flatMap((p) => Object.keys(p.weights)));
  return `${TERRY_PRODUCTS.length} constructions · ${sizes.size} sizes`;
}

/**
 * The range listing, one card per FAMILY rather than one per sheet row.
 *
 * The sheet has seven rows but only six products a buyer would name: Classic
 * Terry Towels appears twice, once per blend. Two cards carrying the same title
 * in one grid reads as a duplicate — the difference between them is a line of
 * body text, which is not where a buyer looks first. So the family gets one
 * card and both blends are listed inside it, and the choice is made on the
 * chooser page where the two are side by side.
 *
 * A single-member family keeps the fuller summary — blend, hem and the sizes it
 * is made in. A multi-member one lists blend and hem per member instead: the
 * sizes differ between them, so one combined size list would describe neither.
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
