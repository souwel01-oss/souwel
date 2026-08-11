import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getLeadDetail, listLeads, type ListQuery } from "@/lib/db/crm";
import { CrmPage, Panel, PanelHeader } from "@/components/crm/Surface";
import { FilterChips, Pagination, SearchBox, SortHeader } from "@/components/crm/TableControls";
import { QuoteStatusSelect } from "@/components/crm/QuoteStatusSelect";
import { LeadDrawer } from "@/components/crm/LeadDrawer";
import { ExportButton } from "@/components/crm/ExportButton";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Leads & Quotes",
  robots: { index: false, follow: false },
};

type Search = {
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
  status?: string;
  lead?: string;
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireRole("/admin/leads", ["ADMIN", "SALES"]);
  const params = await searchParams;

  const query: ListQuery = {
    q: params.q,
    sort: params.sort,
    dir: params.dir === "asc" ? "asc" : "desc",
    page: params.page ? Number.parseInt(params.page, 10) || 1 : 1,
    status: params.status,
  };

  let page = {
    rows: [] as Awaited<ReturnType<typeof listLeads>>["rows"],
    total: 0,
    page: 1,
    perPage: 20,
    pageCount: 1,
  };
  let detail: Awaited<ReturnType<typeof getLeadDetail>> = null;
  let loadFailed = false;

  try {
    [page, detail] = await Promise.all([
      listLeads(query),
      params.lead ? getLeadDetail(params.lead) : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error("[crm] leads read failed:", error);
    loadFailed = true;
  }

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const rowHref = (id: string) =>
    `/admin/leads?${new URLSearchParams({ ...cleanParams(params), lead: id })}`;

  return (
    <CrmPage className="grid gap-5">
      <Panel>
        <PanelHeader
          title="Leads & quotes"
          description="Every quote request from the site, including submissions from visitors with no account."
          action={<ExportButton type="leads" />}
        />

        <div className="border-border/60 flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
          <SearchBox placeholder="Search reference, contact or company" />
          <FilterChips
            label="Filter leads"
            options={[
              { value: "REQUESTED", label: "Awaiting price" },
              { value: "QUOTED", label: "Quoted" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "DECLINED", label: "Declined" },
              { value: "guest", label: "Guests" },
            ]}
          />
        </div>

        {loadFailed ? (
          <div className="px-5 py-5">
            <FormAlert kind="error">
              We could not load the leads right now. Please reload in a moment.
            </FormAlert>
          </div>
        ) : page.rows.length === 0 ? (
          <p className="text-muted-foreground px-5 py-14 text-center text-[13.5px]">
            No leads match this search.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="border-border/60 border-b">
                  <tr>
                    <SortHeader column="reference" defaultDir="asc">
                      Reference
                    </SortHeader>
                    <th
                      scope="col"
                      className="text-muted-foreground px-4 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="text-muted-foreground px-4 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase"
                    >
                      Products
                    </th>
                    <SortHeader column="createdAt">Received</SortHeader>
                    <th
                      scope="col"
                      className="text-muted-foreground px-4 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((l) => (
                    <tr
                      key={l.id}
                      className="border-border/40 hover:bg-muted/50 border-b transition-colors last:border-0"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link
                          href={rowHref(l.id)}
                          scroll={false}
                          className="text-foreground hover:text-primary-strong dark:hover:text-primary focus-visible:ring-ring rounded text-[13.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {l.reference}
                        </Link>
                      </th>
                      <td className="px-4 py-3">
                        <p className="text-foreground text-[13px]">{l.contactName}</p>
                        <p className="text-muted-foreground text-[12px]">
                          {l.company}
                          {/* Guest is called out on the row, not left to be
                              inferred from a missing account link — it changes
                              how sales follows up. */}
                          {l.isGuest ? (
                            <span className="border-premium/40 text-premium ml-2 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase">
                              Guest
                            </span>
                          ) : null}
                        </p>
                      </td>
                      <td className="text-muted-foreground max-w-[18rem] truncate px-4 py-3 text-[13px]">
                        {l.products}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-[13px] tabular-nums">
                        {dateFmt.format(l.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <QuoteStatusSelect quoteId={l.id} status={l.status} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-border/40 divide-y lg:hidden">
              {page.rows.map((l) => (
                <li key={l.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={rowHref(l.id)}
                        scroll={false}
                        className="text-foreground text-[14px] font-semibold"
                      >
                        {l.reference}
                      </Link>
                      <p className="text-muted-foreground truncate text-[12.5px]">
                        {l.contactName} · {l.company}
                      </p>
                      <p className="text-muted-foreground truncate text-[12.5px]">{l.products}</p>
                    </div>
                    {l.isGuest ? (
                      <span className="border-premium/40 text-premium shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase">
                        Guest
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2.5">
                    <QuoteStatusSelect quoteId={l.id} status={l.status} compact />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={page.page}
              pageCount={page.pageCount}
              total={page.total}
              perPage={page.perPage}
            />
          </>
        )}
      </Panel>

      {detail ? <LeadDrawer detail={detail} /> : null}
    </CrmPage>
  );
}

function cleanParams(params: Search): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "lead" && typeof v === "string" && v !== "") out[k] = v;
  }
  return out;
}
