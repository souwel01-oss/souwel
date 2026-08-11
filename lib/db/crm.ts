import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Staff-only reads for the CRM.
 *
 * The mirror image of lib/db/portal.ts. There, every query is scoped to one
 * customer and that scoping is the security control. Here, staff legitimately
 * see everything — so the control moves entirely to WHO IS ALLOWED TO CALL
 * THESE. Nothing in this file checks a role; every caller must have passed
 * `getStaffUser()` or `getAdminUser()` first.
 *
 * That is a deliberate split rather than an oversight: a query module that
 * sometimes filters by role and sometimes does not is a module where the next
 * person cannot tell which functions are safe. These are all unsafe without a
 * guard, uniformly, and the guard lives at the boundary.
 *
 * PRICING. QuoteItem.unitPrice and lineTotal ARE selected here, unlike in
 * portal.ts. Staff pricing a quote is the one legitimate reader of those
 * columns — that is what the field exists for — and this module is only ever
 * reached by Admin or Sales.
 */

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export type CrmStats = {
  users: number;
  customers: number;
  leads: number;
  quotesByStatus: { requested: number; quoted: number; accepted: number; declined: number };
  orders: number;
};

export async function getCrmStats(): Promise<CrmStats> {
  const [users, customers, leads, byStatus, orders] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.quote.count(),
    prisma.quote.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
  ]);

  const n = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;

  return {
    users,
    customers,
    leads,
    quotesByStatus: {
      requested: n("REQUESTED"),
      quoted: n("QUOTED"),
      accepted: n("ACCEPTED"),
      declined: n("DECLINED"),
    },
    orders,
  };
}

export type TrendPoint = { label: string; leads: number; orders: number };

/**
 * Leads and orders per week over the last `weeks` weeks.
 *
 * Bucketed in JavaScript from a list of dates rather than with a SQL
 * date_trunc, because the grouping key has to agree with the axis labels the
 * chart renders and doing that in two places is how a chart ends up one bucket
 * out. Only the createdAt column is selected, so the row width is tiny; if
 * this ever needs to cover years rather than weeks it should move to raw SQL.
 */
export async function getTrend(weeks = 12): Promise<TrendPoint[]> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - weeks * 7);
  start.setHours(0, 0, 0, 0);

  const [quotes, orders] = await Promise.all([
    prisma.quote.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
  ]);

  const buckets: TrendPoint[] = [];
  const index = new Map<string, number>();
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

  for (let i = 0; i < weeks; i++) {
    const from = new Date(start);
    from.setDate(from.getDate() + i * 7);
    buckets.push({ label: fmt.format(from), leads: 0, orders: 0 });
    index.set(weekKey(from), i);
  }

  const add = (dates: { createdAt: Date }[], field: "leads" | "orders") => {
    for (const { createdAt } of dates) {
      const i = index.get(weekKey(alignToBucket(createdAt, start)));
      if (i !== undefined) buckets[i][field] += 1;
    }
  };

  add(quotes, "leads");
  add(orders, "orders");

  return buckets;
}

/** Start-of-bucket for a date, aligned to the same 7-day grid as `start`. */
function alignToBucket(date: Date, start: Date): Date {
  const days = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const out = new Date(start);
  out.setDate(out.getDate() + Math.floor(days / 7) * 7);
  return out;
}

function weekKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// Shared list plumbing
// ---------------------------------------------------------------------------

export type Paged<T> = {
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type ListQuery = {
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  status?: string;
};

export const PER_PAGE = 20;

/**
 * SORT COLUMNS ARE WHITELISTED, NOT PASSED THROUGH.
 *
 * `sort` arrives in the query string, and Prisma's orderBy takes a field name.
 * Handing it the raw value lets a visitor order by any column on the model —
 * including ones the table does not show, which is a slow but real way to read
 * data a row was never meant to reveal (order by a hidden field, then read the
 * sequence off the visible ones). An unknown value falls back to the default.
 */
function resolveSort<T extends Record<string, unknown>>(
  map: T,
  sort: string | undefined,
  dir: string | undefined,
  fallback: keyof T
): { orderBy: unknown; sort: string; dir: "asc" | "desc" } {
  const key = sort && sort in map ? sort : String(fallback);
  const direction: "asc" | "desc" = dir === "asc" ? "asc" : "desc";
  const build = map[key] as (d: "asc" | "desc") => unknown;
  return { orderBy: build(direction), sort: key, dir: direction };
}

function pageOf(value: number | undefined, total: number): { page: number; skip: number } {
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Math.floor(value ?? 1)), pageCount);
  return { page, skip: (page - 1) * PER_PAGE };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export type UserRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
};

