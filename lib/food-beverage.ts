/**
 * The Food & Beverage range, transcribed from the client's F&B sheet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS A TRANSCRIPTION, NOT A WRITE-UP, same discipline as the other
 * range files. Every colour, size, blend, weight, packing and stock code is
 * copied from the sheet. Nothing is inferred, converted or filled in from a
 * neighbouring row.
 *
 * TWO SHAPES OF ROW ON ONE SHEET. The top half lists a row per COLOUR — a bar
 * mop in white, in blue C/S, in gold C/S, each with its own code and all at
 * one size. The bottom half lists a row per SIZE with a column per colour, so
 * an apron or a table cloth is a size-by-colour grid of codes. Both are
 * modelled the same way here: a product has a list of sizes, a list of
 * colours, and a line for every pair the sheet actually fills in. A
 * single-size product is simply the case where that list of sizes has one
 * entry.
 *
 * A PAIR THE SHEET LEAVES BLANK IS NOT MADE. The pencil-pocket aprons are
 * given in white and black only, while the plain ones run to all seven
 * colours, so the grid below is sparse on purpose. Never fill a gap from the
 * row above it.
 *
 * SPELLINGS ARE THE CLIENT'S UNLESS THEY SAY OTHERWISE. "Mommie Napkin" is
 * written as the sheet writes it. The sheet's "PENCEL POCKET" is the one
 * exception: the client confirmed it as a typo, so the apron reads "Pencil
 * Pocket". Its stock codes still end in PEN, because a code is an identifier
 * rather than a word — correcting one would invent a code their system does
 * not have. The colour "Burgundy" on this sheet is the spelling the whole
 * site now uses, the salon sheet's "Bergundy" included.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type FbSize = {
  /** Finished size, exactly as the sheet writes it. */
  size: string;
  /** The sheet's PACKING for this size, where it gives one. */
  packing: string | null;
};

/** One orderable line: a size, a colour, and the client's code for the pair. */
export type FbLine = {
  size: string;
  colour: string;
  sku: string;
};

export type FbProduct = {
  slug: string;
  /** Item plus the sheet's DESCRIPTION, where several rows share an item. */
  name: string;
  /** Groups the rows sharing an ITEM value — drives the family listing page. */
  family: string;
  /** As the client writes it, for the family's heading and breadcrumb. */
  familyLabel: string;
  /** The sheet's DESCRIPTION column. */
  description: string | null;
  blend: string;
  /** Verbatim, including the unit the sheet chose. */
  weight: string | null;
  /**
   * Whether the sheet denominates this line in dozens — its weight is per
   * dozen, or its packing counts dozens per case. Where it does, a quantity
   * rounds up to the next twelve the way the towel range does. Where the
   * sheet says neither, no rounding rule is invented.
   */
  unit: "dozen" | null;
  sizes: FbSize[];
  colours: string[];
  lines: FbLine[];
};

/**
 * Builds the size-by-colour grid from the sheet's own layout: one array of
 * codes per size, in colour order. An empty string is a pair the sheet leaves
 * blank, and produces no line.
 *
 * Written this way rather than as 56 hand-typed line objects because the
 * table cloth alone is eight sizes by seven colours — and a grid typed out
 * long-hand is a grid with a transposed code in it.
 */
function grid(sizes: string[], colours: string[], codes: string[][]): FbLine[] {
  return sizes.flatMap((size, i) =>
    colours.flatMap((colour, j) => {
      const sku = codes[i]?.[j];
      return sku ? [{ size, colour, sku }] : [];
    })
  );
}

/** One size, several colours — the shape the top half of the sheet uses. */
function bySize(size: string, pairs: [colour: string, sku: string][]): FbLine[] {
  return pairs.map(([colour, sku]) => ({ size, colour, sku }));
}

/** The seven colours the sheet's apron, napkin and table cloth grid runs. */
const GRID_COLOURS = [
  "White",
  "Black",
  "Burgundy",
  "Forest Green",
  "Navy",
  "Red",
  "Royal Blue",
];

