import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/roles";
import { getUserDetail, listUsers, type ListQuery } from "@/lib/db/crm";
import { CrmPage, Panel, PanelHeader } from "@/components/crm/Surface";
import { FilterChips, Pagination, SearchBox, SortHeader } from "@/components/crm/TableControls";
import { RolePill, StatusPill, UserControls } from "@/components/crm/UserControls";
import { UserDrawer } from "@/components/crm/UserDrawer";
import { ExportButton } from "@/components/crm/ExportButton";
import { FormAlert } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

type Search = {
  q?: string;
  sort?: string;
  dir?: string;
  page?: string;
  status?: string;
  user?: string;
};

/** Query params → the shape lib/db/crm expects. Sort keys are whitelisted there. */
function toQuery(s: Search): ListQuery {
  return {
    q: s.q,
    sort: s.sort,
    dir: s.dir === "asc" ? "asc" : "desc",
    page: s.page ? Number.parseInt(s.page, 10) || 1 : 1,
    status: s.status,
  };
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const staff = await requireRole("/admin/users", ["ADMIN", "SALES"]);
  const params = await searchParams;
  const query = toQuery(params);

  let page = { rows: [] as Awaited<ReturnType<typeof listUsers>>["rows"], total: 0, page: 1, perPage: 20, pageCount: 1 };
  let detail: Awaited<ReturnType<typeof getUserDetail>> = null;
  let loadFailed = false;

  try {
    // The detail is fetched alongside the list, on the server, under the same
    // guard — rather than by a second client request that would need its own.
    [page, detail] = await Promise.all([
      listUsers(query),
      params.user ? getUserDetail(params.user) : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error("[crm] users read failed:", error);
    loadFailed = true;
  }

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <CrmPage className="grid gap-5">
      <Panel>
        <PanelHeader
          title="Users"
          description="Everyone with an account — customers and staff."
          action={<ExportButton type="users" />}
        />

        <div className="border-border/60 flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
          <SearchBox placeholder="Search name, email or company" />
          <FilterChips
            label="Filter users"
            options={[
              { value: "CUSTOMER", label: "Customers" },
              { value: "SALES", label: "Sales" },
              { value: "ADMIN", label: "Admins" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        {loadFailed ? (
          <div className="px-5 py-5">
            <FormAlert kind="error">
              We could not load the user list right now. Please reload in a moment.
            </FormAlert>
          </div>
        ) : page.rows.length === 0 ? (
          <p className="text-muted-foreground px-5 py-14 text-center text-[13.5px]">
            No users match this search.
          </p>
        ) : (
          <>
            {/* Desktop: a real table. Column headers are what a screen reader
                navigates by, and these rows genuinely share columns. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead className="border-border/60 border-b">
                  <tr>
                    <SortHeader column="name" defaultDir="asc">
                      Name
                    </SortHeader>
                    <SortHeader column="company" defaultDir="asc">
                      Company
                    </SortHeader>
                    <SortHeader column="role" defaultDir="asc">
                      Role
                    </SortHeader>
                    <th scope="col" className="text-muted-foreground px-4 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase">
                      Status
                    </th>
                    <SortHeader column="createdAt" align="right">
                      Joined
                    </SortHeader>
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-border/40 hover:bg-muted/50 border-b transition-colors last:border-0"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        {/* The link is on the name, not a wrapper around the row:
                            a <tr> cannot legally contain an <a>, and making the
                            row clickable with onClick would put the only route
                            into the detail behind a mouse. */}
                        <Link
                          href={`/admin/users?${new URLSearchParams({ ...cleanParams(params), user: u.id })}`}
                          scroll={false}
                          className="text-foreground hover:text-primary-strong dark:hover:text-primary focus-visible:ring-ring rounded text-[13.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {u.name}
                        </Link>
                        <span className="text-muted-foreground block text-[12px]">{u.email}</span>
                      </th>
                      <td className="text-muted-foreground px-4 py-3 text-[13px]">
                        {u.company ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RolePill role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill active={u.active} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-right text-[13px] tabular-nums">
                        {dateFmt.format(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: five columns do not fit in 360px, and a table that
                scrolls sideways hides the columns that matter. */}
            <ul className="divide-border/40 divide-y md:hidden">
              {page.rows.map((u) => (
                <li key={u.id} className="px-5 py-3.5">
                  <Link
                    href={`/admin/users?${new URLSearchParams({ ...cleanParams(params), user: u.id })}`}
                    scroll={false}
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-[14px] font-semibold">
                          {u.name}
                        </p>
                        <p className="text-muted-foreground truncate text-[12.5px]">{u.email}</p>
                        {u.company ? (
                          <p className="text-muted-foreground truncate text-[12.5px]">
                            {u.company}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <RolePill role={u.role} />
                        <StatusPill active={u.active} />
                      </div>
                    </div>
                  </Link>
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

      {detail ? (
        <UserDrawer
          detail={detail}
          controls={
            <UserControls
              userId={detail.id}
              role={detail.role}
              active={!detail.banned}
              isSelf={detail.id === staff.id}
              // Admin only. The action re-checks — this just avoids showing
              // Sales a control that would refuse them.
              canManage={isAdmin(staff.role)}
            />
          }
        />
      ) : null}
    </CrmPage>
  );
}

/** Drop the drawer param and any empty values before rebuilding a row link. */
function cleanParams(params: Search): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "user" && typeof v === "string" && v !== "") out[k] = v;
  }
  return out;
}
