import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getCrmStats, getTrend, type CrmStats, type TrendPoint } from "@/lib/db/crm";
import { CrmPage, Panel, PanelHeader } from "@/components/crm/Surface";
import { StatCard } from "@/components/crm/StatCard";
import { TrendChart } from "@/components/crm/TrendChart";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "CRM Overview",
  robots: { index: false, follow: false },
};

const EMPTY_STATS: CrmStats = {
  users: 0,
  customers: 0,
  leads: 0,
  quotesByStatus: { requested: 0, quoted: 0, accepted: 0, declined: 0 },
  orders: 0,
};

export default async function CrmOverviewPage() {
  // Re-checked here as well as in the layout. Cheap (the session read is
  // request-cached) and it means this page cannot be rendered by a route
  // arrangement that bypasses the shell.
  await requireRole("/admin", ["ADMIN", "SALES"]);

  let stats = EMPTY_STATS;
  let trend: TrendPoint[] = [];
  let loadFailed = false;

  try {
    [stats, trend] = await Promise.all([getCrmStats(), getTrend(12)]);
  } catch (error) {
    console.error("[crm] overview read failed:", error);
    loadFailed = true;
  }

  const { quotesByStatus: q } = stats;
  const openQuotes = q.requested + q.quoted;

  return (
    <CrmPage className="grid gap-5">
      {loadFailed ? (
        <div data-crm-item>
          <FormAlert kind="error">
            We could not load the CRM figures right now. Please reload in a moment.
          </FormAlert>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* `icon` is a NAME, not a component. This page is a Server Component
            and StatCard is a client one, so an icon passed as a prop would have
            to be serialised across that boundary — React refuses, and the page
            500s with "Functions cannot be passed directly to Client
            Components". */}
        <StatCard
          label="Registered users"
          value={stats.users}
          icon="users"
          hint={`${stats.customers} customer${stats.customers === 1 ? "" : "s"}`}
          delay={0}
        />
        <StatCard
          label="Leads received"
          value={stats.leads}
          icon="leads"
          accent="gold"
          hint={`${openQuotes} still open`}
          delay={0.06}
        />
        <StatCard
          label="Quotes accepted"
          value={q.accepted}
          icon="quotes"
          hint={`${q.declined} declined`}
          delay={0.12}
        />
        <StatCard label="Orders" value={stats.orders} icon="orders" accent="gold" delay={0.18} />
      </div>

      {/* Quote pipeline. Four numbers with a shared total is a breakdown, not a
          chart — a four-slice pie would be less precise and take five times the
          room. The bar underneath carries the proportion. */}
      <Panel>
        <PanelHeader
          title="Quote pipeline"
          description="Every quote request, by where it has reached."
          action={
            <Link
              href="/admin/leads"
              className="text-primary-strong hover:text-primary focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Open leads
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
        <div className="px-5 py-5">
          <Pipeline stats={stats} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Leads and orders over time" />
        <div className="px-5 py-5">
          <TrendChart data={trend} />
        </div>
      </Panel>
    </CrmPage>
  );
}

/**
 * The pipeline breakdown.
 *
 * Each stage shows its own count AND its share, because "3 accepted" means
 * something very different out of 4 than out of 400. Status colours come from
 * the reserved status tokens rather than the chart series — these are states,
 * not identities, and mixing the two palettes is how "declined" ends up the
 * same colour as a data series somewhere else on the page.
 */
function Pipeline({ stats }: { stats: CrmStats }) {
  const q = stats.quotesByStatus;
  const total = q.requested + q.quoted + q.accepted + q.declined;

  const stages = [
    { key: "Awaiting a price", count: q.requested, className: "bg-premium" },
    { key: "Quoted", count: q.quoted, className: "bg-primary" },
    { key: "Accepted", count: q.accepted, className: "bg-forest dark:bg-[#7fa05c]" },
    { key: "Declined", count: q.declined, className: "bg-destructive" },
  ];

  return (
    <div className="grid gap-4">
      {/* gap-[2px] between segments — the surface gap that keeps two adjacent
          fills from reading as one longer bar. */}
      <div className="bg-muted flex h-2.5 gap-[2px] overflow-hidden rounded-full" aria-hidden>
        {total === 0 ? null : (
          stages.map((s) =>
            s.count === 0 ? null : (
              <span
                key={s.key}
                className={s.className}
                style={{ width: `${(s.count / total) * 100}%` }}
              />
            )
          )
        )}
      </div>

      {/*
        Content-sized items, NOT a four-column grid.

        The grid version stretched each cell to a quarter of a 1400px panel and
        pushed the count to the far right of its cell with ml-auto — leaving
        roughly 200px of empty space between "Awaiting a price" and its own
        number, and putting that number directly beside the NEXT label. On
        screen it read as "Quoted: 5". Proximity is the only thing pairing a
        label to its value here, so the value sits against the label and the
        separation between stages does the grouping.
      */}
      <ul className="flex flex-wrap gap-x-8 gap-y-3">
        {stages.map((s) => (
          <li key={s.key} className="flex items-baseline gap-2">
            <span
              aria-hidden
              className={`size-2.5 shrink-0 translate-y-px rounded-full ${s.className}`}
            />
            <span className="text-muted-foreground text-[12.5px]">{s.key}</span>
            <span className="text-foreground text-[13.5px] font-semibold tabular-nums">
              {s.count}
            </span>
            {total > 0 ? (
              <span className="text-muted-foreground text-[11.5px] tabular-nums">
                {Math.round((s.count / total) * 100)}%
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
