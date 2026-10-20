"use client";

import { useSyncExternalStore } from "react";
import {
  QUOTE_LIST_MAX_ITEMS,
  QUOTE_LIST_MAX_LINE_QUANTITY,
  QUOTE_LIST_MAX_QUANTITY,
  isQuoteListKind,
  isQuoteListSku,
  isQuoteListSlug,
  quoteListId,
  type QuoteListItem,
  type QuoteListLine,
  type QuoteListProductRef,
} from "@/lib/quote-list";

/**
 * The quote list, kept in localStorage.
 *
 * A MODULE-LEVEL STORE, NOT A CONTEXT. Four things read this list and they sit
 * in unrelated parts of the tree: the badge in the header, the drawer, the
 * "Add to List" button in a product page's hero, and the range tables further
 * down. `useSyncExternalStore` lets each subscribe on its own, so adding a
 * product re-renders those four and nothing between them — and the badge
 * moves in the same frame as the click, with no reload.
 *
 * THE SERVER SNAPSHOT IS ALWAYS EMPTY. The server cannot see localStorage, so
 * every page is rendered with no list and the real one arrives as an ordinary
 * update after hydration. Reading storage during the first client render
 * instead would produce markup the server never sent — see lib/use-hydrated.ts
 * for the same reasoning.
 *
 * OTHER TABS FOLLOW ALONG through the `storage` event, which fires in every
 * tab except the one that wrote.
 */

const STORAGE_KEY = "souwel-quote-list";
const STORAGE_VERSION = 1;

const EMPTY: QuoteListItem[] = [];

/** Null until the first read. After that, the list as last read or written. */
let cache: QuoteListItem[] | null = null;
const listeners = new Set<() => void>();

/* ── Reading ────────────────────────────────────────────────────────────── */

const clampInt = (value: unknown, min: number, max: number): number | null => {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  return value < min || value > max ? null : value;
};

/** A path under /public and nothing else — never a scheme, never `//host`. */
const localPath = (value: unknown): string | null =>
  typeof value === "string" && /^\/(?!\/)/.test(value) && value.length <= 300 ? value : null;

/**
 * Rebuilds the list from whatever is in storage.
 *
 * NOTHING IN STORAGE IS TRUSTED. It is written by this file, but it is also
 * editable by hand, by a browser extension, or by an older version of this
 * code. Every field is checked and anything malformed is dropped rather than
 * rendered, so a damaged entry costs the buyer one row instead of the drawer.
 */
function sanitise(value: unknown): QuoteListItem[] {
  const rows = (value as { items?: unknown } | null)?.items;
  if (!Array.isArray(rows)) return EMPTY;

  const seen = new Set<string>();
  const out: QuoteListItem[] = [];

  for (const row of rows as Record<string, unknown>[]) {
    if (out.length >= QUOTE_LIST_MAX_ITEMS) break;
    if (!row || typeof row !== "object") continue;

    const { kind, slug, name } = row;
    if (!isQuoteListKind(kind) || !isQuoteListSlug(slug)) continue;
    if (typeof name !== "string" || !name.trim()) continue;

    const id = quoteListId(kind, slug);
    if (seen.has(id)) continue;

    const lines: QuoteListLine[] = [];
    if (kind !== "product" && Array.isArray(row.lines)) {
      const skus = new Set<string>();
      for (const line of (row.lines as Record<string, unknown>[]).slice(0, 100)) {
        if (!line || typeof line !== "object") continue;
        const quantity = clampInt(line.quantity, 1, QUOTE_LIST_MAX_LINE_QUANTITY);
        if (!isQuoteListSku(line.sku) || quantity === null || skus.has(line.sku)) continue;
        skus.add(line.sku);
        lines.push({
          sku: line.sku,
          label: typeof line.label === "string" ? line.label.slice(0, 120) : line.sku,
          quantity,
          step: clampInt(line.step, 1, 1000) ?? 1,
        });
      }
    }
    // A range product with no lines says nothing about what is wanted.
    if (kind !== "product" && lines.length === 0) continue;

    seen.add(id);
    out.push({
      id,
      kind,
      slug,
      name: name.slice(0, 200),
      image: localPath(row.image),
      href: localPath(row.href),
      quantity: clampInt(row.quantity, 1, QUOTE_LIST_MAX_QUANTITY) ?? 1,
      lines,
    });
  }

  return out.length > 0 ? out : EMPTY;
}

function read(): QuoteListItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitise(JSON.parse(raw)) : EMPTY;
  } catch {
    // Storage blocked, or not JSON. An empty list is the honest answer.
    return EMPTY;
  }
}

