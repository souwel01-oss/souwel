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
 * This now applies to TWENTY-FOUR products, not one. The exposure scaled with
 * the catalogue: every GSM, thread count, MOQ and lead time on the live site is
 * a number nobody at Souwel has confirmed.
 *
 * Note also what is deliberately ABSENT: no certification marks, no test
 * standards, no compliance claims. OEKO-TEX, ISO and the like are legally
 * meaningful assertions about a business, and inventing one to fill a slot is
 * not a placeholder, it is a false claim. `certifications` is left empty and the
 * page simply omits the section until real entries are supplied.
 *
 * PHOTOGRAPHY IS THE OTHER GAP, and it is worse than it looks. There are eight
 * source photographs for twenty-four products, so most pages share imagery —
 * other-textile.jpg alone appears on twenty-one of them. Reuse is survivable;
 * MISLABELLING IS NOT. There is no garment photography at all, so Patient Gowns,
 * Scrub Suits and Lab Coats deliberately show a fabric close-up rather than
 * borrowing categories/health-care.jpg, which is a photograph of folded towels.
 * Captioning towels as "clinical scrub garments" would be a false claim to a
 * buyer and a false description to a screen reader. Every `alt` in this file
 * describes what is actually in the frame; keep it that way when real
 * photography replaces these.
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

