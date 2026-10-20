"use client";

import { ClipboardList } from "lucide-react";
import { quoteListCount } from "@/lib/quote-list";
import { useQuoteList } from "@/lib/quote-list-store";
import { useQuoteListDrawer } from "@/components/quote-list/QuoteListProvider";
import { cn } from "@/lib/utils";

/**
 * The quote list icon in the header, with a count of the products in it.
 *
 * A CLIPBOARD, NOT A TROLLEY. Nothing is bought on this site and nothing has a
 * price; a shopping cart in the bar would promise a checkout that does not
 * exist. The control is the same one a shopper knows — an icon, a badge, a
 * panel from the right — under the name the product pages already use for it.
 *
 * THE BADGE COUNTS ITEMS, not pieces — see quoteListCount. Two products at 500
 * each show 2; three sizes of one towel show 3, because each was its own
 * "Add to List" and the badge is the only thing that confirms the press.
 *
 * Sized to the theme toggle beside it: 44px to touch, visually smaller.
 */
export function QuoteListButton({
  className,
  onOpen,
}: {
  className?: string;
  /** Runs before the drawer opens — the header closes its mobile menu here. */
  onOpen?: () => void;
}) {
  const count = quoteListCount(useQuoteList());
  const { open, openList } = useQuoteListDrawer();

  return (
    <button
      type="button"
      onClick={(e) => {
        onOpen?.();
        openList(e.currentTarget);
      }}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={
        count > 0 ? `Open your list, ${count} ${count === 1 ? "item" : "items"}` : "Open your list"
      }
      title="Your list"
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
        "text-foreground/70 hover:text-primary hover:bg-muted",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      <ClipboardList aria-hidden className="size-[19px]" />

      {count > 0 ? (
        <span
          // Re-keyed on the count so the pop replays each time it changes; a
          // badge that changes its digit in place is easy to miss.
          key={count}
          aria-hidden
          className="bg-primary-strong text-primary-strong-foreground ring-card animate-in zoom-in-50 absolute top-1 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10.5px] leading-none font-bold tabular-nums ring-2 duration-200"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
