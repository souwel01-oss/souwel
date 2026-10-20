"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";
import { submitQuoteRequest } from "@/app/(marketing)/quote/actions";
import { ANNUAL_VOLUME_BANDS, QUOTE_MESSAGE_MAX } from "@/lib/quote-fields";
import { quoteListId } from "@/lib/quote-list";
import { removeFromQuoteList } from "@/lib/quote-list-store";
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
   * The catalogue products of a quote list, with the quantities the buyer set
   * in the drawer. Each becomes a row here, still editable.
   */
  initialItems?: { slug: string; quantity: number }[];
  /**
   * Identifies the list this form was last built from — the raw `?list=`.
   *
   * The drawer can send a different list to this same page while it is open,
   * which re-renders it with new props and leaves the form's own state where
   * it was. When this changes, the product rows start over from the new list
   * and the buyer's contact details stay as typed.
   */
  listKey?: string;
  /**
   * The quote-list entries this request covers. They leave the list once the
   * request has gone, so the same products are not sitting in the drawer
   * waiting to be sent a second time.
   */
  listIds?: string[];
  /**
   * A product NAME, for a Hospitality line with no catalogue entry.
   *
   * Twenty of the thirty-one lines have no slug for the picker to select, so
   * the name arrives as prose. When it is set the product picker becomes
   * optional: the request is about a named line, and the server accepts it with
   * no line items — see the schema note in the quote action.
   */
  enquiryName?: string;
  /**
   * Replaces the default sentence under the enquiry banner.
   *
   * The default says we do not publish a specification for the line, which is
   * true of the twenty bare Hospitality names and false of a Terry Towels
   * request — that one arrives with its blend, hem, size and weight already
   * chosen and written into the message below.
   */
  enquiryNote?: string;
  /** Seeds the message box. Overrides the generic "Rough annual volume:" line. */
  messagePrefill?: string;
  /** Prefill for a signed-in customer, so they are not retyping known details. */
  prefill?: { name: string; email: string; company: string };
};

let rowCounter = 0;
const nextKey = () => `row-${(rowCounter += 1)}`;

