"use client";

import { useId, useState } from "react";
import { ArrowDown } from "lucide-react";
import { SPEC_SECTION_ID, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import { cn } from "@/lib/utils";

/**
 * Choose a size and a colour, then a quantity, then go down to the table.
 *
 * TWO AXES, NOT ONE, and that is the difference from every other picker on
 * the site. A bar mop is one size in six colours; a table cloth is eight
 * sizes in seven colours. The sheet gives a separate code for each PAIR, so
 * the pair is what identifies the line — and until both halves are chosen
 * there is no code to put on the request.
 *
 * THE SIZE FIELDSET DISAPPEARS WHEN THERE IS ONLY ONE. A single button that
 * cannot be un-chosen is not a choice; the size moves up into the fixed facts
 * instead, where the blend and weight already are. Same for colour.
 *
 * A PAIR THE SHEET LEAVES BLANK IS NOT OFFERED. The pencil-pocket aprons run
 * in white and black only, so those are the only two buttons on that product
 * — there is no greyed-out swatch implying a colour we could supply if asked.
 */

export type FbPickerColour = {
  colour: string;
  /** Indicative swatch, or null when the shade name has no mapping. */
  hex: string | null;
};

export function FoodBevSpecPicker({
  facts,
  sizes,
  colours,
  /** "<size>|<colour>" -> sku, for the pairs the sheet fills in. */
  skus,
  /** Null where the sheet gives no per-dozen figure to round to. */
  dozenRounding,
  packingBySize,
}: {
  facts: { label: string; value: string }[];
  sizes: string[];
  colours: FbPickerColour[];
  skus: Record<string, string>;
  dozenRounding: number | null;
  packingBySize: Record<string, string>;
}) {
  const { setLine, setSelected } = useRangeOrderList();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [colour, setColour] = useState<string | null>(
    colours.length === 1 ? colours[0].colour : null
  );
  const [quantity, setQuantity] = useState("");
  /** The figure the buyer typed, when rounding changed it. Cleared on edit. */
  const [roundedFrom, setRoundedFrom] = useState<number | null>(null);
  const qtyId = useId();
  const qtyHelpId = useId();
  const helpId = useId();

  const skuFor = (s: string | null, c: string | null) =>
    s && c ? (skus[`${s}|${c}`] ?? null) : null;

  const sku = skuFor(size, colour);

  /**
   * The picker owns its own two halves, but the row the table highlights is
   * the shared one — so the resolved code is pushed across as soon as both
   * halves are set, not only when "Next" is pressed. Done in the handlers
   * rather than during render: setting another component's state while
   * rendering is what React re-renders forever over.
   */
  const chooseSize = (next: string) => {
    setSize(next);
    setSelected(skuFor(next, colour));
  };
  const chooseColour = (next: string) => {
    setColour(next);
    setSelected(skuFor(size, next));
  };

  const typed = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const validStep =
    typed !== null && typed > 0 && (!dozenRounding || typed % dozenRounding === 0);
  const qty = validStep ? typed : null;

  const snapToDozen = () => {
    if (typed === null || typed <= 0 || !dozenRounding) return;
    const rounded = Math.ceil(typed / dozenRounding) * dozenRounding;
    setRoundedFrom(rounded === typed ? null : typed);
    setQuantity(String(rounded));
  };

  const ready = sku !== null && qty !== null;

  const goToTable = () => {
    if (!sku || !qty) return;
    setLine(sku, qty);
    document
      .getElementById(SPEC_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const packing = size ? packingBySize[size] : undefined;

  return (
    <div className="border-premium/25 mt-8 rounded-xl border p-5 sm:p-6">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Build your request
      </p>

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

      {/* ── Size, only where there is a choice ───────────────────────── */}
      {sizes.length > 1 ? (
        <fieldset className="mt-6">
          <legend className="text-foreground/80 text-[13px] font-semibold">
            Size <span className="text-muted-foreground font-normal">(required)</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {sizes.map((option) => {
              const active = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseSize(option)}
                  className={cn(
                    "focus-visible:ring-ring rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                  )}
                >
                  {option}
                  {packingBySize[option] ? (
                    <span className="text-muted-foreground block text-[11.5px] font-normal">
                      {packingBySize[option]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* ── Colour, only where there is a choice ─────────────────────── */}
      {colours.length > 1 ? (
        <fieldset className="mt-6">
          <legend className="text-foreground/80 text-[13px] font-semibold">
            Colour <span className="text-muted-foreground font-normal">(required)</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {colours.map((option) => {
              const active = option.colour === colour;
              return (
                <button
                  key={option.colour}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseColour(option.colour)}
                  className={cn(
                    "focus-visible:ring-ring flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                  )}
                >
                  {/* The inset white ring keeps a pale shade visible on an
                      ivory page. The name beside it is what a screen reader
                      and anyone who cannot separate the hues actually reads. */}
                  <span
                    aria-hidden
                    className="border-foreground/25 block size-5 shrink-0 rounded-[4px] border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]"
                    style={option.hex ? { backgroundColor: option.hex } : undefined}
                  />
                  {option.colour}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* The code follows from the pair; it is shown, never chosen. */}
      <p className="text-muted-foreground mt-4 text-[13.5px]" aria-live="polite">
        {sku ? (
          <>
            Stock code: <span className="text-foreground font-mono font-semibold">{sku}</span>
            {packing ? <> · packed {packing}</> : null}
          </>
        ) : (
          "Choose a size and colour to see its stock code."
        )}
      </p>

      <p className="text-muted-foreground mt-2 text-[12.5px] leading-relaxed">
        Swatches are indicative only — shades are matched from a physical sample when we quote.
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
          min={dozenRounding ?? 1}
          step={dozenRounding ?? 1}
          required
          aria-describedby={qtyHelpId}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setRoundedFrom(null);
          }}
          onBlur={snapToDozen}
          placeholder={dozenRounding ? "e.g. 144" : "e.g. 100"}
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
        <p id={qtyHelpId} className="text-muted-foreground text-[12.5px] leading-relaxed">
          {roundedFrom !== null ? (
            <span className="text-foreground font-medium">
              Rounded up from {roundedFrom.toLocaleString("en-US")} — supplied by the dozen.
            </span>
          ) : dozenRounding ? (
            "Supplied by the dozen, so quantities go up in twelves."
          ) : (
            "No pack size is given for this line — enter the pieces you need."
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
          {!size
            ? "Choose a size above to continue."
            : !colour
              ? "Choose a colour above to continue."
              : !sku
                ? "That size is not made in that colour. Pick another pair."
                : !qty
                  ? dozenRounding
                    ? "Enter a quantity in multiples of 12 to continue."
                    : "Enter a quantity to continue."
                  : "Adds this to your list and takes you to the full table, where you can add more."}
        </p>
      </div>
    </div>
  );
}
