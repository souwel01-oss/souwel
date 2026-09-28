/**
 * The Bed Linen range, transcribed from the client's "HOSPITALITY SHEETS".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP, same discipline as
 * lib/terry-towels.ts: every thread count, design, blend, hem, case pack,
 * finished size and stock code below is copied from the sheet. Nothing here is
 * inferred, rounded, converted or borrowed from a neighbouring row.
 *
 * THE STOCK CODES ARE THE CLIENT'S OWN. Unlike the towel sheet, this one
 * carries a SKU column beside every size, so there is nothing invented here to
 * replace later — a buyer quoting KSD108115S20 back at Souwel is quoting
 * Souwel's own code. Each code is tied to one product in one size, which is
 * why it is also what the order list and the quote link are keyed on.
 *
 * MERGED CELLS ARE MODELLED AS MERGED, NOT SPLIT. Several rows print one size
 * and one SKU across two or three bed-size columns — a pillow case is 42"X36"
 * whether the bed is twin, full or queen, and there is a single code for it.
 * Those are one `lines` entry naming every column it covers, so the page
 * offers the buyer the one real product rather than three copies of it under
 * different names.
 *
 * A BLANK CELL IS A SIZE NOT MADE. Where the sheet leaves a bed size empty for
 * a row, that row simply has no line for it and the size is never offered.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BedSizeKey = "twin" | "full" | "queen" | "king" | "extra-wide-king";

export type BedSize = {
  key: BedSizeKey;
  /** The sheet's own column heading. */
  name: string;
};

/** The size columns, in sheet order. */
export const BED_SIZES: BedSize[] = [
  { key: "twin", name: "Twin" },
  { key: "full", name: "Full" },
  { key: "queen", name: "Queen" },
  { key: "king", name: "King" },
  // Only one row on the sheet fills this in — Flat Sheet T300 Solid.
  { key: "extra-wide-king", name: "Extra Wide King" },
];

/**
 * One orderable line: a finished size, its stock code, and every bed-size
 * column the sheet prints it across.
 */
export type BedLinenSizeLine = {
  /** One entry per column this line covers. Several where the sheet merges. */
  sizes: BedSizeKey[];
  /** Finished size, exactly as the sheet writes it. */
  dimensions: string;
  /** The client's own stock code for this product in this size. */
  sku: string;
};

export type BedLinenProduct = {
  slug: string;
  /**
   * The sheet's ITEM value with its own Thread Count / Design / Blend columns
   * folded in, because ITEM alone says "FLAT SHEET" on seven different rows.
   * Nothing here is written that is not one of the sheet's own cells.
   */
  name: string;
  /** Groups the rows sharing an ITEM value — drives the family listing page. */
  family: string;
  /** As the client writes it, for the family's page heading and breadcrumb. */
  familyLabel: string;
  threadCount: string | null;
  design: string | null;
  blend: string | null;
  hem: string | null;
  /** PCS/CASE, and what a quantity on this product rounds up to. */
  pcsPerCase: number | null;
  lines: BedLinenSizeLine[];
};

/**
 * The sheet's own footnote, shown on any product whose hem is BALANCE*.
 * Quoted exactly as the "NOTED" block at the foot of the sheet writes it.
 */
export const BALANCE_HEM_NOTE = "Balanced hems allow either end of the sheet to be the top.";

