"use client";

import { useId } from "react";
import { ArrowDown } from "lucide-react";
import { terryCaseStep, terryWeightLabel } from "@/lib/terry-towels";
import { SPEC_SECTION_ID, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
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
 * ── QUANTITY IS IN DOZENS, IN WHOLE CASES ───────────────────────────────────
 *
 * Each size is packed a set number of dozens to the case, and the case is the
 * minimum order. A quantity that is not a whole number of cases cannot be
 * filled as typed, so rather than reject it the field ROUNDS UP to the next
 * case: a wash cloth packed 15 dz to the case turns 20 into 30. See
 * lib/case-pack.ts.
 *
 * It rounds on BLUR, never while typing. Snapping on each keystroke means the
 * "1" of 150 becomes 15 before the second digit lands, and the buyer fights
 * the field the whole way. It rounds again when the size changes, because the
 * case does. And it says so afterwards: a number that silently changes itself
 * between being typed and being sent is the kind of thing a buyer discovers
 * on the quotation.
 */

export type TerryPickerSize = {
  /** The client's stock code — the line's identity everywhere. */
  sku: string;
  name: string;
  dimensions: string;
  weight: string;
  /** What that figure is per. Null where it is a density, not a bundle. */
  weightPer: "dozen" | null;
  /** Dozens per case, where the sheet gives one for this size. */
  dozenPerCase: number | null;
};

export function TerrySpecPicker({
  blend,
  hem,
  note,
  sizes,
}: {
  blend: string;
  hem: string;
  /** The sheet's own footnote for this product, where it has one. */
  note?: string;
  sizes: TerryPickerSize[];
}) {
  const { setLine, setSelected, selected } = useRangeOrderList();
  const helpId = useId();

  const chosen = sizes.find((s) => s.sku === selected) ?? null;
  // Until a size is chosen there is no case to round to, only the dozen.
  const step = chosen ? terryCaseStep(chosen) : 1;

  // One case is the smallest order; the table below is where the quantity is set.
  const qty = step;

  const ready = chosen !== null;

  const goToTable = () => {
    if (!chosen) return;
    // Into the list BEFORE the scroll, so the row is already there when the
    // table arrives rather than appearing under the buyer a frame later.
    setLine(chosen.sku, qty);
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

      {note ? (
        <p className="text-muted-foreground mt-4 text-[12.5px] leading-relaxed">{note}</p>
      ) : null}

      {/* ── Product type ─────────────────────────────────────────────── */}
      <fieldset className="mt-6">
        <legend className="text-foreground/80 text-[13px] font-semibold">
          Product type <span className="text-muted-foreground font-normal">(required)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {sizes.map((size) => {
            const active = size.sku === selected;
            return (
              <button
                key={size.sku}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelected(size.sku);
                }}
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
            <span className="text-foreground font-semibold">{terryWeightLabel(chosen)}</span>
            {chosen.dozenPerCase ? <> · packed {chosen.dozenPerCase} dz per case</> : null}
          </>
        ) : (
          "Pick a product type to see its weight."
        )}
      </p>

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
          Request quote
          <ArrowDown aria-hidden className="size-4" />
        </button>

        <p id={helpId} className="text-muted-foreground mt-3 text-[13px]">
          {!chosen
            ? "Choose a product type above to continue."
            : "Adds this to your list and takes you to the full table, where you set the quantity and add more sizes."}
        </p>
      </div>
    </div>
  );
}