const USER_SORTS = {
  name: (d: "asc" | "desc") => ({ name: d }),
  email: (d: "asc" | "desc") => ({ email: d }),
  role: (d: "asc" | "desc") => ({ role: d }),
  createdAt: (d: "asc" | "desc") => ({ createdAt: d }),
  company: (d: "asc" | "desc") => ({ customerProfile: { companyName: d } }),
} as const;

function userWhere(query: ListQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  const q = query.q?.trim();

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { customerProfile: { companyName: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (query.status === "active") where.banned = false;
  if (query.status === "inactive") where.banned = true;
  if (query.status && ["ADMIN", "SALES", "CUSTOMER"].includes(query.status)) {
    where.role = query.status as Prisma.UserWhereInput["role"];
  }

  return where;
}

export async function listUsers(query: ListQuery): Promise<Paged<UserRow>> {
  const where = userWhere(query);
  const { orderBy } = resolveSort(USER_SORTS, query.sort, query.dir, "createdAt");

  const total = await prisma.user.count({ where });
  const { page, skip } = pageOf(query.page, total);

  const rows = await prisma.user.findMany({
    where,
    orderBy: orderBy as Prisma.UserOrderByWithRelationInput,
    skip,
    take: PER_PAGE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      customerProfile: { select: { companyName: true } },
    },
  });

  return {
    rows: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.customerProfile?.companyName ?? null,
      role: u.role,
      // `banned` is Better Auth's column; the CRM speaks of it as "active"
      // because that is what an account manager is deciding. Inverted once,
      // here, rather than in every component that renders it.
      active: !u.banned,
      createdAt: u.createdAt,
    })),
    total,
    page,
    perPage: PER_PAGE,
    pageCount: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

