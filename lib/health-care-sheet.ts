/**
 * The Health-Care range as the client's "Health Care Category Structure"
 * sheet lays it out: a CATEGORY per red heading, a PRODUCT per row under it,
 * and a stock code per orderable variant.
 *
 *   category page   /health-care/<category>            one card per product
 *   product page    /health-care/<category>/<product>  specification and order list
 *
 * lib/health-care.ts holds the categories themselves (name, slug, intro) because
 * the header's menu is built from it and must not ship this file. The products
 * live here, and only the server pages and the quote page import it.
 *
 * WHAT A "VARIANT" IS DEPENDS ON THE ROW. The sheet gives one code per weight
 * for a wash cloth, per size for a bed sheet, per shade for a spread blanket.
 * `variantLabel` says which, and each variant's `label` is that weight, size or
 * shade. A product with a single code has a single variant, which the page
 * selects for the buyer.
 *
 * THE CASE IS THE SHEET'S "BULK CASE". "100 DZ / BULK CASE" is 100 dozen to a
 * case and is ordered in dozens; "60 EA / BULK CASE" is 60 pieces. Quantities
 * round up to a whole case, as everywhere else on the site. Rows with no
 * packing on the sheet are ordered one at a time and say nothing about a case.
 *
 * WORDING IS THE SHEET'S, WITH OBVIOUS SLIPS CORRECTED: "Cappuccino" for
 * "CUPPUCINO" and "Blanket" for "BALNKET". "Septerine" is kept as written,
 * because it may be the client's own name for the weave. The bath towels that
 * differ only by SCB or DCB at the end of their codes are named by those
 * letters, since the sheet does not spell them out.
 */

export type HcVariant = {
  /** The client's stock code. */
  sku: string;
  /** The weight, size or shade this code is. */
  label: string;
};

export type HcCase = {
  size: number;
  unit: "dozen" | "pieces";
};

export type HcProduct = {
  slug: string;
  name: string;
  blend: string | null;
  /** As the sheet writes it, e.g. "100 DZ / BULK CASE". Null where it gives none. */
  packing: string | null;
  /** What a quantity rounds up to. Null: one at a time. */
  case: HcCase | null;
  /** Facts that are the same on every variant, shown above the picker. */
  facts: { label: string; value: string }[];
  /** What the variants differ by: "Weight", "Size" or "Colour". */
  variantLabel: "Weight" | "Size" | "Colour" | "Design";
  variants: HcVariant[];
};

const DZ = (n: number): HcCase => ({ size: n, unit: "dozen" });
const EA = (n: number): HcCase => ({ size: n, unit: "pieces" });

const COTPOLY = "85% Cot / 15% Poly";

function product(
  slug: string,
  name: string,
  opts: {
    blend?: string;
    packing?: string;
    case?: HcCase;
    facts?: { label: string; value: string }[];
    variantLabel: HcProduct["variantLabel"];
    variants: HcVariant[];
  }
): HcProduct {
  return {
    slug,
    name,
    blend: opts.blend ?? null,
    packing: opts.packing ?? null,
    case: opts.case ?? null,
    facts: opts.facts ?? [],
    variantLabel: opts.variantLabel,
    variants: opts.variants,
  };
}

const v = (sku: string, label: string): HcVariant => ({ sku, label });
const size = (value: string) => ({ label: "Size", value });
const weight = (value: string) => ({ label: "Weight", value });

const towel = (
  slug: string,
  name: string,
  dozens: number,
  dims: string,
  lbs: string,
  sku: string
) =>
  product(slug, name, {
    blend: COTPOLY,
    packing: `${dozens} DZ / BULK CASE`,
    case: DZ(dozens),
    facts: [size(dims)],
    variantLabel: "Weight",
    variants: [v(sku, lbs)],
  });

/**
 * A terry towel on the "Health Care Addition" and "Economy bath towels" sheets: a
 * hem, then a weight and a code per size. The sizes are the Economy sheet's
 * column headings (12X12, 13X13, 16X27, 22X44, 24X48, 24X50, 20X30), and they
 * agree with the digits in each code. Neither sheet gives a packing, so a
 * quantity is taken as entered.
 */
