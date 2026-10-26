"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The "Build your request" panel for a line with no specification on the
 * client's sheet (Patient Gown, Hyperbaric Towel, the Airline lines).
 *
 * It has the same frame as the picker, so the page keeps its shape. But there
 * is no row to choose and no table to go down to, so it asks only for a
 * quantity and goes straight to the quote form. The form receives the line's
 * name and the quantity; app/(marketing)/quote/page.tsx checks both before
 * using either.
 */
export function CatalogueEnquiryPanel({ name }: { name: string }) {
  const [quantity, setQuantity] = useState("");
  const qtyId = useId();
  const qtyHelpId = useId();

  const typed = /^\d{1,7}$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const ready = typed !== null && typed > 0;
  const href = `/quote?enquiry=${encodeURIComponent(name)}${ready ? `&qty=${typed}` : ""}`;

  return (
    <div className="border-premium/25 mt-8 rounded-xl border p-5 sm:p-6">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Build your request
      </p>

      <dl className="mt-4">
        <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
          Specification
        </dt>
        <dd className="text-foreground mt-1 text-sm font-medium">On request</dd>
      </dl>

      <div className="mt-6 grid gap-2 sm:max-w-[16rem]">
        <label htmlFor={qtyId} className="text-foreground/80 text-[13px] font-semibold">
          Quantity <span className="text-muted-foreground font-normal">(required)</span>
        </label>
        <input
          id={qtyId}
          type="number"
          inputMode="numeric"
          min={1}
          required
          aria-describedby={qtyHelpId}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 500"
          className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4"
        />
        <p id={qtyHelpId} className="text-muted-foreground text-[12.5px] leading-relaxed">
          An estimate is enough. Pack sizes are confirmed with your quotation.
        </p>
      </div>

      <div className="mt-7">
        {ready ? (
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
          {ready
            ? "Priced by quotation against your specification and volume. No account needed to ask."
            : "Enter a quantity to continue."}
        </p>
      </div>
    </div>
  );
}