export const FB_PRODUCTS: FbProduct[] = [
  /* ── Bar Mop — three builds ──────────────────────────────────────────── */
  {
    slug: "bar-mop-full-terry-cotton",
    name: "Bar Mop — Full Terry, 100% Cotton",
    family: "bar-mop",
    familyLabel: "Bar Mop",
    description: "Full Terry",
    blend: "100% Cotton",
    weight: "32 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "16X19", packing: "100 DZ / BULK CASE" }],
    colours: ["White", "Blue C/S", "Gold C/S", "Green C/S", "Blue/Gold C/S", "Twin Green C/S"],
    lines: bySize("16X19", [
      ["White", "BM32WHT"],
      ["Blue C/S", "BM32BLUS"],
      ["Gold C/S", "BM32GLDS"],
      ["Green C/S", "BM32GRNS"],
      ["Blue/Gold C/S", "BM32BGS"],
      ["Twin Green C/S", "BM32TWNGRNS"],
    ]),
  },
  {
    slug: "bar-mop-full-terry-6040",
    name: "Bar Mop — Full Terry, 60% Cot / 40% Poly",
    family: "bar-mop",
    familyLabel: "Bar Mop",
    description: "Full Terry",
    blend: "60% Cot / 40% Poly",
    weight: "30 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "16X19", packing: "100 DZ / BULK CASE" }],
    colours: ["White", "Blue C/S", "Gold C/S", "Green C/S"],
    lines: bySize("16X19", [
      ["White", "BM30WHT64"],
      ["Blue C/S", "BM30BLUS64"],
      ["Gold C/S", "BM30GLDS64"],
      ["Green C/S", "BM30GRNS64"],
    ]),
  },
  {
    // The sheet writes this row's item as "BARMOP", one word, where the six
    // rows above it read "BAR MOP". Same product family either way.
    slug: "bar-mop-ribbed",
    name: "Bar Mop — Ribbed",
    family: "bar-mop",
    familyLabel: "Bar Mop",
    description: "Ribbed",
    blend: "100% Cotton",
    weight: "32 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "16X19", packing: "100 DZ / BULK CASE" }],
    colours: ["White"],
    lines: bySize("16X19", [["White", "BM32WHTRB"]]),
  },

  /* ── Kitchen Towel ───────────────────────────────────────────────────── */
  {
    slug: "kitchen-towel-herringbone",
    name: "Kitchen Towel — Herringbone",
    family: "kitchen-towel",
    familyLabel: "Kitchen Towel",
    description: "Herringbone",
    blend: "100% Cotton",
    weight: "24 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "15X25", packing: null }],
    colours: ["Green C/S", "Blue C/S"],
    lines: bySize("15X25", [
      ["Green C/S", "KT1525HBGRN"],
      ["Blue C/S", "KT1525HBLU"],
    ]),
  },

  /* ── Flour Sack ──────────────────────────────────────────────────────── */
  {
    slug: "flour-sack",
    name: "Flour Sack",
    family: "flour-sack",
    familyLabel: "Flour Sack",
    description: null,
    blend: "100% Cotton",
    weight: "22 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "28X28", packing: null }],
    colours: ["White"],
    lines: bySize("28X28", [["White", "FSAC2828WHT"]]),
  },

  /* ── Glass Towel ─────────────────────────────────────────────────────── */
  {
    slug: "glass-towel",
    name: "Glass Towel",
    family: "glass-towel",
    familyLabel: "Glass Towel",
    description: null,
    blend: "100% Cotton",
    weight: "24 OZ/DZ",
    unit: "dozen",
    sizes: [{ size: "16X28", packing: null }],
    colours: ["Red Stripes"],
    lines: bySize("16X28", [["Red Stripes", "GT1628STRP"]]),
  },

  /* ── Bistro Napkin ───────────────────────────────────────────────────── */
  {
    // The sheet gives this row no weight and no packing, so it carries no
    // rounding rule — a quantity is taken as entered.
    slug: "bistro-napkin",
    name: "Bistro Napkin",
    family: "bistro-napkin",
    familyLabel: "Bistro Napkin",
    description: "Bistro Stripe Napkin",
    blend: "100% Cotton",
    weight: null,
    unit: null,
    sizes: [{ size: "20X20", packing: null }],
    colours: ["Blue", "Red", "Black", "Gold", "Green"],
    lines: bySize("20X20", [
      ["Blue", "BISTROBLUE"],
      ["Red", "BISTRORED"],
      ["Black", "BISTROBLK"],
      ["Gold", "BISTROGOLD"],
      ["Green", "BISTROGRN"],
    ]),
  },

  /* ── Mommie Napkin ───────────────────────────────────────────────────── */
  {
    slug: "mommie-napkin",
    name: "Mommie Napkin",
    family: "mommie-napkin",
    familyLabel: "Mommie Napkin",
    description: "Mercerised Mommie Napkin Cotton",
    blend: "100% Cotton",
    weight: null,
    unit: null,
    sizes: [{ size: "20X20", packing: null }],
    colours: ["White"],
    lines: bySize("20X20", [["White", "MNAP2020"]]),
  },

  /* ── Aprons — two builds, each a size-by-colour grid ─────────────────── */
  {
    slug: "aprons-bib-tubular-ties",
    name: "Aprons — Bib Aprons with Tubular Ties",
    family: "aprons",
    familyLabel: "Aprons",
    description: "Bib Aprons with Tubular Ties",
    blend: "100% Polyester",
    weight: "6.40 OZ/SQYD",
    unit: "dozen",
    sizes: [
      { size: "28X32", packing: "10 DZ / CASE" },
      { size: "30X32", packing: "10 DZ / CASE" },
      { size: "30X34", packing: "10 DZ / CASE" },
    ],
    colours: GRID_COLOURS,
    lines: grid(
      ["28X32", "30X32", "30X34"],
      GRID_COLOURS,
      [
        [
          "APN2832WHT",
          "APN2832BLK",
          "APN2832BGDY",
          "APN2832GRN",
          "APN2832NVY",
          "APN2832RED",
          "APN2832RBLU",
        ],
        [
          "APN3032WHT",
          "APN3032BLK",
          "APN3032BGDY",
          "APN3032GRN",
          "APN3032NVY",
          "APN3032RED",
          "APN3032RBLU",
        ],
        [
          "APN3034WHT",
          "APN3034BLK",
          "APN3034BGDY",
          "APN3034GRN",
          "APN3034NVY",
          "APN3034RED",
          "APN3034RBLU",
        ],
      ]
    ),
  },
  {
    // The sheet writes "PENCEL POCKET"; the client confirmed it is a typo, so
    // it reads "Pencil Pocket" here. The STOCK CODES are untouched — they end
    // in PEN, and a code is an identifier rather than a word. This build is
    // given in white and black only — the other five colours are blank.
    slug: "aprons-bib-tubular-ties-pencil-pocket",
    name: "Aprons — Bib Aprons with Tubular Ties with Pencil Pocket",
    family: "aprons",
    familyLabel: "Aprons",
    description: "Bib Aprons with Tubular Ties with Pencil Pocket",
    blend: "100% Polyester",
    weight: "6.40 OZ/SQYD",
    unit: "dozen",
    sizes: [
      { size: "28X32", packing: "10 DZ / CASE" },
      { size: "30X32", packing: "10 DZ / CASE" },
      { size: "30X34", packing: "10 DZ / CASE" },
    ],
    colours: ["White", "Black"],
    lines: grid(
      ["28X32", "30X32", "30X34"],
      ["White", "Black"],
      [
        ["APN2832WHTPEN", "APN2832BLKPEN"],
        ["APN3032WHTPEN", "APN3032BLKPEN"],
        ["APN3034WHTPEN", "APN3034BLKPEN"],
      ]
    ),
  },

  /* ── Napkins ─────────────────────────────────────────────────────────── */
  {
    slug: "napkins-spun-polyester",
    name: "Napkins — Spun Polyester",
    family: "napkins",
    familyLabel: "Napkins",
    description: "Spun Polyester",
    blend: "100% Polyester",
    weight: null,
    unit: "dozen",
    sizes: [{ size: "20X20", packing: "25 DZ / CASE" }],
    colours: GRID_COLOURS,
    lines: bySize("20X20", [
      ["White", "NAP2020WHT"],
      ["Black", "NAP2020BLK"],
      ["Burgundy", "NAP2020BGDY"],
      ["Forest Green", "NAP2020GRN"],
      ["Navy", "NAP2020NVY"],
      ["Red", "NAP2020RED"],
      ["Royal Blue", "NAP2020RBLU"],
    ]),
  },

  /* ── Table Cloth — eight sizes by seven colours ──────────────────────── */
  {
    slug: "table-cloth-spun-polyester",
    name: "Table Cloth — Spun Polyester",
    family: "table-cloth",
    familyLabel: "Table Cloth",
    description: "Spun Polyester",
    blend: "100% Polyester",
    weight: null,
    unit: "dozen",
    sizes: [
      // 42X42 is the one size packed ten dozen to a case; the rest are five.
      { size: "42X42", packing: "10 DZ / CASE" },
      { size: "52X52", packing: "5 DZ / CASE" },
      { size: "62X62", packing: "5 DZ / CASE" },
      { size: "72X72", packing: "5 DZ / CASE" },
      { size: "85X85", packing: "5 DZ / CASE" },
      { size: "52X120", packing: "5 DZ / CASE" },
      { size: "90X90", packing: "5 DZ / CASE" },
      { size: '90" ROUND', packing: "5 DZ / CASE" },
    ],
    colours: GRID_COLOURS,
    lines: grid(
      ["42X42", "52X52", "62X62", "72X72", "85X85", "52X120", "90X90", '90" ROUND'],
      GRID_COLOURS,
      [
        ["TC42WHT", "TC42BLK", "TC42BGDY", "TC42GRN", "TC42NVY", "TC42RED", "TC42RBLU"],
        ["TC52WHT", "TC52BLK", "TC52BGDY", "TC52GRN", "TC52NVY", "TC52RED", "TC52RBLU"],
        ["TC62WHT", "TC62BLK", "TC62BGDY", "TC62GRN", "TC62NVY", "TC62RED", "TC62RBLU"],
        ["TC72WHT", "TC72BLK", "TC72BGDY", "TC72GRN", "TC72NVY", "TC72RED", "TC72RBLU"],
        ["TC85WHT", "TC85BLK", "TC85BGDY", "TC85GRN", "TC85NVY", "TC85RED", "TC85RBLU"],
        [
          "TC52120WHT",
          "TC52120BLK",
          "TC52120BGDY",
          "TC52120GRN",
          "TC52120NVY",
          "TC52120RED",
          "TC52120RBLU",
        ],
        ["TC90WHT", "TC90BLK", "TC90BGDY", "TC90GRN", "TC90NVY", "TC90RED", "TC90RBLU"],
        [
          "TC90WHTRO",
          "TC90BLKRO",
          "TC90BGDYRO",
          "TC90GRNRO",
          "TC90NVYRO",
          "TC90REDRO",
          "TC90RBLURO",
        ],
      ]
    ),
  },
];

