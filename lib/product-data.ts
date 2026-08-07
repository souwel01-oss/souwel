/**
 * Static product detail content, pending the database.
 *
 * WHY THIS FILE EXISTS. Product pages are meant to be served from Prisma
 * (`Product` in prisma/schema.prisma), but that is blocked on T013 — .env.local
 * still holds placeholder Supabase credentials, so there is no database to read
 * from. Rather than block the page too, the content lives here in the SAME
 * SHAPE as the model: `slug`, `name`, `shortDescription`, `description`,
 * `heroImageUrl`, `galleryImageUrls`, and a `specifications` blob that maps onto
 * the model's `Json` column. Swapping this for a Prisma query should be a change
 * of data source, not a rewrite of the page.
 *
 * NO PRICE FIELD, AND THERE MUST NEVER BE ONE. This is a quote-driven B2B
 * catalogue: pricing exists only on QuoteItem, readable by Sales and Admin. A
 * price on a public product page would break the core constraint of the whole
 * project. Same for stock levels, "add to cart", and any checkout affordance.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY VALUE BELOW IS PLACEHOLDER CONTENT AND MUST BE REPLACED BEFORE LAUNCH.
 *
 * The fields are the ones a textile buyer actually asks for — composition, GSM,
 * thread count, weave, finished sizes, MOQ, lead time — and the values are
 * plausible industry figures, which is exactly what makes them dangerous: they
 * read as fact. They are not Souwel's specifications. A buyer quoting from this
 * page today would be quoting numbers nobody at the company has confirmed.
 *
 * Note also what is deliberately ABSENT: no certification marks, no test
 * standards, no compliance claims. OEKO-TEX, ISO and the like are legally
 * meaningful assertions about a business, and inventing one to fill a slot is
 * not a placeholder, it is a false claim. `certifications` is left empty and the
 * page simply omits the section until real entries are supplied.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SpecGroup = {
  title: string;
  rows: { label: string; value: string }[];
};

export type SizeRow = {
  name: string;
  /** Finished size, as supplied. Free text — imperial, metric or both. */
  size: string;
  /** Typical application, so a buyer can match it to their room mix. */
  use: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  /** Must match a slug in CATEGORIES. */
  categorySlug: string;
  /** One line, used under the H1 and as the meta description seed. */
  shortDescription: string;
  /** Two or three sentences of positioning. */
  description: string;
  heroImageUrl: string;
  heroImageAlt: string;
  galleryImageUrls: { src: string; alt: string }[];
  /** Headline figures, shown as a strip beside the gallery. */
  keyFacts: { label: string; value: string }[];
  specifications: SpecGroup[];
  sizes: SizeRow[];
  /** What can be changed on a contract order. */
  customisation: { title: string; detail: string }[];
  /** Laundry and durability notes — the question every institutional buyer asks. */
  care: string[];
  /** Which of the site's sectors this product is specified for. */
  sectors: string[];
  /**
   * Certification marks. EMPTY BY DESIGN — see the note at the top of the file.
   * Populate only with certifications the business actually holds.
   */
  certifications: string[];
};

export const PRODUCTS: Record<string, ProductDetail> = {
  "bedding-linens": {
    slug: "bedding-linens",
    name: "Bedding Linens",
    categorySlug: "hospitality",
    shortDescription:
      "Flat sheets, fitted sheets and pillowcases woven for commercial laundry cycles.",
    description:
      "A contract bedding programme built around one thing: how the sheet looks on the two-hundredth wash, not the first. Woven from long-staple cotton in percale and sateen constructions, finished for high-temperature industrial laundering, and supplied to a consistent specification across every property in a group.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "Bed made up in white contract bedding linen",
    galleryImageUrls: [
      {
        src: "/images/products/bed-sheets.jpg",
        alt: "Bed made up in white contract bedding linen",
      },
      { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
      { src: "/images/products/pillow-covers.jpg", alt: "White pillowcases on a made bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of the woven cotton structure" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton / 50-50 poly-cotton" },
      { label: "Thread count", value: "200 – 400 TC" },
      { label: "Minimum order", value: "500 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "Long-staple combed cotton" },
          { label: "Blends available", value: "100% cotton, 60/40 and 50/50 poly-cotton" },
          { label: "Weave", value: "Percale (plain) or sateen" },
          { label: "Thread count", value: "200, 250, 300, 400 TC" },
          { label: "Weight", value: "110 – 145 GSM depending on construction" },
          { label: "Yarn count", value: "Ne 40s / 60s" },
        ],
      },
      {
        title: "Finish",
        rows: [
          { label: "Treatment", value: "Mercerised, calendered, pre-shrunk" },
          { label: "Shrinkage", value: "Within 3% after five industrial washes" },
          { label: "Colour", value: "Optical white standard; dyed to shade on contract order" },
          { label: "Hem", value: "Double-needle, 25mm head hem / 12mm side and foot" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per size per construction" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Poly-bagged and carton packed; bulk packing on request" },
        ],
      },
    ],
    sizes: [
      { name: "Single", size: '66" × 100"', use: "Staff accommodation, hostels" },
      { name: "Double", size: '90" × 108"', use: "Standard guest rooms" },
      { name: "Queen", size: '96" × 112"', use: "Upper-midscale guest rooms" },
      { name: "King", size: '108" × 115"', use: "Suites and premium rooms" },
      { name: "Fitted (Queen)", size: '60" × 80" × 15"', use: "Deep mattress with topper" },
      { name: "Pillowcase", size: '20" × 30" housewife', use: "Standard; oxford on request" },
    ],
    customisation: [
      {
        title: "Woven or embroidered branding",
        detail:
          "Property logo applied to the head hem as a woven label, satin-stitch embroidery or jacquard border.",
      },
      {
        title: "Cut to your mattress",
        detail:
          "Fitted depths made to the actual mattress and topper build, rather than to a standard pocket.",
      },
      {
        title: "Dyed to shade",
        detail:
          "Matched to a supplied swatch or Pantone reference on contract quantities. Optical white is stock.",
      },
      {
        title: "Packing and labelling",
        detail:
          "Per-room packs, per-floor cartons, barcode and care labelling to your laundry's system.",
      },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F with a five-minute hold, the cycle most commercial laundries run for linen disinfection.",
      "Tunnel washer and flatwork ironer compatible; no special handling required.",
      "Chlorine bleach tolerant on optical white. Dyed shades should use oxygen bleach only.",
      "Supplied pre-shrunk, so sizing after the first industrial wash matches the sizing on the spec sheet.",
    ],
    sectors: ["Hospitality", "Health-Care", "Institutional/Laundry"],
    certifications: [],
  },
};

export function getProduct(slug: string): ProductDetail | null {
  return PRODUCTS[slug] ?? null;
}

/** Slugs that have a real detail page, for linking decisions elsewhere. */
export const PRODUCT_PAGE_SLUGS = new Set(Object.keys(PRODUCTS));
