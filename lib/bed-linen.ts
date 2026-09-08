/**
 * The Bed Linen range, transcribed from the client's "HOSPITALITY SHEETS" sheet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP, same discipline as
 * lib/terry-towels.ts: every thread count, design, quality, blend, hem, case
 * pack and finished size below is copied from the sheet. Nothing here was
 * inferred, rounded, converted or filled in from a neighbouring row.
 *
 * ONE WRINKLE THE TERRY SHEET DID NOT HAVE. The sheet's TWIN/FULL/QUEEN/KING
 * columns use merged cells — one finished size printed once, spanning two or
 * three bed sizes that share it. A copy-pasted text extraction of a merged
 * cell keeps the value but loses which columns it spanned, so a handful of
 * rows below were reconstructed by matching their sizes against a sibling row
 * that IS fully populated (the two Flat Sheet T200 rows, the two Fitted Sheet
 * T200 rows) rather than guessed outright. Every row below says which case it
 * is. The one row with no sibling to check against — Pillow Protector — is
 * flagged as the least certain of the set; send the source spreadsheet if
 * that one needs correcting.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BedSizeKey = "twin" | "full" | "queen" | "king";

export type BedSize = {
  key: BedSizeKey;
  /** The sheet's own column heading. */
  name: string;
  /** Two-letter segment of the SKU. See bedLinenSkuFor. */
  code: string;
};

/** The size columns, in sheet order. */
export const BED_SIZES: BedSize[] = [
  { key: "twin", name: "Twin", code: "TW" },
  { key: "full", name: "Full", code: "FL" },
  { key: "queen", name: "Queen", code: "QN" },
  { key: "king", name: "King", code: "KG" },
];

export type BedLinenProduct = {
  slug: string;
  /**
   * As the sheet's ITEM column names it, with the sheet's own Thread Count /
   * Design / Quality columns folded in to tell the four (or three) rows under
   * one item apart — the same technique already used elsewhere in
   * lib/hospitality.ts for "Kitchen towels – checks" vs "– herringbone".
   * Nothing here is written that is not one of the sheet's own cells.
   */
  name: string;
  /** Groups the rows that share an ITEM value — drives the family listing page. */
  family: string;
  /** As the client writes it, for the family's page heading and breadcrumb. */
  familyLabel: string;
  /** Construction segment of the SKU. See bedLinenSkuFor. */
  code: string;
  threadCount: string | null;
  design: string | null;
  quality: string | null;
  blend: string | null;
  hem: string | null;
  /** PCS/CASE. Null where the sheet gives no figure — Mattress and Pillow Protector. */
  pcsPerCase: number | null;
  /** Finished size per bed size. A key that is absent is a bed size not made. */
  sizes: Partial<Record<BedSizeKey, string>>;
};