/** Nineteen rows, in sheet order. */
export const BED_LINEN_PRODUCTS: BedLinenProduct[] = [
  /* ── Flat Sheets — seven rows ────────────────────────────────────────── */
  {
    slug: "flat-sheet-t200-solid-55-45",
    name: "Flat Sheet — T200 Solid, 55/45",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T200",
    design: "Solid",
    blend: "55/45",
    hem: '2"',
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '66"X108"', sku: "TSD66108S20" },
      { sizes: ["full"], dimensions: '81"X115"', sku: "FSD81115S20" },
      { sizes: ["queen"], dimensions: '90"X115"', sku: "QSD90115S20" },
      { sizes: ["king"], dimensions: '108"X115"', sku: "KSD108115S20" },
    ],
  },
  {
    slug: "flat-sheet-t250-solid-55-45",
    name: "Flat Sheet — T250 Solid, 55/45",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T250",
    design: "Solid",
    blend: "55/45",
    hem: '2"',
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '66"X108"', sku: "TSD66108S25" },
      { sizes: ["full"], dimensions: '81"X115"', sku: "FSD81115S25" },
      { sizes: ["queen"], dimensions: '90"X115"', sku: "QSD90115S25" },
      { sizes: ["king"], dimensions: '108"X115"', sku: "KSD108115S25" },
    ],
  },
  {
    slug: "flat-sheet-t200-solid-60-40",
    name: "Flat Sheet — T200 Solid, 60/40",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T200",
    design: "Solid",
    blend: "60/40",
    hem: "Balance*",
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '66"X108"', sku: "TSB66108A20" },
      { sizes: ["full"], dimensions: '81"X115"', sku: "FSB81115A20" },
      { sizes: ["queen"], dimensions: '90"X115"', sku: "QSB90115A20" },
      { sizes: ["king"], dimensions: '108"X115"', sku: "KSB108115A20" },
    ],
  },
  {
    slug: "flat-sheet-t250-solid-60-40",
    name: "Flat Sheet — T250 Solid, 60/40",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T250",
    design: "Solid",
    blend: "60/40",
    hem: "Balance*",
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '66"X108"', sku: "TSB66108A25" },
      { sizes: ["full"], dimensions: '81"X115"', sku: "FSB81115A25" },
      { sizes: ["queen"], dimensions: '90"X115"', sku: "QSB90115A25" },
      { sizes: ["king"], dimensions: '108"X115"', sku: "KSB108115A25" },
    ],
  },
  {
    // The one row on the sheet that is not a cotton/polyester ratio — its
    // blend cell spells the fibres out. Twin is blank for this row.
    slug: "flat-sheet-t210-poly-modal",
    name: "Flat Sheet — T210 Solid, 52% Polyester / 48% Modal",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T210",
    design: "Solid",
    blend: "52% Polyester / 48% Modal",
    hem: "Balance*",
    pcsPerCase: 24,
    lines: [
      { sizes: ["full"], dimensions: '81"X115"', sku: "FPM81115A21" },
      { sizes: ["queen"], dimensions: '90"X115"', sku: "QPM90115A21" },
      { sizes: ["king"], dimensions: '108"X115"', sku: "KPM108115A21" },
    ],
  },
  {
    // The only row with an Extra Wide King. The sheet's cell reads 114"X125
    // with no closing inch mark; the client confirmed that is a typo in the
    // sheet and that the size is 114"X125", so it is written that way here.
    slug: "flat-sheet-t300-solid-60-40",
    name: "Flat Sheet — T300 Solid, 60/40",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T300",
    design: "Solid",
    blend: "60/40",
    hem: '2"',
    pcsPerCase: 24,
    lines: [
      { sizes: ["queen"], dimensions: '90"X120"', sku: "QSD90120A30" },
      { sizes: ["king"], dimensions: '108"X120"', sku: "KSD108120A30" },
      { sizes: ["extra-wide-king"], dimensions: '114"X125"', sku: "KSD114125A30XW" },
    ],
  },
  {
    slug: "flat-sheet-t300-satin-stripes",
    name: "Flat Sheet — T300 Satin Stripes, 60/40",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    threadCount: "T300",
    design: "Satin Stripes",
    blend: "60/40",
    hem: "Balance*",
    pcsPerCase: 24,
    lines: [
      { sizes: ["queen"], dimensions: '90"X120"', sku: "QB90120A30STRP" },
      { sizes: ["king"], dimensions: '108"X120"', sku: "KB108120A30STRP" },
    ],
  },

  /* ── Fitted Sheets — three rows ──────────────────────────────────────── */
  {
    slug: "fitted-sheet-t200-55-45",
    name: "Fitted Sheet — T200 Plain, 55/45",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    threadCount: "T200",
    design: "Plain",
    blend: "55/45",
    hem: "Elastic",
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '39"X80"X9"', sku: "TDE39809S20FTD" },
      { sizes: ["full"], dimensions: '54"X80"X11"', sku: "FDE548011S20FTD" },
      { sizes: ["queen"], dimensions: '60"X80"X11"', sku: "QDE608011S20FTD" },
      { sizes: ["king"], dimensions: '78"X80"X11"', sku: "KDE788011S20FTD" },
    ],
  },
  {
    slug: "fitted-sheet-t200-60-40",
    name: "Fitted Sheet — T200 Plain, 60/40",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    threadCount: "T200",
    design: "Plain",
    blend: "60/40",
    hem: "Elastic",
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin"], dimensions: '39"X80"X9"', sku: "TSE39809A20FTD" },
      { sizes: ["full"], dimensions: '54"X80"X11"', sku: "FSE548011A20FTD" },
      { sizes: ["queen"], dimensions: '60"X80"X11"', sku: "QSE608011A20FTD" },
      { sizes: ["king"], dimensions: '78"X80"X11"', sku: "KSE788011A20FTD" },
    ],
  },
  {
    slug: "fitted-sheet-t300-55-45",
    name: "Fitted Sheet — T300 Plain, 55/45",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    threadCount: "T300",
    design: "Plain",
    blend: "55/45",
    hem: "Elastic",
    pcsPerCase: 24,
    lines: [
      { sizes: ["full"], dimensions: '54"X80"X14"', sku: "FDE548011A30FTD" },
      { sizes: ["queen"], dimensions: '60"X80"X14"', sku: "QDE608011A30FTD" },
      { sizes: ["king"], dimensions: '78"X80"X14"', sku: "KDE788011A30FTD" },
    ],
  },

  /* ── Pillow Case — four rows ─────────────────────────────────────────── */
  {
    // 42"X36" is printed once across Twin, Full and Queen with a single code:
    // one pillow case that suits all three beds, not three products.
    slug: "pillow-case-t200-percale-55-45",
    name: "Pillow Case — T200 Plain Percale, 55/45",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    threadCount: "T200",
    design: "Plain - Percale",
    blend: "55/45",
    hem: "Open End",
    pcsPerCase: 72,
    lines: [
      { sizes: ["twin", "full", "queen"], dimensions: '42"X36"', sku: "PD4236S20" },
      { sizes: ["king"], dimensions: '42"X46"', sku: "KPD4246S20" },
    ],
  },
  {
    slug: "pillow-case-t250-percale-60-40",
    name: "Pillow Case — T250 Plain Percale, 60/40",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    threadCount: "T250",
    design: "Plain - Percale",
    blend: "60/40",
    hem: "Open End",
    pcsPerCase: 72,
    lines: [
      { sizes: ["twin", "full", "queen"], dimensions: '42"X36"', sku: "P4236A25" },
      { sizes: ["king"], dimensions: '42"X46"', sku: "KP4246A25" },
    ],
  },
  {
    // Here the merge covers Twin and Full only — Queen steps up to its own
    // 42"X40" with its own code.
    slug: "pillow-case-t300-plain-60-40",
    name: "Pillow Case — T300 Plain, 60/40",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    threadCount: "T300",
    design: "Plain",
    blend: "60/40",
    hem: "Open End",
    pcsPerCase: 72,
    lines: [
      { sizes: ["twin", "full"], dimensions: '42"X36"', sku: "PD4236S30" },
      { sizes: ["queen"], dimensions: '42"X40"', sku: "QPD4240S30" },
      { sizes: ["king"], dimensions: '42"X46"', sku: "KPD4246S30" },
    ],
  },
  {
    slug: "pillow-case-t300-satin-stripes",
    name: "Pillow Case — T300 Satin Stripes, 60/40",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    threadCount: "T300",
    design: "Satin Stripes",
    blend: "60/40",
    hem: "EZ Fit",
    pcsPerCase: 72,
    lines: [
      { sizes: ["queen"], dimensions: '42"X40"', sku: "QPEZ4240A30STRP" },
      { sizes: ["king"], dimensions: '42"X46"', sku: "KPEZ4246A30STRP" },
    ],
  },

  /* ── Duvet Cover — three rows ────────────────────────────────────────── */
  {
    slug: "duvet-cover-t200-plain",
    name: "Duvet Cover — T200 Plain, 55/40",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    threadCount: "T200",
    design: "Plain",
    blend: "55/40",
    hem: "Center Open",
    pcsPerCase: 12,
    lines: [
      { sizes: ["full"], dimensions: '82"X94"', sku: "FSD8294S20DVT" },
      { sizes: ["queen"], dimensions: '96"X94"', sku: "QSD9694S20DVT" },
      { sizes: ["king"], dimensions: '105"X94"', sku: "KSD10594S20DVT" },
    ],
  },
  {
    slug: "duvet-cover-t300-plain",
    name: "Duvet Cover — T300 Plain, 60/40",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    threadCount: "T300",
    design: "Plain",
    blend: "60/40",
    hem: "Center Open",
    pcsPerCase: 12,
    lines: [
      { sizes: ["queen"], dimensions: '96"X94"', sku: "QSD9694S30DVT" },
      { sizes: ["king"], dimensions: '105"X94"', sku: "KSD10594S30DVT" },
    ],
  },
  {
    slug: "duvet-cover-t300-satin-stripes",
    name: "Duvet Cover — T300 Satin Stripes, 60/40",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    threadCount: "T300",
    design: "Satin Stripes",
    blend: "60/40",
    hem: "Center Open",
    pcsPerCase: 12,
    lines: [
      { sizes: ["queen"], dimensions: '96"X94"', sku: "Q9694A30DVTSTRP" },
      { sizes: ["king"], dimensions: '105"X94"', sku: "K10594A30DVTSTRP" },
    ],
  },

  /* ── Mattress Protector — one row ────────────────────────────────────── */
  {
    // The sheet gives no design and no hem for this row; its thread count
    // cell carries the fill as well.
    slug: "mattress-protector",
    name: "Mattress Protector",
    family: "mattress-protector",
    familyLabel: "Mattress Protector",
    threadCount: "T140 with polyester fill",
    design: null,
    blend: "55/45",
    hem: null,
    pcsPerCase: 12,
    lines: [
      { sizes: ["twin"], dimensions: '39"X80"X14"', sku: "TMP3980WP" },
      { sizes: ["full"], dimensions: '54"X80"X14"', sku: "FMP5480WP" },
      { sizes: ["queen"], dimensions: '60"X80"X14"', sku: "QMP6080WP" },
      { sizes: ["king"], dimensions: '78"X80"X14"', sku: "KMP7880WP" },
    ],
  },

  /* ── Pillow Protector — one row ──────────────────────────────────────── */
  {
    slug: "pillow-protector",
    name: "Pillow Protector",
    family: "pillow-protector",
    familyLabel: "Pillow Protector",
    threadCount: "T180",
    design: null,
    blend: "55/45",
    hem: "Hidden Zipper",
    pcsPerCase: 24,
    lines: [
      { sizes: ["twin", "full"], dimensions: '21"X27"', sku: "PPD2127HZ" },
      { sizes: ["queen"], dimensions: '21"X30"', sku: "QPP2130HZ" },
      { sizes: ["king"], dimensions: '21"X37"', sku: "KPP2137HZ" },
    ],
  },
];

