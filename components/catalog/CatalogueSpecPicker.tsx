"use client";

import { useId } from "react";
import { ArrowDown } from "lucide-react";
import { SPEC_SECTION_ID, useRangeOrderList } from "@/components/hospitality/RangeOrderList";
import type { OrderSpec } from "@/lib/catalogue-lines";
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
  const helpId = useId();

  const single = spec.rows.length === 1 ? spec.rows[0] : null;
  const chosen = single ?? spec.rows.find((r) => r.code === selected) ?? null;
  // Until a row is chosen, the step is the one every row shares, or 1.
  const step =
    chosen?.step ?? (new Set(spec.rows.map((r) => r.step)).size === 1 ? spec.rows[0].step : 1);

  // One case is the smallest order; the table below is where the quantity is set.
  const qty = step;

  const ready = chosen !== null;

  const goToTable = () => {
    if (!chosen) return;
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
            ? `Choose a ${spec.choiceLabel.toLowerCase()} above to continue.`
            : "Adds this to your list and takes you to the full table, where you set the quantity and add more."}
        </p>
      </div>
    </div>
  );
}