export function QuoteRequestForm({
  products,
  initialSlug,
  initialItems,
  listKey,
  listIds,
  enquiryName,
  enquiryNote,
  messagePrefill,
  prefill,
}: QuoteRequestFormProps) {
  // NO EMPTY ROW WHEN THE REQUEST ALREADY NAMES ITS PRODUCT.
  //
  // Arriving from a Terry Towels page means the construction, blend, hem, size
  // and quantity have all been chosen already. Opening on a blank
  // "Select a product…" row asks the buyer to do the job they just did, and
  // worse, implies the thing they picked did not come through. The picker is
  // still there behind "Add a product" for anyone who wants a second line.
  //
  // A quote list's catalogue products come first of all: they are rows the
  // buyer has already chosen, quantity included.
  //
  // SEEDED ROWS ARE KEYED BY POSITION, NOT BY nextKey(). These keys become
  // the `id` of each row's inputs, so they are in the HTML the server sends —
  // and `rowCounter` is module state, which on the server runs on from one
  // request to the next. The server would render "row-5" where the browser
  // expects "row-1", and React reports the page as failing to hydrate.
  // nextKey() is still right for a row added by a click: that only ever
  // happens in the browser.
  const seedItems = (): LineItem[] =>
    initialItems?.length
      ? initialItems.map((i, index) => ({
          key: `seed-${index}`,
          slug: i.slug,
          quantity: String(i.quantity),
          notes: "",
        }))
      : enquiryName
        ? []
        : [{ key: "seed-0", slug: initialSlug ?? "", quantity: "", notes: "" }];

  const [items, setItems] = useState<LineItem[]>(seedItems);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // A different list has been sent to this page while it was open. Start the
  // product rows again from it — and drop a "Request received" panel left over
  // from the last one, or the new list would arrive behind a success message.
  // Adjusted during render rather than in an effect, the way SiteHeader resets
  // its menus on a route change: an effect would paint the stale rows first.
  const [seededFrom, setSeededFrom] = useState(listKey);
  if (listKey !== seededFrom) {
    setSeededFrom(listKey);
    setItems(seedItems());
    setReference(null);
    setFormError(null);
  }

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { key: nextKey(), slug: "", quantity: "", notes: "" }]);
  };

  const removeItem = (key: string) => {
    // The last row is kept only when it is the only way to say what is wanted.
    // A named enquiry already says it, so the list may go back to empty.
    setItems((prev) =>
      prev.length === 1 && !enquiryName ? prev : prev.filter((i) => i.key !== key)
    );
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
        industry: String(form.get("industry") ?? ""),
        designation: String(form.get("designation") ?? ""),
        deliveryLocation: String(form.get("deliveryLocation") ?? ""),
        annualVolumeUsd: String(form.get("annualVolumeUsd") ?? ""),
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
        // What has been requested leaves the quote list: the entries this
        // request was built from, and any catalogue product sent in a row
        // here that also happens to be listed.
        removeFromQuoteList([
          ...(listIds ?? []),
          ...chosen.map((i) => quoteListId("product", i.slug)),
        ]);
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
            You are asking about <span className="font-semibold">{enquiryName}</span>.{" "}
            {enquiryNote ??
              "We do not publish a specification for that line yet, so there is nothing to pick below — just add your volumes in the message and send it."}
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
                  // The last row locks only when removing it would leave the
                  // form with nothing to say. A named enquiry already carries
                  // the request, so a row added from the empty state has to be
                  // removable again — otherwise one stray click leaves a blank
                  // product the buyer cannot get rid of.
                  disabled={items.length === 1 && !enquiryName}
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
            {items.length === 0 ? "Add a product" : "Add another product"}
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        {/* TWO COLUMNS FROM sm, ONE BELOW IT. Eight fields in two columns on a
            360px screen gives each about 150px, which a company name and an
            email address both overflow. The select follows the same rule, and
            spans the full width on every size: its longest option is wider than
            half a phone. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your Name"
            name="name"
            autoComplete="name"
            required
            defaultValue={prefill?.name}
          />
          <Field
            label="Company Name"
            name="company"
            autoComplete="organization"
            required
            defaultValue={prefill?.company}
          />
          <Field
            label="Industry"
            name="industry"
            required
            placeholder="Hotels, healthcare, laundry…"
          />
          <Field
            label="Designation"
            name="designation"
            autoComplete="organization-title"
            required
            placeholder="Procurement Manager"
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
            label="Number"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            hint="Fastest way to reach you about specifications."
          />
          <Field
            label="Delivery Location"
            name="deliveryLocation"
            autoComplete="address-level2"
            required
            placeholder="City, state or country"
            className="sm:col-span-2"
          />

          <div className="grid gap-2 sm:col-span-2">
            <label
              htmlFor="quote-volume"
              className="text-foreground/80 text-[13px] font-semibold"
            >
              Annual Purchase Volume in USD{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            {/* Styled to match Field's input rather than left as a browser
                default: a raw <select> beside seven custom inputs is the one
                control that looks like it belongs to a different form. */}
            <select
              id="quote-volume"
              name="annualVolumeUsd"
              defaultValue=""
              className="border-input bg-card text-foreground focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] transition-[border-color,box-shadow] outline-none focus-visible:ring-4"
            >
              <option value="">Prefer not to say</option>
              {ANNUAL_VOLUME_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="quote-message" className="text-foreground/80 text-[13px] font-semibold">
            Anything else? (optional)
          </label>
          <textarea
            // Uncontrolled, so a new prefill only shows if the element is new.
            // Keyed on the list for the same reason the rows are re-seeded
            // above: a second list sent to this page must replace the first
            // one's specification, not sit unseen behind it.
            key={listKey ?? "message"}
            id="quote-message"
            name="message"
            // Tall enough to show a list's specification without scrolling a
            // four-line box, and no taller than it needs to be otherwise.
            rows={messagePrefill ? Math.min(Math.max(messagePrefill.split("\n").length + 1, 4), 16) : 4}
            maxLength={QUOTE_MESSAGE_MAX}
            defaultValue={
              messagePrefill ??
              (enquiryName ? `We are looking at ${enquiryName}. Rough annual volume: ` : undefined)
            }
            placeholder="Target lead time, existing specification you are matching…"
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
