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
    totalAmount: o.totalAmount.toString(),
    createdAt: o.createdAt,
    itemCount: o.quote._count.items,
  }));
}

export type PortalQuoteSummary = {
  requested: number;
  quoted: number;
  accepted: number;
};

export async function getQuoteSummary(userId: string): Promise<PortalQuoteSummary> {
  const grouped = await prisma.quote.groupBy({
    by: ["status"],
    where: { customerProfile: { userId } },
    _count: { _all: true },
  });

  const count = (status: string) =>
    grouped.find((g) => g.status === status)?._count._all ?? 0;

  return {
    requested: count("REQUESTED"),
    quoted: count("QUOTED"),
    accepted: count("ACCEPTED"),
  };
}
