import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package, ShieldCheck, User } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { firstNameOf } from "@/lib/auth/user";
import { getOrders, getProfile, getQuoteSummary } from "@/lib/db/portal";
import { Card, PortalPage } from "@/components/portal/Surface";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  /**
   * One try/catch around all three reads rather than three separate ones.
   * They share a connection and fail together in practice, and three
   * independent error banners for one outage is noise.
   */
  let profile = null;
  let quotes = { requested: 0, quoted: 0, accepted: 0 };
  let recentOrders: Awaited<ReturnType<typeof getOrders>> = [];
  let loadFailed = false;

  try {
    [profile, quotes, recentOrders] = await Promise.all([
      getProfile(user.id),
      getQuoteSummary(user.id),
      getOrders(user.id, 4),
    ]);
  } catch (error) {
    console.error("[portal] dashboard read failed:", error);
    loadFailed = true;
  }

  const stats = [
    { label: "Quotes awaiting a price", value: quotes.requested, icon: FileText },
    { label: "Quotes ready to review", value: quotes.quoted, icon: ShieldCheck },
    { label: "Orders in progress", value: recentOrders.length, icon: Package },
  ];

  return (
    <PortalPage className="grid gap-5">
      {/* --- Greeting -------------------------------------------------- */}
      <div data-portal-item>
        <p className="text-premium text-[11px] font-semibold tracking-[0.16em] uppercase">
          {profile?.companyName ?? "Customer portal"}
        </p>
        <h2 className="font-heading text-foreground mt-2 text-[1.75rem] leading-tight">
          Welcome back, {firstNameOf(user.name)}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-[14px] leading-relaxed">
          Track quotations, follow orders through production, and keep your company details
          current — all in one place.
        </p>
      </div>

      {loadFailed ? (
        <div data-portal-item>
          <FormAlert kind="error">
            We could not load your account data right now. Your details are safe; please reload in
            a moment.
          </FormAlert>
        </div>
      ) : null}

      {/* --- Stats ------------------------------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-muted-foreground text-[12.5px] leading-snug font-medium">
                {label}
              </p>
              <Icon aria-hidden className="text-premium/70 size-4 shrink-0" />
            </div>
            {/* tabular-nums keeps the three figures optically aligned even
                though each sits in its own card. */}
            <p className="font-heading text-foreground mt-3 text-[2rem] leading-none tabular-nums">
              {value}
            </p>
          </Card>
        ))}
      </div>

      {/* --- Recent orders ---------------------------------------------- */}
      <Card className="overflow-hidden">
        <div className="border-border/50 flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <h3 className="font-heading text-foreground text-[1.05rem]">Recent orders</h3>
          <Link
            href="/dashboard/orders"
            className="text-primary-strong hover:text-primary focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            View all
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground px-5 py-8 text-center text-[13.5px] sm:px-6">
            Nothing here yet. Orders appear once you accept a quotation.
          </p>
        ) : (
          <ul className="divide-border/40 divide-y">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-[13.5px] font-semibold">
                    {order.reference}
                  </p>
                  <p className="text-muted-foreground text-[12.5px]">
                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* --- Prompt to complete the profile ------------------------------ */}
      {!loadFailed && !profile?.companyName ? (
        <Card interactive className="p-5">
          <div className="flex items-start gap-4">
            <span className="border-premium/30 bg-premium/10 text-premium grid size-10 shrink-0 place-items-center rounded-full border">
              <User aria-hidden className="size-4.5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-foreground text-[1rem]">
                Finish setting up your account
              </h3>
              <p className="text-muted-foreground mt-1.5 text-[13.5px] leading-relaxed">
                We use your company name and address on quotations and delivery paperwork.
              </p>
              <Link
                href="/dashboard/account"
                className="text-primary-strong hover:text-primary focus-visible:ring-ring mt-3 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Add your details
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </div>
        </Card>
      ) : null}
    </PortalPage>
  );
}
