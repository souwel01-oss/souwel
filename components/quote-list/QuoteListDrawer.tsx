"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { ArrowRight, ClipboardList, Trash2, X } from "lucide-react";
import {
  QUOTE_LIST_MAX_LINE_QUANTITY,
  QUOTE_LIST_MAX_QUANTITY,
  hasStockCodes,
  quoteListCount,
  quoteListHref,
  type QuoteListItem,
  type QuoteListLine,
} from "@/lib/quote-list";
import {
  removeFromQuoteList,
  removeQuoteListLine,
  setQuoteListLineQuantity,
  setQuoteListQuantity,
  useQuoteList,
} from "@/lib/quote-list-store";
import { QuantityStepper } from "@/components/quote-list/QuantityStepper";

/**
 * The quote list, as a drawer from the right. There is no list PAGE: the list
 * is something a buyer checks on the way past, and sending them to another
 * route to look at it would take them off the product they were reading.
 *
 * BUILT ON RADIX DIALOG, which is what makes this a real modal rather than a
 * panel that looks like one: Escape and a click on the overlay close it, focus
 * moves in and is held there, and the page behind stops scrolling. Each of
 * those is a line in the brief and none of them is written here. The one
 * piece Radix cannot do alone is hand focus back on close, because it has no
 * single trigger to hand it to — QuoteListProvider supplies that.
 *
 * `data-lenis-prevent` IS THE ONE THING RADIX CANNOT KNOW ABOUT. The marketing
 * pages scroll through Lenis (components/animation/SmoothScroll.tsx), which
 * takes every wheel event on the window and moves the PAGE with it. Left
 * alone, wheeling over this drawer would scroll the page behind it and never
 * the list inside it. The attribute tells Lenis to leave events under these
 * two elements alone; Radix's own scroll lock then does the rest.
 *
 * THE SLIDE IS A CSS ANIMATION, NOT A TRANSITION, because Radix keeps the
 * panel mounted until an `animation` on it ends and has no way to wait for a
 * transition. Under prefers-reduced-motion globals.css collapses it to
 * nothing, so the drawer simply appears.
 */
export function QuoteListDrawer({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes when the drawer closes — see QuoteListProvider. */
  onCloseAutoFocus: (event: Event) => void;
}) {
  const items = useQuoteList();
  // The same figure the header badge shows, so the two can never disagree.
  const count = quoteListCount(items);
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* z-[60]: one above the sticky header's z-50, so the bar is dimmed
            with the rest of the page instead of floating over the overlay.

            The overlay leaves in the same 200ms as the panel. Radix holds the
            scroll lock until the overlay has gone, so a slower fade here is
            a page that stays frozen after the drawer has visibly closed. */}
        <Dialog.Overlay
          data-lenis-prevent
          className="bg-navy/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-[60] backdrop-blur-[2px] duration-300 data-[state=closed]:duration-200 dark:bg-black/65"
        />

        <Dialog.Content
          data-lenis-prevent
          onCloseAutoFocus={onCloseAutoFocus}
          className="bg-background text-foreground border-border data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right fixed top-0 right-0 z-[60] flex h-dvh w-full flex-col border-l shadow-2xl duration-300 ease-out outline-none data-[state=closed]:duration-200 data-[state=closed]:ease-in sm:w-[400px]"
        >
          <div className="border-border flex items-start justify-between gap-4 border-b py-4 pr-3 pl-5">
            <div className="min-w-0">
              <Dialog.Title className="font-heading text-foreground text-xl font-semibold">
                Your list
                {items.length > 0 ? (
                  <span className="text-muted-foreground font-sans text-sm font-normal">
                    {" "}
                    ({count} {count === 1 ? "item" : "items"})
                  </span>
                ) : null}
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                Everything here goes into one quote request.
              </Dialog.Description>
            </div>

            <Dialog.Close
              aria-label="Close your list"
              className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring grid size-11 shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
              <span
                aria-hidden
                className="border-premium/40 text-premium grid size-14 place-items-center rounded-full border"
              >
                <ClipboardList className="size-6" />
              </span>
              <p className="text-foreground mt-5 text-base font-semibold">Your list is empty</p>
              <p className="text-muted-foreground mt-2 max-w-[17rem] text-[13.5px] leading-relaxed">
                Press Add to List on any product page. Everything you add is kept here, ready to
                send as one request.
              </p>
            </div>
          ) : (
            // overscroll-contain: reaching the end of the list must not hand
            // the gesture on to the page behind the overlay.
            <ul className="divide-border min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain px-5">
              {listRows(items).map((row) => (
                <ListRow key={row.key} row={row} onNavigate={close} />
              ))}
            </ul>
          )}

          {/* The bottom inset keeps the button clear of the home indicator on
              a phone, where this drawer is the full width of the screen. */}
          <div className="border-border border-t px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {items.length > 0 ? (
              <Link
                href={quoteListHref(items)}
                onClick={close}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-7 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Request a Quote
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : (
              /* A real disabled <button>, not a Link styled to look dead — the
                 same choice the range tables make for the same reason. */
              <button
                type="button"
                disabled
                className="bg-muted text-muted-foreground inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg px-7 text-[15px] font-semibold"
              >
                Request a Quote
                <ArrowRight aria-hidden className="size-4" />
              </button>
            )}
            <p className="text-muted-foreground mt-3 text-center text-[12.5px] leading-relaxed">
              {items.length > 0
                ? "Priced by quotation. You can still change quantities on the next step."
                : "Add at least one product to request a quote."}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * One row of the drawer: a catalogue product, or ONE LINE of a range product.
 *
 * ONE ROW PER ITEM THE BADGE COUNTS. A wash cloth and a hand towel of the same
 * construction are two "Add to List" presses and two on the badge, so they are
 * two rows here too — each with the product's picture, its name, and the size
 * or colour underneath. Grouped under one heading they read as one item with
 * one picture, and the sizes below it as something less than items.
 */
