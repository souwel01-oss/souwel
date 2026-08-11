import { prisma } from "@/lib/db/prisma";

/**
 * Customer-facing reads for the portal.
 *
 * EVERY QUERY IN THIS FILE IS SCOPED BY userId AND THAT IS NOT NEGOTIABLE.
 * The portal has exactly one rule — a customer sees their own data and nothing
 * else — and the way that rule gets broken is a query that takes an id from the
 * URL instead of from the session. So these functions accept a userId that
 * callers must have got from `getSessionUser()`, and there is no variant that
 * looks anything up by a client-supplied id.
 *
 * Pricing: `Order.totalAmount` is a figure the customer has already accepted,
 * so it is theirs to see. `QuoteItem.unitPrice` is not, and nothing here
 * selects it.
 */

export type PortalProfile = {
  companyName: string;
  contactName: string;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  country: string | null;
};

export async function getProfile(userId: string): Promise<PortalProfile | null> {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
    select: {
      companyName: true,
      contactName: true,
      phone: true,
      addressLine1: true,
      city: true,
      country: true,
    },
  });

  return profile;
}

export type PortalOrder = {
  id: string;
  reference: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  itemCount: number;
};

export async function getOrders(userId: string, take = 25): Promise<PortalOrder[]> {
  const orders = await prisma.order.findMany({
    where: { customerProfile: { userId } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      reference: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      quote: { select: { _count: { select: { items: true } } } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    // Decimal is serialised at the boundary, not in the component. Passing a
    // Prisma Decimal into a Client Component throws — it is not a plain value —
    // and converting with Number() would quietly lose precision on a money
    // column.
    totalAmount: formatAmount(o.totalAmount.toString()),
    createdAt: o.createdAt,
    itemCount: o.quote._count.items,
  }));
}

/**
 * Money, formatted for a table column.
 *
 * `Decimal.toString()` alone rendered "7320.5" and "24980" next to "3610.75" —
 * a total that reads as seven thousand three hundred and twenty point five,
 * and a five-figure sum with nothing to break up the digits. Grouping and a
 * fixed two decimals are the minimum for a column people scan down.
 *
 * NO CURRENCY SYMBOL, because there is no currency to show. Order has an
 * amount and no currency field, and this is an exporter whose orders will not
 * all be in one currency — so a hard-coded "$" or "PKR" would be a guess
 * printed next to someone's money. The header says Total; the unit is a
 * decision for the schema, not for this function.
 *
 * Formatted here rather than in the component so the server and the client
 * cannot disagree about it — Intl in a component renders under the server's
 * locale first and the browser's on hydration, which is a mismatch waiting to
 * happen.
 */
function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export type PortalSummary = {
  quotesAwaitingPrice: number;
  quotesReadyToReview: number;
  ordersInProgress: number;
};

/**
 * The three counters on the dashboard.
 *
 * `ordersInProgress` IS ITS OWN QUERY and that is the point. It used to be
 * `recentOrders.length` — which is the length of a list capped at four and
 * containing every status, so a customer with two live orders and twenty
 * finished ones saw "Orders in progress: 4". The label was a lie in both
 * directions at once: it counted completed orders, and it stopped counting at
 * four.
 *
 * In progress means not yet delivered and not cancelled — PENDING or
 * IN_PRODUCTION. SHIPPED is deliberately excluded: from the customer's side
 * that order has left the factory and is no longer something Souwel is working
 * on.
 */
export async function getSummary(userId: string): Promise<PortalSummary> {
  const scope = { customerProfile: { userId } };

  const [quotes, ordersInProgress] = await Promise.all([
    prisma.quote.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.order.count({
      where: { ...scope, status: { in: ["PENDING", "IN_PRODUCTION"] } },
    }),
  ]);

  const count = (status: string) => quotes.find((q) => q.status === status)?._count._all ?? 0;

  return {
    quotesAwaitingPrice: count("REQUESTED"),
    quotesReadyToReview: count("QUOTED"),
    ordersInProgress,
  };
}