import { PRODUCT_PAGE_SLUGS } from "@/lib/product-slugs";

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

  // ── Hospitality ───────────────────────────────────────────────────────────

  "terry-towels": {
    slug: "terry-towels",
    name: "Terry Towels",
    // Listed under BOTH Hospitality and Health-Care in the nav, but a product
    // has one canonical page and one breadcrumb. Hospitality is the larger
    // programme, so it owns the page; `sectors` below records the rest.
    categorySlug: "hospitality",
    shortDescription:
      "Ring-spun cotton terry in bath, hand and face weights, built for daily laundering.",
    description:
      "A towel programme specified by weight and by how it survives the laundry, not by how it feels in the showroom. Ring-spun combed cotton loops on a reinforced ground weave, double-stitched hems, and dobby borders that hold their shape through repeated high-temperature cycles.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Folded white terry bath towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Folded white terry bath towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of terry loop pile" },
      { src: "/images/products/bar-mops.jpg", alt: "Stacked terry cloth in a linen room" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% ring-spun cotton" },
      { label: "Weight", value: "400 – 650 GSM" },
      { label: "Minimum order", value: "1,000 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "Combed ring-spun cotton" },
          { label: "Pile", value: "Loop pile; sheared face on request" },
          { label: "Ground weave", value: "2-ply reinforced" },
          { label: "Weight range", value: "400, 500, 550, 650 GSM" },
          { label: "Border", value: "Dobby, cam or plain hem" },
        ],
      },
      {
        title: "Finish",
        rows: [
          { label: "Absorbency", value: "Fully scoured; no softener residue" },
          { label: "Shrinkage", value: "Within 7% after five industrial washes" },
          { label: "Colour", value: "Optical white standard; dyed to shade on contract" },
          { label: "Hem", value: "Double-needle lock-stitch on all four sides" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces per size per weight" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bale or carton packed; per-floor packs on request" },
        ],
      },
    ],
    sizes: [
      { name: "Face towel", size: '13" × 13"', use: "Vanity and washbasin" },
      { name: "Hand towel", size: '16" × 30"', use: "Guest bathrooms, washrooms" },
      { name: "Bath towel", size: '27" × 54"', use: "Standard guest rooms" },
      { name: "Bath sheet", size: '35" × 70"', use: "Suites and premium rooms" },
      { name: "Bath mat", size: '20" × 32"', use: "Floor, heavier ground weave" },
    ],
    customisation: [
      {
        title: "Woven dobby border",
        detail: "Property name or motif woven into the border rather than printed on it.",
      },
      {
        title: "Weight to your laundry",
        detail:
          "Heavier pile reads as luxury but costs dryer time. We specify to your cycle, not to a catalogue number.",
      },
      {
        title: "Dyed to shade",
        detail: "Matched to a supplied swatch or Pantone reference on contract quantities.",
      },
      {
        title: "Packing and labelling",
        detail: "Per-room packs, barcode and care labelling to your laundry's system.",
      },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F with a five-minute hold.",
      "Wash without fabric softener — it coats the loop and destroys absorbency, which is the one property a towel is bought for.",
      "Chlorine bleach tolerant on optical white. Dyed shades should use oxygen bleach only.",
      "Tumble dry on moderate heat; over-drying shortens pile life more than washing does.",
    ],
    sectors: ["Hospitality", "Health-Care", "Institutional/Laundry"],
    certifications: [],
  },

  pillow: {
    slug: "pillow",
    name: "Pillow",
    categorySlug: "hospitality",
    shortDescription: "Filled pillows in soft, medium and firm, cased in downproof cotton cambric.",
    description:
      "Pillows specified the way a housekeeping manager thinks about them: how they recover after a night, how they wash, and how long before they are unpresentable. Supplied in matched soft/firm pairs so a room can offer both without holding two SKUs per bed.",
    heroImageUrl: "/images/products/pillow-covers.jpg",
    heroImageAlt: "White pillows stacked on a made bed",
    galleryImageUrls: [
      { src: "/images/products/pillow-covers.jpg", alt: "White pillows stacked on a made bed" },
      { src: "/images/products/bed-sheets.jpg", alt: "Pillows dressed on a contract bed" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of downproof cambric casing" },
    ],
    keyFacts: [
      { label: "Fill", value: "Microfibre, hollow fibre or down-alternative" },
      { label: "Casing", value: "233TC downproof cotton cambric" },
      { label: "Minimum order", value: "500 pcs per specification" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Fill",
        rows: [
          {
            label: "Options",
            value: "Microfibre cluster, hollow-conjugate fibre, down-alternative",
          },
          { label: "Fill weight", value: "700 – 1,300 g depending on size and firmness" },
          { label: "Firmness", value: "Soft, medium, firm" },
          { label: "Recovery", value: "Cluster fill re-lofts after compression" },
        ],
      },
      {
        title: "Casing",
        rows: [
          { label: "Fabric", value: "100% cotton cambric, 233TC downproof" },
          { label: "Construction", value: "Piped edge; box-wall on firm specification" },
          { label: "Stitching", value: "Double-stitched, turned seam" },
          { label: "Closure", value: "Fully closed; no zip on contract pillows" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per specification" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Individually bagged, carton packed" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '20" × 26"', use: "Standard guest rooms" },
      { name: "Queen", size: '20" × 30"', use: "Queen and king beds" },
      { name: "King", size: '20" × 36"', use: "Suites, wide beds" },
      { name: "Euro / continental", size: '26" × 26"', use: "Decorative front-of-bed" },
      { name: "Bolster", size: '20" × 54"', use: "Feature beds" },
    ],
    customisation: [
      {
        title: "Soft / firm pairing",
        detail: "Matched pairs per bed so guests get a choice without doubling your SKU count.",
      },
      {
        title: "Fill weight to your bed build",
        detail:
          "Specified against mattress height and headboard so the dressed bed sits correctly.",
      },
      {
        title: "Woven label",
        detail: "Property branding and firmness indicator woven into the casing seam.",
      },
      {
        title: "Packing",
        detail: "Compressed or uncompressed; compressed halves freight volume and re-lofts in 24h.",
      },
    ],
    care: [
      "Washable at 60°C / 140°F. Higher temperatures shorten fill life without improving hygiene outcomes on a laundered casing.",
      "Tumble dry thoroughly on low heat — residual moisture in the fill is the usual cause of premature failure.",
      "Always used with a pillow protector; the protector is the washable barrier, the pillow is the asset.",
      "Expect a defined service life rather than indefinite use; replace on loft loss, not on appearance.",
    ],
    sectors: ["Hospitality", "Health-Care"],
    certifications: [],
  },

  "pool-and-beach-towels": {
    slug: "pool-and-beach-towels",
    name: "Pool and Beach Towels",
    categorySlug: "hospitality",
    shortDescription:
      "Oversized terry and velour towels built for chlorine, sun and high turnover.",
    description:
      "Pool linen has a harder life than room linen: chlorine, sunscreen, sand and a wash every single day. This programme trades a little pile height for colourfastness and hem strength, because a faded, fraying pool towel is visible from across the deck.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Stacked pool towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Stacked pool towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of terry velour surface" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton terry or terry velour" },
      { label: "Weight", value: "400 – 500 GSM" },
      { label: "Minimum order", value: "1,000 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "Ring-spun cotton" },
          { label: "Face", value: "Loop terry, or sheared velour for print" },
          { label: "Weight range", value: "400, 450, 500 GSM" },
          { label: "Border", value: "Woven stripe or dobby" },
        ],
      },
      {
        title: "Finish",
        rows: [
          { label: "Colourfastness", value: "Specified for chlorine and UV exposure" },
          { label: "Shrinkage", value: "Within 7% after five industrial washes" },
          { label: "Hem", value: "Reinforced double-needle; corner bar-tacked" },
          { label: "Print", value: "Reactive print on velour face where required" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces per size" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bale packed for pool-side storage" },
        ],
      },
    ],
    sizes: [
      { name: "Pool towel", size: '30" × 60"', use: "Deck and lounger" },
      { name: "Beach towel", size: '35" × 70"', use: "Beach clubs, resorts" },
      { name: "Cabana towel", size: '40" × 70"', use: "Premium cabana service" },
    ],
    customisation: [
      {
        title: "Woven stripe in house colours",
        detail: "Stripe woven through rather than printed, so it cannot wash off or fade unevenly.",
      },
      {
        title: "Printed velour face",
        detail: "Full-colour reactive print on a sheared face for branded resort programmes.",
      },
      {
        title: "Distinct from room linen",
        detail:
          "Deliberately different colour and size so pool stock never gets absorbed into room stock — the most common way pool inventory disappears.",
      },
      { title: "Packing", detail: "Bale packed to suit deck cabinets and towel huts." },
    ],
    care: [
      "Rated for daily industrial laundering at 71°C / 160°F.",
      "Sunscreen and tanning oil are the real enemy, not chlorine — pre-treat or run a dedicated pool-linen cycle.",
      "Oxygen bleach only on coloured stock; chlorine bleach will strip a woven stripe.",
      "Do not use fabric softener; it reduces absorbency and traps oils in the pile.",
    ],
    sectors: ["Hospitality"],
    certifications: [],
  },

  "duvet-pillow-covers": {
    slug: "duvet-pillow-covers",
    name: "Duvet / Pillow Covers",
    categorySlug: "hospitality",
    shortDescription:
      "Duvet covers and pillowcases in matched percale or sateen, cut for fast bed-making.",
    description:
      "Covers are what housekeeping actually handles, so they are specified around the change: an opening wide enough to work quickly, closures that survive the laundry, and a cut that matches the duvet so the corners fill.",
    heroImageUrl: "/images/products/duvet-covers.jpg",
    heroImageAlt: "White duvet cover on a dressed bed",
    galleryImageUrls: [
      { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover on a dressed bed" },
      { src: "/images/products/pillow-covers.jpg", alt: "Matching pillowcases" },
      { src: "/images/products/bed-sheets.jpg", alt: "Bed dressed in a matched linen set" },
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
        ],
      },
      {
        title: "Make-up",
        rows: [
          { label: "Closure", value: "Envelope flap standard; hidden button placket on request" },
          { label: "Opening", value: "Full-width foot opening for fast changes" },
          { label: "Corners", value: "Internal corner ties to stop duvet migration" },
          { label: "Hem", value: "Double-needle, turned and stitched" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per size per construction" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Poly-bagged and carton packed" },
        ],
      },
    ],
    sizes: [
      { name: "Single", size: '54" × 78"', use: "Staff accommodation, hostels" },
      { name: "Double", size: '78" × 86"', use: "Standard guest rooms" },
      { name: "Queen", size: '90" × 94"', use: "Upper-midscale guest rooms" },
      { name: "King", size: '104" × 94"', use: "Suites and premium rooms" },
      { name: "Housewife pillowcase", size: '20" × 30"', use: "Standard" },
      { name: "Oxford pillowcase", size: '20" × 30" + 2" flange', use: "Front-of-bed dressing" },
    ],
    customisation: [
      {
        title: "Cut to your duvet",
        detail:
          "Made to the actual duvet, not a nominal size, so the corners fill and stay filled.",
      },
      {
        title: "Closure to suit housekeeping",
        detail: "Envelope flap is fastest; button placket looks more considered. Both are offered.",
      },
      {
        title: "Woven or embroidered branding",
        detail: "Applied to the flap or the pillowcase cuff as a woven label or satin-stitch mark.",
      },
      { title: "Dyed to shade", detail: "Matched to a supplied swatch on contract quantities." },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F with a five-minute hold.",
      "Tunnel washer and flatwork ironer compatible.",
      "Chlorine bleach tolerant on optical white. Dyed shades should use oxygen bleach only.",
      "Supplied pre-shrunk, so sizing after the first industrial wash matches the spec sheet.",
    ],
    sectors: ["Hospitality", "Health-Care"],
    certifications: [],
  },

  barmops: {
    slug: "barmops",
    name: "Barmops",
    categorySlug: "hospitality",
    shortDescription: "Heavy ribbed cotton bar towels for spills, glassware and counter work.",
    description:
      "The workhorse of every bar and service station. Heavy ribbed cotton that absorbs fast, wrings out fast and takes a hot wash daily. Bought by the dozen and used until they are rags, so the specification is about cost per wash, not appearance.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Stack of ribbed cotton bar mop towels",
    galleryImageUrls: [
      { src: "/images/products/bar-mops.jpg", alt: "Stack of ribbed cotton bar mop towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of ribbed cotton structure" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton" },
      { label: "Weight", value: "24 – 32 oz per dozen" },
      { label: "Minimum order", value: "2,000 pcs" },
      { label: "Lead time", value: "25 – 40 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton, open-end or ring-spun" },
          { label: "Weave", value: "Ribbed / herringbone terry" },
          { label: "Weight", value: "24, 28, 32 oz per dozen" },
          { label: "Hem", value: "Overlocked all round" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Absorbency", value: "Fully scoured, no softener finish" },
          { label: "Lint", value: "Low-lint; not lint-free — see Glass Towel for that" },
          { label: "Shrinkage", value: "Within 8% after five industrial washes" },
          { label: "Colour", value: "Bleached white or dyed; colour-coding available" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "2,000 pieces" },
          { label: "Lead time", value: "25 – 40 days from approved sample" },
          { label: "Packing", value: "Dozen-banded, bale packed" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '16" × 19"', use: "Bar and service station" },
      { name: "Large", size: '18" × 18"', use: "Kitchen and prep counter" },
    ],
    customisation: [
      {
        title: "Colour-coded by area",
        detail:
          "Different stripe or body colour per department, so bar cloths stop migrating into the kitchen.",
      },
      { title: "Weight", detail: "Heavier cloth lasts longer per wash but costs more per piece." },
      { title: "Woven stripe", detail: "Centre or border stripe in a house colour." },
      { title: "Packing", detail: "Dozen-banded for issue and stock control." },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F.",
      "Never use fabric softener — it is what turns an absorbent bar cloth into one that pushes liquid around.",
      "Expect a defined service life; these are consumables, not assets.",
      "Wash separately from room linen. Kitchen soiling and grease will transfer.",
    ],
    sectors: ["Hospitality", "Institutional/Laundry"],
    certifications: [],
  },

  "kitchen-towels": {
    slug: "kitchen-towels",
    name: "Kitchen Towels",
    categorySlug: "hospitality",
    shortDescription: "Cotton and cotton-linen kitchen cloths for drying, handling and prep.",
    description:
      "Kitchen cloth specified by job: a flat-woven cloth that dries without lint, and a heavier cloth that can be folded to handle hot pans. Both take a daily hot wash and both are colour-codeable to keep sections separate.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Folded kitchen towels",
    galleryImageUrls: [
      { src: "/images/products/bar-mops.jpg", alt: "Folded kitchen towels" },
      { src: "/images/products/napkins.jpg", alt: "Woven cotton cloth detail" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton or cotton-linen union" },
      { label: "Weight", value: "180 – 260 GSM" },
      { label: "Minimum order", value: "2,000 pcs" },
      { label: "Lead time", value: "25 – 40 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton, or 50/50 cotton-linen union" },
          { label: "Weave", value: "Plain or herringbone; waffle on request" },
          { label: "Weight", value: "180, 220, 260 GSM" },
          { label: "Hem", value: "Turned and double-stitched, hanging loop optional" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Lint", value: "Low-lint on the linen union; suitable for drying" },
          { label: "Heat", value: "Folded thickness rated for short pan handling, not as a mitt" },
          { label: "Shrinkage", value: "Within 6% after five industrial washes" },
          { label: "Colour", value: "White, or dyed for departmental colour-coding" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "2,000 pieces" },
          { label: "Lead time", value: "25 – 40 days from approved sample" },
          { label: "Packing", value: "Dozen-banded, bale packed" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '20" × 28"', use: "General kitchen use" },
      { name: "Large", size: '24" × 36"', use: "Pass and plating" },
    ],
    customisation: [
      {
        title: "Colour-coded by section",
        detail: "Larder, pastry, pass and wash-up each on their own colour.",
      },
      { title: "Hanging loop", detail: "Corner loop for rail storage at the section." },
      {
        title: "Cotton-linen union",
        detail: "Higher linen content dries glass and steel lint-free.",
      },
      { title: "Packing", detail: "Dozen-banded for issue and stock control." },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F.",
      "Wash separately from room and restaurant linen — grease transfer is the reason kitchen cloth should never share a load.",
      "No fabric softener; it destroys the drying performance these are bought for.",
      "Treat as consumables with a planned replacement cycle.",
    ],
    sectors: ["Hospitality", "Institutional/Laundry"],
    certifications: [],
  },

  "duvet-comforters": {
    slug: "duvet-comforters",
    name: "Duvet Comforters",
    categorySlug: "hospitality",
    shortDescription:
      "Baffle-box and channel-quilted duvets in seasonal weights, cased in downproof cotton.",
    description:
      "The duvet is the one piece of bedding a guest is under all night and never sees. It is specified on warmth, on how evenly the fill stays put, and on whether it can be laundered in-house or has to go out — which is a running cost decision, not a comfort one.",
    heroImageUrl: "/images/products/duvet-covers.jpg",
    heroImageAlt: "Duvet on a dressed contract bed",
    galleryImageUrls: [
      { src: "/images/products/duvet-covers.jpg", alt: "Duvet on a dressed contract bed" },
      { src: "/images/products/bed-sheets.jpg", alt: "Bed dressed with duvet and linen" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of quilted casing" },
    ],
    keyFacts: [
      { label: "Fill", value: "Microfibre or down-alternative" },
      { label: "Warmth", value: "4.5 / 10.5 / 13.5 tog" },
      { label: "Minimum order", value: "300 pcs per specification" },
      { label: "Lead time", value: "40 – 55 days" },
    ],
    specifications: [
      {
        title: "Fill",
        rows: [
          { label: "Options", value: "Microfibre cluster, hollow-conjugate, down-alternative" },
          {
            label: "Warmth ratings",
            value: "4.5 tog summer, 10.5 tog all-season, 13.5 tog winter",
          },
          { label: "Fill weight", value: "200 – 500 gsm depending on tog and size" },
          {
            label: "Distribution",
            value: "Baffle-box construction; channel quilt on lighter togs",
          },
        ],
      },
      {
        title: "Casing",
        rows: [
          { label: "Fabric", value: "100% cotton cambric, 233TC downproof" },
          { label: "Edge", value: "Piped and double-stitched" },
          { label: "Corner", value: "Corner loops for cover ties" },
          { label: "Quilting", value: "Stitch-through or true baffle wall" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "300 pieces per specification" },
          { label: "Lead time", value: "40 – 55 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Compressed and bagged; re-lofts within 24 hours" },
        ],
      },
    ],
    sizes: [
      { name: "Single", size: '54" × 78"', use: "Staff accommodation, hostels" },
      { name: "Double", size: '78" × 86"', use: "Standard guest rooms" },
      { name: "Queen", size: '90" × 94"', use: "Upper-midscale guest rooms" },
      { name: "King", size: '104" × 94"', use: "Suites and premium rooms" },
    ],
    customisation: [
      {
        title: "Tog to your building",
        detail:
          "Specified against how the property actually heats. A 13.5 tog duvet in a warm building generates complaints, not comfort.",
      },
      {
        title: "Baffle-box vs stitch-through",
        detail: "Baffle-box holds loft and costs more; stitch-through is lighter and cheaper.",
      },
      {
        title: "In-house launderable",
        detail:
          "Specified to your machine capacity if you want to avoid outsourced duvet cleaning.",
      },
      {
        title: "Corner loops",
        detail: "Positioned to match your cover ties so the duvet stays put.",
      },
    ],
    care: [
      "Washable at 60°C / 140°F where machine capacity allows; check drum size against duvet weight when wet.",
      "Dry thoroughly on low heat. A duvet that goes back on a bed damp is the most common source of odour complaints.",
      "Always used inside a cover; the cover is the washable layer.",
      "Air rather than wash between guests; wash on a scheduled cycle, not on turnover.",
    ],
    sectors: ["Hospitality"],
    certifications: [],
  },

  "salon-and-spa": {
    slug: "salon-and-spa",
    name: "Salon and Spa",
    categorySlug: "hospitality",
    shortDescription:
      "Treatment linen, wraps and towels specified for oils, bleach and constant laundering.",
    description:
      "Spa linen fails differently from room linen. Massage oil does not wash out of cotton the way body soil does, and salon bleach will mark anything it touches. This programme is specified around those two facts: bleach-resistant shades, oil-releasing constructions, and sizes cut for treatment couches rather than beds.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Rolled spa towels and treatment linen",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Rolled spa towels and treatment linen" },
      { src: "/images/products/bed-sheets.jpg", alt: "Treatment couch dressed in spa linen" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of towelling structure" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton; poly-cotton for bleach areas" },
      { label: "Weight", value: "350 – 500 GSM towelling" },
      { label: "Minimum order", value: "500 pcs per item" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Towelling", value: "Ring-spun cotton terry, 350 – 500 GSM" },
          { label: "Couch covers", value: "Poly-cotton percale, fitted with face-hole option" },
          { label: "Wraps", value: "Towelling with hook-and-loop or press-stud closure" },
          { label: "Robes", value: "Waffle or velour, shawl or kimono collar" },
        ],
      },
      {
        title: "Finish",
        rows: [
          { label: "Bleach exposure", value: "Bleach-resistant shades available for salon areas" },
          { label: "Oil release", value: "Scoured finish; no softener residue" },
          { label: "Shrinkage", value: "Within 7% after five industrial washes" },
          {
            label: "Colour",
            value: "White, charcoal and stone hold up best against product marking",
          },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per item" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Poly-bagged, carton packed" },
        ],
      },
    ],
    sizes: [
      { name: "Couch cover (fitted)", size: '75" × 28" × 6"', use: "Standard treatment couch" },
      { name: "Couch sheet (flat)", size: '78" × 46"', use: "Over-sheet and modesty draping" },
      { name: "Treatment towel", size: '27" × 54"', use: "General treatment use" },
      { name: "Hand / face towel", size: '16" × 30"', use: "Facial and manicure stations" },
      { name: "Body wrap", size: 'One size, 60" chest', use: "Changing and relaxation areas" },
      { name: "Robe", size: "S/M, L/XL", use: "Relaxation and pool areas" },
    ],
    customisation: [
      {
        title: "Face-hole couch covers",
        detail: "Reinforced face aperture positioned to your couch model.",
      },
      {
        title: "Bleach-tolerant colourways",
        detail: "Separate shade for salon areas so bleach marking does not condemn stock.",
      },
      { title: "Embroidered branding", detail: "Spa mark on robes, wraps and larger towels." },
      {
        title: "Area colour-coding",
        detail: "Treatment, salon and pool on distinct shades to keep circulation separate.",
      },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F.",
      "Massage oil needs a dedicated cycle with an oil-releasing detergent — a normal linen wash leaves residue that will eventually self-heat in the dryer.",
      "Never use fabric softener on treatment towelling.",
      "Keep salon stock on its own wash; bleach carry-over will mark spa linen.",
    ],
    sectors: ["Hospitality"],
    certifications: [],
  },

  "table-covers-napkins": {
    slug: "table-covers-napkins",
    name: "Table Covers / Napkins",
    categorySlug: "hospitality",
    shortDescription: "Banquet cloths, slip cloths and napkins in spun poly or cotton-rich damask.",
    description:
      "Table linen is judged from across a room: how the cloth falls, whether the fold holds, and whether it looks the same on the fiftieth cover as the first. Spun polyester for volume banqueting, cotton-rich damask where the table is the product.",
    heroImageUrl: "/images/products/napkins.jpg",
    heroImageAlt: "Folded table napkins on a laid table",
    galleryImageUrls: [
      { src: "/images/products/napkins.jpg", alt: "Folded table napkins on a laid table" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of damask weave" },
      { src: "/images/products/bed-sheets.jpg", alt: "Pressed linen detail" },
    ],
    keyFacts: [
      { label: "Composition", value: "Spun polyester or cotton-rich damask" },
      { label: "Weight", value: "190 – 240 GSM" },
      { label: "Minimum order", value: "500 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Spun polyester", value: "100% spun poly, 190 – 220 GSM, momie or plain" },
          { label: "Cotton-rich", value: "80/20 or 100% cotton damask, 220 – 240 GSM" },
          { label: "Weave", value: "Plain, momie, satin band or jacquard damask" },
          { label: "Hem", value: "Mitred corners, double-stitched" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Stain release", value: "Soil-release finish on spun polyester" },
          { label: "Press", value: "Damask requires ironing; spun poly is press-free" },
          { label: "Shrinkage", value: "Within 2% (poly) / 4% (cotton) after five washes" },
          { label: "Drape", value: "Weighted hem available for banquet drops" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per size" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Flat packed in dozens" },
        ],
      },
    ],
    sizes: [
      { name: "Napkin", size: '20" × 20"', use: "À la carte and banquet" },
      { name: "Cocktail napkin", size: '12" × 12"', use: "Bar and lounge service" },
      { name: "Slip cloth", size: '36" × 36"', use: "Over-cloth on a dressed table" },
      { name: "Square cloth", size: '54" × 54"', use: "Small square tables" },
      { name: "Round cloth", size: '90" round', use: "5ft banquet round" },
      { name: "Banquet cloth", size: '90" × 156"', use: "6ft trestle, floor drop" },
    ],
    customisation: [
      {
        title: "Jacquard house pattern",
        detail: "Property motif woven into the damask rather than applied to it.",
      },
      {
        title: "Cut to your tables",
        detail: "Measured to your actual trestle and round sizes for a specified drop.",
      },
      { title: "Satin band", detail: "Woven band border in a house colour." },
      {
        title: "Dyed to shade",
        detail: "Matched to a supplied swatch or Pantone reference on contract quantities.",
      },
    ],
    care: [
      "Spun polyester washes at 60°C / 140°F and comes out of the dryer ready to fold.",
      "Cotton damask needs 71°C / 160°F and a flatwork ironer to look like damask.",
      "Treat food staining promptly; a soil-release finish shortens the window but does not remove it.",
      "Store flat and folded, not hung — a crease line in a banquet cloth is visible from every seat.",
    ],
    sectors: ["Hospitality"],
    certifications: [],
  },

  "mattress-protector": {
    slug: "mattress-protector",
    name: "Mattress Protector",
    categorySlug: "hospitality",
    shortDescription:
      "Quilted and waterproof-membrane protectors that keep the mattress asset serviceable.",
    description:
      "A mattress is one of the most expensive items in a guest room and the one most easily written off by a single incident. The protector is the cheap, washable layer that stands between the two — specified for the depth of your actual mattress build so it does not ride up.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "Mattress dressed with a fitted protector",
    galleryImageUrls: [
      { src: "/images/products/bed-sheets.jpg", alt: "Mattress dressed with a fitted protector" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of quilted protector surface" },
    ],
    keyFacts: [
      { label: "Types", value: "Quilted, waterproof membrane, or both" },
      { label: "Skirt depth", value: "12 – 18 inches" },
      { label: "Minimum order", value: "300 pcs per size" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Face", value: "Cotton-rich jacquard or poly-cotton percale" },
          { label: "Fill", value: "Hollow-fibre wadding, 120 – 200 gsm" },
          { label: "Membrane", value: "Breathable polyurethane on waterproof specification" },
          { label: "Skirt", value: "Knitted stretch skirt with elasticated pocket" },
        ],
      },
      {
        title: "Performance",
        rows: [
          {
            label: "Waterproofing",
            value: "Membrane specification is liquid-proof, not just resistant",
          },
          { label: "Breathability", value: "Moisture-vapour permeable; not a plastic sheet" },
          { label: "Noise", value: "Membrane bonded to face fabric to avoid rustle" },
          { label: "Shrinkage", value: "Within 5% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "300 pieces per size" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Individually bagged, carton packed" },
        ],
      },
    ],
    sizes: [
      { name: "Single", size: '36" × 75"', use: "Staff accommodation, hostels" },
      { name: "Double", size: '54" × 75"', use: "Standard guest rooms" },
      { name: "Queen", size: '60" × 80"', use: "Upper-midscale guest rooms" },
      { name: "King", size: '78" × 80"', use: "Suites and premium rooms" },
    ],
    customisation: [
      {
        title: "Skirt to your mattress build",
        detail:
          "Measured over mattress plus topper. A protector that will not reach is one housekeeping stops fitting.",
      },
      {
        title: "Waterproof only where needed",
        detail:
          "Membrane specification on accessible and family rooms, quilted elsewhere — the membrane costs more and launders harder.",
      },
      {
        title: "Anchor style",
        detail: "Full skirt, elasticated corner straps, or zipped encasement.",
      },
      { title: "Labelling", detail: "Size and orientation labelled for fast fitting on turnover." },
    ],
    care: [
      "Quilted protectors wash at 71°C / 160°F. Membrane protectors are limited to 60°C / 140°F — higher will delaminate the film.",
      "Tumble dry membrane types on low only; heat is what kills a waterproof layer, not washing.",
      "Do not iron or dry-clean membrane specifications.",
      "Inspect on every strip; a failed membrane is invisible until the mattress is already damaged.",
    ],
    sectors: ["Hospitality", "Health-Care"],
    certifications: [],
  },

  "terry-grill-pads": {
    slug: "terry-grill-pads",
    name: "Terry Grill Pads",
    categorySlug: "hospitality",
    shortDescription: "Thick multi-layer terry pads for grill cleaning and hot-surface handling.",
    description:
      "A heavy, multi-ply terry pad for the grill station: thick enough to work a hot surface, cheap enough to be treated as a consumable, and constructed so it does not shed lint into food areas.",
    heroImageUrl: "/images/products/bar-mops.jpg",
    heroImageAlt: "Thick terry cloth pads",
    galleryImageUrls: [
      { src: "/images/products/bar-mops.jpg", alt: "Thick terry cloth pads" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of multi-ply terry" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton terry" },
      { label: "Construction", value: "Multi-ply, edge-bound" },
      { label: "Minimum order", value: "2,000 pcs" },
      { label: "Lead time", value: "25 – 40 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton terry" },
          { label: "Plies", value: "3 or 4 ply, quilted through" },
          { label: "Edge", value: "Bias-bound and bar-tacked at corners" },
          { label: "Weight", value: "600 – 900 GSM finished" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Heat", value: "Rated for brief contact with hot surfaces, not as a heat mitt" },
          { label: "Lint", value: "Low-lint construction for food areas" },
          { label: "Absorbency", value: "Fully scoured, no softener finish" },
          { label: "Service life", value: "Consumable; replace on scorch or fraying" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "2,000 pieces" },
          { label: "Lead time", value: "25 – 40 days from approved sample" },
          { label: "Packing", value: "Dozen-banded, bale packed" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
        ],
      },
    ],
    sizes: [
      { name: "Standard pad", size: '8" × 8"', use: "Grill and flat-top" },
      { name: "Large pad", size: '10" × 12"', use: "Heavy grill sections" },
    ],
    customisation: [
      { title: "Ply count", detail: "Thicker pads last longer per piece and cost more per wash." },
      {
        title: "Colour-coding",
        detail: "Distinct colour so grill pads never enter the linen stream.",
      },
      { title: "Bound edge colour", detail: "Binding tape in a section colour." },
      { title: "Packing", detail: "Dozen-banded for issue and stock control." },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F.",
      "Wash separately. Grease and carbon will transfer into any load these share.",
      "Never use fabric softener — on a grill pad it is a fire risk, not just a performance loss.",
      "Withdraw on scorching or fraying. These are consumables with a short planned life.",
    ],
    sectors: ["Hospitality", "Institutional/Laundry"],
    certifications: [],
  },

  "glass-towel": {
    slug: "glass-towel",
    name: "Glass Towel",
    categorySlug: "hospitality",
    shortDescription: "Lint-free linen-union cloths for polishing glassware and cutlery.",
    description:
      "The one cloth in the building that is judged on what it leaves behind. A high-linen union weave that dries glass and cutlery without depositing lint and without smearing — which cotton terry cannot do, whatever its weight.",
    heroImageUrl: "/images/products/napkins.jpg",
    heroImageAlt: "Folded linen glass polishing cloths",
    galleryImageUrls: [
      { src: "/images/products/napkins.jpg", alt: "Folded linen glass polishing cloths" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of linen union weave" },
    ],
    keyFacts: [
      { label: "Composition", value: "Linen-cotton union, linen-rich" },
      { label: "Weight", value: "200 – 240 GSM" },
      { label: "Minimum order", value: "1,000 pcs" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "60/40 or 70/30 linen-cotton union" },
          { label: "Weave", value: "Plain or herringbone, tightly set" },
          { label: "Weight", value: "200, 220, 240 GSM" },
          { label: "Hem", value: "Turned and double-stitched, hanging loop optional" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Lint", value: "Lint-free on glass and polished steel — the whole point" },
          { label: "Absorbency", value: "Improves with washing as the linen breaks in" },
          { label: "Smear", value: "No softener finish; softener is what causes streaking" },
          { label: "Shrinkage", value: "Within 6% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Packing", value: "Dozen-banded, flat packed" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '20" × 30"', use: "Glass and cutlery polishing" },
      { name: "Large", size: '24" × 36"', use: "Banquet polishing stations" },
    ],
    customisation: [
      {
        title: "Linen content",
        detail: "Higher linen polishes better and costs more; specified to your service standard.",
      },
      {
        title: "Woven stripe",
        detail: "Border stripe so glass cloths are visually distinct from kitchen cloth.",
      },
      { title: "Hanging loop", detail: "Corner loop for polishing station rails." },
      { title: "Packing", detail: "Dozen-banded for issue and stock control." },
    ],
    care: [
      "Wash at 71°C / 160°F with no fabric softener and no optical brightener carry-over.",
      "Softener is the single most common cause of smeared glassware. Keep these on a dedicated wash formula.",
      "Do not wash with terry — cotton lint from towelling will contaminate them and defeat the purpose.",
      "Performance improves over the first several washes as the linen softens; do not judge a new cloth on day one.",
    ],
    sectors: ["Hospitality"],
    certifications: [],
  },

  "bib-apron": {
    slug: "bib-apron",
    name: "Bib Apron",
    categorySlug: "hospitality",
    shortDescription:
      "Poly-cotton and cotton-drill bib aprons for kitchen, service and front-of-house.",
    description:
      "Aprons are uniform, and uniform is judged on the fiftieth wash. Poly-cotton drill for the kitchen where stain release and press-free finish matter, heavier cotton canvas front-of-house where the apron is part of the look.",
    heroImageUrl: "/images/products/industrial-aprons.jpg",
    heroImageAlt: "Bib aprons hanging in a service area",
    galleryImageUrls: [
      {
        src: "/images/products/industrial-aprons.jpg",
        alt: "Bib aprons hanging in a service area",
      },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of drill weave and stitching" },
    ],
    keyFacts: [
      { label: "Composition", value: "65/35 poly-cotton drill or 100% cotton canvas" },
      { label: "Weight", value: "210 – 280 GSM" },
      { label: "Minimum order", value: "500 pcs per style" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fabric", value: "65/35 poly-cotton drill, or 100% cotton canvas" },
          { label: "Weight", value: "210, 240, 280 GSM" },
          { label: "Stitching", value: "Double-needle throughout; bar-tacked stress points" },
          {
            label: "Pockets",
            value: "Split front pocket standard; chest and pen pockets optional",
          },
        ],
      },
      {
        title: "Fit and finish",
        rows: [
          { label: "Neck", value: "Adjustable slider or fixed loop" },
          { label: "Ties", value: "Extra-long waist ties for front-tying" },
          { label: "Stain release", value: "Soil-release finish on poly-cotton" },
          { label: "Shrinkage", value: "Within 4% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per style per colour" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Poly-bagged, carton packed by size" },
        ],
      },
    ],
    sizes: [
      { name: "Standard bib", size: '28" × 34"', use: "Kitchen and service" },
      { name: "Long bib", size: '32" × 40"', use: "Butchery, wash-up" },
      { name: "Short bistro", size: '28" × 26"', use: "Front-of-house, bar" },
      { name: "Waist apron", size: '28" × 18"', use: "Service and barista" },
    ],
    customisation: [
      {
        title: "Embroidered branding",
        detail:
          "Property or outlet mark on the bib or pocket, positioned to your uniform standard.",
      },
      {
        title: "Colour by outlet",
        detail: "Distinct colours per restaurant, bar or department across one group.",
      },
      {
        title: "Pocket configuration",
        detail: "Split, chest, pen and thermometer pockets to spec.",
      },
      {
        title: "Fabric weight",
        detail: "Heavier canvas front-of-house, lighter drill for hot kitchens.",
      },
    ],
    care: [
      "Rated for industrial laundering at 71°C / 160°F.",
      "Poly-cotton drill comes out of the dryer press-free; cotton canvas will need pressing to look like uniform.",
      "Wash separately from linen — kitchen soiling and grease transfer.",
      "Treat food and oil staining promptly; soil-release finish widens the window, it does not remove it.",
    ],
    sectors: ["Hospitality", "Institutional/Laundry"],
    certifications: [],
  },

  // ── Health-Care ───────────────────────────────────────────────────────────

  "bed-linens": {
    slug: "bed-linens",
    name: "Bed Linens",
    categorySlug: "health-care",
    shortDescription:
      "Ward sheets, draw sheets and pillowcases specified for thermal disinfection cycles.",
    description:
      "Health-care bed linen is specified around the wash, not the bed. It has to survive thermal disinfection at 71°C with a held dwell, repeated far more often than hotel linen, and it has to come off the ironer flat enough to make a bed at speed on a ward round.",
    heroImageUrl: "/images/products/bed-sheets.jpg",
    heroImageAlt: "White ward bed linen",
    galleryImageUrls: [
      { src: "/images/products/bed-sheets.jpg", alt: "White ward bed linen" },
      // health-care.jpg is a photograph of folded towels. Captioned honestly
      // here rather than passed off as ward bedding.
      { src: "/images/categories/health-care.jpg", alt: "Folded white health-care linen" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of the woven structure" },
    ],
    keyFacts: [
      { label: "Composition", value: "50/50 poly-cotton or 100% cotton" },
      { label: "Weight", value: "130 – 150 GSM" },
      { label: "Minimum order", value: "1,000 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "50/50 poly-cotton standard; 100% cotton on request" },
          { label: "Weave", value: "Plain weave, tightly set" },
          { label: "Thread count", value: "144 – 200 TC" },
          { label: "Weight", value: "130 – 150 GSM" },
          { label: "Yarn count", value: "Ne 30s / 40s" },
        ],
      },
      {
        title: "Finish",
        rows: [
          {
            label: "Disinfection",
            value: "Specified for 71°C / 160°F thermal disinfection cycles",
          },
          { label: "Shrinkage", value: "Within 3% after five industrial washes" },
          { label: "Colour", value: "Optical white; coloured coding available by ward" },
          { label: "Hem", value: "Double-needle, 25mm head hem" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces per size" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Flat sheet (single)", size: '70" × 108"', use: "Standard ward bed" },
      { name: "Flat sheet (double)", size: '90" × 108"', use: "Maternity, private rooms" },
      { name: "Fitted sheet", size: '36" × 80" × 10"', use: "Standard hospital mattress" },
      { name: "Draw sheet", size: '54" × 90"', use: "Patient repositioning" },
      { name: "Pillowcase", size: '20" × 30" housewife', use: "Standard ward" },
    ],
    customisation: [
      {
        title: "Ward colour-coding",
        detail: "Distinct shades or woven stripes per ward or department to control circulation.",
      },
      {
        title: "Cut to your mattress",
        detail: "Fitted depths made to the actual hospital mattress and pressure-relief overlay.",
      },
      {
        title: "Durability grade",
        detail: "Heavier construction where wash frequency is highest, costed per wash cycle.",
      },
      {
        title: "Labelling",
        detail: "Barcode, RFID pocket and date-coding to your tracking system.",
      },
    ],
    care: [
      "Specified for thermal disinfection: 71°C / 160°F with a three-minute minimum hold, or 65°C / 150°F with ten minutes.",
      "Tunnel washer and flatwork ironer compatible.",
      "Chlorine bleach tolerant on optical white.",
      "Supplied pre-shrunk so fitted sizing holds after the first disinfection cycle.",
    ],
    sectors: ["Health-Care", "Institutional/Laundry"],
    certifications: [],
  },

  "pillow-covers": {
    slug: "pillow-covers",
    name: "Pillow Covers",
    categorySlug: "health-care",
    shortDescription:
      "Wipe-clean and launderable pillow protectors and cases for clinical settings.",
    description:
      "In a clinical setting the pillow cover is a barrier before it is a furnishing. Supplied either as a wipe-clean membrane protector that stays on the pillow between patients, or as a launderable case that goes through the same disinfection cycle as the bed linen.",
    heroImageUrl: "/images/products/pillow-covers.jpg",
    heroImageAlt: "White pillow covers",
    galleryImageUrls: [
      { src: "/images/products/pillow-covers.jpg", alt: "White pillow covers" },
      { src: "/images/products/bed-sheets.jpg", alt: "Pillows dressed on a ward bed" },
    ],
    keyFacts: [
      { label: "Types", value: "Wipe-clean membrane or launderable poly-cotton" },
      { label: "Closure", value: "Zipped encasement or housewife" },
      { label: "Minimum order", value: "1,000 pcs per size" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Launderable", value: "50/50 poly-cotton, 144 – 200 TC" },
          { label: "Barrier", value: "Polyurethane-coated polyester, wipe-clean" },
          { label: "Closure", value: "Housewife opening, or full zip encasement" },
          { label: "Seams", value: "Double-stitched; welded seams on barrier specification" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Fluid barrier", value: "Barrier specification is liquid-proof and wipeable" },
          { label: "Breathability", value: "Moisture-vapour permeable on coated types" },
          { label: "Disinfection", value: "Launderable types rated for 71°C / 160°F" },
          { label: "Shrinkage", value: "Within 3% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces per size" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '20" × 26"', use: "General ward" },
      { name: "Queen", size: '20" × 30"', use: "Private rooms, maternity" },
      { name: "Encasement (standard)", size: '20" × 26" zipped', use: "Barrier protection" },
    ],
    customisation: [
      {
        title: "Barrier or launderable",
        detail:
          "Barrier covers reduce laundry volume but need wipe-down protocols; launderable fits an existing linen stream.",
      },
      { title: "Ward colour-coding", detail: "Distinct shades or piping per department." },
      {
        title: "Zip style",
        detail: "Concealed flap-over zip to prevent fluid ingress at the closure.",
      },
      {
        title: "Labelling",
        detail: "Barcode, RFID pocket and date-coding to your tracking system.",
      },
    ],
    care: [
      "Launderable covers: thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Barrier covers: wipe down with your approved disinfectant; check chemical compatibility with the coating before adopting.",
      "Do not tumble dry barrier types on high heat — heat delaminates the coating.",
      "Inspect barrier covers on every change; a split seam removes the protection entirely.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },

  "patient-gowns": {
    slug: "patient-gowns",
    name: "Patient Gowns",
    categorySlug: "health-care",
    shortDescription:
      "Poly-cotton gowns with back or side closures, cut for access and repeated laundering.",
    description:
      "A patient gown has to be quick to put on, quick to remove around lines and dressings, and dignified enough that patients will actually wear it. Made in poly-cotton that holds its shape through thermal disinfection, with closures that survive the same.",
    // NO GARMENT PHOTOGRAPHY EXISTS YET, so this shows the fabric rather than a
    // stand-in. The obvious filler — /images/categories/health-care.jpg — is a
    // photograph of folded towels, and captioning towels as "clinical garments"
    // on a Patient Gowns page is a false claim to a buyer and a false alt text
    // to a screen reader. A fabric close-up is at least what it says it is.
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Close-up of the poly-cotton fabric used for patient gowns",
    galleryImageUrls: [
      {
        src: "/images/products/other-textile.jpg",
        alt: "Close-up of the poly-cotton fabric used for patient gowns",
      },
    ],
    keyFacts: [
      { label: "Composition", value: "65/35 poly-cotton" },
      { label: "Weight", value: "150 – 180 GSM" },
      { label: "Minimum order", value: "1,000 pcs per size" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fabric", value: "65/35 poly-cotton poplin" },
          { label: "Weight", value: "150, 165, 180 GSM" },
          { label: "Closure", value: "Back ties, side ties, or press-stud shoulder" },
          { label: "Seams", value: "Overlocked and double-stitched at stress points" },
        ],
      },
      {
        title: "Clinical use",
        rows: [
          { label: "Access", value: "Full back opening; shoulder opening for IV and line access" },
          { label: "Dignity", value: "Overlap panel option on back opening" },
          { label: "Disinfection", value: "Rated for 71°C / 160°F thermal disinfection" },
          { label: "Shrinkage", value: "Within 4% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces per size" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed by size for central laundry" },
        ],
      },
    ],
    sizes: [
      { name: "Small", size: "Chest 36 – 38″", use: "General ward" },
      { name: "Medium", size: "Chest 40 – 42″", use: "General ward" },
      { name: "Large", size: "Chest 44 – 46″", use: "General ward" },
      { name: "X-Large", size: "Chest 48 – 52″", use: "Bariatric and general" },
      { name: "Paediatric", size: "Age 4 – 12 range", use: "Children's wards" },
    ],
    customisation: [
      {
        title: "Closure style",
        detail: "Back tie, side tie or press-stud shoulder, chosen for the access your unit needs.",
      },
      {
        title: "Department colour-coding",
        detail: "Distinct colours by ward, theatre or day unit.",
      },
      {
        title: "Overlap panel",
        detail: "Additional rear panel where patient dignity is a priority.",
      },
      {
        title: "Labelling",
        detail: "Size, department and RFID or barcode to your tracking system.",
      },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Poly-cotton returns press-free from the dryer; no ironing required.",
      "Chlorine bleach tolerant on white; oxygen bleach only on coloured coding.",
      "Withdraw on tie failure — a gown that cannot be closed is a dignity issue, not a laundry one.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },

  "scrub-suits": {
    slug: "scrub-suits",
    name: "Scrub Suits",
    categorySlug: "health-care",
    shortDescription: "Tunic and trouser sets in poly-cotton, colour-coded by department.",
    description:
      "Scrubs are worn a whole shift and washed after every one. The specification is about fabric that stays opaque and keeps its colour through hundreds of disinfection cycles, and a cut that works standing, bending and reaching for twelve hours.",
    // Fabric, not a stand-in garment photo — see the note on patient-gowns.
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Close-up of the poly-cotton twill used for scrub suits",
    galleryImageUrls: [
      {
        src: "/images/products/other-textile.jpg",
        alt: "Close-up of the poly-cotton twill used for scrub suits",
      },
    ],
    keyFacts: [
      { label: "Composition", value: "65/35 poly-cotton twill" },
      { label: "Weight", value: "165 – 195 GSM" },
      { label: "Minimum order", value: "500 sets per colour" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fabric", value: "65/35 poly-cotton twill" },
          { label: "Weight", value: "165, 180, 195 GSM" },
          { label: "Tunic", value: "V-neck, short sleeve, chest and hip pockets" },
          { label: "Trouser", value: "Drawcord or elasticated waist, side pockets" },
          { label: "Seams", value: "Overlocked, bar-tacked at pocket corners" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Opacity", value: "Specified to stay opaque when damp" },
          { label: "Colourfastness", value: "Held through repeated disinfection cycles" },
          { label: "Disinfection", value: "Rated for 71°C / 160°F" },
          { label: "Shrinkage", value: "Within 4% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 sets per colour per style" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Size set supplied for fit approval before bulk" },
          { label: "Packing", value: "Bagged as sets, carton packed by size" },
        ],
      },
    ],
    sizes: [
      { name: "XS", size: "Chest 32 – 34″", use: "All departments" },
      { name: "S", size: "Chest 36 – 38″", use: "All departments" },
      { name: "M", size: "Chest 40 – 42″", use: "All departments" },
      { name: "L", size: "Chest 44 – 46″", use: "All departments" },
      { name: "XL", size: "Chest 48 – 50″", use: "All departments" },
      { name: "2XL", size: "Chest 52 – 54″", use: "All departments" },
    ],
    customisation: [
      {
        title: "Department colour-coding",
        detail: "A colour per department — theatre, ICU, day surgery — for instant identification.",
      },
      { title: "Cut", detail: "Unisex, or separate men's and women's blocks where fit matters." },
      {
        title: "Embroidered identification",
        detail: "Name, role and department on the chest or sleeve.",
      },
      {
        title: "Pocket configuration",
        detail: "Chest, hip and pen pockets specified to clinical need.",
      },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Returns press-free from the dryer; no ironing required.",
      "Oxygen bleach only — chlorine will strip departmental colour-coding, which is the whole point of it.",
      "Order a size set for fit approval before bulk. Scrubs are the garment staff complain about most, and fit is why.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },

  "lab-coats": {
    slug: "lab-coats",
    name: "Lab Coats",
    categorySlug: "health-care",
    shortDescription:
      "Poly-cotton coats in knee and mid-thigh lengths, press-free after laundering.",
    description:
      "A lab coat is the most visible garment in a clinical building and the one judged hardest on appearance. Made in a poly-cotton that comes out of an industrial dryer looking pressed, so it still reads as professional after a hundred cycles.",
    // Fabric, not a stand-in garment photo — see the note on patient-gowns.
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Close-up of the poly-cotton fabric used for lab coats",
    galleryImageUrls: [
      {
        src: "/images/products/other-textile.jpg",
        alt: "Close-up of the poly-cotton fabric used for lab coats",
      },
    ],
    keyFacts: [
      { label: "Composition", value: "65/35 poly-cotton" },
      { label: "Weight", value: "180 – 210 GSM" },
      { label: "Minimum order", value: "500 pcs per style" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fabric", value: "65/35 poly-cotton twill or poplin" },
          { label: "Weight", value: "180, 195, 210 GSM" },
          { label: "Closure", value: "Concealed placket or exposed buttons" },
          { label: "Pockets", value: "Two hip, one chest; pen slot optional" },
          { label: "Back", value: "Plain, or half-belt with inverted pleat" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Appearance", value: "Press-free finish; holds a clean line without ironing" },
          { label: "Whiteness", value: "Optical white retained through repeated laundering" },
          { label: "Disinfection", value: "Rated for 71°C / 160°F" },
          { label: "Shrinkage", value: "Within 3% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "500 pieces per style" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Size set supplied for fit approval before bulk" },
          { label: "Packing", value: "Hanger or flat packed, by size" },
        ],
      },
    ],
    sizes: [
      { name: "Knee length — S", size: "Chest 36 – 38″", use: "Clinical and laboratory" },
      { name: "Knee length — M", size: "Chest 40 – 42″", use: "Clinical and laboratory" },
      { name: "Knee length — L", size: "Chest 44 – 46″", use: "Clinical and laboratory" },
      { name: "Knee length — XL", size: "Chest 48 – 50″", use: "Clinical and laboratory" },
      { name: "Mid-thigh", size: "S – XL", use: "Consulting and reception-facing roles" },
    ],
    customisation: [
      { title: "Length", detail: "Knee or mid-thigh, specified by role." },
      { title: "Embroidered identification", detail: "Name, role and department on the chest." },
      {
        title: "Closure",
        detail: "Concealed placket for a cleaner line; exposed buttons for speed.",
      },
      {
        title: "Coloured trim",
        detail: "Piping or collar trim to distinguish grade or department.",
      },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Press-free after tumble drying; over-drying is what causes the creasing people blame on the fabric.",
      "Chlorine bleach tolerant on optical white; oxygen bleach only where coloured trim is used.",
      "Withdraw on visible greying — a lab coat is judged on whiteness more than on wear.",
    ],
    sectors: ["Health-Care", "Institutional/Laundry"],
    certifications: [],
  },

  "bath-blankets": {
    slug: "bath-blankets",
    name: "Bath Blankets",
    categorySlug: "health-care",
    shortDescription:
      "Large absorbent cotton blankets for patient bathing, drying and modesty covering.",
    description:
      "A bath blanket does three jobs at once: it dries, it keeps a patient warm during a bed bath, and it preserves dignity while care is given. Woven large and soft in absorbent cotton, and built to take the same disinfection cycle as everything else on the ward.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Folded cotton bath blankets",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Folded cotton bath blankets" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of soft woven cotton" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton" },
      { label: "Weight", value: "300 – 400 GSM" },
      { label: "Minimum order", value: "1,000 pcs" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton, ring-spun" },
          { label: "Weave", value: "Loose thermal or honeycomb weave" },
          { label: "Weight", value: "300, 350, 400 GSM" },
          { label: "Hem", value: "Turned and double-stitched all round" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Absorbency", value: "Fully scoured; no softener finish" },
          { label: "Warmth", value: "Open weave traps air while remaining breathable" },
          { label: "Disinfection", value: "Rated for 71°C / 160°F" },
          { label: "Shrinkage", value: "Within 7% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '60" × 90"', use: "Adult bed bathing" },
      { name: "Large", size: '70" × 100"', use: "Bariatric and full coverage" },
    ],
    customisation: [
      { title: "Weight", detail: "Heavier blankets dry better; lighter ones handle easier." },
      { title: "Ward colour-coding", detail: "Woven stripe or dyed shade per department." },
      { title: "Size", detail: "Cut to the coverage your bathing protocol requires." },
      {
        title: "Labelling",
        detail: "Barcode, RFID pocket and date-coding to your tracking system.",
      },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "No fabric softener — absorbency is the function being bought.",
      "Chlorine bleach tolerant on white.",
      "Tumble dry on moderate heat; over-drying makes an open weave harsh.",
    ],
    sectors: ["Health-Care", "Institutional/Laundry"],
    certifications: [],
  },

  "baby-blankets": {
    slug: "baby-blankets",
    name: "Baby Blankets",
    categorySlug: "health-care",
    shortDescription:
      "Soft cotton receiving and swaddle blankets for maternity and neonatal units.",
    description:
      "Maternity linen is held to a different standard because of who it touches. Soft, breathable cotton in cellular and flannel constructions, sized for swaddling and receiving, and specified to stay soft through the same disinfection cycles as the rest of the unit.",
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Soft folded cotton blankets",
    galleryImageUrls: [
      { src: "/images/products/other-textile.jpg", alt: "Soft folded cotton blankets" },
      { src: "/images/products/towels.jpg", alt: "Stacked soft cotton textiles" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton" },
      { label: "Weight", value: "180 – 300 GSM" },
      { label: "Minimum order", value: "1,000 pcs" },
      { label: "Lead time", value: "30 – 45 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton, combed" },
          { label: "Weave", value: "Cellular (open) or brushed flannel" },
          { label: "Weight", value: "180 GSM cellular / 260 – 300 GSM flannel" },
          { label: "Hem", value: "Turned and double-stitched; no binding tape or trims" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Breathability", value: "Cellular weave chosen for airflow" },
          { label: "Softness", value: "Softness achieved by construction, not by softener finish" },
          { label: "Disinfection", value: "Rated for 71°C / 160°F" },
          { label: "Shrinkage", value: "Within 6% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces" },
          { label: "Lead time", value: "30 – 45 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Receiving blanket", size: '30" × 40"', use: "Delivery and immediate care" },
      { name: "Swaddle", size: '40" × 40"', use: "Postnatal ward" },
      { name: "Cot blanket", size: '40" × 60"', use: "Neonatal and paediatric cots" },
    ],
    customisation: [
      {
        title: "Construction",
        detail: "Cellular for airflow, flannel for warmth, specified per unit.",
      },
      { title: "Woven stripe", detail: "Border stripe for unit identification." },
      {
        title: "No applied trims",
        detail:
          "Supplied without ribbon, binding or appliqué by default — fewer components means fewer things to detach.",
      },
      { title: "Labelling", detail: "Barcode and date-coding to your tracking system." },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "No fabric softener or optical brightener; softness comes from the weave.",
      "Tumble dry on low. High heat is what turns brushed cotton harsh.",
      "Inspect on every cycle and withdraw on any seam or hem failure.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },

  "thermal-blankets": {
    slug: "thermal-blankets",
    name: "Thermal Blankets",
    categorySlug: "health-care",
    shortDescription:
      "Cellular and honeycomb blankets that keep patients warm and still launder hot.",
    description:
      "Warmth without weight, and — critically — warmth that survives thermal disinfection. Most warm blankets cannot be washed at ward temperatures. These are woven in cellular and honeycomb constructions specifically so they can be, which is what makes them usable as ward stock rather than as a hazard.",
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Folded cellular thermal blankets",
    galleryImageUrls: [
      { src: "/images/products/other-textile.jpg", alt: "Folded cellular thermal blankets" },
      // Not a ward bed — this photograph is folded towels. Captioned as such.
      { src: "/images/categories/health-care.jpg", alt: "Folded white health-care linen" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton or poly-cotton" },
      { label: "Weight", value: "280 – 420 GSM" },
      { label: "Minimum order", value: "1,000 pcs" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% cotton, or 50/50 poly-cotton for longer life" },
          { label: "Weave", value: "Cellular or honeycomb" },
          { label: "Weight", value: "280, 350, 420 GSM" },
          { label: "Edge", value: "Whipped or bound edge; no satin binding" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Warmth", value: "Air trapped in the cell structure, not in loose pile" },
          { label: "Breathability", value: "Open structure avoids overheating" },
          {
            label: "Disinfection",
            value: "Rated for 71°C / 160°F — verify before substituting stock",
          },
          { label: "Shrinkage", value: "Within 7% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Single", size: '70" × 90"', use: "Standard ward bed" },
      { name: "Double", size: '90" × 100"', use: "Maternity, private rooms" },
      { name: "Cot", size: '40" × 60"', use: "Paediatric" },
    ],
    customisation: [
      {
        title: "Fibre choice",
        detail: "Poly-cotton lasts longer under frequent disinfection; cotton feels better.",
      },
      { title: "Ward colour-coding", detail: "Dyed shades or woven borders per department." },
      { title: "Weight", detail: "Specified against how warm your wards actually run." },
      {
        title: "Labelling",
        detail: "Barcode, RFID pocket and date-coding to your tracking system.",
      },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Oxygen bleach only on coloured stock.",
      "Tumble dry on moderate heat; high heat flattens the cell structure that provides the warmth.",
      "Do not substitute non-launderable warm blankets into this stock — they cannot be disinfected on the ward cycle.",
    ],
    sectors: ["Health-Care", "Institutional/Laundry"],
    certifications: [],
  },

  "surgical-towels-lint-free": {
    slug: "surgical-towels-lint-free",
    name: "Surgical Towels (Lint Free)",
    categorySlug: "health-care",
    shortDescription:
      "Lint-free woven cotton huck towels for theatre use, where shed fibre is the failure mode.",
    description:
      "In a theatre, lint is not a cosmetic problem. These are tightly woven huck-weave cotton towels made specifically so they do not shed fibre onto instruments or into a field — a property that comes from the weave and the finishing, not from a coating that washes away.",
    heroImageUrl: "/images/products/towels.jpg",
    heroImageAlt: "Folded green surgical huck towels",
    galleryImageUrls: [
      { src: "/images/products/towels.jpg", alt: "Folded green surgical huck towels" },
      { src: "/images/products/other-textile.jpg", alt: "Close-up of huck weave structure" },
    ],
    keyFacts: [
      { label: "Composition", value: "100% cotton huck weave" },
      { label: "Weight", value: "180 – 240 GSM" },
      { label: "Minimum order", value: "2,000 pcs" },
      { label: "Lead time", value: "35 – 50 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Fibre", value: "100% combed cotton" },
          { label: "Weave", value: "Huck / birdseye, tightly set" },
          { label: "Weight", value: "180, 210, 240 GSM" },
          { label: "Hem", value: "Turned and double-stitched; no raw edges" },
        ],
      },
      {
        title: "Clinical use",
        rows: [
          { label: "Lint", value: "Low-lint by construction; verify against your own protocol" },
          { label: "Colour", value: "Surgical green or blue for contrast against the field" },
          {
            label: "Autoclave",
            value: "Suitable for steam sterilisation where your protocol requires",
          },
          { label: "Shrinkage", value: "Within 6% after five industrial washes" },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "2,000 pieces" },
          { label: "Lead time", value: "35 – 50 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Dozen-banded; pack counts to your set requirements" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '17" × 26"', use: "General theatre use" },
      { name: "Large", size: '20" × 30"', use: "Instrument trolley and drying" },
    ],
    customisation: [
      {
        title: "Colour",
        detail: "Surgical green or blue; deliberately distinct from all other linen on site.",
      },
      { title: "Pack counts", detail: "Banded in the counts your set assembly uses." },
      { title: "Weight", detail: "Heavier cloth absorbs more; lighter cloth handles more easily." },
      { title: "Labelling", detail: "Barcode and cycle-count tracking to your CSSD system." },
    ],
    care: [
      "Specified for thermal disinfection at 71°C / 160°F with a three-minute hold.",
      "Never use fabric softener. It coats fibre, and a coated surgical towel is neither absorbent nor reliably lint-free.",
      "Wash separately from terry — cotton pile lint will contaminate a lint-free load, which defeats the entire specification.",
      "Track cycle counts and withdraw on schedule rather than on appearance.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },

  "water-proof-flat-pads": {
    slug: "water-proof-flat-pads",
    name: "Water Proof Flat Pads",
    categorySlug: "health-care",
    shortDescription:
      "Reusable absorbent underpads with a fluid-proof backing, laundered rather than discarded.",
    description:
      "A washable alternative to disposable underpads: an absorbent quilted face over a fluid-proof backing, sized to protect the mattress across the patient's hip zone. The economics are straightforward — they cost more per piece and far less per use, provided the backing survives your dryer.",
    heroImageUrl: "/images/products/other-textile.jpg",
    heroImageAlt: "Quilted waterproof underpads",
    galleryImageUrls: [
      { src: "/images/products/other-textile.jpg", alt: "Quilted waterproof underpads" },
      { src: "/images/products/bed-sheets.jpg", alt: "Ward bed with protective pad in place" },
    ],
    keyFacts: [
      { label: "Backing", value: "Fluid-proof polyurethane" },
      { label: "Absorbency", value: "1 – 4 litres depending on specification" },
      { label: "Minimum order", value: "1,000 pcs" },
      { label: "Lead time", value: "40 – 55 days" },
    ],
    specifications: [
      {
        title: "Construction",
        rows: [
          { label: "Face", value: "Brushed polyester or poly-cotton knit" },
          { label: "Soaker", value: "Needle-punched absorbent core" },
          { label: "Backing", value: "Polyurethane-coated fabric, fluid-proof" },
          { label: "Edge", value: "Bound and double-stitched all round" },
        ],
      },
      {
        title: "Performance",
        rows: [
          { label: "Absorbency", value: "1L, 2L and 4L specifications" },
          { label: "Fluid barrier", value: "Backing is liquid-proof, not merely resistant" },
          {
            label: "Wash life",
            value: "Specified in cycles; verify against your laundry's process",
          },
          {
            label: "Disinfection",
            value: "Rated to 71°C / 160°F wash; drying temperature is the limit",
          },
        ],
      },
      {
        title: "Supply",
        rows: [
          { label: "Minimum order", value: "1,000 pieces" },
          { label: "Lead time", value: "40 – 55 days from approved sample" },
          { label: "Sampling", value: "Pre-production sample supplied for sign-off" },
          { label: "Packing", value: "Bulk packed for central laundry intake" },
        ],
      },
    ],
    sizes: [
      { name: "Standard", size: '30" × 36"', use: "General ward" },
      { name: "Large", size: '36" × 42"', use: "Bariatric and high-dependency" },
      { name: "With tuck-ins", size: '30" × 36" + 18" wings', use: "Secured under the mattress" },
    ],
    customisation: [
      {
        title: "Absorbency grade",
        detail: "1L to 4L, specified per ward rather than one grade across the site.",
      },
      { title: "Tuck-in wings", detail: "Side extensions that anchor under the mattress." },
      {
        title: "Colour-coding",
        detail: "Face colour by absorbency so staff can identify at a glance.",
      },
      {
        title: "Labelling",
        detail: "Cycle-count tracking so pads are withdrawn on data, not on guesswork.",
      },
    ],
    care: [
      "Wash at 71°C / 160°F for thermal disinfection. The wash temperature is fine; the dryer is what fails these.",
      "Tumble dry on LOW only. High heat delaminates polyurethane backing, and a delaminated pad looks perfectly serviceable while protecting nothing.",
      "Do not iron, do not dry-clean, and do not use chlorine bleach on the backing.",
      "Track cycle counts and withdraw on schedule; barrier failure is not visible on inspection.",
    ],
    sectors: ["Health-Care"],
    certifications: [],
  },
};

export function getProduct(slug: string): ProductDetail | null {
  return PRODUCTS[slug] ?? null;
}

/**
 * Build-time guard that PRODUCTS and lib/product-slugs cannot drift apart.
 *
 * The nav decides where a product links from the slug list; this file decides
 * whether a page exists at all. If they disagree the failure is silent and
 * user-facing: a product with a page keeps linking to an unbuilt category
 * anchor, or worse, the nav links to /products/<slug> and the route 404s.
 * Failing the build is the cheapest possible place to catch that.
 */
{
  const defined = new Set(Object.keys(PRODUCTS));
  const declared = new Set<string>(PRODUCT_PAGE_SLUGS);
  const missing = [...declared].filter((s) => !defined.has(s));
  const extra = [...defined].filter((s) => !declared.has(s));

  if (missing.length || extra.length) {
    throw new Error(
      "product-data / product-slugs are out of sync.\n" +
        (missing.length ? `  declared with no data: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  data with no declaration: ${extra.join(", ")}\n` : "")
    );
  }
}
