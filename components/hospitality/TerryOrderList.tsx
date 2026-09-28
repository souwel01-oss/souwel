"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * The list a buyer builds on a Terry Towels product page.
 *
 * WHY A CONTEXT AND NOT PROPS. Two controls share this state and they sit at
 * opposite ends of the page: the picker in the hero, which chooses a size and
 * sends the buyer down with "Next", and the specification table further down,
 * where quantities are entered per size. Threading state between them would
 * mean hoisting the entire page into one client component, and the page is a
 * server component holding a breadcrumb, a gallery and two prose sections that
 * have no reason to ship to the browser.
 *
 * A provider around both keeps the page server-rendered and lets the two
 * controls agree — the picker's choice is already in the list by the time the
 * table comes into view, which is what the brief asks for.
 *
 * QUANTITIES ARE STORED ALREADY ROUNDED. Every caller rounds to a dozen before
 * it gets here, so nothing downstream has to wonder whether a number has been
 * through that yet.
 *
 * KEYED ON THE CLIENT'S STOCK CODE, NOT A SIZE. The sheet prints one code per
 * orderable line, and a line is not always one size — Cabana Pool Towels is
 * one pool towel in two colours with two codes. The SKU is the only key that
 * is one-per-line by construction.
 */

export type OrderLine = { sku: string; quantity: number };

type OrderListValue = {
  lines: OrderLine[];
  /** Adds, or replaces the quantity if the code is already listed. */
  setLine: (sku: string, quantity: number) => void;
  removeLine: (sku: string) => void;
  quantityOf: (sku: string) => number | null;
  /** The line chosen in the hero picker, so the table can highlight its row. */
  selected: string | null;
  setSelected: (sku: string | null) => void;
};

const Ctx = createContext<OrderListValue | null>(null);

export function TerryOrderListProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const setLine = useCallback((sku: string, quantity: number) => {
    setLines((prev) => {
      const found = prev.some((l) => l.sku === sku);
      return found
        ? prev.map((l) => (l.sku === sku ? { ...l, quantity } : l))
        : [...prev, { sku, quantity }];
    });
  }, []);

  const removeLine = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const value = useMemo<OrderListValue>(
    () => ({
      lines,
      setLine,
      removeLine,
      quantityOf: (sku) => lines.find((l) => l.sku === sku)?.quantity ?? null,
      selected,
      setSelected,
    }),
    [lines, selected, setLine, removeLine]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTerryOrderList(): OrderListValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useTerryOrderList must be used inside <TerryOrderListProvider>");
  }
  return ctx;
}

/** Where "Next" sends the buyer, and what the table anchors itself to. */
export const SPEC_SECTION_ID = "specification";
