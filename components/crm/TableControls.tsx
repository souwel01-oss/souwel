"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Search, filter, sort and pagination — all held in the URL.
 *
 * NOT IN COMPONENT STATE, and that decision earns its keep four times over:
 *
 *   - the server does the filtering, so the table works at 10,000 users
 *     instead of shipping all of them to the browser to hide most
 *   - the Export button is a plain <a> to a route that reads the SAME query
 *     string, so "export what I am looking at" is true by construction rather
 *     than by two code paths agreeing
 *   - a filtered view is a link. Staff can send "these three declined quotes"
 *     to a colleague
 *   - Back works
 *
 * The cost is a round trip per keystroke, which is what the debounce below is
 * for.
 */

export function useTableQuery() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      // Any change to the filter invalidates the page number — otherwise
      // narrowing a search from page 4 lands on an empty page 4 of 1.
      if (!("page" in patch)) next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  return { params, pathname, push };
}

export function SearchBox({ placeholder }: { placeholder: string }) {
  const { params, push } = useTableQuery();
  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Keeps the box in step when the URL changes from somewhere else — a filter
  // chip clearing the search, or the Back button.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setValue(initial);
    setPending(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function onChange(next: string) {
    setValue(next);
    setPending(true);
    window.clearTimeout(timer.current);
    // 300ms: long enough that typing "textile" is one request rather than
    // seven, short enough that it does not feel like the box is ignoring you.
    timer.current = window.setTimeout(() => {
      setPending(false);
      push({ q: next.trim() || null });
    }, 300);
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-input bg-card text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/25 h-10 w-full rounded-lg border pr-9 pl-9 text-[13.5px] transition-[border-color,box-shadow] outline-none focus-visible:ring-4"
      />
      {pending ? (
        <Loader2
          aria-hidden
          className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
        />
      ) : value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            push({ q: null });
          }}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-md"
        >
          <X aria-hidden className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export function FilterChips({
  options,
  label,
}: {
  options: { value: string; label: string }[];
  label: string;
}) {
  const { params, push } = useTableQuery();
  const active = params.get("status") ?? "";

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {[{ value: "", label: "All" }, ...options].map((o) => {
        const on = active === o.value;
        return (
          <button
            key={o.value || "all"}
            type="button"
            aria-pressed={on}
            onClick={() => push({ status: o.value || null })}
            className={cn(
              "focus-visible:ring-ring h-8 rounded-full border px-3 text-[12px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
              on
                ? "border-primary bg-primary/12 text-primary-strong dark:text-primary"
                : "border-border text-muted-foreground hover:border-input hover:text-foreground bg-transparent"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A sortable column header.
 *
 * The whole header is a button, not an icon beside the label — a 12px caret is
 * a poor target and the label is the thing people aim at. `aria-sort` on the
 * <th> is what tells a screen reader the table is sorted and which way; the
 * caret alone says nothing.
 */
export function SortHeader({
  column,
  children,
  align = "left",
  defaultDir = "desc",
}: {
  column: string;
  children: React.ReactNode;
  align?: "left" | "right";
  defaultDir?: "asc" | "desc";
}) {
  const { params, push } = useTableQuery();
  const activeSort = params.get("sort");
  const activeDir = params.get("dir") === "asc" ? "asc" : "desc";
  const on = activeSort === column;
  const nextDir = on ? (activeDir === "asc" ? "desc" : "asc") : defaultDir;

  return (
    <th
      scope="col"
      aria-sort={on ? (activeDir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3", align === "right" && "text-right")}
    >
      <button
        type="button"
        onClick={() => push({ sort: column, dir: nextDir })}
        className={cn(
          "focus-visible:ring-ring inline-flex items-center gap-1 rounded text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
          on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
        <span aria-hidden className={cn("text-[9px]", !on && "opacity-40")}>
          {on ? (activeDir === "asc" ? "▲" : "▼") : "▼"}
        </span>
      </button>
    </th>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  perPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  perPage: number;
}) {
  const { params, pathname } = useTableQuery();

  const href = (p: number) => {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    return `${pathname}${next.toString() ? `?${next}` : ""}`;
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);

  return (
    <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
      {/* aria-live so the count is announced after a filter changes it. */}
      <p className="text-muted-foreground text-[12.5px] tabular-nums" aria-live="polite">
        {total === 0 ? "No results" : `${from}–${to} of ${total}`}
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          <PageLink href={href(page - 1)} disabled={page <= 1} label="Previous page">
            <ChevronLeft aria-hidden className="size-4" />
          </PageLink>
          <span className="text-muted-foreground px-2 text-[12.5px] tabular-nums">
            Page {page} of {pageCount}
          </span>
          <PageLink href={href(page + 1)} disabled={page >= pageCount} label="Next page">
            <ChevronRight aria-hidden className="size-4" />
          </PageLink>
        </div>
      ) : null}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const shared =
    "grid size-9 place-items-center rounded-lg border border-border transition-colors";

  // A disabled control must not be a link. Rendering an <a> and styling it grey
  // still leaves it focusable and clickable by keyboard.
  if (disabled) {
    return (
      <span aria-hidden className={cn(shared, "text-muted-foreground/40")}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className={cn(shared, "text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none")}
    >
      {children}
    </Link>
  );
}