/** Where the range lives. One constant so the links cannot drift. */
export const FB_BASE = "/hospitality/food-beverage";

const BY_SLUG = new Map(FB_PRODUCTS.map((p) => [p.slug, p]));

export function getFbProduct(slug: string): FbProduct | undefined {
  return BY_SLUG.get(slug);
}

/** The members of a family, in sheet order. */
export function getFbFamily(family: string): FbProduct[] {
  return FB_PRODUCTS.filter((p) => p.family === family);
}

/** Every family, once each, in sheet order — drives generateStaticParams. */
export function fbFamilySlugs(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of FB_PRODUCTS) {
    if (seen.has(p.family)) continue;
    seen.add(p.family);
    out.push(p.family);
  }
  return out;
}

/**
 * Where a click on this product's card, or the mega-menu, should land.
 *
 * A FAMILY WITH ONE MEMBER HAS NO LISTING PAGE — only Bar Mop and Aprons have
 * several builds, so only those two get one. A listing page holding exactly
 * one card is a click that exists only to be clicked through.
 */
export function fbProductHref(product: FbProduct): string {
  return getFbFamily(product.family).length > 1
    ? `${FB_BASE}/${product.family}/${product.slug}`
    : `${FB_BASE}/${product.family}`;
}

/** The code for one size in one colour, or null where the sheet is blank. */
export function fbSkuFor(product: FbProduct, size: string, colour: string): string | null {
  return product.lines.find((l) => l.size === size && l.colour === colour)?.sku ?? null;
}

