"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { TerrySizeKey } from "@/lib/terry-towels";

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
 */

export type OrderLine = { sizeKey: TerrySizeKey; quantity: number };

type OrderListValue = {
  lines: OrderLine[];
  /** Adds, or replaces the quantity if the size is already listed. */
  setLine: (sizeKey: TerrySizeKey, quantity: number) => void;
  removeLine: (sizeKey: TerrySizeKey) => void;
  quantityOf: (sizeKey: TerrySizeKey) => number | null;
  /** The size chosen in the hero picker, so the table can highlight its row. */
  selected: TerrySizeKey | null;
  setSelected: (sizeKey: TerrySizeKey | null) => void;
};

const Ctx = createContext<OrderListValue | null>(null);

export function TerryOrderListProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [selected, setSelected] = useState<TerrySizeKey | null>(null);

  const setLine = useCallback((sizeKey: TerrySizeKey, quantity: number) => {
    setLines((prev) => {
      const found = prev.some((l) => l.sizeKey === sizeKey);
      return found
        ? prev.map((l) => (l.sizeKey === sizeKey ? { ...l, quantity } : l))
        : [...prev, { sizeKey, quantity }];
    });
  }, []);

  const removeLine = useCallback((sizeKey: TerrySizeKey) => {
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

export function useTerryOrderList(): OrderListValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useTerryOrderList must be used inside <TerryOrderListProvider>");
  }
  return ctx;
}

/** Where "Next" sends the buyer, and what the table anchors itself to. */
export const SPEC_SECTION_ID = "specification";