const terrySizes = (
  slug: string,
  name: string,
  blend: string,
  rows: [dims: string, lbs: string, sku: string][]
) =>
  product(slug, name, {
    blend,
    facts: [{ label: "Hem", value: "Plain" }],
    variantLabel: "Size",
    variants: rows.map(([dims, lbs, sku]) => v(sku, `${dims} · ${lbs}`)),
  });

const spread = (
  slug: string,
  name: string,
  blend: string,
  each: number,
  dims: string,
  lbs: string,
  shades: [string, string][]
) =>
  product(slug, name, {
    blend,
    packing: `${each} EA / BULK CASE`,
    case: EA(each),
    facts: [size(dims), weight(lbs)],
    variantLabel: "Colour",
    variants: shades.map(([label, sku]) => v(sku, label)),
  });

const gown = (slug: string, name: string, dozens: number, fabric: string | null, sku: string) =>
  product(slug, name, {
    blend: "55/45",
    packing: `${dozens} DZ / BULK CASE`,
    case: DZ(dozens),
    facts: fabric ? [{ label: "Fabric weight", value: fabric }] : [],
    variantLabel: "Design",
    variants: [v(sku, name)],
  });

/**
 * A row of the "HYPERBARIC USE ONLY" sheet: size, code, packing and, where the
 * sheet gives one, a weight. The towel is weighed per dozen and the blanket per
 * piece, so the weight is kept as the sheet writes it.
 */
const hyperbaric = (
  slug: string,
  name: string,
  dims: string,
  sku: string,
  packing: { text: string; case: HcCase },
  lbs?: string
) =>
  product(slug, name, {
    blend: "100% Cotton",
    packing: packing.text,
    case: packing.case,
    facts: [
      size(dims),
      ...(lbs ? [weight(lbs)] : []),
      { label: "Marking", value: "“HYPERBARIC USE ONLY”" },
    ],
    variantLabel: "Size",
    variants: [v(sku, dims)],
  });

const baby = (slug: string, name: string, dims: string, lbs: string, sku: string) =>
  product(slug, name, {
    blend: "100% Cotton",
    packing: "25 DZ / BULK CASE",
    case: DZ(25),
    facts: [size(dims), weight(lbs)],
    variantLabel: "Design",
    variants: [v(sku, name)],
  });