type ListRowData = {
  key: string;
  item: QuoteListItem;
  /** The line this row is, on a range product. Null on a catalogue product. */
  line: QuoteListLine | null;
};

function listRows(items: QuoteListItem[]): ListRowData[] {
  return items.flatMap((item): ListRowData[] =>
    item.kind === "product"
      ? [{ key: item.id, item, line: null }]
      : item.lines.map((line) => ({ key: `${item.id}:${line.sku}`, item, line }))
  );
}

function ListRow({ row, onNavigate }: { row: ListRowData; onNavigate: () => void }) {
  const { item, line } = row;
  // What this row is called wherever it has to be named on its own — the
  // remove button and the quantity controls.
  const rowName = line ? `${item.name}, ${line.label}` : item.name;

  return (
    <li className="flex gap-3.5 py-4">
      {item.image ? (
        <Image
          src={item.image}
          // Decorative: the product's name is the text right beside it.
          alt=""
          width={64}
          height={64}
          sizes="64px"
          className="border-premium/30 size-16 shrink-0 rounded-lg border object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="border-premium/30 bg-muted text-muted-foreground grid size-16 shrink-0 place-items-center rounded-lg border"
        >
          <ClipboardList className="size-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          <p className="text-foreground min-w-0 flex-1 pt-0.5 text-[14.5px] leading-snug font-semibold">
            {item.href ? (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="hover:text-primary-strong focus-visible:ring-ring dark:hover:text-primary rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </p>
          {/* Removes this row only. On the last line of a range product that
              is the product as well — see removeQuoteListLine. */}
          <button
            type="button"
            onClick={() =>
              line ? removeQuoteListLine(item.id, line.sku) : removeFromQuoteList([item.id])
            }
            aria-label={`Remove ${rowName} from your list`}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-ring -mt-1 -mr-1.5 grid size-9 shrink-0 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>

        {line ? (
          <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
            {line.label}
            {/* The client's own code, so a buyer can match the row to their
                order sheet without opening the product page. Only where it
                is one: a catalogue row's key is this site's, not theirs. */}
            {hasStockCodes(item.kind) ? (
              <span className="text-muted-foreground/80 ml-1.5 font-mono text-[11px]">
                {line.sku}
              </span>
            ) : null}
          </p>
        ) : null}

        <QuantityStepper
          className="mt-2"
          value={line ? line.quantity : item.quantity}
          step={line?.step}
          max={line ? QUOTE_LIST_MAX_LINE_QUANTITY : QUOTE_LIST_MAX_QUANTITY}
          name={rowName}
          onChange={(next) =>
            line
              ? setQuoteListLineQuantity(item.id, line.sku, next)
              : setQuoteListQuantity(item.id, next)
          }
        />
      </div>
    </li>
  );
}
