import Link from "next/link";
import { Drawer, DrawerSection } from "@/components/crm/Drawer";
import { QuoteStatusSelect } from "@/components/crm/QuoteStatusSelect";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import type { LeadDetail } from "@/lib/db/crm";

/**
 * Lead detail — the products asked for, the quantities, the notes, and who
 * asked.
 *
 * THIS IS THE ONE SURFACE THAT SHOWS unitPrice AND lineTotal. Those columns
 * exist on QuoteItem precisely so pricing can never leak to a public page, and
 * this drawer sits behind the CRM's role guard, so it is their legitimate
 * reader. Nothing in lib/db/portal.ts selects them.
 */
export function LeadDrawer({ detail }: { detail: LeadDetail }) {
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const profile = detail.customerProfile;
  const isGuest = profile === null;

  const contact = {
    name: profile?.contactName ?? detail.guestName ?? "—",
    company: profile?.companyName ?? detail.guestCompany ?? "—",
    email: profile?.user?.email ?? detail.guestEmail ?? "—",
    phone: profile?.phone ?? detail.guestPhone ?? null,
  };

  const priced = detail.items.some((i) => i.lineTotal !== null);
  const total = priced
    ? detail.items.reduce((sum, i) => sum + Number(i.lineTotal ?? 0), 0)
    : null;

  return (
    <Drawer paramName="lead" title={detail.reference}>
      <div data-drawer-section className="mb-6 grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <QuoteStatusSelect quoteId={detail.id} status={detail.status} />
          {isGuest ? (
            <span className="border-premium/40 bg-premium/10 text-premium rounded-full border px-2.5 py-1 text-[11.5px] font-semibold">
              Guest submission
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground text-[12.5px]">
          Received {dateFmt.format(detail.createdAt)}
          {detail.quotedAt ? ` · quoted ${dateFmt.format(detail.quotedAt)}` : ""}
        </p>
      </div>

      <DrawerSection title="Contact">
        <dl className="border-border bg-card grid gap-2 rounded-xl border p-4 text-[13px]">
          <Row label="Contact" value={contact.name} />
          <Row label="Company" value={contact.company} />
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <div className="flex gap-3">
            <dt className="text-muted-foreground w-24 shrink-0">Account</dt>
            <dd className="min-w-0 flex-1">
              {profile?.user ? (
                <Link
                  href={`/admin/users?user=${profile.user.id}`}
                  className="text-primary-strong dark:text-primary font-semibold hover:underline"
                >
                  View user
                </Link>
              ) : (
                // Said plainly. A guest lead has no account, and sales needs to
                // know that following up means email rather than the portal.
                <span className="text-muted-foreground">
                  No account — submitted without registering
                </span>
              )}
            </dd>
          </div>
        </dl>
      </DrawerSection>

      <DrawerSection title="Products requested" empty="No line items on this request.">
        {detail.items.length ? (
          <div className="border-border overflow-hidden rounded-xl border">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="border-border/60 text-muted-foreground border-b">
                <tr>
                  <th scope="col" className="px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Product
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Qty
                  </th>
                  {priced ? (
                    <th scope="col" className="px-3 py-2 text-right text-[11px] font-semibold tracking-[0.08em] uppercase">
                      Line total
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {detail.items.map((item) => (
                  <tr key={item.id} className="border-border/40 border-b last:border-0">
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      <span className="text-foreground font-medium">{item.product.name}</span>
                      {item.customerNotes ? (
                        <span className="text-muted-foreground block text-[12px]">
                          {item.customerNotes}
                        </span>
                      ) : null}
                    </th>
                    <td className="text-foreground px-3 py-2.5 text-right tabular-nums">
                      {item.quantity}
                    </td>
                    {priced ? (
                      <td className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                        {item.lineTotal ?? "—"}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
              {total !== null ? (
                <tfoot>
                  <tr className="border-border/60 border-t">
                    <th scope="row" className="text-muted-foreground px-3 py-2.5 text-left font-semibold">
                      Total
                    </th>
                    <td />
                    <td className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(total)}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        ) : undefined}
      </DrawerSection>

      {!priced ? (
        <DrawerSection title="Pricing">
          {/* Honest about what is not built rather than showing an inert
              "Add price" button. Pricing a quote line is its own screen with
              its own validation, and it is not in this change. */}
          <p className="text-muted-foreground border-border rounded-xl border border-dashed p-4 text-[13px] leading-relaxed">
            No prices entered yet. Entering line prices is a separate screen and is not built —
            the columns exist on every line item and are staff-only.
          </p>
        </DrawerSection>
      ) : null}

      {detail.customerMessage ? (
        <DrawerSection title="Customer message">
          <p className="border-border bg-card rounded-xl border p-4 text-[13px] leading-relaxed">
            {detail.customerMessage}
          </p>
        </DrawerSection>
      ) : null}

      {detail.order ? (
        <DrawerSection title="Order">
          <div className="border-border bg-card flex items-center justify-between gap-3 rounded-xl border p-4">
            <span className="text-foreground text-[13px] font-semibold">
              {detail.order.reference}
            </span>
            <OrderStatusBadge status={detail.order.status} />
          </div>
        </DrawerSection>
      ) : null}
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{label}</dt>
      <dd className="text-foreground min-w-0 flex-1 break-words">{value || "—"}</dd>
    </div>
  );
}