/** Where the range lives. One constant so the links cannot drift. */
export const BED_LINEN_BASE = "/hospitality/bed-linen";

const BY_SLUG = new Map(BED_LINEN_PRODUCTS.map((p) => [p.slug, p]));

export function getBedLinenProduct(slug: string): BedLinenProduct | undefined {
  return BY_SLUG.get(slug);
}

/** The members of a family, in sheet order. */
export function getBedLinenFamily(family: string): BedLinenProduct[] {
  return BED_LINEN_PRODUCTS.filter((p) => p.family === family);
}

/** Every family, once each, in sheet order — drives generateStaticParams. */
export function bedLinenFamilySlugs(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of BED_LINEN_PRODUCTS) {
    if (seen.has(p.family)) continue;
    seen.add(p.family);
    out.push(p.family);
  }
  return out;
}

/**
 * Where a click on this product's card, or the mega-menu, should land.
 *
 * A FAMILY WITH ONE MEMBER HAS NO LISTING PAGE — Mattress Protector and
 * Pillow Protector open their product detail page directly, because a listing
 * page holding exactly one card is a click that exists only to be clicked
 * through.
 */
export function bedLinenProductHref(product: BedLinenProduct): string {
  return getBedLinenFamily(product.family).length > 1
    ? `${BED_LINEN_BASE}/${product.family}/${product.slug}`
    : `${BED_LINEN_BASE}/${product.family}`;
}

