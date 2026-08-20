import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageSquare, Package } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getQuoteDetail } from "@/lib/db/portal";
import { Card, CardHeader, PortalPage } from "@/components/portal/Surface";
import { QuoteStatusBadge } from "@/components/portal/QuoteStatusBadge";

export const metadata: Metadata = {
  title: "Quotation",
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * One quotation, as the customer sees it: what they asked for, what Souwel
 * said back, and what it costs.
 *
 * NOTHING HERE IS AUTHORISED BY THE URL. `getQuoteDetail` takes the session's
 * userId and puts it in the WHERE clause, so a pasted id belonging to another
 * company returns no row rather than a row this page then has to remember to
 * hide. The 404 below is what "not yours" looks like, and it is also what
 * "does not exist" looks like — deliberately the same, since telling a
 * stranger that an id is real is itself a leak.
 *
 * PRICES MAY BE ABSENT ON A QUOTE THAT HAS A REPLY, and the table says so per
 * line rather than printing 0.00. Sales can legitimately answer "we can do
 * three of these four, tell us the GSM on the towels" — an em dash is that
 * answer; a zero is a promise to supply them free.
 */
export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/quotes/${id}`);

  const quote = await getQuoteDetail(user.id, id);
  if (!quote) notFound();

  const priced = quote.items.some((i) => i.lineTotal !== null);
  const { expired } = quote;

  return (
    <PortalPage className="grid gap-5">
      <div data-portal-item>
        <Link
          href="/dashboard/quotes"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          All quotations
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="font-heading text-foreground text-[1.75rem] leading-tight">
            {quote.reference}
          </h2>
          <QuoteStatusBadge status={quote.status} />
        </div>

        <p className="text-muted-foreground mt-2 text-[13px]">
          Sent {dateFmt.format(quote.createdAt)}
          {quote.quotedAt ? ` · quoted ${dateFmt.format(quote.quotedAt)}` : ""}
        </p>
      </div>

      {/* --- The reply ---------------------------------------------------
          First on the page, above the customer's own request. They wrote that
          part; they are here to read this one. */}
      <Card>
        <CardHeader title="Our reply" />

        {quote.staffResponse ? (
          <div className="px-5 py-5 sm:px-6">
            {/* whitespace-pre-line: Sales writes in paragraphs and line breaks
                carry meaning in a message about lead times and minimums. */}
            <p className="text-foreground text-[14px] leading-relaxed whitespace-pre-line">
              {quote.staffResponse}
            </p>

            {quote.validUntil ? (
              <p
                className={
                  expired
                    ? "text-destructive mt-4 flex items-center gap-2 text-[12.5px] font-semibold"
                    : "text-muted-foreground mt-4 flex items-center gap-2 text-[12.5px]"
                }
              >
                <Clock aria-hidden className="size-3.5 shrink-0" />
                {expired
                  ? `This quotation expired on ${dateFmt.format(quote.validUntil)}. Get in touch and we will re-price it.`
                  : `Valid until ${dateFmt.format(quote.validUntil)}.`}
              </p>
            ) : null}
          </div>
        ) : (
          <WaitingForReply quoted={quote.quotedAt !== null} />
        )}
      </Card>

      {/* --- Line items --------------------------------------------------- */}
      <Card className="overflow-hidden">
        <CardHeader
          title="What you asked for"
          description={
            priced
              ? "Prices are per unit, as quoted."
              : "We have not put prices against these lines yet."
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border/50 text-muted-foreground border-b text-[11px] font-semibold tracking-[0.1em] uppercase">
                <th scope="col" className="px-5 py-3 sm:px-6">
                  Product
                </th>
                <th scope="col" className="px-5 py-3 text-right sm:px-6">
                  Qty
                </th>
                {priced ? (
                  <>
                    <th scope="col" className="px-5 py-3 text-right sm:px-6">
                      Unit
                    </th>
                    <th scope="col" className="px-5 py-3 text-right sm:px-6">
                      Line total
                    </th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-border/40 border-b last:border-0">
                  <th scope="row" className="px-5 py-4 font-normal sm:px-6">
                    <span className="text-foreground text-[13.5px] font-semibold">{item.name}</span>
                    {item.customerNotes ? (
                      <span className="text-muted-foreground mt-0.5 block text-[12.5px]">
                        {item.customerNotes}
                      </span>
                    ) : null}
                  </th>
                  <td className="text-muted-foreground px-5 py-4 text-right text-[13.5px] tabular-nums sm:px-6">
                    {item.quantity}
                  </td>
                  {priced ? (
                    <>
                      <td className="text-muted-foreground px-5 py-4 text-right text-[13.5px] tabular-nums sm:px-6">
                        {item.unitPrice ?? "—"}
                      </td>
                      <td className="text-foreground px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums sm:px-6">
                        {item.lineTotal ?? "—"}
                      </td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
            {quote.total ? (
              <tfoot>
                <tr className="border-border/60 border-t">
                  <th
                    scope="row"
                    className="text-muted-foreground px-5 py-4 text-left text-[13px] font-semibold sm:px-6"
                  >
                    Total
                  </th>
                  <td />
                  <td />
                  <td className="text-foreground px-5 py-4 text-right text-[14px] font-semibold tabular-nums sm:px-6">
                    {quote.total}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        {quote.total ? (
          /* No currency symbol, matching the orders table and the CRM's reply
             form. Order carries an amount and no currency column, and Souwel
             exports — a hard-coded "$" would be a guess printed next to
             someone's money. */
          <p className="border-border/50 text-muted-foreground border-t px-5 py-3 text-[12px] sm:px-6">
            Totals exclude freight and duties unless our reply says otherwise.
          </p>
        ) : null}
      </Card>

      {/* --- What they originally wrote ----------------------------------- */}
      {quote.customerMessage ? (
        <Card>
          <CardHeader title="Your message" />
          <p className="text-muted-foreground px-5 py-5 text-[13.5px] leading-relaxed whitespace-pre-line sm:px-6">
            {quote.customerMessage}
          </p>
        </Card>
      ) : null}

      {/* --- The order it became ------------------------------------------ */}
      {quote.orderReference ? (
        <Card>
          <CardHeader title="Order raised from this quotation" />
          <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <span className="text-foreground text-[13.5px] font-semibold">
              {quote.orderReference}
            </span>
            <Link
              href="/dashboard/orders"
              className="text-primary-strong hover:text-primary focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              View orders
            </Link>
          </div>
        </Card>
      ) : null}

      {/* --- Reply by hand ------------------------------------------------
          There is no accept/decline control here yet: moving a quote to
          ACCEPTED is a CRM action, and a button that silently does nothing on
          the customer's side would be worse than an honest instruction. */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="border-premium/30 bg-premium/10 text-premium grid size-10 shrink-0 place-items-center rounded-full border">
            <MessageSquare aria-hidden className="size-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-foreground text-[1rem]">
              Want to go ahead, or need it changed?
            </h3>
            <p className="text-muted-foreground mt-1.5 text-[13.5px] leading-relaxed">
              Reply to us quoting {quote.reference} and we will raise the order or re-price it.
            </p>
            <Link
              href="/contact"
              className="text-primary-strong hover:text-primary focus-visible:ring-ring mt-3 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </Card>
    </PortalPage>
  );
}

/**
 * The state a customer hits most often — they asked yesterday and nobody has
 * priced it yet. Says what happens next rather than showing an empty panel,
 * because "no reply" and "your request went nowhere" look identical otherwise.
 */
function WaitingForReply({ quoted }: { quoted: boolean }) {
  return (
    <div className="flex items-start gap-4 px-5 py-6 sm:px-6">
      <span className="border-border bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-full border">
        <Package aria-hidden className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-foreground text-[14px] font-semibold">
          {quoted ? "Priced, with no message attached" : "We are working on it"}
        </p>
        <p className="text-muted-foreground mt-1.5 text-[13.5px] leading-relaxed">
          {quoted
            ? "The prices below are our quotation. Nobody added a note alongside them."
            : "Our team is putting prices and lead times against this request. It will appear here as soon as it is ready, and we will not go quiet on you."}
        </p>
      </div>
    </div>
  );
}
