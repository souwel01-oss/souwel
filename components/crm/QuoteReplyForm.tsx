"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { FormAlert, SubmitButton } from "@/components/auth/fields";
import { respondToQuote } from "@/app/(crm)/actions";
import { cn } from "@/lib/utils";

/**
 * Sales replying to a quote request: a message, a price per line, and an
 * optional expiry.
 *
 * WHAT THE CUSTOMER SEES IS SAID ON THE FORM. Everything typed here lands in
 * the customer's portal the moment it saves, which is not obvious from a panel
 * that otherwise holds internal fields — the drawer beside it shows staff
 * notes and a guest's phone number. Someone drafting a rough figure "just to
 * have it saved" needs to know it is not a draft, so the button says so and
 * the hint under the textarea says so again.
 *
 * TOTALS ARE NOT INPUTS. The line total shown as you type is a preview of what
 * the server will compute; the server multiplies unit x quantity itself and
 * never reads a total from this form.
 */

export type ReplyItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string | null;
};

export type QuoteReplyFormProps = {
  quoteId: string;
  items: ReplyItem[];
  /** Existing reply, so a correction edits rather than starts blank. */
  message: string | null;
  /** ISO date (yyyy-mm-dd) or "". */
  validUntil: string;
  /** A guest lead has no portal to read the reply in. */
  hasAccount: boolean;
};

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function QuoteReplyForm({
  quoteId,
  items,
  message,
  validUntil,
  hasAccount,
}: QuoteReplyFormProps) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.unitPrice ?? ""]))
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Only lines with a usable number contribute. A half-typed "12." counts as
  // nothing rather than as zero, so the preview never claims a total the
  // server would not agree with.
  const lineTotal = (id: string, quantity: number) => {
    const raw = prices[id]?.trim() ?? "";
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
    return Number(raw) * quantity;
  };

  const totals = items.map((i) => lineTotal(i.id, i.quantity));
  const grandTotal = totals.some((t) => t !== null)
    ? totals.reduce((sum: number, t) => sum + (t ?? 0), 0)
    : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await respondToQuote({
        quoteId,
        message: String(form.get("message") ?? ""),
        validUntil: String(form.get("validUntil") ?? ""),
        items: items.map((i) => ({ itemId: i.id, unitPrice: prices[i.id] ?? "" })),
      });

      if (result.ok) {
        setSaved(result.message);
        // The drawer reads server-rendered data, so the panel behind this form
        // is stale until the route re-renders.
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error ? <FormAlert kind="error">{error}</FormAlert> : null}
      {saved ? <FormAlert kind="success">{saved}</FormAlert> : null}

      {!hasAccount ? (
        <p className="border-premium/40 bg-premium/10 text-foreground rounded-lg border px-3.5 py-2.5 text-[12.5px] leading-relaxed">
          This lead has no account, so there is no portal for them to read this in. Save it for the
          record, then send it on by email.
        </p>
      ) : null}

      <div className="border-border overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="border-border/60 text-muted-foreground border-b">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[11px] font-semibold tracking-[0.08em] uppercase"
              >
                Qty
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[11px] font-semibold tracking-[0.08em] uppercase"
              >
                Unit price
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[11px] font-semibold tracking-[0.08em] uppercase"
              >
                Line total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-border/40 border-b last:border-0">
                <th scope="row" className="text-foreground px-3 py-2 font-medium">
                  <label htmlFor={`price-${item.id}`}>{item.name}</label>
                </th>
                <td className="text-muted-foreground px-3 py-2 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    id={`price-${item.id}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="—"
                    value={prices[item.id] ?? ""}
                    onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className={cn(
                      "border-input bg-card text-foreground h-9 w-24 rounded-md border px-2 text-right text-[13px] tabular-nums",
                      "focus-visible:border-primary focus-visible:ring-primary/25 outline-none focus-visible:ring-4"
                    )}
                  />
                </td>
                <td className="text-foreground px-3 py-2 text-right font-semibold tabular-nums">
                  {totals[index] === null ? (
                    <span className="text-muted-foreground font-normal">—</span>
                  ) : (
                    money.format(totals[index]!)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {grandTotal !== null ? (
            <tfoot>
              <tr className="border-border/60 border-t">
                <th scope="row" className="text-muted-foreground px-3 py-2 text-left font-semibold">
                  Total
                </th>
                <td />
                <td />
                <td className="text-foreground px-3 py-2 text-right font-semibold tabular-nums">
                  {money.format(grandTotal)}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {/* No currency symbol anywhere in this form, matching the orders table.
          Order carries an amount and no currency column, and Souwel exports —
          a hard-coded "$" would be a guess printed next to someone's money. */}
      <p className="text-muted-foreground text-[12px]">
        Leave a price blank to say that line is not priced yet. Totals are calculated on save.
      </p>

      <div className="grid gap-2">
        <label htmlFor="reply-message" className="text-foreground/80 text-[13px] font-semibold">
          Message to the customer
        </label>
        <textarea
          id="reply-message"
          name="message"
          rows={5}
          maxLength={4000}
          defaultValue={message ?? ""}
          placeholder="Lead time, minimum order quantity, what you need from them to firm the price up."
          className={cn(
            "border-input bg-card text-foreground placeholder:text-muted-foreground/60 w-full resize-y rounded-lg border px-3 py-2.5 text-[13.5px] leading-relaxed",
            "focus-visible:border-primary focus-visible:ring-primary/25 outline-none focus-visible:ring-4"
          )}
        />
        <p className="text-muted-foreground text-[12px]">
          {hasAccount
            ? "The customer reads this word for word in their portal. It is not an internal note."
            : "Saved on the record. Send it to them yourself — they have no account."}
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="reply-valid" className="text-foreground/80 text-[13px] font-semibold">
          Valid until
        </label>
        <input
          id="reply-valid"
          name="validUntil"
          type="date"
          defaultValue={validUntil}
          className={cn(
            "border-input bg-card text-foreground h-10 w-full rounded-lg border px-3 text-[13.5px] sm:w-48",
            "focus-visible:border-primary focus-visible:ring-primary/25 outline-none focus-visible:ring-4"
          )}
        />
        <p className="text-muted-foreground text-[12px]">Optional. Leave empty for no expiry.</p>
      </div>

      <SubmitButton
        pending={pending}
        pendingLabel="Sending…"
        className="sm:w-auto sm:justify-self-start sm:px-6"
      >
        <Send aria-hidden className="size-4" />
        {message ? "Update the quotation" : "Send the quotation"}
      </SubmitButton>
    </form>
  );
}
