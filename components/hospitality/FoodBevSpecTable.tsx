"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import { FB_BASE, encodeFbLines } from "@/lib/food-beverage";
import { roundUpToCase, type QuantityUnit } from "@/lib/case-pack";
import { RangeListScopeNote, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import { cn } from "@/lib/utils";

/**
 * The specification table, with a quantity box and "Add to List" on every row.
 *
 * Mirrors components/hospitality/TerrySpecTable.tsx — see that file's docblock
 * for the reasoning behind the real <table>, the row headers and the "Update"
 * state. A row here is one SIZE-AND-COLOUR PAIR, because that is what the
 * sheet gives a code to: the table cloth's eight sizes by seven colours are
 * fifty-six rows, and a buyer reading this against a tender wants every one
 * of them.
 *
 * THE SIZE COLUMN DISAPPEARS WHEN THERE IS ONLY ONE SIZE. It is already
 * stated in the picker's fixed facts above, and a column repeating "16X19"
 * six times is a column carrying nothing.
 */

export type FbSpecRow = {
  sku: string;
  size: string;
  colour: string;
  /** Indicative swatch, or null when the shade name has no mapping. */
  hex: string | null;
  /** What a quantity goes up in: this size's case, in the product's unit. */
  step: number;
};

export function FoodBevSpecTable({
  productSlug,
  rows,
  showSize,
  unit,
}: {
  productSlug: string;
  rows: FbSpecRow[];
  showSize: boolean;
  unit: QuantityUnit;
}) {
  const { lines, setLine, removeLine, quantityOf, selected } = useRangeOrderList();

  const href =
    lines.length > 0
      ? `/quote?fb=${encodeURIComponent(productSlug)}&lines=${encodeURIComponent(
          encodeFbLines(lines)
        )}`
      : null;

  const bySku = new Map(rows.map((r) => [r.sku, r]));
  // The case column, as on the Terry table, wherever the sheet gives one.
  const showCase = rows.some((r) => r.step > 1);
  const headings = [
    ...(showSize ? ["Size"] : []),
    "Colour",
    "SKU",
    ...(showCase ? ["Per case"] : []),
    `Quantity (${unit})`,
    "",
  ];

  return (
    <>
      <div className="border-premium/25 bg-card relative overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[36rem] text-sm">
          <caption className="sr-only">
            Sizes, colours and stock codes for this product, with a quantity box per row
          </caption>
          <thead>
            <tr className="border-premium/20 border-b">
              {headings.map((h, i) => (
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
                key={row.sku}
                row={row}
                showSize={showSize}
                showCase={showCase}
                unit={unit}
                listed={quantityOf(row.sku)}
                highlighted={row.sku === selected}
                onAdd={(qty) => setLine(row.sku, qty)}
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
            ({lines.length} {lines.length === 1 ? "line" : "lines"} selected)
          </span>
        </h3>

        {lines.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-[13.5px] leading-relaxed">
            Nothing added yet. Enter a quantity against any row above and press Add to List.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2.5">
            {lines.map((line) => {
              const row = bySku.get(line.sku);
              if (!row) return null;
              return (
                <li
                  key={line.sku}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3 text-[13.5px]"
                >
                  <span
                    aria-hidden
                    className="border-foreground/25 block size-4 shrink-0 rounded-[3px] border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]"
                    style={row.hex ? { backgroundColor: row.hex } : undefined}
                  />
                  <span className="text-foreground font-medium">{row.colour}</span>
                  {showSize ? <span className="text-muted-foreground">{row.size}</span> : null}
                  <span className="text-muted-foreground font-mono text-[12px]">{row.sku}</span>
                  <span className="text-foreground ml-auto font-semibold tabular-nums">
                    {line.quantity.toLocaleString("en-US")} {unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.sku)}
                    aria-label={`Remove ${row.colour}${showSize ? ` ${row.size}` : ""} from your list`}
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
               disabled anchor is still followed by a keyboard and still read
               as a link by assistive tech. */
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
          <RangeListScopeNote />
        </div>
      </div>

      <p className="text-muted-foreground mt-6 max-w-2xl text-[13px] leading-relaxed">
        Sizes and colours not listed are not part of this line. Shades are matched from a physical
        sample when we quote.{" "}
        {unit === "dz" ? "Quantities are in dozens and round up to a full case. " : ""}
        <Link href={FB_BASE} className="underline underline-offset-4">
          The rest of Food &amp; Beverage
        </Link>{" "}
        can be added to the same list.
      </p>
    </>
  );
}

function SpecTableRow({
  row,
  showSize,
  showCase,
  unit,
  listed,
  highlighted,
  onAdd,
}: {
  row: FbSpecRow;
  showSize: boolean;
  showCase: boolean;
  unit: QuantityUnit;
  listed: number | null;
  highlighted: boolean;
  onAdd: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const typed = /^\d{1,7}$/.test(draft.trim()) ? Number(draft.trim()) : null;
  const canAdd = typed !== null && typed > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(roundUpToCase(typed, row.step));
    setDraft("");
  };

  return (
    <tr
      className={cn("border-premium/15 border-b last:border-0", highlighted && "bg-primary/[0.06]")}
    >
      {showSize ? (
        <th scope="row" className="text-foreground px-5 py-3.5 text-left font-medium">
          {row.size}
        </th>
      ) : null}
      <td className={cn("px-5 py-3.5", showSize ? "text-foreground/80" : "text-foreground")}>
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="border-foreground/25 block size-4 shrink-0 rounded-[3px] border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]"
            style={row.hex ? { backgroundColor: row.hex } : undefined}
          />
          {row.colour}
          {listed !== null ? (
            <span className="text-primary-strong dark:text-primary inline-flex items-center gap-1 text-[11.5px] font-semibold">
              <Check aria-hidden className="size-3" />
              {listed.toLocaleString("en-US")} {unit}
            </span>
          ) : null}
        </span>
      </td>
      <td className="text-foreground/80 px-5 py-3.5 font-mono text-[12.5px]">{row.sku}</td>
      {showCase ? (
        <td className="text-foreground/80 px-5 py-3.5 whitespace-nowrap">
          {row.step > 1 ? `${row.step} ${unit}` : "—"}
        </td>
      ) : null}
      <td className="px-5 py-3.5">
        <input
          type="number"
          inputMode="numeric"
          min={row.step}
          step={row.step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          aria-label={`Quantity of ${row.colour}${showSize ? ` ${row.size}` : ""} in ${
            unit === "dz" ? "dozens" : "pieces"
          }`}
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

