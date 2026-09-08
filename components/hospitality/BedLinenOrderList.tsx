"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BedSizeKey } from "@/lib/bed-linen";

/**
 * The list a buyer builds on a Bed Linen product page.
 *
 * Same shape and same reason as components/hospitality/TerryOrderList.tsx: the
 * hero picker and the specification table sit at opposite ends of a mostly
 * server-rendered page, and a context is what lets them agree without
 * hoisting the whole page into a client component. See that file's docblock
 * for the full reasoning — it applies here unchanged, keyed by bed size
 * instead of towel size.
 */

export type OrderLine = { sizeKey: BedSizeKey; quantity: number };

type OrderListValue = {
  lines: OrderLine[];
  setLine: (sizeKey: BedSizeKey, quantity: number) => void;
  removeLine: (sizeKey: BedSizeKey) => void;
  quantityOf: (sizeKey: BedSizeKey) => number | null;
  selected: BedSizeKey | null;
  setSelected: (sizeKey: BedSizeKey | null) => void;
};

const Ctx = createContext<OrderListValue | null>(null);

export function BedLinenOrderListProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [selected, setSelected] = useState<BedSizeKey | null>(null);

  const setLine = useCallback((sizeKey: BedSizeKey, quantity: number) => {
    setLines((prev) => {
      const found = prev.some((l) => l.sizeKey === sizeKey);
      return found
        ? prev.map((l) => (l.sizeKey === sizeKey ? { ...l, quantity } : l))
        : [...prev, { sizeKey, quantity }];
    });
  }, []);

  const removeLine = useCallback((sizeKey: BedSizeKey) => {
    setLines((prev) => prev.filter((l) => l.sizeKey !== sizeKey));
  }, []);

  const value = useMemo<OrderListValue>(
    () => ({
      lines,
      setLine,
      removeLine,
      quantityOf: (sizeKey) => lines.find((l) => l.sizeKey === sizeKey)?.quantity ?? null,
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
