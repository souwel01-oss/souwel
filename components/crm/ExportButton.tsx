"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

/**
 * "Export to Excel".
 *
 * A PLAIN LINK TO A ROUTE HANDLER, not a fetch-and-blob dance. The browser
 * already knows how to download a file from a URL with a
 * Content-Disposition header — doing it in JavaScript means building a Blob,
 * minting an object URL, synthesising a click and remembering to revoke it,
 * and it breaks middle-click and "save link as" for no gain.
 *
 * IT FORWARDS THE CURRENT QUERY STRING VERBATIM. That is what makes "exports
 * the current data, respecting active search and filters" true by construction
 * rather than by two code paths being kept in agreement — the route parses the
 * same parameters through the same functions the table used.
 *
 * The drawer parameter is dropped: which record happens to be open has nothing
 * to do with which rows are being exported.
 */
export function ExportButton({ type }: { type: "users" | "leads" }) {
  const params = useSearchParams();

  const query = new URLSearchParams(params.toString());
  query.delete("user");
  query.delete("lead");
  query.delete("page"); // export the whole filtered set, not the visible page
  query.set("type", type);

  return (
    <a
      href={`/admin/export?${query.toString()}`}
      // No `download` attribute — the filename comes from the server's
      // Content-Disposition, which includes the date and the active filter.
      className="border-border text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-[12.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <Download aria-hidden className="size-3.5" />
      Export to Excel
    </a>
  );
}
