"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * − / quantity / + for one row of the quote list.
 *
 * THE NUMBER IS TYPEABLE, NOT ONLY STEPPABLE. This is a trade list: a buyer
 * wants 500 of something, and a control that only goes up one press at a time
 * makes that 499 presses. The buttons are for nudging a figure; the box is for
 * entering one.
 *
 * `step` IS THE UNIT THE LINE IS SUPPLIED IN — a dozen, a case, a pack. The
 * buttons move by it and a typed figure rounds UP to it on commit, the same
 * way the range pages round, so the drawer cannot hold a quantity the product
 * page would have refused.
 *
 * A text input with `inputMode="numeric"`, not `type="number"`: the number
 * type changes value under a scrolling mouse wheel, and this sits inside a
 * scrolling list.
 */
export function QuantityStepper({
  value,
  step = 1,
  max,
  name,
  onChange,
  className,
}: {
  value: number;
  step?: number;
  max: number;
  /** What is being counted, for the controls' accessible names. */
  name: string;
  onChange: (next: number) => void;
  className?: string;
}) {
  /** What is being typed, or null when the box simply shows `value`. */
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const text = draft.trim();
    setDraft(null);
    // Anything that is not a positive whole number snaps back to what was there.
    if (!/^\d{1,7}$/.test(text)) return;
    const typed = Number(text);
    if (typed < 1) return;
    onChange(Math.min(Math.ceil(typed / step) * step, max));
  };

  const button =
    "text-foreground/70 hover:text-foreground hover:bg-muted focus-visible:ring-ring grid w-9 shrink-0 place-items-center transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label={`Quantity of ${name}`}
      className={cn(
        "border-input bg-card inline-flex h-9 shrink-0 items-stretch overflow-hidden rounded-lg border",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(value - step, step))}
        // Stops at one unit. Taking a product off the list is the remove
        // button's job, and a − that deletes on its last press loses rows.
        disabled={value <= step}
        aria-label={`Decrease quantity of ${name}`}
        className={button}
      >
        <Minus aria-hidden className="size-3.5" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        aria-label={`Quantity of ${name}`}
        className="border-input text-foreground focus-visible:bg-primary/[0.07] w-14 min-w-0 border-x bg-transparent px-1 text-center text-[13.5px] font-semibold tabular-nums outline-none"
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(value + step, max))}
        disabled={value + step > max}
        aria-label={`Increase quantity of ${name}`}
        className={button}
      >
        <Plus aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