/** The packing the sheet gives for one size. */
export function fbPackingFor(product: FbProduct, size: string): string | null {
  return product.sizes.find((s) => s.size === size)?.packing ?? null;
}

/** The one-line summary a listing card shows under the title. */
export function fbCardSummary(product: FbProduct): string {
  const sizes =
    product.sizes.length === 1
      ? product.sizes[0].size
      : `${product.sizes.length} sizes`;
  const colours =
    product.colours.length === 1
      ? product.colours[0]
      : `${product.colours.length} colours`;
  return [product.blend, sizes, colours].join(" · ");
}

/** The one line the group card shows for a family as a whole. */
export function fbFamilyCardSummary(family: string): string | null {
  const members = getFbFamily(family);
  if (members.length === 0) return null;
  if (members.length === 1) return fbCardSummary(members[0]);

  const codes = members.reduce((n, p) => n + p.lines.length, 0);
  return `${members.length} builds · ${codes} stock codes`;
}

/* ───────────────────────────────────────────────────────────────────────────
   The order list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/** Supplied by the dozen, on every line the sheet denominates that way. */
export const FB_DOZEN = 12;

/**
 * Rounds up to the next dozen where the sheet denominates this product in
 * dozens, and leaves the quantity alone where it does not — the two napkin
 * rows carry neither a per-dozen weight nor a dozens-per-case packing, so
 * there is no figure on the sheet to round them to.
 */
