"use client";

import { useId, useState } from "react";
import { ArrowDown } from "lucide-react";
import { SPEC_SECTION_ID, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import type { OrderSpec } from "@/lib/catalogue-lines";
import { roundUpToCase } from "@/lib/case-pack";
import { cn } from "@/lib/utils";

/**
 * Choose a row and a quantity, then go down to the table. This is the
 * catalogue's version of TerrySpecPicker, which has the fuller reasoning: the
 * same panel, the same rounding on blur, and the same inert "Next" until both
 * are set.
 *
 * NO BUTTONS WHEN THERE IS NOTHING TO CHOOSE. A product made in a single row
 * (Hyperbaric Blanket, Serpentine Blanket) goes straight to the quantity. That
 * one row is already chosen, which is how the single-row Food & Beverage pages
 * behave too.
 */
export function CatalogueSpecPicker({ spec }: { spec: OrderSpec }) {
  const { setLine, setSelected, selected } = useRangeOrderList();
  const [quantity, setQuantity] = useState("");
  const [roundedFrom, setRoundedFrom] = useState<number | null>(null);
  const qtyId = useId();
  const qtyHelpId = useId();
  const helpId = useId();

  const single = spec.rows.length === 1 ? spec.rows[0] : null;
  const chosen = single ?? spec.rows.find((r) => r.code === selected) ?? null;
  // Until a row is chosen, the step is the one every row shares, or 1.
  const step =
    chosen?.step ?? (new Set(spec.rows.map((r) => r.step)).size === 1 ? spec.rows[0].step : 1);
  const stepNote = chosen?.stepNote ?? spec.rows[0].stepNote;
  const unit = chosen?.unit ?? spec.rows[0].unit;

  const typed = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const qty = typed !== null && typed > 0 && typed % step === 0 ? typed : null;

  // From the figure the buyer typed, not from an earlier rounding of it, so
  // trying a few rows does not ratchet the quantity up.
  const snapToCase = (perCase: number) => {
    const base = roundedFrom ?? typed;
    if (base === null || base <= 0) return;
    const rounded = roundUpToCase(base, perCase);
    setRoundedFrom(rounded === base ? null : base);
    setQuantity(String(rounded));
  };

  const ready = chosen !== null && qty !== null;

  const goToTable = () => {
    if (!chosen || !qty) return;
    setLine(chosen.code, qty);
    document
      .getElementById(SPEC_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="border-premium/25 mt-8 rounded-xl border p-5 sm:p-6">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Build your request
      </p>

      {spec.facts.length ? (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {spec.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-foreground mt-1 text-sm font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {single ? null : (
        <>
          <fieldset className="mt-6">
            <legend className="text-foreground/80 text-[13px] font-semibold">
              {spec.choiceLabel}{" "}
              <span className="text-muted-foreground font-normal">(required)</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {spec.rows.map((row) => {
                const active = row.code === selected;
                return (
                  <button
                    key={row.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelected(row.code);
                      snapToCase(row.step);
                    }}
                    className={cn(
                      "focus-visible:ring-ring rounded-lg border px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                    )}
                  >
                    <span className="block text-[14px] font-medium">{row.title}</span>
                    {row.detail.map((line) => (
                      <span key={line} className="text-muted-foreground block text-[12.5px]">
                        {line}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="text-muted-foreground mt-4 text-[13.5px]" aria-live="polite">
            {chosen ? (
              <>
                Selected: <span className="text-foreground font-semibold">{chosen.summary}</span>
              </>
            ) : (
              `Pick a ${spec.choiceLabel.toLowerCase()} to continue.`
            )}
          </p>
        </>
      )}

      {/* ── Quantity ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-2 sm:max-w-[16rem]">
        <label htmlFor={qtyId} className="text-foreground/80 text-[13px] font-semibold">
          Quantity in {unit === "dz" ? "dozens" : "pieces"}{" "}
          <span className="text-muted-foreground font-normal">(required)</span>
        </label>
        <input
          id={qtyId}
          type="number"
          inputMode="numeric"
          min={step}
          step={step}
          required
          aria-describedby={qtyHelpId}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setRoundedFrom(null);
          }}
          onBlur={() => snapToCase(step)}
          placeholder={`e.g. ${(step > 1 ? step * 2 : unit === "dz" ? 10 : 100).toLocaleString("en-US")}`}
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
        <p id={qtyHelpId} className="text-muted-foreground text-[12.5px] leading-relaxed">
          {roundedFrom !== null ? (
            <span className="text-foreground font-medium">
              Rounded up from {roundedFrom.toLocaleString("en-US")} to a full case. {stepNote}
            </span>
          ) : (
            stepNote
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
            ? `Choose a ${spec.choiceLabel.toLowerCase()} above to continue.`
            : !qty
              ? step > 1
                ? `Enter a quantity in multiples of ${step.toLocaleString("en-US")} to continue.`
                : "Enter a quantity to continue."
              : "Adds this to your list and takes you to the full table, where you can add more."}
        </p>
      </div>
    </div>
  );
}
