"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import { RangeListScopeNote, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import type { OrderSpec, OrderSpecRow } from "@/lib/catalogue-lines";
import { roundUpToCase } from "@/lib/case-pack";
import type { QuoteListKind } from "@/lib/quote-list";
import { cn } from "@/lib/utils";

/**
 * The specification table, with a quantity box and "Add to List" on every
 * row. This is the catalogue's version of TerrySpecTable; read that file's
 * note for why the table is also the order form.
 *
 * The columns are the values that differ from row to row. The values every row
 * shares are already stated once in the picker panel above.
 */
export function CatalogueSpecTable({
  spec,
  listKind,
  listSlug,
  rangeHref,
  rangeLabel,
}: {
  spec: OrderSpec;
  /** How the quote list files this page — the `kind.slug` of its `?list=` entry. */
  listKind: QuoteListKind;
  listSlug: string;
  /** The range page, for the "can be added to the same list" line. */
  rangeHref: string;
  rangeLabel: string;
}) {
  const { lines, setLine, removeLine, quantityOf, selected } = useRangeOrderList();

  const href =
    lines.length > 0
      ? `/quote?list=${encodeURIComponent(
          `${listKind}.${listSlug}=${lines.map((l) => `${l.sku}:${l.quantity}`).join(",")}`
        )}`
      : null;

  const byCode = new Map(spec.rows.map((r) => [r.code, r]));
  const notes = new Set(spec.rows.map((r) => r.stepNote));
  const stepNote = notes.size === 1 ? spec.rows[0].stepNote : null;
  const units = new Set(spec.rows.map((r) => r.unit));
  const quantityHeading = units.size === 1 ? `Quantity (${spec.rows[0].unit})` : "Quantity";

  return (
    <>
      <div className="border-premium/25 bg-card relative overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">
            The builds of this product with their figures, and a quantity box for each
          </caption>
          <thead>
            <tr className="border-premium/20 border-b">
              {[...spec.columns, quantityHeading, ""].map((h, i) => (
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
            {spec.rows.map((row) => (
              <SpecTableRow
                key={row.code}
                row={row}
                listed={quantityOf(row.code)}
                highlighted={row.code === selected}
                onAdd={(qty) => setLine(row.code, qty)}
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
            ({lines.length} {lines.length === 1 ? "product" : "products"} selected)
          </span>
        </h3>

        {lines.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-[13.5px] leading-relaxed">
            Nothing added yet. Enter a quantity against any row above and press Add to List.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2.5">
            {lines.map((line) => {
              const row = byCode.get(line.sku);
              if (!row) return null;
              return (
                <li
                  key={line.sku}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3 text-[13.5px]"
                >
                  <span className="text-foreground font-medium">{row.summary}</span>
                  <span className="text-foreground ml-auto font-semibold tabular-nums">
                    {line.quantity.toLocaleString("en-US")} {row.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.sku)}
                    aria-label={`Remove ${row.summary} from your list`}
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
        Rows not listed are not part of this product. A dash means that detail is not recorded on
        our product sheet; ask us and we will confirm it.{stepNote ? ` ${stepNote}` : ""}{" "}
        <Link href={rangeHref} className="underline underline-offset-4">
          The rest of {rangeLabel}
        </Link>{" "}
        can be added to the same list.
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
  row: OrderSpecRow;
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

  const [head, ...rest] = row.cells;

  return (
    <tr
      className={cn("border-premium/15 border-b last:border-0", highlighted && "bg-primary/[0.06]")}
    >
      <th scope="row" className="text-foreground px-5 py-3.5 text-left font-medium">
        {head}
        {listed !== null ? (
          <span className="text-primary-strong dark:text-primary ml-2 inline-flex items-center gap-1 align-middle text-[11.5px] font-semibold">
            <Check aria-hidden className="size-3" />
            {listed.toLocaleString("en-US")} {row.unit}
          </span>
        ) : null}
      </th>
      {rest.map((cell, i) => (
        <td key={i} className="text-foreground/80 px-5 py-3.5">
          {cell}
        </td>
      ))}
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
          aria-label={`Quantity of ${row.summary} in ${row.unit === "dz" ? "dozens" : "pieces"}`}
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