/** Every user matching the filter, for export. No pagination, capped. */
export async function listUsersForExport(query: ListQuery, cap = 5000): Promise<UserRow[]> {
  const { orderBy } = resolveSort(USER_SORTS, query.sort, query.dir, "createdAt");
  const rows = await prisma.user.findMany({
    where: userWhere(query),
    orderBy: orderBy as Prisma.UserOrderByWithRelationInput,
    take: cap,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      customerProfile: { select: { companyName: true } },
    },
  });

  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    company: u.customerProfile?.companyName ?? null,
    role: u.role,
    active: !u.banned,
    createdAt: u.createdAt,
  }));
}

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>;

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      banned: true,
      createdAt: true,
      customerProfile: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          phone: true,
          addressLine1: true,
          city: true,
          country: true,
        },
      },
    },
  });

  if (!user) return null;

  const profileId = user.customerProfile?.id;

  // A staff account, or a customer who signed up through Google and never
  // completed a profile, has no CustomerProfile — and every relation below
  // hangs off one. Skipping the queries entirely is both correct and avoids
  // four round trips that can only return empty.
  if (!profileId) {
    return { ...user, quotes: [], orders: [], documents: [], activity: [] };
  }

  const [quotes, orders, documents, activity] = await Promise.all([
    prisma.quote.findMany({
      where: { customerProfileId: profileId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.findMany({
      where: { customerProfileId: profileId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        reference: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.document.findMany({
      where: { customerProfileId: profileId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, fileName: true, createdAt: true },
    }),
    prisma.activityLog.findMany({
      where: { customerProfileId: profileId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
    }),
  ]);

  return {
    ...user,
    quotes,
    // Decimal cannot cross into a Client Component, and Number() on a money
    // column loses precision. Same treatment as the customer portal.
    orders: orders.map((o) => ({ ...o, totalAmount: o.totalAmount.toFixed(2) })),
    documents,
    activity,
  };
}

// ---------------------------------------------------------------------------
// Leads & quotes
// ---------------------------------------------------------------------------

export type LeadRow = {
  id: string;
  reference: string;
  contactName: string;
  company: string;
  email: string;
  isGuest: boolean;
  status: string;
  itemCount: number;
  products: string;
  createdAt: Date;
};

const LEAD_SORTS = {
  createdAt: (d: "asc" | "desc") => ({ createdAt: d }),
  reference: (d: "asc" | "desc") => ({ reference: d }),
  status: (d: "asc" | "desc") => ({ status: d }),
} as const;

function leadWhere(query: ListQuery): Prisma.QuoteWhereInput {
  const where: Prisma.QuoteWhereInput = {};
  const q = query.q?.trim();

  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { guestName: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
      { guestCompany: { contains: q, mode: "insensitive" } },
      { customerProfile: { contactName: { contains: q, mode: "insensitive" } } },
      { customerProfile: { companyName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const statuses = ["REQUESTED", "QUOTED", "ACCEPTED", "DECLINED", "FULFILLED"];
  if (query.status && statuses.includes(query.status)) {
    where.status = query.status as Prisma.QuoteWhereInput["status"];
  }
  if (query.status === "guest") where.customerProfileId = null;

  return where;
}

const LEAD_SELECT = {
  id: true,
  reference: true,
  status: true,
  createdAt: true,
  guestName: true,
  guestEmail: true,
  guestCompany: true,
  customerProfile: {
    select: { contactName: true, companyName: true, user: { select: { email: true } } },
  },
  items: { select: { product: { select: { name: true } } } },
} satisfies Prisma.QuoteSelect;

type LeadRecord = Prisma.QuoteGetPayload<{ select: typeof LEAD_SELECT }>;

function toLeadRow(q: LeadRecord): LeadRow {
  const names = q.items.map((i) => i.product.name);
  return {
    id: q.id,
    reference: q.reference,
    // A lead is either a registered customer or a guest submission, and the
    // table has to show both in one column — the whole point of the leads view
    // is that a quote request from someone with no account is still a lead.
    contactName: q.customerProfile?.contactName ?? q.guestName ?? "—",
    company: q.customerProfile?.companyName ?? q.guestCompany ?? "—",
    email: q.customerProfile?.user?.email ?? q.guestEmail ?? "—",
    isGuest: q.customerProfile === null,
    status: q.status,
    itemCount: names.length,
    // Two names then a count. The full list belongs in the detail panel; a
    // fourteen-product cell wraps to five lines and destroys the row rhythm.
    products:
      names.length === 0
        ? "—"
        : names.length <= 2
          ? names.join(", ")
          : `${names.slice(0, 2).join(", ")} +${names.length - 2}`,
    createdAt: q.createdAt,
  };
}

export async function listLeads(query: ListQuery): Promise<Paged<LeadRow>> {
  const where = leadWhere(query);
  const { orderBy } = resolveSort(LEAD_SORTS, query.sort, query.dir, "createdAt");

  const total = await prisma.quote.count({ where });
  const { page, skip } = pageOf(query.page, total);

  const rows = await prisma.quote.findMany({
    where,
    orderBy: orderBy as Prisma.QuoteOrderByWithRelationInput,
    skip,
    take: PER_PAGE,
    select: LEAD_SELECT,
  });

  return {
    rows: rows.map(toLeadRow),
    total,
    page,
    perPage: PER_PAGE,
    pageCount: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function listLeadsForExport(query: ListQuery, cap = 5000): Promise<LeadRow[]> {
  const { orderBy } = resolveSort(LEAD_SORTS, query.sort, query.dir, "createdAt");
  const rows = await prisma.quote.findMany({
    where: leadWhere(query),
    orderBy: orderBy as Prisma.QuoteOrderByWithRelationInput,
    take: cap,
    select: LEAD_SELECT,
  });
  return rows.map(toLeadRow);
}

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLeadDetail>>>;

export async function getLeadDetail(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      reference: true,
      status: true,
      customerMessage: true,
      staffResponse: true,
      createdAt: true,
      quotedAt: true,
      validUntil: true,
      guestName: true,
      guestEmail: true,
      guestCompany: true,
      guestPhone: true,
      customerProfile: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          phone: true,
          user: { select: { id: true, email: true } },
        },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          customerNotes: true,
          // Staff-only columns. Selected here and nowhere in lib/db/portal.ts.
          unitPrice: true,
          lineTotal: true,
          staffNotes: true,
          product: { select: { name: true, slug: true } },
        },
      },
      order: { select: { id: true, reference: true, status: true } },
    },
  });

  if (!quote) return null;

  return {
    ...quote,
    items: quote.items.map((i) => ({
      ...i,
      unitPrice: i.unitPrice ? i.unitPrice.toFixed(2) : null,
      lineTotal: i.lineTotal ? i.lineTotal.toFixed(2) : null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function listDocuments(take = 100) {
  return prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      fileName: true,
      mimeType: true,
      fileSizeBytes: true,
      createdAt: true,
      customerProfile: { select: { companyName: true } },
      uploadedBy: { select: { name: true } },
    },
  });
}