/**
 * How one line is labelled — "Queen", or "Twin / Full / Queen" where the
 * sheet prints one size across several columns. Always in sheet order,
 * whatever order the keys were written in.
 */
export function bedSizeLabel(line: BedLinenSizeLine): string {
  return BED_SIZES.filter((s) => line.sizes.includes(s.key))
    .map((s) => s.name)
    .join(" / ");
}

/** The bed sizes this product is made in at all, in sheet order. */
export function bedSizesCovered(product: BedLinenProduct): string[] {
  const covered = new Set(product.lines.flatMap((l) => l.sizes));
  return BED_SIZES.filter((s) => covered.has(s.key)).map((s) => s.name);
}

/** The one-line summary a listing card shows under the title. */
export function bedLinenCardSummary(product: BedLinenProduct): string {
  const facts = [product.blend, product.hem ? `${product.hem} hem` : null].filter(
    (v): v is string => Boolean(v)
  );
  return [...facts, bedSizesCovered(product).join(", ")].filter(Boolean).join(" · ");
}

/**
 * The one-line summary the /hospitality/bed-linen card shows for a family as
 * a whole. Derived, never typed twice — a count written down goes stale the
 * first time the client sends another row.
 */
export function bedLinenFamilyCardSummary(family: string): string | null {
  const members = getBedLinenFamily(family);
  if (members.length === 0) return null;
  if (members.length === 1) return bedLinenCardSummary(members[0]);

  const covered = new Set(members.flatMap((p) => p.lines.flatMap((l) => l.sizes)));
  const sizes = BED_SIZES.filter((s) => covered.has(s.key)).map((s) => s.name);
  return `${members.length} builds · ${sizes.join(", ")}`;
}