export const BED_LINEN_PRODUCTS: BedLinenProduct[] = [
  /* ── Flat Sheets ─────────────────────────────────────────────────────── */
  {
    slug: "flat-sheet-t200-percale-dpi-sht",
    name: "Flat Sheet — T200/T250 Percale (DPI-SHT)",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    code: "FS1",
    threadCount: "T200 / T250",
    design: "Plain - Percale",
    quality: "DPI - SHT",
    blend: "55/45",
    hem: '2"',
    pcsPerCase: 24,
    sizes: { twin: '66"x108"', full: '81"x115"', queen: '90"x115"', king: '108"x115"' },
  },
  {
    slug: "flat-sheet-t200-percale-spk-air",
    name: "Flat Sheet — T200/T250 Percale (SPK-AIR)",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    code: "FS2",
    threadCount: "T200 / T250",
    design: "Plain - Percale",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "Balance*",
    pcsPerCase: 24,
    sizes: { twin: '66"x108"', full: '81"x115"', queen: '90"x115"', king: '108"x115"' },
  },
  {
    // TWIN and FULL are blank on the sheet for both T300 Flat Sheet rows —
    // only Queen and King are filled in, matching the pattern already
    // confirmed for Fitted Sheet T300 below (the higher thread count is
    // stocked in fewer sizes). No reconstruction needed here.
    slug: "flat-sheet-t300-plain-dpi-sht",
    name: "Flat Sheet — T300 Plain (DPI-SHT)",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    code: "FS3",
    threadCount: "T300",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "60/40",
    hem: '2"',
    pcsPerCase: 24,
    sizes: { queen: '90"x120"', king: '108"x120"' },
  },
  {
    slug: "flat-sheet-t300-satin-stripe-spk-air",
    name: "Flat Sheet — T300 Satin Stripe (SPK-AIR)",
    family: "flat-sheets",
    familyLabel: "Flat Sheets",
    code: "FS4",
    threadCount: "T300",
    design: "Satin Stripes",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "Balance*",
    pcsPerCase: 24,
    sizes: { queen: '90"x120"', king: '108"x120"' },
  },

  /* ── Fitted Sheets ───────────────────────────────────────────────────── */
  {
    slug: "fitted-sheet-t200-dpi-sht",
    name: "Fitted Sheet — T200 (DPI-SHT)",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    code: "FT1",
    threadCount: "T200",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "55/45",
    hem: "Elastic",
    pcsPerCase: 24,
    sizes: {
      twin: '39"x80"x9"',
      full: '54"x80"x11"',
      queen: '60"x80"x11"',
      king: '78"x80"x11"',
    },
  },
  {
    slug: "fitted-sheet-t200-spk-air",
    name: "Fitted Sheet — T200 (SPK-AIR)",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    code: "FT2",
    threadCount: "T200",
    design: "Plain",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "Elastic",
    pcsPerCase: 24,
    sizes: {
      twin: '39"x80"x9"',
      full: '54"x80"x11"',
      queen: '60"x80"x11"',
      king: '78"x80"x11"',
    },
  },
  {
    // RECONSTRUCTED. The sheet gives three sizes for this row: 54"x80"x14",
    // 60"x80"x14" and 78"x80"x14". Those three WIDTHS (54, 60, 78) are exactly
    // the Full/Queen/King widths of the T200 row above — only the depth (14"
    // instead of 11") differs — so Twin is the missing one, not Full. High
    // confidence: this is a number match against a sibling row, not a guess.
    slug: "fitted-sheet-t300-dpi-sht",
    name: "Fitted Sheet — T300 (DPI-SHT)",
    family: "fitted-sheets",
    familyLabel: "Fitted Sheets",
    code: "FT3",
    threadCount: "T300",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "60/40",
    hem: "Elastic",
    pcsPerCase: 24,
    sizes: { full: '54"x80"x14"', queen: '60"x80"x14"', king: '78"x80"x14"' },
  },

  /* ── Pillow Case ─────────────────────────────────────────────────────── */
  {
    // RECONSTRUCTED. The sheet gives two sizes, 42"x36" and 42"x46", printed
    // in a cell merged across Twin/Full/Queen and a separate King cell — a
    // single "standard" pillow case size shared by three bed sizes, then a
    // larger one for King. Applied identically to both T200 Percale rows.
    slug: "pillow-case-t200-percale-dpi-sht",
    name: "Pillow Case — T200 Percale (DPI-SHT)",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    code: "PC1",
    threadCount: "T200",
    design: "Plain - Percale",
    quality: "DPI - SHT",
    blend: "55/45",
    hem: "Open End",
    pcsPerCase: 72,
    sizes: { twin: '42"x36"', full: '42"x36"', queen: '42"x36"', king: '42"x46"' },
  },
  {
    slug: "pillow-case-t200-percale-spk-air",
    name: "Pillow Case — T200 Percale (SPK-AIR)",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    code: "PC2",
    threadCount: "T200",
    design: "Plain - Percale",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "Open End",
    pcsPerCase: 72,
    sizes: { twin: '42"x36"', full: '42"x36"', queen: '42"x36"', king: '42"x46"' },
  },
  {
    // RECONSTRUCTED. Three sizes given: 42"x36", 42"x40", 42"x46". Read as
    // Twin/Full sharing the merged 42"x36" (the same standard size as the
    // T200 rows above), Queen stepping up to its own 42"x40", King at 42"x46".
    slug: "pillow-case-t300-plain-dpi-sht",
    name: "Pillow Case — T300 Plain (DPI-SHT)",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    code: "PC3",
    threadCount: "T300",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "60/40",
    hem: "Open End",
    pcsPerCase: 72,
    sizes: { twin: '42"x36"', full: '42"x36"', queen: '42"x40"', king: '42"x46"' },
  },
  {
    // RECONSTRUCTED. Two sizes given, 42"x40" and 42"x46" — exactly the
    // Queen/King figures from the T300 Plain row above — so Twin/Full are
    // blank here rather than sharing the 42"x36" standard size.
    slug: "pillow-case-t300-satin-stripe-spk-air",
    name: "Pillow Case — T300 Satin Stripe (SPK-AIR)",
    family: "pillow-case",
    familyLabel: "Pillow Case",
    code: "PC4",
    threadCount: "T300",
    design: "Satin Stripes",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "EZ Fit",
    pcsPerCase: 72,
    sizes: { queen: '42"x40"', king: '42"x46"' },
  },

  /* ── Duvet Cover ─────────────────────────────────────────────────────── */
  {
    // RECONSTRUCTED. Three sizes given: 82"x94", 96"x94", 105"x94". The last
    // two match the T300 rows below exactly, so those are Queen/King and
    // 82"x94" — one size smaller — is Full. Twin is blank, consistent with
    // the client not carrying a duvet insert/comforter line for it either.
    slug: "duvet-cover-t200-dpi-sht",
    name: "Duvet Cover — T200 (DPI-SHT)",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    code: "DC1",
    threadCount: "T200",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "55/40",
    hem: "Center Open",
    pcsPerCase: 12,
    sizes: { full: '82"x94"', queen: '96"x94"', king: '105"x94"' },
  },
  {
    slug: "duvet-cover-t300-dpi-sht",
    name: "Duvet Cover — T300 Plain (DPI-SHT)",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    code: "DC2",
    threadCount: "T300",
    design: "Plain",
    quality: "DPI - SHT",
    blend: "60/40",
    hem: "Center Open",
    pcsPerCase: 12,
    sizes: { queen: '96"x94"', king: '105"x94"' },
  },
  {
    slug: "duvet-cover-t300-satin-stripe-spk-air",
    name: "Duvet Cover — T300 Satin Stripe (SPK-AIR)",
    family: "duvet-cover",
    familyLabel: "Duvet Cover",
    code: "DC3",
    threadCount: "T300",
    design: "Satin Stripes",
    quality: "SPK - AIR",
    blend: "60/40",
    hem: "Center Open",
    pcsPerCase: 12,
    sizes: { queen: '96"x94"', king: '105"x94"' },
  },

  /* ── Mattress Protector ──────────────────────────────────────────────── */
  {
    // The sheet gives no thread count, design, quality, blend, hem or
    // PCS/CASE for this row at all — only the four finished sizes.
    slug: "mattress-protector",
    name: "Mattress Protector",
    family: "mattress-protector",
    familyLabel: "Mattress Protector",
    code: "MP",
    threadCount: null,
    design: null,
    quality: null,
    blend: null,
    hem: null,
    pcsPerCase: null,
    sizes: { twin: '39"x80"', full: '54"x80"', queen: '60"x80"', king: '78"x80"' },
  },

  /* ── Pillow Protector ────────────────────────────────────────────────── */
  {
    // RECONSTRUCTED, AND THE LEAST CERTAIN ROW IN THIS FILE. Three sizes are
    // given — 21"x27", 21"x30", 21"x37" — but this is the only Pillow
    // Protector row on the sheet, so there is no sibling row to match numbers
    // against the way every other reconstruction above could. Read here as
    // Twin/Full sharing 21"x27" (the same merged-cell shape Pillow Case
    // uses), Queen at 21"x30", King at 21"x37". Confirm against the source
        // spreadsheet before this one is quoted.
    slug: "pillow-protector",
    name: "Pillow Protector",
    family: "pillow-protector",
    familyLabel: "Pillow Protector",
    code: "PP",
    threadCount: "T180",
    design: null,
    quality: "DPI - SHT",
    blend: "55/45",
    hem: "Hidden Zipper",
    pcsPerCase: null,
    sizes: { twin: '21"x27"', full: '21"x27"', queen: '21"x30"', king: '21"x37"' },
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
 * Pillow Protector open their product detail page directly, because a
 * listing page holding exactly one card is a click that exists only to be
 * clicked through.
 */
export function bedLinenProductHref(product: BedLinenProduct): string {
  return getBedLinenFamily(product.family).length > 1
    ? `${BED_LINEN_BASE}/${product.family}/${product.slug}`
    : `${BED_LINEN_BASE}/${product.family}`;
}

export type BedLinenLine = {
  size: BedSize;
  /** Exactly as the sheet writes it. A bed size with no entry is not returned. */
  dimensions: string;
  sku: string;
};

/**
 * The bed sizes this product is made in, in sheet order, each with its SKU.
 *
 * Driven entirely by which cells the sheet fills in (or, for the rows
 * documented above, which cells the merge could be attributed to) — never by
 * borrowing a figure from the size beside it.
 */
export function bedLinenSizesFor(product: BedLinenProduct): BedLinenLine[] {
  return BED_SIZES.flatMap((size) => {
    const dimensions = product.sizes[size.key];
    return dimensions ? [{ size, dimensions, sku: bedLinenSkuFor(product, size) }] : [];
  });
}

/**
 * The stock code for one product in one bed size.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THESE CODES ARE OURS, NOT THE CLIENT'S — same caveat as terrySkuFor in
 * lib/terry-towels.ts. The sheet carries no SKU column. Replace by putting the
 * real code on each product and size in this file; every page reads it from
 * here, so nothing else changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function bedLinenSkuFor(product: BedLinenProduct, size: BedSize): string {
  return `SW-${product.code}-${size.code}`;
}

/** The one-line summary a listing card shows under the title. */
export function bedLinenCardSummary(product: BedLinenProduct): string {
  const sizes = bedLinenSizesFor(product)
    .map((s) => s.size.name)
    .join(", ");
  const facts = [product.blend, product.hem ? `${product.hem} hem` : null].filter(
    (v): v is string => Boolean(v)
  );
  return [...facts, sizes].filter(Boolean).join(" · ");
}

/**
 * The one-line summary the /hospitality/bed-linen card shows for a family as
 * a whole — used where the mega-menu item is a range (a listing or, for a
 * single-member family, a product) rather than a single specified line.
 *
 * A single-member family reuses its product's own card summary. A
 * multi-member one names how many builds are on the sheet and the union of
 * every bed size any of them is made in, derived rather than typed twice.
 */
export function bedLinenFamilyCardSummary(family: string): string | null {
  const members = getBedLinenFamily(family);
  if (members.length === 0) return null;
  if (members.length === 1) return bedLinenCardSummary(members[0]);

  const sizes = new Set(members.flatMap((p) => Object.keys(p.sizes)));
  const order = BED_SIZES.filter((s) => sizes.has(s.key)).map((s) => s.name);
  return `${members.length} builds · ${order.join(", ")}`;
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Rounds a quantity up to this product's own case pack (PCS/CASE on the
 * sheet — 24 for sheets, 72 for pillow cases, 12 for duvet covers). Returns
 * the quantity unchanged where the sheet gives no case pack, which is true
 * only for Mattress Protector and Pillow Protector — there is no figure on
 * the sheet to round to, so none is invented.
 */
export function roundUpToCase(product: BedLinenProduct, n: number): number {
  const pack = product.pcsPerCase;
  return pack ? Math.ceil(n / pack) * pack : n;
}

export type BedLinenOrderLine = { sizeKey: BedSizeKey; quantity: number };

/** `?lines=` — the buyer's list. "queen:96,king:48". See encodeTerryLines. */
export function encodeBedLinenLines(lines: BedLinenOrderLine[]): string {
  return lines.map((l) => `${l.sizeKey}:${l.quantity}`).join(",");
}

export type BedLinenOrderRow = BedLinenLine & { quantity: number };

/**
 * Parses `?lines=`, keeping only pairs that name a bed size THIS product is
 * made in. See parseTerryLines in lib/terry-towels.ts for the reasoning —
 * the same rule applies here: an unknown key, a duplicate or a junk quantity
 * is dropped rather than repaired.
 */
export function parseBedLinenLines(
  product: BedLinenProduct,
  raw: string | undefined
): BedLinenOrderRow[] {
  if (!raw) return [];
  const offered = new Map(bedLinenSizesFor(product).map((l) => [l.size.key, l]));
  const seen = new Set<string>();
  const out: BedLinenOrderRow[] = [];

  for (const part of raw.split(",").slice(0, BED_SIZES.length)) {
    const [key, qty] = part.split(":");
    const line = offered.get(key as BedSizeKey);
    if (!line || seen.has(key)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(key);
    out.push({ ...line, quantity: roundUpToCase(product, n) });
  }

  return out;
}