function getSnapshot(): QuoteListItem[] {
  if (cache === null) cache = read();
  return cache;
}

const getServerSnapshot = (): QuoteListItem[] => EMPTY;

/* ── Writing ────────────────────────────────────────────────────────────── */

function emit() {
  for (const listener of listeners) listener();
}

function write(next: QuoteListItem[]) {
  cache = next.length > 0 ? next : EMPTY;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, items: cache }));
  } catch {
    // Private mode or a full quota. The list still works for this visit from
    // the in-memory copy; it just will not survive a reload.
  }
  emit();
}

function onStorage(event: StorageEvent) {
  // `key` is null when the whole of storage was cleared.
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = read();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** The list, live. Empty on the server and until hydration has finished. */
export function useQuoteList(): QuoteListItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ── Actions ────────────────────────────────────────────────────────────── */

export type QuoteListAddResult = "added" | "exists" | "full";

/**
 * Adds a catalogue product at a quantity of one.
 *
 * NEVER A DUPLICATE. A second "Add to List" for a product already listed
 * reports `exists` and leaves the quantity alone — bumping it would turn a
 * double-click into a different order.
 */
export function addProductToQuoteList(
  product: Omit<QuoteListProductRef, "kind">
): QuoteListAddResult {
  const items = getSnapshot();
  const id = quoteListId("product", product.slug);
  if (items.some((i) => i.id === id)) return "exists";
  if (items.length >= QUOTE_LIST_MAX_ITEMS) return "full";

  write([...items, { ...product, kind: "product", id, quantity: 1, lines: [] }]);
  return "added";
}

export function setQuoteListQuantity(id: string, quantity: number) {
  const next = Math.min(Math.max(Math.round(quantity), 1), QUOTE_LIST_MAX_QUANTITY);
  write(getSnapshot().map((i) => (i.id === id ? { ...i, quantity: next } : i)));
}

/**
 * Adds one line of a range product, or replaces its quantity if the stock
 * code is already listed. Creates the product's entry on its first line.
 *
 * The quantity arrives ALREADY ROUNDED to the line's step — each range page
 * rounds by its own rule before calling this.
 */
export function setQuoteListLine(
  product: QuoteListProductRef,
  line: Omit<QuoteListLine, "quantity">,
  quantity: number
): "ok" | "full" {
  const items = getSnapshot();
  const id = quoteListId(product.kind, product.slug);
  const existing = items.find((i) => i.id === id);
  const next: QuoteListLine = {
    ...line,
    quantity: Math.min(Math.max(Math.round(quantity), 1), QUOTE_LIST_MAX_LINE_QUANTITY),
  };

  if (!existing) {
    if (items.length >= QUOTE_LIST_MAX_ITEMS) return "full";
    write([...items, { ...product, id, quantity: 1, lines: [next] }]);
    return "ok";
  }

  const lines = existing.lines.some((l) => l.sku === line.sku)
    ? existing.lines.map((l) => (l.sku === line.sku ? next : l))
    : [...existing.lines, next];

  // The name, thumbnail and link are refreshed on every write, so an entry
  // made before the catalogue changed catches up the next time it is touched.
  write(items.map((i) => (i.id === id ? { ...i, ...product, lines } : i)));
  return "ok";
}

/** Changes one line's quantity from the drawer, keeping it on its step. */
export function setQuoteListLineQuantity(id: string, sku: string, quantity: number) {
  write(
    getSnapshot().map((i) =>
      i.id === id
        ? {
            ...i,
            lines: i.lines.map((l) =>
              l.sku === sku
                ? {
                    ...l,
                    quantity: Math.min(
                      Math.max(Math.ceil(quantity / l.step) * l.step, l.step),
                      QUOTE_LIST_MAX_LINE_QUANTITY
                    ),
                  }
                : l
            ),
          }
        : i
    )
  );
}

/** Removes one line. A range product with no lines left goes with it. */
export function removeQuoteListLine(id: string, sku: string) {
  write(
    getSnapshot().flatMap((i) => {
      if (i.id !== id) return [i];
      const lines = i.lines.filter((l) => l.sku !== sku);
      return lines.length > 0 ? [{ ...i, lines }] : [];
    })
  );
}

export function removeFromQuoteList(ids: string[]) {
  if (ids.length === 0) return;
  const gone = new Set(ids);
  const items = getSnapshot();
  const next = items.filter((i) => !gone.has(i.id));
  if (next.length !== items.length) write(next);
}