export const HEALTH_CARE_PRODUCTS: Record<string, HcProduct[]> = {
  towels: [
    product("wash-cloth-hemmed", "Wash Cloth Hemmed", {
      blend: COTPOLY,
      packing: "100 DZ / BULK CASE",
      case: DZ(100),
      facts: [size("12X12")],
      variantLabel: "Weight",
      variants: [v("WC1212H75", "0.75 LBS"), v("WC1212H1", "1 LBS")],
    }),
    product("wash-cloth-surged", "Wash Cloth Surged", {
      blend: COTPOLY,
      packing: "100 DZ / BULK CASE",
      case: DZ(100),
      facts: [size("12X12")],
      variantLabel: "Weight",
      variants: [v("WC1212S1", "1 LBS")],
    }),
    towel("hand-towel", "Hand Towel", 50, "16X27", "2.75 LBS", "1627SC275"),
    towel("bath-towel-22x44", "Bath Towel 22X44", 25, "22X44", "6 LBS", "2244SC6"),
    towel("bath-towel-24x48-scb", "Bath Towel 24X48 SCB", 25, "24X48", "8 LBS", "2448SCB"),
    towel("bath-towel-24x48-dcb", "Bath Towel 24X48 DCB", 25, "24X48", "8 LBS", "2448DCB"),
    towel("bath-towel-24x50-scb", "Bath Towel 24X50 SCB", 15, "24X50", "10.5 LBS", "2450SCB"),
    towel("bath-towel-24x50-dcb", "Bath Towel 24X50 DCB", 15, "24X50", "10.5 LBS", "2450DCB"),
    // From "Health Care Addition": three terry towels, each in a run of sizes.
    terrySizes("single-cam-terry-towel", "Single Cam Terry Towel", "86% Cot / 14% Poly", [
      ["12X12", "1 LBS", "1212SCB"],
      ["13X13", "1.5 LBS", "1313SCB"],
      ["16X27", "3 LBS", "1627SCB"],
      ["22X44", "6.75 LBS", "2244SCB"],
      ["24X48", "8 LBS", "2448SCB"],
      ["24X50", "10.5 LBS", "2450SCB"],
      ["20X30", "6.5 LBS", "2030SPF"],
    ]),
    terrySizes("double-cam-terry-towel", "Double Cam Terry Towel", "78% Cot / 22% Poly", [
      ["12X12", "1 LBS", "1212DCB"],
      ["13X13", "1.5 LBS", "1313DCB"],
      ["16X27", "3 LBS", "1627DCB"],
      ["22X44", "6.75 LBS", "2244DCB"],
      ["24X48", "8 LBS", "2448DCB"],
      ["24X50", "10.5 LBS", "2450DCB"],
      ["20X30", "6.5 LBS", "2030DPF"],
    ]),
    terrySizes("full-terry-towel", "Full Terry Towel", "100% Cotton", [
      ["12X12", "1 LBS", "1212FTC"],
      ["13X13", "1.5 LBS", "1313FTC"],
    ]),
  ],

  sheets: [
    product("bed-sheet-t180", "Bed Sheet T180", {
      blend: "55/45",
      packing: "5 DZ / BULK CASE",
      case: DZ(5),
      variantLabel: "Size",
      variants: [v("66104S18", "66X104"), v("66108S18", "66X108"), v("66115S18", "66X115")],
    }),
    product("fitted-sheet", "Fitted Sheet", {
      blend: "55/45",
      packing: "5 DZ / BULK CASE",
      case: DZ(5),
      variantLabel: "Size",
      variants: [v("FIT3380BLD", "33X80X16")],
    }),
    product("knitted-fitted-sheet-24-oz", "Knitted Fitted Sheet 24 Oz", {
      blend: "100% Polyester",
      packing: "5 DZ / BULK CASE",
      case: DZ(5),
      variantLabel: "Size",
      variants: [v("KFIT3380P24", "33X80X16")],
    }),
    product("knitted-fitted-sheet-27-oz", "Knitted Fitted Sheet 27 Oz", {
      blend: "100% Polyester",
      packing: "5 DZ / BULK CASE",
      case: DZ(5),
      variantLabel: "Size",
      variants: [v("KFIT3384P27", "33X84X18")],
    }),
    product("pillow-case-t180", "Pillow Case T180", {
      blend: "55/45",
      packing: "25 DZ / BULK CASE",
      case: DZ(25),
      variantLabel: "Size",
      variants: [v("PC4234S18", "42X34")],
    }),
  ],

  "bath-blanket": [
    product("natural-bath-blanket", "Natural Bath Blanket", {
      blend: "55% Cot / 45% Poly",
      packing: "60 EA / BULK CASE",
      case: EA(60),
      facts: [size('70"X90"')],
      variantLabel: "Weight",
      variants: [v("BB7090N175", "1.75 LBS"), v("BB7090N20", "2 LBS"), v("BB7090N225", "2.25 LBS")],
    }),
    product("white-bath-blanket", "White Bath Blanket", {
      blend: "55% Cot / 45% Poly",
      packing: "60 EA / BULK CASE",
      case: EA(60),
      facts: [size('70"X90"')],
      variantLabel: "Weight",
      variants: [v("BB7090W175", "1.75 LBS"), v("BB7090W20", "2 LBS")],
    }),
    product("blue-stripe-bath-blanket", "Blue Stripe Bath Blanket", {
      blend: "55% Cot / 45% Poly",
      packing: "60 EA / BULK CASE",
      case: EA(60),
      facts: [size('70"X90"')],
      variantLabel: "Weight",
      variants: [v("BB7090WBSTRP", "2 LBS")],
    }),
  ],

  "spread-blanket": [
    spread("herringbone-spread-blanket", "Herringbone Spread Blanket", "55/45", 12, "70X108", "3 LBS", [
      ["White", "HB70108WHT"],
      ["Nantucket Blue", "HB70108BLU"],
      ["Beige", "HB70108BGE"],
      ["Celery", "HB70108CEL"],
    ]),
    spread("septerine-spread-blanket", "Septerine Spread Blanket", "55/45", 24, "66X90", "2.75 LBS", [
      ["White", "SPTRN6690WHT275"],
    ]),
    spread("spectrum-spread-blanket", "Spectrum Spread Blanket", "55/45", 12, "74X104", "3.5 LBS", [
      ["White", "SPCTM74104WHT35"],
      ["Nantucket Blue", "SPCTM74104BLU35"],
      ["Cappuccino", "SPCTM74104CAP35"],
    ]),
    spread(
      "spectrum-spread-blanket-links",
      "Spectrum Spread Blanket Links",
      "100% Polyester",
      18,
      "74X104",
      "3.5 LBS",
      [
        ["White", "SPCTM74104W35PL"],
        ["Blue", "SPCTM74104BLU35PL"],
        ["Tan", "SPCTM74104TAN35PL"],
        ["Grey", "SPCTM74104GRY35PL"],
      ]
    ),
    spread("chevron-spread-blanket", "Chevron Spread Blanket", "60/40", 12, "70X90", "2.70 LBS", [
      ["White", "CHEV7090WHT27"],
      ["Blue", "CHEV7090BLU27"],
      ["Beige", "CHEV7090BGE27"],
      ["Grey", "CHEV7090GRY27"],
    ]),
    spread(
      "chevron-spread-blanket-polyester",
      "Chevron Spread Blanket 100% Polyester",
      "100% Polyester",
      18,
      "70X90",
      "3 LBS",
      [
        ["White", "CHEV7090WHT3P"],
        ["Blue", "CHEV7090BLU3P"],
        ["Tan", "CHEV7090TAN3P"],
        ["Grey", "CHEV7090GRY3P"],
      ]
    ),
    spread("multistripe-spread-blanket", "Multistripe Spread Blanket", "55/45", 12, "74X104", "3.5 LBS", [
      ["Multistripe", "MULTI74104"],
    ]),
    spread("open-weave-blanket", "Open Weave Blanket", "100% Cotton", 24, "66X96", "2.5 LBS", [
      ["White", "OPN6696COT25"],
    ]),
    spread("checkers-blankets", "Checkers Blankets", "100% Cotton", 24, "66X96", "2.5 LBS", [
      ["White", "CHKR6696COT25"],
    ]),
    spread("odyssey-spreads-blanket", "Odyssey Spreads Blanket", "55/45", 12, "74X100", "3.75 LBS", [
      ["White", "HBSG74100WHT375"],
      ["Nantucket Blue", "HBSG74100BLU375"],
      ["Cappuccino", "HBSG74100CAP375"],
      ["Celery", "HBSG74100CEL375"],
    ]),
  ],

  "patient-gown": [
    gown("compass-print", "Compass Print", 15, "4.10 OZ/SY", "PGCOMPASS"),
    product("multistripe-print-twill-weave", "Multistripe Print (Twill Weave)", {
      blend: "55/45",
      packing: "15 DZ / BULK CASE",
      case: DZ(15),
      facts: [{ label: "Fabric weight", value: "4.10 OZ/SY" }],
      variantLabel: "Colour",
      variants: [v("PGMULSTRPBLU", "Blue"), v("PGMULSTRPGRN", "Green")],
    }),
    gown("snow-flake-print", "Snow Flake Print", 15, "4.10 OZ/SY", "PGSNOF"),
    gown("demure-print", "Demure Print", 15, null, "PGDMR"),
    gown("snow-flake-black", "Snow Flake Black", 15, null, "PGSNOFBLK"),
    gown("leaf-print", "Leaf Print", 15, "4.10 OZ/SY", "PGLEAF"),
  ],

  "iv-gown": [
    gown("iv-snow-flake", "Snow Flake", 10, "4.10 OZ/SY", "IVGSNOF"),
    gown("iv-diamond-print", "Diamond Print", 10, "4.10 OZ/SY", "IVGDIA"),
  ],

  "absorbent-towel": [
    product("absorbent-towels", "Absorbent Towels", {
      blend: "100% Cotton",
      packing: "25 DZ / BULK CASE",
      case: DZ(25),
      facts: [size("18X33"), weight("2.40 LBS")],
      variantLabel: "Colour",
      variants: [
        v("AT1833WHT", "White"),
        v("AT1833JG", "Jade Green"),
        v("AT1833MSTY", "Misty Green"),
        v("AT1833CB", "Ceil Blue"),
      ],
    }),
  ],

  "hyperbaric-use-only": [
    hyperbaric("hyperbaric-towel", "Towel", "24X48", "HYPR2448TWL", { text: "10 DZ / BULK CASE", case: DZ(10) }, "8 LBS / DZ"),
    hyperbaric("hyperbaric-sheet-t180", "Sheet T180", "66X107", "HYPR66107SHT", { text: "15 DZ / BULK CASE", case: DZ(15) }),
    hyperbaric("hyperbaric-sheet-180", "Sheet 180", "66X115", "HYPR66115SHT", { text: "25 DZ / BULK CASE", case: DZ(25) }),
    hyperbaric("hyperbaric-pillow-case", "Pillow Case", "42X34", "HYPR4234PLW", { text: "25 DZ / BULK CASE", case: DZ(25) }),
    hyperbaric("hyperbaric-flannel-blanket", "Flannel Blanket", "70X90", "HYPR7090BLNKT", { text: "60 PIECES / BULK CASE", case: EA(60) }, "2 LBS / PIECE"),
  ],

  "receiving-blanket": [
    baby("printed-baby-blanket", "Printed Pink/Blue Baby Blanket", '30"X40"', "3.30 LBS", "BB3040"),
    baby(
      "woven-stripes-baby-blanket",
      "Woven Pink/Blue Stripes Baby Blanket",
      '36"X36"',
      "4 LBS",
      "BB3636WSTRP"
    ),
    baby("little-hands-baby-blanket", "Little Hands Baby Blanket", '36"X40"', "5 LBS", "BB3640HAND"),
    baby("little-foot-print-baby-blanket", "Little Foot Print Baby Blanket", '36"X40"', "7 LBS", "BB3640FOOT"),
    baby("duck-print-baby-blanket", "Duck Print Baby Blanket", '36"X40"', "7 LBS", "BB3640DUCK"),
  ],
};

