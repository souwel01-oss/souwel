"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";
import { submitQuoteRequest } from "@/app/(marketing)/quote/actions";
import { cn } from "@/lib/utils";

/**
 * The request-a-quote form.
 *
 * WHY THE PRODUCT LIST ARRIVES AS A PROP rather than being imported here: the
 * full catalogue lives in lib/product-data.ts with a specification blob per
 * product, and importing it from a client component would ship all twenty-four
 * spec tables to the browser just to render a dropdown. The page passes down
 * only what a picker needs — slug, name, category.
 *
 * NO PRICES ANYWHERE, by design. This form asks what and how many; what it
 * costs comes back from Sales through the CRM.
 */

export type QuotePickerProduct = {
  slug: string;
  name: string;
  categoryName: string;
};

type LineItem = {
  /** Stable key so React does not re-mount rows when one above is removed. */
  key: string;
  slug: string;
  quantity: string;
  notes: string;
};

export type QuoteRequestFormProps = {
  products: QuotePickerProduct[];
  /** Slug taken from ?product=, so the row is pre-filled from a product page. */
  initialSlug?: string;
  /**
   * A product NAME, for a Hospitality line with no catalogue entry.
   *
   * Twenty of the thirty-one lines have no slug for the picker to select, so
   * the name arrives as prose. When it is set the product picker becomes
   * optional: the request is about a named line, and the server accepts it with
   * no line items — see the schema note in the quote action.
   */
  enquiryName?: string;
  /** Prefill for a signed-in customer, so they are not retyping known details. */
  prefill?: { name: string; email: string; company: string };
};

let rowCounter = 0;
const nextKey = () => `row-${(rowCounter += 1)}`;

export function QuoteRequestForm({
  products,
  initialSlug,
  enquiryName,
  prefill,
}: QuoteRequestFormProps) {
  const [items, setItems] = useState<LineItem[]>(() => [
    { key: nextKey(), slug: initialSlug ?? "", quantity: "", notes: "" },
  ]);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { key: nextKey(), slug: "", quantity: "", notes: "" }]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.key !== key)));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const chosen = items.filter((i) => i.slug);

    // The guard is skipped for a named enquiry — there is nothing in the
    // picker to choose, which is the whole reason the name came through the
    // query string in the first place.
    if (chosen.length === 0 && !enquiryName) {
      setFormError("Choose at least one product before sending.");
      return;
    }
    const missingQuantity = chosen.some((i) => !i.quantity || Number(i.quantity) < 1);
    if (missingQuantity) {
      setFormError("Give an estimated quantity for every product.");
      return;
    }

    setPending(true);
    try {
      const result = await submitQuoteRequest({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        company: String(form.get("company") ?? ""),
        phone: String(form.get("phone") ?? ""),
        message: String(form.get("message") ?? ""),
        enquiry: enquiryName,
        items: chosen.map((i) => ({
          slug: i.slug,
          quantity: Number(i.quantity),
          notes: i.notes || undefined,
        })),
      });

      if (result.ok) {
        setReference(result.reference);
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (reference) {
    return (
      <div className="border-border bg-card rounded-2xl border p-8 text-center">
        <CheckCircle2 aria-hidden className="text-primary mx-auto size-10" />
        <h2 className="text-foreground mt-4 text-2xl font-semibold">Request received</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
          Your reference is{" "}
          <span className="text-foreground font-mono font-semibold">{reference}</span>. Quote it if
          you get in touch before we reply. Our team will come back to you with pricing and lead
          times.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center rounded-lg border px-5 text-sm font-semibold transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/register"
            className="bg-primary-strong text-primary-strong-foreground inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold transition-[filter] hover:brightness-110"
          >
            Create an account to track it
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8" noValidate>
      <section className="grid gap-4">
        <h2 className="text-foreground text-lg font-semibold">What do you need?</h2>

        {enquiryName ? (
          /* Says what the buyer already told us by clicking through, and says
             that the picker below is now optional. Without it the form looks
             identical to the one that would reject them, and the fastest way to
             find out otherwise is to fill it all in and press send. */
          <p className="border-premium/40 bg-premium/10 text-foreground rounded-lg border px-4 py-3 text-[14px] leading-relaxed">
            You are asking about <span className="font-semibold">{enquiryName}</span>. We do not
            publish a specification for that line yet, so there is nothing to pick below — just add
            your volumes in the message and send it.
          </p>
        ) : null}

        <ul className="grid gap-4">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="border-border bg-card grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_9rem_auto] sm:items-start"
            >
              <div className="grid gap-2">
                <label
                  htmlFor={`${item.key}-product`}
                  className="text-foreground/80 text-[13px] font-semibold"
                >
                  Product {items.length > 1 ? index + 1 : ""}
                </label>
                <select
                  id={`${item.key}-product`}
                  value={item.slug}
                  onChange={(e) => updateItem(item.key, { slug: e.target.value })}
                  className={cn(
                    "border-input bg-card text-foreground h-11 w-full rounded-lg border px-3 text-[15px]",
                    "focus-visible:border-primary focus-visible:ring-primary/25 outline-none focus-visible:ring-4"
                  )}
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — {p.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Quantity"
                id={`${item.key}-qty`}
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="e.g. 500"
                value={item.quantity}
                onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
              />

              <div className="sm:pt-7">
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length === 1}
                  aria-label={`Remove product ${index + 1}`}
                  className="text-muted-foreground hover:text-destructive hover:border-destructive/40 border-border focus-visible:ring-ring grid h-11 w-11 place-items-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>

              <div className="sm:col-span-3">
                <Field
                  label="Notes for this product (optional)"
                  id={`${item.key}-notes`}
                  placeholder="Size, colour, weave, branding…"
                  value={item.notes}
                  onChange={(e) => updateItem(item.key, { notes: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>

        <div>
          <button
            type="button"
            onClick={addItem}
            className="border-border text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Plus aria-hidden className="size-4" />
            Add another product
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-foreground text-lg font-semibold">Who should we reply to?</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your name"
            name="name"
            autoComplete="name"
            required
            defaultValue={prefill?.name}
          />
          <Field
            label="Company"
            name="company"
            autoComplete="organization"
            required
            defaultValue={prefill?.company}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={prefill?.email}
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            hint="Fastest way to reach you about specifications."
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="quote-message" className="text-foreground/80 text-[13px] font-semibold">
            Anything else? (optional)
          </label>
          <textarea
            id="quote-message"
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={
              enquiryName ? `We are looking at ${enquiryName}. Rough annual volume: ` : undefined
            }
            placeholder="Delivery location, target lead time, existing specification you are matching…"
            className="border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 w-full rounded-lg border px-3.5 py-3 text-[15px] outline-none focus-visible:ring-4"
          />
        </div>
      </section>

      {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

      <div className="grid gap-3">
        <SubmitButton
          pending={pending}
          pendingLabel="Sending…"
          className="sm:w-auto sm:justify-self-start sm:px-8"
        >
          Send request
        </SubmitButton>
        <p className="text-muted-foreground text-xs">
          No payment is taken here and no pricing is shown publicly. A member of our team replies
          with a quotation.
        </p>
      </div>
    </form>
  );
}