export function roundUpForFb(product: FbProduct, n: number): number {
  return product.unit === "dozen" ? Math.ceil(n / FB_DOZEN) * FB_DOZEN : n;
}

export type FbOrderLine = { sku: string; quantity: number };

/** `?lines=` — the buyer's list, keyed on the client's own stock codes. */
export function encodeFbLines(lines: FbOrderLine[]): string {
  return lines.map((l) => `${l.sku}:${l.quantity}`).join(",");
}

export type FbOrderRow = FbLine & { quantity: number };

/**
 * Parses `?lines=`, keeping only codes THIS product is made in. An unknown
 * code, a duplicate or a junk quantity is dropped rather than repaired — see
 * parseTerryLines in lib/terry-towels.ts for the reasoning.
 */
export function parseFbLines(product: FbProduct, raw: string | undefined): FbOrderRow[] {
  if (!raw) return [];
  const offered = new Map(product.lines.map((l) => [l.sku, l]));
  const seen = new Set<string>();
  const out: FbOrderRow[] = [];

  for (const part of raw.split(",").slice(0, product.lines.length)) {
    const [sku, qty] = part.split(":");
    const line = offered.get(sku);
    if (!line || seen.has(sku)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(sku);
    out.push({ ...line, quantity: roundUpForFb(product, n) });
  }

  return out;
}