export function healthCareProducts(categorySlug: string): HcProduct[] {
  return HEALTH_CARE_PRODUCTS[categorySlug] ?? [];
}

export function getHealthCareProduct(
  categorySlug: string,
  productSlug: string
): HcProduct | undefined {
  return healthCareProducts(categorySlug).find((p) => p.slug === productSlug);
}

/**
 * ECONOMY BATH TOWELS, a Hospitality line, from the client's "Economy bath
 * towels" sheet ("Motels, gyms & theme parks staff towel"). Four products: the
 * three terry towels that Health-Care Towels also carries, which are the same
 * rows and so the same objects, and a pool towel.
 */
export const ECONOMY_BASE = "/hospitality/bath-linen/economy-bath-towels";

const POOL_TOWEL = product("pool-towel", "Pool Towel", {
  blend: "86% Cot / 14% Poly",
  facts: [
    { label: "Design", value: "Blue Stripes" },
    { label: "Size", value: "30X60" },
    { label: "Weight", value: "12 LBS" },
  ],
  variantLabel: "Size",
  variants: [v("3060PTB", "30X60 · 12 LBS")],
});

export const ECONOMY_TOWEL_PRODUCTS: HcProduct[] = [
  ...["single-cam-terry-towel", "double-cam-terry-towel", "full-terry-towel"].map(
    (slug) => HEALTH_CARE_PRODUCTS.towels.find((p) => p.slug === slug) as HcProduct
  ),
  POOL_TOWEL,
];

