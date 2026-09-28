"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * The list a buyer builds on a Bed Linen product page.
 *
 * Same shape and same reason as components/hospitality/TerryOrderList.tsx: the
 * hero picker and the specification table sit at opposite ends of a mostly
 * server-rendered page, and a context is what lets them agree without
 * hoisting the whole page into a client component. See that file's docblock
 * for the full reasoning.
 *
 * KEYED ON THE CLIENT'S STOCK CODE, NOT A BED SIZE. The hospitality sheet
 * prints one code per orderable line, and a line is not always one bed size —
 * a pillow case at 42"X36" is a single product covering twin, full and queen.
 * The SKU is the only key that is one-per-line by construction.
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

export function BedLinenOrderListProvider({ children }: { children: React.ReactNode }) {
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

export function useBedLinenOrderList(): OrderListValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useBedLinenOrderList must be used inside <BedLinenOrderListProvider>");
  }
  return ctx;
}

/** Where "Next" sends the buyer, and what the table anchors itself to. */
export const BED_LINEN_SPEC_SECTION_ID = "bed-linen-specification";
