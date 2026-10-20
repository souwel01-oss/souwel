"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  QUOTE_LIST_FULL_MESSAGE,
  quoteListId,
  type QuoteListLine,
  type QuoteListProductRef,
} from "@/lib/quote-list";
import { removeQuoteListLine, setQuoteListLine, useQuoteList } from "@/lib/quote-list-store";
import { useQuoteListDrawer } from "@/components/quote-list/QuoteListProvider";

/**
 * The list a buyer builds on a product page, shared by every range.
 *
 * WHY A CONTEXT AND NOT PROPS. Two controls share this state and they sit at
 * opposite ends of the page: the picker in the hero, which chooses a line and
 * sends the buyer down with "Next", and the specification table further down,
 * where quantities are entered per line. Threading state between them would
 * mean hoisting the entire page into one client component, and the page is a
 * server component holding a breadcrumb, a gallery and two prose sections
 * that have no reason to ship to the browser.
 *
 * A provider around both keeps the page server-rendered and lets the two
 * controls agree — the picker's choice is already in the list by the time the
 * table comes into view, which is what the brief asks for.
 *
 * KEYED ON THE CLIENT'S STOCK CODE. Every one of the client's sheets prints
 * one code per orderable line, and a line is not always one size: a pillow
 * case at 42"X36" covers three bed sizes under one code, Cabana Pool Towels
 * is one size in two colours under two, and the whole Spa & Salon range is
 * one size per product with a code per colour. The SKU is the only key that
 * is one-per-line by construction, which is also why it is what the quote
 * link carries.
 *
 * ONE PROVIDER, FOUR RANGES. Terry, Bed Linen, Food & Beverage and Spa &
 * Salon each render their own picker and table, but the list behind them is
 * the same list with the same rules, so it is written once. QUANTITIES ARE
 * STORED ALREADY ROUNDED — each range rounds by its own rule (a dozen for
 * towels, the case pack for bed linen, the pack for salon) before calling
 * setLine, so nothing downstream has to wonder whether a number has been
 * through that yet.
 *
 * ── THE LINES LIVE IN THE SITE-WIDE QUOTE LIST ──────────────────────────────
 *
 * This used to hold its lines in component state, so they lasted exactly as
 * long as the page did. They are now this product's entry in the quote list
 * (lib/quote-list-store.ts), which is why "Add to List" on a row moves the
 * badge in the header, why the lines are still here after a reload, and why
 * a buyer can add towels on one page and sheets on another and send both.
 *
 * What the picker and the tables see has not changed: the same `lines`, the
 * same `setLine` and `removeLine`. Only where those lines are kept has.
 *
 * `selected` IS STILL LOCAL. Which row the hero picker is pointing at is a
 * fact about this visit to this page, not about what the buyer wants quoted.
 */

export type OrderLine = { sku: string; quantity: number };

/** One orderable line of this product, as the quote list needs to describe it. */
export type RangeLineMeta = Omit<QuoteListLine, "quantity">;

type OrderListValue = {
  lines: OrderLine[];
  /** Adds, or replaces the quantity if the code is already listed. */
  setLine: (sku: string, quantity: number) => void;
  removeLine: (sku: string) => void;
  quantityOf: (sku: string) => number | null;
  /** The line chosen in the hero picker, so the table can highlight its row. */
  selected: string | null;
  setSelected: (sku: string | null) => void;
  /** How many OTHER products the quote list holds besides this one. */
  otherProducts: number;
};

const Ctx = createContext<OrderListValue | null>(null);

export function RangeOrderListProvider({
  product,
  lineMeta,
  children,
}: {
  /** This page's product, as the quote list files it. */
  product: QuoteListProductRef;
  /** Every line this product is made in — its label in the drawer, and its step. */
  lineMeta: RangeLineMeta[];
  children: React.ReactNode;
}) {
  const items = useQuoteList();
  const [selected, setSelected] = useState<string | null>(null);

  const id = quoteListId(product.kind, product.slug);
  const entry = items.find((i) => i.id === id);
  const metaBySku = useMemo(() => new Map(lineMeta.map((m) => [m.sku, m])), [lineMeta]);

  // Only codes this product is still made in. A line saved before the sheet
  // changed would otherwise be counted here and then have no row to show.
  const lines = useMemo<OrderLine[]>(
    () =>
      (entry?.lines ?? [])
        .filter((l) => metaBySku.has(l.sku))
        .map((l) => ({ sku: l.sku, quantity: l.quantity })),
    [entry, metaBySku]
  );

  const setLine = useCallback(
    (sku: string, quantity: number) => {
      const meta = metaBySku.get(sku);
      if (!meta) return;
      if (setQuoteListLine(product, meta, quantity) === "full") {
        toast.error(QUOTE_LIST_FULL_MESSAGE);
      }
    },
    [metaBySku, product]
  );

  const removeLine = useCallback((sku: string) => removeQuoteListLine(id, sku), [id]);

  const value = useMemo<OrderListValue>(
    () => ({
      lines,
      setLine,
      removeLine,
      quantityOf: (sku) => lines.find((l) => l.sku === sku)?.quantity ?? null,
      selected,
      setSelected,
      otherProducts: items.length - (entry ? 1 : 0),
    }),
    [lines, selected, setLine, removeLine, items.length, entry]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRangeOrderList(): OrderListValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useRangeOrderList must be used inside <RangeOrderListProvider>");
  }
  return ctx;
}

/**
 * Says what "Request a Quote" under a range table does NOT send, when there
 * is something it does not send.
 *
 * That button asks about this product only — it always has. Now that the
 * lines above it are also in the site-wide list, a buyer with towels and
 * sheets listed could fairly expect it to send both. This is the sentence
 * that stops that being a surprise, and the way to the request that does
 * cover everything. Renders nothing while this product is all the list holds.
 */
export function RangeListScopeNote() {
  const { otherProducts } = useRangeOrderList();
  const { openList } = useQuoteListDrawer();

  if (otherProducts === 0) return null;

  return (
    <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
      That sends this product on its own. Your list also holds {otherProducts} other{" "}
      {otherProducts === 1 ? "product" : "products"} —{" "}
      <button
        type="button"
        onClick={(e) => openList(e.currentTarget)}
        className="text-foreground focus-visible:ring-ring rounded-sm font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        open your list
      </button>{" "}
      to request them all together.
    </p>
  );
}

/**
 * Where "Next" sends the buyer, and what the table anchors itself to.
 *
 * One id for every range because a page only ever renders one of these
 * sections — there is no page on which a terry table and a bed linen table
 * could collide.
 */
export const SPEC_SECTION_ID = "specification";
