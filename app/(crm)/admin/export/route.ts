import { NextResponse, type NextRequest } from "next/server";
import writeXlsxFile, { type SheetData } from "write-excel-file/node";
import { getStaffUser } from "@/lib/auth/session";
import { roleLabel } from "@/lib/auth/roles";
import {
  listLeadsForExport,
  listUsersForExport,
  type LeadRow,
  type ListQuery,
  type UserRow,
} from "@/lib/db/crm";
import { QUOTE_STATUS_LABELS } from "@/components/crm/QuoteStatusBadge";

/**
 * Excel export for the users and leads tables.
 *
 * THE GUARD IS HERE, NOT ONLY ON THE PAGE THAT LINKS TO IT. A Route Handler is
 * a URL anyone can paste into a browser — /admin/export?type=users is the whole
 * customer list as a spreadsheet, which is the single most valuable thing in
 * this application to an attacker. It is covered by middleware (a cookie must
 * exist) and by this check (that cookie must belong to Admin or Sales); neither
 * alone is enough, because middleware cannot validate a session.
 *
 * `force-dynamic` because the response depends on the session and the query.
 * A cached export would be one customer's filter served to the next reader.
 */
export const dynamic = "force-dynamic";

/**
 * WHY write-excel-file AND NOT SheetJS/xlsx, WHICH THE BRIEF SUGGESTED.
 *
 * The `xlsx` package on npm is frozen at 0.18.5 — SheetJS moved distribution to
 * their own CDN and no longer publishes there, so the registry copy no longer
 * receives fixes. `exceljs`, the other obvious choice, was tried and pulls a
 * `uuid` release with an open advisory. This one audits clean with a single
 * dependency (fflate), and writing a real .xlsx is all that is needed here —
 * nothing in this app ever parses an uploaded spreadsheet, which is where the
 * SheetJS advisories actually bite.
 */

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(request: NextRequest) {
  const staff = await getStaffUser();
  if (!staff) {
    // 404 rather than 403. A customer poking at /admin/export should learn
    // nothing about whether it exists.
    return new NextResponse("Not found", { status: 404 });
  }

  const sp = request.nextUrl.searchParams;
  const type = sp.get("type") === "leads" ? "leads" : "users";

  // Parsed through the SAME shape the tables use, so an export cannot drift
  // from what was on screen.
  const query: ListQuery = {
    q: sp.get("q") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    dir: sp.get("dir") === "asc" ? "asc" : "desc",
    status: sp.get("status") ?? undefined,
  };

  try {
    const { buffer, filename } =
      type === "leads" ? await buildLeads(query) : await buildUsers(query);

    /**
     * Node Buffer -> a standalone Uint8Array.
     *
     * A Buffer is a Uint8Array subclass, but small ones are views into a
     * SHARED internal pool — its `.buffer` is not exclusively this file's
     * bytes. `Uint8Array.from` copies just this view's window, which is both
     * correct and what the Web Response body type wants (a Buffer's
     * `ArrayBufferLike` may be a SharedArrayBuffer, which is not a valid
     * BodyInit).
     */
    const body = Uint8Array.from(buffer);

    return new NextResponse(body, {
      headers: {
        "Content-Type": MIME,
        "Content-Disposition": `attachment; filename="${filename}"`,
        // The file contains the customer list. It must not sit in a shared
        // cache, a CDN, or the browser's disk cache.
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    console.error("[crm] export failed:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}

/** yyyy-mm-dd, plus the active filter, so two exports never collide in Downloads. */
function filenameFor(kind: string, query: ListQuery): string {
  const date = new Date().toISOString().slice(0, 10);
  const parts = [kind, date];
  if (query.status) parts.push(query.status.toLowerCase());
  if (query.q) parts.push("filtered");
  return `souwel-${parts.join("-")}.xlsx`;
}

const HEADER = {
  fontWeight: "bold" as const,
  backgroundColor: "#0A2540",
  color: "#FFFFFF",
  align: "left" as const,
};

async function buildUsers(query: ListQuery) {
  const rows: UserRow[] = await listUsersForExport(query);

  // Annotated as SheetData rather than inferred: without it TypeScript widens
  // the header row and the body rows into a union and then matches the
  // multi-sheet overload, which wants { data } objects.
  const data: SheetData = [
    [
      { value: "Name", ...HEADER },
      { value: "Email", ...HEADER },
      { value: "Company", ...HEADER },
      { value: "Role", ...HEADER },
      { value: "Status", ...HEADER },
      { value: "Joined", ...HEADER },
    ],
    ...rows.map((u) => [
      { value: u.name, type: String },
      { value: u.email, type: String },
      { value: u.company ?? "", type: String },
      { value: roleLabel(u.role), type: String },
      { value: u.active ? "Active" : "Inactive", type: String },
      // A real date cell, not a formatted string: Excel can then sort and
      // filter it as a date, which is most of the point of exporting to Excel
      // rather than to CSV.
      { value: u.createdAt, type: Date, format: "dd mmm yyyy" },
    ]),
  ];

  const buffer = await writeXlsxFile(data, {
    columns: [
      { width: 26 },
      { width: 30 },
      { width: 28 },
      { width: 12 },
      { width: 12 },
      { width: 14 },
    ],
    sheet: "Users",
  }).toBuffer();

  return { buffer, filename: filenameFor("users", query) };
}

async function buildLeads(query: ListQuery) {
  const rows: LeadRow[] = await listLeadsForExport(query);

  const data: SheetData = [
    [
      { value: "Reference", ...HEADER },
      { value: "Contact", ...HEADER },
      { value: "Company", ...HEADER },
      { value: "Email", ...HEADER },
      { value: "Source", ...HEADER },
      { value: "Products", ...HEADER },
      { value: "Items", ...HEADER },
      { value: "Status", ...HEADER },
      { value: "Received", ...HEADER },
    ],
    ...rows.map((l) => [
      { value: l.reference, type: String },
      { value: l.contactName, type: String },
      { value: l.company, type: String },
      { value: l.email, type: String },
      // Whether a lead came from a registered account or an anonymous form is
      // the first thing sales sorts by, so it is its own column rather than
      // something to infer from a blank cell.
      { value: l.isGuest ? "Guest" : "Registered", type: String },
      { value: l.products, type: String },
      { value: l.itemCount, type: Number },
      { value: QUOTE_STATUS_LABELS[l.status] ?? l.status, type: String },
      { value: l.createdAt, type: Date, format: "dd mmm yyyy" },
    ]),
  ];

  const buffer = await writeXlsxFile(data, {
    columns: [
      { width: 16 },
      { width: 24 },
      { width: 26 },
      { width: 30 },
      { width: 12 },
      { width: 34 },
      { width: 8 },
      { width: 16 },
      { width: 14 },
    ],
    sheet: "Leads",
  }).toBuffer();

  return { buffer, filename: filenameFor("leads", query) };
}
