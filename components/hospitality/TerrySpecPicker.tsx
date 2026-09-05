"use client";

import { useId, useState } from "react";
import { ArrowDown } from "lucide-react";
import { TERRY_DOZEN, roundUpToDozen, type TerrySizeKey } from "@/lib/terry-towels";
import { SPEC_SECTION_ID, useTerryOrderList } from "@/components/hospitality/TerryOrderList";
import { cn } from "@/lib/utils";

/**
 * Choose a size and a quantity, then go down to the table.
 *
 * THIS NO LONGER ENDS AT THE QUOTE FORM. It ends at the specification table,
 * because a buyer ordering hotel linen rarely wants one size — they want
 * washcloths and hand towels and bath towels of the same construction, and the
 * table is where the rest of that list gets built. "Next" carries the choice
 * made here into the list and scrolls; the quote request is sent from the
 * bottom of the table once the list is complete.
 *
 * THE BUTTON IS INERT UNTIL BOTH A SIZE AND A QUANTITY ARE SET, and that is
 * still the point of the component. Weight changes with size on every one of
 * these constructions — a Piano Key wash cloth is 1.5 LBS and its bath towel is
 * 18 — so a line with no size named is a line Sales has to send back.
 *
 * ONLY THE SIZES THIS CONSTRUCTION IS MADE IN ARE OFFERED. The list is built
 * straight from the sheet's filled cells, so Classic Terry in 80/20 shows two
 * buttons and the 100% cotton version shows four. There is no greyed-out button
 * implying a size we could supply if asked, and no size appears anywhere the
 * sheet leaves blank.
 *
 * ── QUANTITY IS IN DOZENS ────────────────────────────────────────────────────
 *
 * These are supplied by the dozen, so a quantity that is not a multiple of
 * twelve cannot be filled as typed. Rather than reject it, the field ROUNDS UP
 * to the next twelve: 10,000 becomes 10,008.
 *
 * It rounds on BLUR, never while typing. Snapping on each keystroke means the
 * "1" of 1200 becomes 12 before the second digit lands, and the buyer fights
 * the field the whole way. And it says so afterwards: a number that silently
 * changes itself between being typed and being sent is the kind of thing a
 * buyer discovers on the quotation.
 */

export type TerryPickerSize = {
  key: TerrySizeKey;
  name: string;
  dimensions: string;
  weight: string;
  sku: string;
};

export function TerrySpecPicker({
  blend,
  hem,
  sizes,
}: {
  blend: string;
  hem: string;
  sizes: TerryPickerSize[];
}) {
  const { setLine, setSelected, selected } = useTerryOrderList();
  const [quantity, setQuantity] = useState("");
  /** The figure the buyer typed, when rounding changed it. Cleared on edit. */
  const [roundedFrom, setRoundedFrom] = useState<number | null>(null);
  const qtyId = useId();
  const qtyHelpId = useId();
  const helpId = useId();

  const chosen = sizes.find((s) => s.key === selected) ?? null;

  const typed = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const qty = typed !== null && typed > 0 && typed % TERRY_DOZEN === 0 ? typed : null;

  const snapToDozen = () => {
    if (typed === null || typed <= 0) return;
    const rounded = roundUpToDozen(typed);
    setRoundedFrom(rounded === typed ? null : typed);
    setQuantity(String(rounded));
  };

  const ready = chosen !== null && qty !== null;

  const goToTable = () => {
    if (!chosen || !qty) return;
    // Into the list BEFORE the scroll, so the row is already there when the
    // table arrives rather than appearing under the buyer a frame later.
    setLine(chosen.key, qty);
    document
      .getElementById(SPEC_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="border-premium/25 mt-8 rounded-xl border p-5 sm:p-6">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Build your request
      </p>

      {/* Fixed facts, shown before the choice so the buyer knows what is not
          selectable: the blend and the hem come with the construction. */}
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
            Blend
          </dt>
          <dd className="text-foreground mt-1 text-sm font-medium">{blend}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
            Hem
          </dt>
          <dd className="text-foreground mt-1 text-sm font-medium">{hem}</dd>
        </div>
      </dl>

      {/* ── Product type ─────────────────────────────────────────────── */}
      <fieldset className="mt-6">
        <legend className="text-foreground/80 text-[13px] font-semibold">
          Product type <span className="text-muted-foreground font-normal">(required)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {sizes.map((size) => {
            const active = size.key === selected;
            return (
              <button
                key={size.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(size.key)}
                className={cn(
                  "focus-visible:ring-ring rounded-lg border px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                )}
              >
                <span className="block text-[14px] font-medium">{size.name}</span>
                <span className="text-muted-foreground block text-[12.5px]">{size.dimensions}</span>
                {/* The SKU on the button itself: it is the thing a buyer quotes
                    back at Sales, and hiding it until the table below would mean
                    choosing a product without seeing its code. */}
                <span className="text-muted-foreground/80 mt-0.5 block font-mono text-[11px]">
                  {size.sku}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* The weight is shown, never chosen — it follows from the size. */}
      <p className="text-muted-foreground mt-4 text-[13.5px]" aria-live="polite">
        {chosen ? (
          <>
            Weight for {chosen.name}:{" "}
            <span className="text-foreground font-semibold">{chosen.weight}</span>
          </>
        ) : (
          "Pick a product type to see its weight."
        )}
      </p>

      {/* ── Quantity ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-2 sm:max-w-[16rem]">
        <label htmlFor={qtyId} className="text-foreground/80 text-[13px] font-semibold">
          Quantity <span className="text-muted-foreground font-normal">(required)</span>
        </label>
        <input
          id={qtyId}
          type="number"
          inputMode="numeric"
          // step and min so the browser's own spinners already move in twelves —
          // the blur handler is the safety net, not the only thing teaching it.
          min={TERRY_DOZEN}
          step={TERRY_DOZEN}
          required
          aria-describedby={qtyHelpId}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setRoundedFrom(null);
          }}
          onBlur={snapToDozen}
          placeholder="e.g. 504"
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
        <p id={qtyHelpId} className="text-muted-foreground text-[12.5px] leading-relaxed">
          {roundedFrom !== null ? (
            <span className="text-foreground font-medium">
              Rounded up from {roundedFrom.toLocaleString("en-US")} — supplied by the dozen.
            </span>
          ) : (
            "Supplied by the dozen, so quantities go up in twelves."
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
            ? "Choose a product type above to continue."
            : !qty
              ? "Enter a quantity in multiples of 12 to continue."
              : "Adds this to your list and takes you to the full table, where you can add more sizes."}
        </p>
      </div>
    </div>
  );
}
