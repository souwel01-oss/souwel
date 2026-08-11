import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOrders, type PortalOrder } from "@/lib/db/portal";
import { Card, CardHeader, PortalPage } from "@/components/portal/Surface";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

/**
 * Order history.
 *
 * THESE ARE REAL ROWS OR NO ROWS — there is deliberately no demo data, even
 * though the brief allowed it. A customer portal that shows an invented
 * "SW-1042 · In production" is not a placeholder, it is a false statement about
 * someone's money, and the person most likely to see it first is the client
 * showing the site to a buyer. The empty state below is what a new account
 * genuinely looks like, and the table renders properly the moment the database
 * has orders in it.
 */
export default async function OrdersPage() {
  const user = await requireUser("/dashboard/orders");

  let orders: PortalOrder[] = [];
  let loadFailed = false;
  try {
    orders = await getOrders(user.id);
  } catch (error) {
    console.error("[portal] orders read failed:", error);
    loadFailed = true;
  }

  return (
    <PortalPage>
      <Card>
        <CardHeader
          title="Order history"
          description="Every order raised from a quotation you accepted."
        />

        {loadFailed ? (
          <div className="px-5 py-5 sm:px-6">
            <FormAlert kind="error">
              We could not load your orders right now. Please reload in a moment.
            </FormAlert>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <OrdersTable orders={orders} />
        )}
      </Card>
    </PortalPage>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="border-premium/30 bg-premium/10 text-premium grid size-14 place-items-center rounded-full border">
        <Package aria-hidden className="size-6" />
      </span>
      <h3 className="font-heading text-foreground mt-5 text-[1.05rem]">No orders yet</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-[13.5px] leading-relaxed">
        Orders appear here once you accept a quotation. Start by asking us to price the products
        you need — no account details are shared publicly.
      </p>
      <Link
        href="/"
        className="bg-primary-strong text-primary-strong-foreground focus-visible:ring-ring focus-visible:ring-offset-background mt-6 inline-flex h-10 items-center rounded-lg px-5 text-[13.5px] font-semibold transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Browse the catalogue
      </Link>
    </div>
  );
}

function OrdersTable({ orders }: { orders: PortalOrder[] }) {
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);

  return (
    <>
      {/* Desktop: a real table, because these are records with shared columns
          and a table is what a screen reader can navigate by column header. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-border/50 text-muted-foreground border-b text-[11px] font-semibold tracking-[0.1em] uppercase">
              <th scope="col" className="px-6 py-3">
                Reference
              </th>
              <th scope="col" className="px-6 py-3">
                Placed
              </th>
              <th scope="col" className="px-6 py-3">
                Items
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-border/40 hover:bg-muted/40 border-b transition-colors last:border-0"
              >
                <th scope="row" className="text-foreground px-6 py-4 text-[13.5px] font-semibold">
                  {order.reference}
                </th>
                <td className="text-muted-foreground px-6 py-4 text-[13.5px]">
                  {formatDate(order.createdAt)}
                </td>
                <td className="text-muted-foreground px-6 py-4 text-[13.5px]">
                  {order.itemCount}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                {/* tabular-nums so the decimal points line up down the column. */}
                <td className="text-foreground px-6 py-4 text-right text-[13.5px] font-semibold tabular-nums">
                  {order.totalAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: five columns do not fit in 360px, and a horizontally scrolling
          table is the worst of both. One card per order instead. */}
      <ul className="divide-border/40 divide-y sm:hidden">
        {orders.map((order) => (
          <li key={order.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-foreground text-[14px] font-semibold">{order.reference}</p>
                <p className="text-muted-foreground mt-0.5 text-[12.5px]">
                  {formatDate(order.createdAt)} · {order.itemCount} item
                  {order.itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-foreground shrink-0 text-[14px] font-semibold tabular-nums">
                {order.totalAmount}
              </p>
            </div>
            <div className="mt-2.5">
              <OrderStatusBadge status={order.status} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
