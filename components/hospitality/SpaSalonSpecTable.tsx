"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import { SPA_SALON_BASE, encodeSpaSalonLines } from "@/lib/spa-salon";
import { useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import { cn } from "@/lib/utils";

/**
 * The specification table, with a quantity box and "Add to List" on every row.
 *
 * Mirrors components/hospitality/TerrySpecTable.tsx — see that file's docblock
 * for the reasoning behind the real <table>, the row headers and the "Update"
 * state. The difference is what a row IS: on this sheet a product is one size
 * in several colours, each with its own code, so a row is a colour.
 */

export type SpaSalonSpecRow = {
  sku: string;
  colour: string;
  /** Indicative swatch, or null when the shade name has no mapping. */
  hex: string | null;
};

export function SpaSalonSpecTable({
  productSlug,
  pack,
  rows,
}: {
  productSlug: string;
  pack: number;
  rows: SpaSalonSpecRow[];
}) {
  const { lines, setLine, removeLine, quantityOf, selected } = useRangeOrderList();

  const href =
    lines.length > 0
      ? `/quote?spa=${encodeURIComponent(productSlug)}&lines=${encodeURIComponent(
          encodeSpaSalonLines(lines)
        )}`
      : null;

  const bySku = new Map(rows.map((r) => [r.sku, r]));

  return (
    <>
      <div className="border-premium/25 bg-card overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">
            Colours and stock codes for this product, with a quantity box per row
          </caption>
          <thead>
            <tr className="border-premium/20 border-b">
              {["Colour", "SKU", "Quantity", ""].map((h, i) => (
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
                pack={pack}
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
            ({lines.length} {lines.length === 1 ? "colour" : "colours"} selected)
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
                  <span className="text-muted-foreground font-mono text-[12px]">{row.sku}</span>
                  <span className="text-foreground ml-auto font-semibold tabular-nums">
                    {line.quantity.toLocaleString("en-US")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.sku)}
                    aria-label={`Remove ${row.colour} from your list`}
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
              ? "Add at least one colour to request a quote."
              : "Priced by quotation against your specification and volume. No account needed to ask."}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 max-w-2xl text-[13px] leading-relaxed">
        Colours not listed are not part of this line. Shades are matched from a physical sample when
        we quote, and quantities are supplied in packs of {pack} and round up to the next pack.{" "}
        <Link href={SPA_SALON_BASE} className="underline underline-offset-4">
          The rest of the range
        </Link>{" "}
        is quoted separately.
      </p>
    </>
  );
}

function SpecTableRow({
  row,
  pack,
  listed,
  highlighted,
  onAdd,
}: {
  row: SpaSalonSpecRow;
  pack: number;
  listed: number | null;
  highlighted: boolean;
  onAdd: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const typed = /^\d{1,7}$/.test(draft.trim()) ? Number(draft.trim()) : null;
  const canAdd = typed !== null && typed > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(Math.ceil(typed / pack) * pack);
    setDraft("");
  };

  return (
    <tr
      className={cn("border-premium/15 border-b last:border-0", highlighted && "bg-primary/[0.06]")}
    >
      <th scope="row" className="text-foreground px-5 py-3.5 text-left font-medium">
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
              {listed.toLocaleString("en-US")}
            </span>
          ) : null}
        </span>
      </th>
      <td className="text-foreground/80 px-5 py-3.5 font-mono text-[12.5px]">{row.sku}</td>
      <td className="px-5 py-3.5">
        <input
          type="number"
          inputMode="numeric"
          min={pack}
          step={pack}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          aria-label={`Quantity of ${row.colour}`}
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
