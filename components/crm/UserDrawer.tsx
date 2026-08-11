import Link from "next/link";
import { Drawer, DrawerSection } from "@/components/crm/Drawer";
import { RolePill, StatusPill } from "@/components/crm/UserControls";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import { QuoteStatusBadge } from "@/components/crm/QuoteStatusBadge";
import type { UserDetail } from "@/lib/db/crm";

/**
 * User detail.
 *
 * A SERVER COMPONENT rendered into the client Drawer shell. The data has
 * already been fetched by the page under its role guard, so nothing here needs
 * an endpoint of its own — which is the whole reason the drawer is driven by a
 * query parameter rather than by client state.
 */
export function UserDrawer({
  detail,
  controls,
}: {
  detail: UserDetail;
  controls: React.ReactNode;
}) {
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const stampFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const profile = detail.customerProfile;

  return (
    <Drawer paramName="user" title={detail.name}>
      <div data-drawer-section className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <RolePill role={detail.role} />
          <StatusPill active={!detail.banned} />
          {!detail.emailVerified ? (
            <span className="border-premium/40 bg-premium/10 text-premium rounded-full border px-2.5 py-1 text-[11.5px] font-semibold">
              Email unverified
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-3 text-[13px]">{detail.email}</p>
        <p className="text-muted-foreground text-[12.5px]">
          Joined {dateFmt.format(detail.createdAt)}
        </p>
      </div>

      <DrawerSection title="Manage">{controls}</DrawerSection>

      <DrawerSection
        title="Company"
        empty="No company profile — this account has not completed registration details."
      >
        {profile ? (
          <dl className="border-border bg-card grid gap-2 rounded-xl border p-4 text-[13px]">
            <Row label="Company" value={profile.companyName} />
            <Row label="Contact" value={profile.contactName} />
            <Row label="Phone" value={profile.phone} />
            <Row label="Address" value={profile.addressLine1} />
            <Row label="City" value={profile.city} />
            <Row label="Country" value={profile.country} />
          </dl>
        ) : undefined}
      </DrawerSection>

      <DrawerSection title="Quotes" empty="No quote requests from this account yet.">
        {detail.quotes.length ? (
          <ul className="border-border divide-border/50 divide-y rounded-xl border">
            {detail.quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <Link
                    href={`/admin/leads?lead=${q.id}`}
                    className="text-foreground hover:text-primary-strong dark:hover:text-primary text-[13px] font-semibold"
                  >
                    {q.reference}
                  </Link>
                  <p className="text-muted-foreground text-[12px]">
                    {q._count.items} item{q._count.items === 1 ? "" : "s"} ·{" "}
                    {dateFmt.format(q.createdAt)}
                  </p>
                </div>
                <QuoteStatusBadge status={q.status} />
              </li>
            ))}
          </ul>
        ) : undefined}
      </DrawerSection>

      <DrawerSection title="Orders" empty="No orders yet.">
        {detail.orders.length ? (
          <ul className="border-border divide-border/50 divide-y rounded-xl border">
            {detail.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-foreground text-[13px] font-semibold">{o.reference}</p>
                  <p className="text-muted-foreground text-[12px]">
                    {dateFmt.format(o.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="text-foreground text-[13px] font-semibold tabular-nums">
                    {o.totalAmount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : undefined}
      </DrawerSection>

      <DrawerSection
        title="Documents"
        empty="No documents. Uploading needs Cloudinary credentials, which are not configured yet."
      >
        {detail.documents.length ? (
          <ul className="border-border divide-border/50 divide-y rounded-xl border">
            {detail.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-foreground truncate text-[13px]">{d.fileName}</span>
                <span className="text-muted-foreground shrink-0 text-[11.5px] tracking-[0.08em] uppercase">
                  {d.type.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        ) : undefined}
      </DrawerSection>

      <DrawerSection title="Activity" empty="Nothing recorded against this account yet.">
        {detail.activity.length ? (
          <ol className="border-border/70 ml-1 grid gap-3 border-l pl-4">
            {detail.activity.map((a) => (
              <li key={a.id} className="relative">
                <span
                  aria-hidden
                  className="bg-premium absolute top-1.5 -left-[21px] size-2 rounded-full ring-2 ring-[var(--background)]"
                />
                <p className="text-foreground text-[13px] leading-snug">{a.description}</p>
                <p className="text-muted-foreground mt-0.5 text-[11.5px]">
                  {stampFmt.format(a.createdAt)}
                  {a.actor?.name ? ` · ${a.actor.name}` : ""}
                </p>
              </li>
            ))}
          </ol>
        ) : undefined}
      </DrawerSection>
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{label}</dt>
      <dd className="text-foreground min-w-0 flex-1">{value || "—"}</dd>
    </div>
  );
}
