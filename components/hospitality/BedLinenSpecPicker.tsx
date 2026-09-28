"use client";

import { useId, useState } from "react";
import { ArrowDown } from "lucide-react";
import {
  BED_LINEN_SPEC_SECTION_ID,
  useBedLinenOrderList,
} from "@/components/hospitality/BedLinenOrderList";
import { cn } from "@/lib/utils";

/**
 * Choose a size and a quantity, then go down to the table.
 *
 * Mirrors components/hospitality/TerrySpecPicker.tsx — same "Next" button that
 * seeds the list and scrolls rather than requesting a quote directly, same
 * rule that only the sizes this product is actually made in are offered. See
 * that file's docblock for the reasoning behind both.
 *
 * A BUTTON IS ONE LINE ON THE SHEET, NOT ONE BED SIZE. Where the sheet prints
 * one size and one stock code across several columns — 42"X36" for twin, full
 * and queen — that is one button reading "Twin / Full / Queen", because it is
 * one product with one code. Three buttons would imply three things to order.
 *
 * ── QUANTITY ROUNDS TO THIS PRODUCT'S OWN CASE PACK ─────────────────────────
 *
 * Terry Towels round to a dozen because towels are sold by the dozen. Bed
 * linen is sold by the case, and the case size is not one number across the
 * range — 24 for sheets, 72 for pillow cases, 12 for duvet covers, all from
 * the sheet's own PCS/CASE column.
 */

export type BedLinenPickerSize = {
  /** The client's stock code — the line's identity everywhere. */
  sku: string;
  /** "Queen", or "Twin / Full / Queen" where the sheet merges the columns. */
  label: string;
  dimensions: string;
};

export function BedLinenSpecPicker({
  facts,
  note,
  casePack,
  sizes,
}: {
  /** Fixed facts shown above the choice — thread count, design, blend, hem. */
  facts: { label: string; value: string }[];
  /** The sheet's own footnote for this product, where it has one. */
  note?: string;
  casePack: number | null;
  sizes: BedLinenPickerSize[];
}) {
  const { setLine, setSelected, selected } = useBedLinenOrderList();
  const [quantity, setQuantity] = useState("");
  const [roundedFrom, setRoundedFrom] = useState<number | null>(null);
  const qtyId = useId();
  const qtyHelpId = useId();
  const helpId = useId();

  const chosen = sizes.find((s) => s.sku === selected) ?? null;

  const typed = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const validStep = typed !== null && typed > 0 && (!casePack || typed % casePack === 0);
  const qty = validStep ? typed : null;

  const snapToCase = () => {
    if (typed === null || typed <= 0 || !casePack) return;
    const rounded = Math.ceil(typed / casePack) * casePack;
    setRoundedFrom(rounded === typed ? null : typed);
    setQuantity(String(rounded));
  };

  const ready = chosen !== null && qty !== null;

  const goToTable = () => {
    if (!chosen || !qty) return;
    setLine(chosen.sku, qty);
    document
      .getElementById(BED_LINEN_SPEC_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="border-premium/25 mt-8 rounded-xl border p-5 sm:p-6">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Build your request
      </p>

      {/* Fixed facts, shown before the choice — everything the sheet gives
          this product that does not vary by size. */}
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
              {fact.label}
            </dt>
            <dd className="text-foreground mt-1 text-sm font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {note ? <p className="text-muted-foreground mt-4 text-[12.5px] leading-relaxed">{note}</p> : null}

      {/* ── Size ─────────────────────────────────────────────────────── */}
      <fieldset className="mt-6">
        <legend className="text-foreground/80 text-[13px] font-semibold">
          Size <span className="text-muted-foreground font-normal">(required)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {sizes.map((size) => {
            const active = size.sku === selected;
            return (
              <button
                key={size.sku}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(size.sku)}
                className={cn(
                  "focus-visible:ring-ring rounded-lg border px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                )}
              >
                <span className="block text-[14px] font-medium">{size.label}</span>
                <span className="text-muted-foreground block text-[12.5px]">{size.dimensions}</span>
                {/* The stock code on the button itself: it is what a buyer
                    quotes back at Sales, so it should be visible at the moment
                    the choice is made rather than only in the table below. */}
                <span className="text-muted-foreground/80 mt-0.5 block font-mono text-[11px]">
                  {size.sku}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Quantity ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-2 sm:max-w-[16rem]">
        <label htmlFor={qtyId} className="text-foreground/80 text-[13px] font-semibold">
          Quantity <span className="text-muted-foreground font-normal">(required)</span>
        </label>
        <input
          id={qtyId}
          type="number"
          inputMode="numeric"
          min={casePack ?? 1}
          step={casePack ?? 1}
          required
          aria-describedby={qtyHelpId}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setRoundedFrom(null);
          }}
          onBlur={snapToCase}
          placeholder={casePack ? `e.g. ${casePack * 2}` : "e.g. 50"}
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
        <p id={qtyHelpId} className="text-muted-foreground text-[12.5px] leading-relaxed">
          {roundedFrom !== null ? (
            <span className="text-foreground font-medium">
              Rounded up from {roundedFrom.toLocaleString("en-US")} — supplied by the case of{" "}
              {casePack}.
            </span>
          ) : casePack ? (
            `Supplied in cases of ${casePack}, so quantities go up in ${casePack}s.`
          ) : (
            "No case pack is given for this line — enter the pieces you need."
          )}
        </p>
      </div>

      {/* ── Down to the table ────────────────────────────────────────── */}
      <div className="mt-7">
        <button
          type="button"
          onClick={goToTable}
          disabled={!ready}
          aria-describedby={helpId}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-lg px-7 text-[15px] font-semibold",
            ready
              ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Next
          <ArrowDown aria-hidden className="size-4" />
        </button>

        <p id={helpId} className="text-muted-foreground mt-3 text-[13px]">
          {!chosen
            ? "Choose a size above to continue."
            : !qty
              ? casePack
                ? `Enter a quantity in multiples of ${casePack} to continue.`
                : "Enter a quantity to continue."
              : "Adds this to your list and takes you to the full table, where you can add more sizes."}
        </p>
      </div>
    </div>
  );
}
