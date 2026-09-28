/**
 * The Spa & Salon range, transcribed from the client's salon sheet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP, same discipline as
 * lib/terry-towels.ts and lib/bed-linen.ts. Every size, weight, pack, colour
 * and stock code below is copied from the sheet. Nothing is inferred,
 * converted or filled in from a neighbouring row.
 *
 * THE CHOICE HERE IS A COLOUR, NOT A SIZE. Every other range on this site is
 * one construction made in several sizes; these four are one size each, made
 * in several colours, and the sheet gives a separate stock code per colour.
 * So the colour is the orderable line and the code is its identity — a salon
 * towel in black and the same towel in grey are two different things to order.
 *
 * COLOURS ARE SPELT AS THE SHEET SPELLS THEM, "Bergundy" included. A stock
 * code and the colour it is filed under are the client's to correct, not ours.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** One orderable line: a colour and the client's code for it. */
export type SpaSalonColour = {
  /** As the sheet writes it, in title case. */
  colour: string;
  /** The client's own stock code for this product in this colour. */
  sku: string;
};

export type SpaSalonProduct = {
  slug: string;
  /** As the sheet's first column names it. */
  name: string;
  /** Only the Spa Sheet row carries one. */
  threadCount: string | null;
  /** Finished size, exactly as the sheet writes it. */
  size: string;
  /** Verbatim, including the unit the sheet chose. Blank on the Spa Sheet. */
  weight: string | null;
  /** PCS on the sheet's PACK column, and what a quantity rounds up to. */
  pack: number;
  colours: SpaSalonColour[];
};

/** The four rows of the sheet, in sheet order. */
export const SPA_SALON_PRODUCTS: SpaSalonProduct[] = [
  {
    slug: "salon-towel",
    name: "Salon Towel",
    threadCount: null,
    size: '16"X28"',
    weight: "3 LBS / DZ",
    pack: 12,
    colours: [
      { colour: "Black", sku: "ST1628BLK" },
      { colour: "Grey", sku: "ST1628GRY" },
      { colour: "Bergundy", sku: "ST1628BGDY" },
      { colour: "Beige", sku: "ST1628BGE" },
      { colour: "Ivory", sku: "ST1628IVRY" },
    ],
  },
  {
    // 40"X80" at 600 GSM, the same size and weight as the Sauna Bath Towel on
    // the BATH TOWELS sheet — but a different code there (BTS4080WHT against
    // BT4080WHT here), so they are kept as the two separate rows the client
    // wrote rather than merged into one on the assumption that one is a typo.
    slug: "bath-sheet",
    name: "Bath Sheet",
    threadCount: null,
    size: '40"X80"',
    weight: "600 GSM",
    pack: 12,
    colours: [
      { colour: "White", sku: "BT4080WHT" },
      { colour: "Beige", sku: "BT4080BGE" },
    ],
  },
  {
    slug: "hair-wash-dye-towel",
    name: "Hair Wash/Dye Towel",
    threadCount: null,
    size: "22X44",
    weight: "6 LBS",
    pack: 24,
    colours: [
      { colour: "Black", sku: "2244BLK" },
      { colour: "Grey", sku: "2244GRY" },
    ],
  },
  {
    // The sheet leaves this row's weight blank. It stays blank rather than
    // borrowing a figure from the row above it.
    slug: "spa-sheet",
    name: "Spa Sheet",
    threadCount: "T180",
    size: '66"X104"',
    weight: null,
    pack: 12,
    colours: [{ colour: "White", sku: "SPA66104S18" }],
  },
];

/** Where the range lives. One constant so the links cannot drift. */
export const SPA_SALON_BASE = "/hospitality/pool-fitness-spa-salon";

const BY_SLUG = new Map(SPA_SALON_PRODUCTS.map((p) => [p.slug, p]));

export function getSpaSalonProduct(slug: string): SpaSalonProduct | undefined {
  return BY_SLUG.get(slug);
}

export function spaSalonProductHref(product: SpaSalonProduct): string {
  return `${SPA_SALON_BASE}/${product.slug}`;
}

/** The one-line summary a listing card shows under the title. */
export function spaSalonCardSummary(product: SpaSalonProduct): string {
  const facts = [product.size, product.weight, `${product.colours.length} colours`].filter(
    (v): v is string => Boolean(v)
  );
  return facts.join(" · ");
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/** Rounds a quantity up to this product's own pack — 12 or 24 on the sheet. */
export function roundUpToPack(product: SpaSalonProduct, n: number): number {
  return Math.ceil(n / product.pack) * product.pack;
}

export type SpaSalonOrderLine = { sku: string; quantity: number };

/** `?lines=` — the buyer's list, keyed on the client's own stock codes. */
export function encodeSpaSalonLines(lines: SpaSalonOrderLine[]): string {
  return lines.map((l) => `${l.sku}:${l.quantity}`).join(",");
}

export type SpaSalonOrderRow = SpaSalonColour & { quantity: number };

/**
 * Parses `?lines=`, keeping only codes THIS product is made in. An unknown
 * code, a duplicate or a junk quantity is dropped rather than repaired — see
 * parseTerryLines in lib/terry-towels.ts for the reasoning.
 */
export function parseSpaSalonLines(
  product: SpaSalonProduct,
  raw: string | undefined
): SpaSalonOrderRow[] {
  if (!raw) return [];
  const offered = new Map(product.colours.map((c) => [c.sku, c]));
  const seen = new Set<string>();
  const out: SpaSalonOrderRow[] = [];

  for (const part of raw.split(",").slice(0, product.colours.length)) {
    const [sku, qty] = part.split(":");
    const line = offered.get(sku);
    if (!line || seen.has(sku)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(sku);
    out.push({ ...line, quantity: roundUpToPack(product, n) });
  }

  return out;
}
