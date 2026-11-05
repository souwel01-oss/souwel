"use client";

import { useId } from "react";
import { ArrowDown } from "lucide-react";
import { SPEC_SECTION_ID, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import { cn } from "@/lib/utils";

/**
 * Choose a colour and a quantity, then go down to the table.
 *
 * THE CHOICE IS A COLOUR HERE, NOT A SIZE, and that is the whole difference
 * from the Terry and Bed Linen pickers. Each of these four products is made
 * in one size — a salon towel is 16"X28" and nothing else — and the sheet
 * gives a separate stock code per colour, so the colour is what is being
 * ordered. Size and weight are shown above as fixed facts, because they are.
 *
 * THE SWATCH IS INDICATIVE, THE NAME IS AUTHORITATIVE. The colour square is
 * an approximation of a shade the sheet only names, so the name sits beside
 * it rather than under it, and the swatch is never the only carrier — it is
 * invisible to a screen reader and ambiguous to anyone who cannot separate
 * the hues. Shades are matched from a physical sample when we quote.
 *
 * QUANTITY ROUNDS UP TO THIS PRODUCT'S PACK — 12 pieces for the salon towel,
 * bath sheet and spa sheet, 24 for the hair wash/dye towel, from the sheet's
 * own PACK column. It rounds on BLUR, never while typing: snapping on each
 * keystroke means the "1" of 120 becomes 12 before the second digit lands.
 */

export type SpaSalonPickerColour = {
  /** The client's stock code — the line's identity everywhere. */
  sku: string;
  colour: string;
  /** Indicative swatch, or null when the shade name has no mapping. Left out
   *  where the option is a weight or a size and has no swatch to draw. */
  hex?: string | null;
};

export function SpaSalonSpecPicker({
  facts,
  pack,
  colours,
  noun = "colour",
  unit = "pieces",
}: {
  /** Fixed facts shown above the choice — thread count, size, weight, pack. */
  facts: { label: string; value: string }[];
  pack: number;
  colours: SpaSalonPickerColour[];
  /** What the options are: "colour" here, "weight" or "size" on Health-Care. */
  noun?: string;
  /** What a quantity is counted in: "pieces", or "dozen" on a Health-Care case. */
  unit?: string;
}) {
  const { setLine, setSelected, selected } = useRangeOrderList();
  const helpId = useId();

  // One option is no choice: it is selected for the buyer.
  const chosen =
    colours.find((c) => c.sku === selected) ?? (colours.length === 1 ? colours[0] : null);
  const hasSwatches = colours.some((c) => c.hex !== undefined);
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  // One pack is the smallest order; the table below is where the quantity is set.
  const qty = pack;

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

      {/* Fixed facts — everything the sheet gives that does not vary by colour. */}
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

      {/* ── Colour ───────────────────────────────────────────────────── */}
      <fieldset className="mt-6">
        <legend className="text-foreground/80 text-[13px] font-semibold">
          {Noun} <span className="text-muted-foreground font-normal">(required)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {colours.map((option) => {
            const active = option.sku === selected;
            return (
              <button
                key={option.sku}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(option.sku)}
                className={cn(
                  "focus-visible:ring-ring flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                )}
              >
                {/* The inset white ring is what keeps a pale shade — ivory,
                    beige, white — visible against an ivory page. */}
                {option.hex !== undefined ? (
                  <span
                    aria-hidden
                    className="border-foreground/25 block size-5 shrink-0 rounded-[4px] border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]"
                    style={option.hex ? { backgroundColor: option.hex } : undefined}
                  />
                ) : null}
                <span>
                  <span className="block text-[14px] font-medium">{option.colour}</span>
                  {/* The code on the button itself: it is what a buyer quotes
                      back at Sales, and hiding it until the table below would
                      mean choosing a colour without seeing its code. */}
                  <span className="text-muted-foreground/80 block font-mono text-[11px]">
                    {option.sku}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {hasSwatches ? (
        <p className="text-muted-foreground mt-4 text-[12.5px] leading-relaxed">
          Swatches are indicative only — shades are matched from a physical sample when we quote.
        </p>
      ) : null}

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
            ? `Choose a ${noun} above to continue.`
            : `Adds this to your list and takes you to the full table, where you set the quantity and add more ${noun}s.`}
        </p>
      </div>
    </div>
  );
}
