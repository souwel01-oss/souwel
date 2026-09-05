"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Choose the size, then ask for the quote.
 *
 * THE QUOTE BUTTON IS INERT UNTIL A SIZE IS PICKED, and that is the point of
 * the component. Weight changes with size on every one of these constructions —
 * a Piano Key wash cloth is 1.5 LBS and the bath towel is 18 — so a request
 * that does not name a size is a request Sales has to send back before they can
 * price anything. The choice is made here, while the buyer is looking at the
 * table, rather than typed into a message box two pages later.
 *
 * ONLY THE SIZES THIS CONSTRUCTION IS MADE IN ARE OFFERED. The list is built
 * from the sheet, so Classic Terry in 80/20 shows two buttons and the 100%
 * cotton version shows four. There is no greyed-out fifth button implying a
 * size we could supply if asked — the sheet does not say that.
 *
 * The disabled state is a real <button disabled>, not a Link styled to look
 * dead. A disabled anchor is still followed by a keyboard and still read as a
 * link by assistive tech; a disabled button is skipped by both, and the note
 * beneath it says what is missing.
 */

export type TerryPickerSize = {
  key: string;
  name: string;
  dimensions: string;
  weight: string;
};

export function TerrySpecPicker({
  productSlug,
  blend,
  hem,
  sizes,
}: {
  productSlug: string;
  blend: string;
  hem: string;
  sizes: TerryPickerSize[];
}) {
  const [sizeKey, setSizeKey] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const qtyId = useId();
  const helpId = useId();

  const chosen = sizes.find((s) => s.key === sizeKey) ?? null;

  // Only a positive whole number is carried through. Anything else is dropped
  // rather than passed on as-is — the quote page re-checks it, and a value that
  // will be rejected there should not look accepted here.
  const qty = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;

  const href = chosen
    ? `/quote?terry=${encodeURIComponent(productSlug)}&type=${encodeURIComponent(chosen.key)}` +
      (qty && qty > 0 ? `&qty=${qty}` : "")
    : null;

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
            const active = size.key === sizeKey;
            return (
              <button
                key={size.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSizeKey(size.key)}
                className={cn(
                  "focus-visible:ring-ring rounded-lg border px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground/80 hover:border-premium hover:text-foreground"
                )}
              >
                <span className="block text-[14px] font-medium">{size.name}</span>
                <span className="text-muted-foreground block text-[12.5px]">{size.dimensions}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* The weight is shown, never chosen — it follows from the size. */}
      <p className="text-muted-foreground mt-4 text-[13.5px]" aria-live="polite">
        {chosen ? (
          <>
            Weight for {chosen.name}: <span className="text-foreground font-semibold">{chosen.weight}</span>
          </>
        ) : (
          "Pick a product type to see its weight."
        )}
      </p>

      {/* ── Quantity ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-2 sm:max-w-[16rem]">
        <label htmlFor={qtyId} className="text-foreground/80 text-[13px] font-semibold">
          Quantity <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id={qtyId}
          type="number"
          inputMode="numeric"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 500"
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
      </div>

      {/* ── Through to the quote ─────────────────────────────────────── */}
      <div className="mt-7">
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
            aria-describedby={helpId}
            className="bg-muted text-muted-foreground inline-flex h-12 cursor-not-allowed items-center gap-2 rounded-lg px-7 text-[15px] font-semibold"
          >
            Request a Quote
            <ArrowRight aria-hidden className="size-4" />
          </button>
        )}

        <p id={helpId} className="text-muted-foreground mt-3 text-[13px]">
          {chosen
            ? "Priced by quotation against your specification and volume. No account needed to ask."
            : "Choose a product type above to continue."}
        </p>
      </div>
    </div>
  );
}
