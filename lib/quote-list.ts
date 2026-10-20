/**
 * The buyer's quote list — its shape, and how it travels to the quote form.
 *
 * PURE, AND SHARED BY BOTH SIDES. The browser store (lib/quote-list-store.ts)
 * and the server-rendered quote page both import this file, so it holds types,
 * limits and the `?list=` codec and nothing that touches `window`, React or
 * the catalogue.
 *
 * NO PRICES HERE EITHER. This is a list of what a buyer wants quoted. It is a
 * cart in shape only: nothing in it has a price, and nothing is ever paid for.
 *
 * TWO KINDS OF ENTRY, because the site has two kinds of product page:
 *
 *   - a catalogue product (/products/…) is one line with one quantity, and it
 *     becomes a real line item on the request that Sales can price.
 *   - a range product — Towel, Bed Linen, Food & Beverage, Spa Salon — is one
 *     product with a line per stock code, each with its own quantity, because
 *     that is how the client's sheets are written and how those pages order.
 *
 * ONLY SLUGS, STOCK CODES AND QUANTITIES EVER LEAVE THE BROWSER. The name,
 * thumbnail and line labels below are a display snapshot so the drawer can
 * draw a row without shipping the whole catalogue to every page. The quote
 * page ignores all of it and rebuilds what staff read from the catalogue
 * files — same rule as the `?terry=` / `?bed=` links it already accepted.
 */

export const QUOTE_LIST_KINDS = ["product", "terry", "bed", "spa", "fb"] as const;

export type QuoteListKind = (typeof QUOTE_LIST_KINDS)[number];
export type QuoteListRangeKind = Exclude<QuoteListKind, "product">;

/** Matches MAX_ITEMS in the quote action — one request carries this many. */
export const QUOTE_LIST_MAX_ITEMS = 25;
/** The quote action's ceiling for a catalogue line. */
export const QUOTE_LIST_MAX_QUANTITY = 1_000_000;
/** Seven digits, the same bound the range pages put on a quantity box. */
export const QUOTE_LIST_MAX_LINE_QUANTITY = 9_999_999;

export const QUOTE_LIST_FULL_MESSAGE = `Your list is full. One request carries up to ${QUOTE_LIST_MAX_ITEMS} products — send this one, then start another.`;

export type QuoteListLine = {
  /** The client's own stock code — the line's identity. */
  sku: string;
  /** What the drawer calls this line: a size, a colour, or both. */
  label: string;
  quantity: number;
  /** What a quantity goes up in: a dozen, a case, a pack. 1 where none applies. */
  step: number;
};

/** What a page hands over to describe the product a list entry is for. */
export type QuoteListProductRef = {
  kind: QuoteListKind;
  slug: string;
  name: string;
  /** Thumbnail, a path under /public. */
  image: string | null;
  /** The product's own page, so a row in the drawer can link back to it. */
  href: string | null;
};

export type QuoteListItem = QuoteListProductRef & {
  /** `${kind}:${slug}` — see quoteListId. */
  id: string;
  /** A catalogue product's quantity. Unused on a range product. */
  quantity: number;
  /** A range product's lines. Empty on a catalogue product. */
  lines: QuoteListLine[];
};

export function quoteListId(kind: QuoteListKind, slug: string): string {
  return `${kind}:${slug}`;
}

/**
 * How many things are in the list, as the buyer counts them.
 *
 * ONE PER "ADD TO LIST" PRESS, not one per product. On a range page every row
 * has its own Add to List — a wash cloth, a hand towel and a bath towel of the
 * same construction are three presses — and a badge that answered those three
 * presses by staying on 1 reads as the button not working. So a catalogue
 * product counts once and a range product counts once per line.
 *
 * It is still not a count of PIECES: 500 bar mops is one item.
 */
export function quoteListCount(items: QuoteListItem[]): number {
  return items.reduce((n, item) => n + (item.kind === "product" ? 1 : item.lines.length), 0);
}

export function isQuoteListKind(value: unknown): value is QuoteListKind {
  return typeof value === "string" && (QUOTE_LIST_KINDS as readonly string[]).includes(value);
}

const SLUG = /^[a-z0-9-]{1,120}$/;
const SKU = /^[A-Za-z0-9]{1,40}$/;

export const isQuoteListSlug = (value: unknown): value is string =>
  typeof value === "string" && SLUG.test(value);

export const isQuoteListSku = (value: unknown): value is string =>
  typeof value === "string" && SKU.test(value);

/* ───────────────────────────────────────────────────────────────────────────
   `?list=` — the whole list, as it travels to the quote form
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * `product.bar-mop=500;terry.dobby-towels=BT2754DBY:504,WC1313DBY:120`
 *
 * One segment per product, `kind.slug=payload`. A catalogue product's payload
 * is its quantity; a range product's is the same `code:quantity,…` string its
 * own page already puts in `?lines=`, so the quote page can hand it to the
 * parser that range already has.
 *
 * None of the three separators can occur inside a value: slugs are lowercase
 * letters, digits and hyphens, and every stock code on the client's sheets is
 * letters and digits only.
 */
export function encodeQuoteList(items: QuoteListItem[]): string {
  return items
    .map((item) =>
      item.kind === "product"
        ? `${item.kind}.${item.slug}=${item.quantity}`
        : `${item.kind}.${item.slug}=${item.lines.map((l) => `${l.sku}:${l.quantity}`).join(",")}`
    )
    .join(";");
}

/** Where "Request a Quote" in the drawer goes. */
export function quoteListHref(items: QuoteListItem[]): string {
  return `/quote?list=${encodeURIComponent(encodeQuoteList(items))}`;
}

export type QuoteListRequestEntry =
  | { kind: "product"; id: string; slug: string; quantity: number }
  /** `lines` is still raw — the range's own parser checks it against its sheet. */
  | { kind: QuoteListRangeKind; id: string; slug: string; lines: string };

/**
 * Parses `?list=`. A query string is attacker-controlled, so this keeps only
 * well-formed segments and says nothing about whether a slug is a real
 * product — the quote page checks that against the catalogue.
 */
export function decodeQuoteList(raw: string | undefined): QuoteListRequestEntry[] {
  if (!raw || raw.length > 8000) return [];

  const seen = new Set<string>();
  const out: QuoteListRequestEntry[] = [];

  for (const segment of raw.split(";")) {
    if (out.length >= QUOTE_LIST_MAX_ITEMS) break;

    const eq = segment.indexOf("=");
    const dot = segment.indexOf(".");
    if (dot < 1 || eq < dot) continue;

    const kind = segment.slice(0, dot);
    const slug = segment.slice(dot + 1, eq);
    const payload = segment.slice(eq + 1);
    if (!isQuoteListKind(kind) || !isQuoteListSlug(slug) || !payload) continue;

    const id = quoteListId(kind, slug);
    if (seen.has(id)) continue;

    if (kind === "product") {
      if (!/^\d{1,7}$/.test(payload)) continue;
      const quantity = Number(payload);
      if (quantity < 1 || quantity > QUOTE_LIST_MAX_QUANTITY) continue;
      out.push({ kind, id, slug, quantity });
    } else {
      out.push({ kind, id, slug, lines: payload });
    }
    seen.add(id);
  }

  return out;
}