export function getEconomyTowel(slug: string): HcProduct | undefined {
  return ECONOMY_TOWEL_PRODUCTS.find((p) => p.slug === slug);
}

export function economyTowelHref(product: HcProduct): string {
  return `${ECONOMY_BASE}/${product.slug}`;
}

/**
 * BATH ROBES, a Hospitality line, from the client's "BATHROBE" sheet: six rows,
 * all 100% cotton. The Standard Terry Robe is four rows (kimono or shawl collar,
 * standard or X large), so it is four cards, each with its own code. The sheet
 * gives the waffle and honeycomb robes no collar or size, and none is invented.
 */
export const BATH_ROBE_BASE = "/hospitality/bath-linen/bath-robes";

const terryRobe = (collar: "Kimono" | "Shawl", sizeName: "Standard" | "X Large", sku: string) =>
  product(
    `standard-terry-robe-${collar.toLowerCase()}-${sizeName === "Standard" ? "standard" : "xl"}`,
    `Standard Terry Robe — ${collar}, ${sizeName}`,
    {
      blend: "100% Cotton",
      facts: [{ label: "Collar", value: collar }],
      variantLabel: "Size",
      variants: [v(sku, sizeName)],
    }
  );

const designRobe = (slug: string, name: string, sku: string) =>
  product(slug, name, {
    blend: "100% Cotton",
    variantLabel: "Design",
    variants: [v(sku, name)],
  });