/** Whether this product carries the sheet's balanced-hem footnote. */
export function hasBalanceHem(product: BedLinenProduct): boolean {
  return (product.hem ?? "").toLowerCase().startsWith("balance");
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Rounds a quantity up to this product's own case pack (PCS/CASE on the
 * sheet — 24 for sheets, 72 for pillow cases, 12 for duvet covers and
 * mattress protectors, 24 for pillow protectors). Returns the quantity
 * unchanged where the sheet gives no case pack, so none is invented.
 */
export function roundUpToCase(product: BedLinenProduct, n: number): number {
  const pack = product.pcsPerCase;
  return pack ? Math.ceil(n / pack) * pack : n;
}

export type BedLinenOrderLine = { sku: string; quantity: number };

/**
 * `?lines=` — the buyer's list, keyed on the client's own stock codes.
 * "QSD90115S20:96,KSD108115S20:48". Codes and quantities only: no names, no
 * sizes. Everything a member of staff reads is rebuilt from this file after
 * the codes are checked, so nothing a visitor can type reaches the lead.
 */
export function encodeBedLinenLines(lines: BedLinenOrderLine[]): string {
  return lines.map((l) => `${l.sku}:${l.quantity}`).join(",");
}

export type BedLinenOrderRow = BedLinenSizeLine & { quantity: number };

/**
 * Parses `?lines=`, keeping only codes THIS product is actually made in. An
 * unknown code, a duplicate or a junk quantity is dropped rather than
 * repaired — a request that half-parsed is worse than one that arrives empty
 * and makes the buyer say what they meant.
 */
export function parseBedLinenLines(
  product: BedLinenProduct,
  raw: string | undefined
): BedLinenOrderRow[] {
  if (!raw) return [];
  const offered = new Map(product.lines.map((l) => [l.sku, l]));
  const seen = new Set<string>();
  const out: BedLinenOrderRow[] = [];

  for (const part of raw.split(",").slice(0, product.lines.length)) {
    const [sku, qty] = part.split(":");
    const line = offered.get(sku);
    if (!line || seen.has(sku)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(sku);
    out.push({ ...line, quantity: roundUpToCase(product, n) });
  }

  return out;
}
