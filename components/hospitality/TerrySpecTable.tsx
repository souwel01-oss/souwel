"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import {
  TERRY_DOZEN,
  TERRY_BASE,
  encodeTerryLines,
  roundUpToDozen,
  type TerrySizeKey,
} from "@/lib/terry-towels";
import { useTerryOrderList } from "@/components/hospitality/TerryOrderList";
import { cn } from "@/lib/utils";

/**
 * The specification table, with a quantity box and "Add to List" on every row.
 *
 * THE TABLE IS THE ORDER FORM. A property ordering terry rarely wants one size:
 * they want washcloths, hand towels and bath towels of the same construction,
 * in different quantities. The picker in the hero settles the construction and
 * seeds the first line; everything else is added here, next to the weight and
 * the SKU the buyer is choosing on.
 *
 * IT IS STILL A REAL <table> WITH ROW HEADERS. A buyer reads a size across to
 * its weight against their own tender document, and a screen reader needs the
 * row/column pairing that a grid of divs throws away. The quantity box and the
 * button live in two more columns rather than replacing that structure.
 *
 * ROWS ALREADY IN THE LIST SAY SO. The button becomes "Update" and the row is
 * marked, because the alternative — an "Add to List" button that silently
 * replaces a quantity — makes a buyer who mistypes 5,000 wonder whether they
 * now have one line or two.
 *
 * A ROW WITH NO WEIGHT IS STILL ORDERABLE. The pool towel has no figure on the
 * client's sheet and reads "On request"; it can be listed, and the quote comes
 * back with the weight rather than the buyer being blocked on it here.
 *
 * BLEND AND HEM ARE NOT ROWS HERE. They do not vary by size, and they are
 * already stated twice above — under the product name and again in the picker's
 * fixed facts. A third copy at the foot of a table whose every other row is
 * orderable reads as two more things to add a quantity to.
 */

export type SpecRow = {
  sizeKey: TerrySizeKey;
  name: string;
  dimensions: string;
  weight: string | null;
  sku: string;
};

export function TerrySpecTable({ productSlug, rows }: { productSlug: string; rows: SpecRow[] }) {
  const { lines, setLine, removeLine, quantityOf, selected } = useTerryOrderList();

  const href =
    lines.length > 0
      ? `/quote?terry=${encodeURIComponent(productSlug)}&lines=${encodeURIComponent(
          encodeTerryLines(lines)
        )}`
      : null;

  const byKey = new Map(rows.map((r) => [r.sizeKey, r]));

  return (
    <>
      <div className="border-premium/25 bg-card overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[46rem] text-sm">
          <caption className="sr-only">
            Sizes, stock codes and weights for this construction, with a quantity box per row
          </caption>
          <thead>
            <tr className="border-premium/20 border-b">
              {["Product type", "Size", "SKU", "Weight", "Quantity", ""].map((h, i) => (
                <th
                  key={h || i}
                  scope="col"
                  className="text-muted-foreground px-5 py-3.5 text-left text-[11px] font-semibold tracking-[0.14em] uppercase"
                >
                  {h || <span className="sr-only">Add to list</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <SpecTableRow
                key={row.sizeKey}
                row={row}
                listed={quantityOf(row.sizeKey)}
                highlighted={row.sizeKey === selected}
                onAdd={(qty) => setLine(row.sizeKey, qty)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── The list ─────────────────────────────────────────────────── */}
      <div className="border-premium/25 bg-card mt-8 rounded-xl border p-5 sm:p-6">
        <h3 className="text-foreground text-[15px] font-semibold">
          Your list{" "}
          <span className="text-muted-foreground font-normal">
            ({lines.length} {lines.length === 1 ? "line" : "lines"})
          </span>
        </h3>

        {lines.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-[13.5px] leading-relaxed">
            Nothing added yet. Enter a quantity against any row above and press Add to List.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2.5">
            {lines.map((line) => {
              const row = byKey.get(line.sizeKey);
              if (!row) return null;
              return (
                <li
                  key={line.sizeKey}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3 text-[13.5px]"
                >
                  <span className="text-foreground font-medium">{row.name}</span>
                  <span className="text-muted-foreground">{row.dimensions}</span>
                  <span className="text-muted-foreground font-mono text-[12px]">{row.sku}</span>
                  <span className="text-foreground ml-auto font-semibold tabular-nums">
                    {line.quantity.toLocaleString("en-US")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.sizeKey)}
                    aria-label={`Remove ${row.name} from your list`}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-ring rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6">
          {href ? (
            <Link
              href={href}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-12 items-center gap-2 rounded-lg px-7 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Request a Quote
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : (
            /* A real disabled <button>, not a Link styled to look dead: a
               disabled anchor is still followed by a keyboard and still read as
               a link by assistive tech. */
            <button
              type="button"
              disabled
              className="bg-muted text-muted-foreground inline-flex h-12 cursor-not-allowed items-center gap-2 rounded-lg px-7 text-[15px] font-semibold"
            >
              Request a Quote
              <ArrowRight aria-hidden className="size-4" />
            </button>
          )}
          <p className="text-muted-foreground mt-3 text-[13px]">
            {lines.length === 0
              ? "Add at least one line to request a quote."
              : "Priced by quotation against your specification and volume. No account needed to ask."}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 max-w-2xl text-[13px] leading-relaxed">
        Sizes not listed are not part of this construction. Colour is matched from a physical sample
        when we quote. Quantities are supplied by the dozen and round up to the next twelve.{" "}
        <Link href={TERRY_BASE} className="underline underline-offset-4">
          Other terry constructions
        </Link>{" "}
        are quoted separately.
      </p>
    </>
  );
}

function SpecTableRow({
  row,
  listed,
  highlighted,
  onAdd,
}: {
  row: SpecRow;
  listed: number | null;
  highlighted: boolean;
  onAdd: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const typed = /^\d{1,7}$/.test(draft.trim()) ? Number(draft.trim()) : null;
  const canAdd = typed !== null && typed > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(roundUpToDozen(typed));
    setDraft("");
  };

  return (
    <tr
      className={cn("border-premium/15 border-b last:border-0", highlighted && "bg-primary/[0.06]")}
    >
      <th scope="row" className="text-foreground px-5 py-3.5 text-left font-medium">
        {row.name}
        {listed !== null ? (
          <span className="text-primary-strong dark:text-primary ml-2 inline-flex items-center gap-1 align-middle text-[11.5px] font-semibold">
            <Check aria-hidden className="size-3" />
            {listed.toLocaleString("en-US")}
          </span>
        ) : null}
      </th>
      <td className="text-foreground/80 px-5 py-3.5">{row.dimensions}</td>
      <td className="text-foreground/80 px-5 py-3.5 font-mono text-[12.5px]">{row.sku}</td>
      <td className="text-foreground px-5 py-3.5 font-medium">
        {row.weight ?? <span className="text-muted-foreground font-normal">On request</span>}
      </td>
      <td className="px-5 py-3.5">
        <input
          type="number"
          inputMode="numeric"
          min={TERRY_DOZEN}
          step={TERRY_DOZEN}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          aria-label={`Quantity of ${row.name}`}
          placeholder="Qty"
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-10 w-28 rounded-lg border px-3 text-[14px] outline-none focus-visible:ring-4"
        />
      </td>
      <td className="px-5 py-3.5">
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className={cn(
            "focus-visible:ring-ring h-10 rounded-lg px-4 text-[13.5px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none",
            canAdd
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {listed !== null ? "Update" : "Add to List"}
        </button>
      </td>
    </tr>
  );
}