export const BATH_ROBE_PRODUCTS: HcProduct[] = [
  terryRobe("Kimono", "Standard", "ROBFTKMNS"),
  terryRobe("Kimono", "X Large", "ROBFTKMNXL"),
  terryRobe("Shawl", "Standard", "ROBFTSHL"),
  terryRobe("Shawl", "X Large", "ROBFTSHLXL"),
  designRobe("waffle-robe", "Waffle Robe", "ROBWFL"),
  designRobe("honeycomb-robe", "Honeycomb Robe", "ROBHNYCMB"),
];

/** Every product with the category it sits in, for the quote page's lookup by slug. */
export function findHealthCareProduct(
  productSlug: string
): { category: string; product: HcProduct } | undefined {
  for (const [category, list] of Object.entries(HEALTH_CARE_PRODUCTS)) {
    const product = list.find((p) => p.slug === productSlug);
    if (product) return { category, product };
  }
  const economy = getEconomyTowel(productSlug);
  if (economy) return { category: "economy-bath-towels", product: economy };
  const robe = BATH_ROBE_PRODUCTS.find((p) => p.slug === productSlug);
  return robe ? { category: "bath-robes", product: robe } : undefined;
}

export function healthCareProductHref(categorySlug: string, product: HcProduct): string {
  return `/health-care/${categorySlug}/${product.slug}`;
}

/** The one-line summary a listing card shows under the title. */
export function healthCareCardSummary(product: HcProduct): string {
  const parts = [product.blend, ...product.facts.filter((f) => f.label === "Size").map((f) => f.value)];
  if (!product.facts.some((f) => f.label === "Size") && product.variantLabel === "Size") {
    parts.push(product.variants.map((x) => x.label).join(", "));
  }
  if (product.variantLabel === "Colour" && product.variants.length > 1) {
    parts.push(`${product.variants.length} colours`);
  }
  return parts.filter((p): p is string => Boolean(p)).join(" · ");
}

/** What a quantity is counted in, for the pages and the quote message. */
export function healthCareUnit(product: HcProduct): string {
  return product.case?.unit === "dozen" ? "dozen" : "pieces";
}

export function healthCareStep(product: HcProduct): number {
  return product.case?.size ?? 1;
}

export function roundUpToHealthCareCase(product: HcProduct, n: number): number {
  const step = healthCareStep(product);
  return Math.ceil(n / step) * step;
}

export type HealthCareOrderLine = { sku: string; quantity: number };

/** `?lines=` — the buyer's list, keyed on the client's own stock codes. */
export function encodeHealthCareLines(lines: HealthCareOrderLine[]): string {
  return lines.map((l) => `${l.sku}:${l.quantity}`).join(",");
}

export type HealthCareOrderRow = HcVariant & { quantity: number };

/**
 * Parses `?lines=`, keeping only codes THIS product is made in. An unknown
 * code, a duplicate or a junk quantity is dropped rather than repaired.
 */
export function parseHealthCareLines(
  product: HcProduct,
  raw: string | undefined
): HealthCareOrderRow[] {
  if (!raw) return [];
  const offered = new Map(product.variants.map((x) => [x.sku, x]));
  const seen = new Set<string>();
  const out: HealthCareOrderRow[] = [];

  for (const part of raw.split(",").slice(0, product.variants.length)) {
    const [sku, qty] = part.split(":");
    const line = offered.get(sku);
    if (!line || seen.has(sku)) continue;
    if (!/^\d{1,7}$/.test(qty ?? "")) continue;
    const n = Number(qty);
    if (n <= 0) continue;
    seen.add(sku);
    out.push({ ...line, quantity: roundUpToHealthCareCase(product, n) });
  }

  return out;
}
