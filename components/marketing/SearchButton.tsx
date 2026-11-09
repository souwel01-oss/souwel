"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = { title: string; section: string; detail: string | null; href: string };

/**
 * The search icon in the header, and the panel it opens.
 *
 * A modal on Radix Dialog, like the quote list: Escape closes, focus is held,
 * and the page behind does not scroll. The query goes to /api/search after a
 * short pause, so typing does not send a request per letter. Enter opens the
 * first result.
 */
export function SearchButton({
  className,
  onOpen,
}: {
  className?: string;
  /** Runs before the panel opens — the header closes its mobile menu here. */
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results);
      } catch {
        /* aborted by a newer query, or offline: leave the last results */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const typed = query.trim().length >= 2;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Search products"
        title="Search"
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
          "text-foreground/70 hover:text-primary hover:bg-muted",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          className
        )}
      >
        <Search aria-hidden className="size-[19px]" />
      </button>

      <Dialog.Portal>
        <Dialog.Overlay
          data-lenis-prevent
          className="bg-navy/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-[60] backdrop-blur-[2px] duration-200 dark:bg-black/65"
        />
        <Dialog.Content
          data-lenis-prevent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="bg-background text-foreground border-border data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 fixed top-[8dvh] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border shadow-2xl outline-none"
        >
          <Dialog.Title className="sr-only">Search products</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type a product name, blend or stock code. Enter opens the first result.
          </Dialog.Description>

          <div className="border-border flex items-center gap-3 border-b px-4">
            <Search aria-hidden className="text-muted-foreground size-5 shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  window.location.assign(results[0].href);
                }
              }}
              placeholder="Search towels, sheets, robes, stock codes…"
              autoComplete="off"
              aria-controls={listId}
              className="placeholder:text-muted-foreground h-14 min-w-0 flex-1 bg-transparent text-[16px] outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <Dialog.Close
              aria-label="Close search"
              className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring grid size-9 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
              <X aria-hidden className="size-4" />
            </Dialog.Close>
          </div>

          <div id={listId} className="max-h-[60dvh] overflow-y-auto overscroll-contain p-2">
            {!typed ? (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                Type at least two letters.
              </p>
            ) : results.length > 0 ? (
              <ul>
                {results.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      onClick={close}
                      className="hover:bg-muted focus-visible:bg-muted flex flex-col rounded-lg px-3 py-2.5 outline-none"
                    >
                      <span className="text-foreground text-[15px] font-medium">{r.title}</span>
                      <span className="text-muted-foreground text-[12.5px]">
                        {r.section}
                        {r.detail ? ` · ${r.detail}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm" aria-live="polite">
                {loading ? "Searching…" : `No products found for "${query.trim()}".`}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
