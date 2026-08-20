import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getQuotes, type PortalQuote } from "@/lib/db/portal";
import { Card, CardHeader, PortalPage } from "@/components/portal/Surface";
import { QuoteStatusBadge } from "@/components/portal/QuoteStatusBadge";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "My Quotes",
  robots: { index: false, follow: false },
};

/**
 * Quotation history — every request this customer has sent, and whether Souwel
 * has come back on it.
 *
 * THIS IS THE PAGE THAT MAKES THE PORTAL WORTH SIGNING IN FOR. Before it, a
 * customer could see a counter saying "Quotes ready to review: 1" and had no
 * way to review it. The reply and the prices existed in the database and were
 * readable only by staff.
 *
 * SAME RULE AS ORDERS: real rows or no rows. No sample quotation, ever — an
 * invented price in someone's account is a false statement about their money.
 *
 * GUEST REQUESTS DO NOT APPEAR HERE and that is not a bug to paper over. A
 * quote submitted without signing in has no CustomerProfile attached, so there
 * is nothing tying it to this account; the empty state says so rather than
 * leaving someone to wonder where last week's request went.
 */
export default async function QuotesPage() {
  const user = await requireUser("/dashboard/quotes");

  let quotes: PortalQuote[] = [];
  let loadFailed = false;
  try {
    quotes = await getQuotes(user.id);
  } catch (error) {
    console.error("[portal] quotes read failed:", error);
    loadFailed = true;
  }

  return (
    <PortalPage>
      <Card>
        <CardHeader
          title="My quotations"
          description="Every request you have sent us, and our reply when it is ready."
        />

        {loadFailed ? (
          <div className="px-5 py-5 sm:px-6">
            <FormAlert kind="error">
              We could not load your quotations right now. Please reload in a moment.
            </FormAlert>
          </div>
        ) : quotes.length === 0 ? (
          <EmptyQuotes />
        ) : (
          <QuotesList quotes={quotes} />
        )}
      </Card>
    </PortalPage>
  );
}

function EmptyQuotes() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="border-premium/30 bg-premium/10 text-premium grid size-14 place-items-center rounded-full border">
        <FileText aria-hidden className="size-6" />
      </span>
      <h3 className="font-heading text-foreground mt-5 text-[1.05rem]">No quotations yet</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-[13.5px] leading-relaxed">
        Ask us to price the products you need and the reply will appear here. If you sent a request
        before creating this account, it is not linked to it — send it again while signed in and we
        will pick it up.
      </p>
      <Link
        href="/quote"
        className="bg-primary-strong text-primary-strong-foreground focus-visible:ring-ring focus-visible:ring-offset-background mt-6 inline-flex h-10 items-center rounded-lg px-5 text-[13.5px] font-semibold transition-[filter,transform] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
      >
        Request a quote
      </Link>
    </div>
  );
}

function QuotesList({ quotes }: { quotes: PortalQuote[] }) {
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);

  return (
    /* One list, not a desktop table plus a mobile card list like Orders. Every
       row here is a link to a detail page and the useful columns are few, so a
       single stacked row works at both widths and there is one thing to keep
       correct instead of two. */
    <ul className="divide-border/40 divide-y">
      {quotes.map((quote) => (
        <li key={quote.id}>
          <Link
            href={`/dashboard/quotes/${quote.id}`}
            className="hover:bg-muted/40 focus-visible:ring-ring flex items-center gap-4 px-5 py-4 transition-colors focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none sm:px-6"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="text-foreground text-[14px] font-semibold">{quote.reference}</p>
                <QuoteStatusBadge status={quote.status} />
                {/* The one thing a returning customer is here to find out.
                    Called out on the row rather than left to be inferred from
                    the status, because "Price ready" and "we wrote back" are
                    not quite the same event. */}
                {quote.hasReply ? (
                  <span className="text-primary-strong dark:text-primary text-[12px] font-semibold">
                    Reply from Souwel
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-1 text-[12.5px]">
                {quote.itemCount} product{quote.itemCount === 1 ? "" : "s"} · sent{" "}
                {formatDate(quote.createdAt)}
                {quote.quotedAt ? ` · quoted ${formatDate(quote.quotedAt)}` : ""}
              </p>
            </div>

            {quote.total ? (
              <p className="text-foreground shrink-0 text-[14px] font-semibold tabular-nums">
                {quote.total}
              </p>
            ) : null}

            <ArrowRight aria-hidden className="text-muted-foreground size-4 shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
