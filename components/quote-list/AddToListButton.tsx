"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QUOTE_LIST_FULL_MESSAGE, quoteListId } from "@/lib/quote-list";
import { addProductToQuoteList, useQuoteList } from "@/lib/quote-list-store";
import { useQuoteListDrawer } from "@/components/quote-list/QuoteListProvider";
import { cn } from "@/lib/utils";

/** How long the button says "Added" before settling. */
const ADDED_MS = 1800;

/**
 * "Add to List", beside "Request a Quote" on a catalogue product page.
 *
 * THREE STATES, ONE BUTTON:
 *
 *   Add to List    → adds the product and says "Added" for a moment
 *   Added          → the confirmation, on the control that was just pressed
 *   In your list   → the resting state afterwards; pressing it opens the list
 *
 * NEVER A DUPLICATE. Once the product is listed the button stops adding. It
 * opens the drawer instead, which is where the quantity is changed — a second
 * press that quietly made it two would turn a double-click into a different
 * order.
 *
 * THE PRODUCT ARRIVES AS A PROP, already reduced to a name, a thumbnail and a
 * link. The page is a server component holding the whole specification; this
 * needs four strings from it.
 */
export function AddToListButton({
  product,
  className,
}: {
  product: { slug: string; name: string; image: string | null; href: string };
  className?: string;
}) {
  const items = useQuoteList();
  const { openList } = useQuoteListDrawer();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const inList = items.some((i) => i.id === quoteListId("product", product.slug));

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (inList) {
      openList(event.currentTarget);
      return;
    }

    if (addProductToQuoteList(product) === "full") {
      toast.error(QUOTE_LIST_FULL_MESSAGE);
      return;
    }

    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), ADDED_MS);
  };

  const label = justAdded ? "Added" : inList ? "In your list" : "Add to List";

  return (
    <>
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={onClick}
        // The three labels are different lengths. A fixed floor stops the
        // buttons beside this one shifting each time it changes.
        className={cn(
          "h-12 min-w-[10.75rem] px-7 text-base font-semibold",
          "border-primary/55 text-primary-strong hover:bg-primary/10 hover:text-primary-strong",
          "dark:border-primary/55 dark:text-primary dark:hover:bg-primary/15 dark:hover:text-primary",
          inList && "bg-primary/[0.07] dark:bg-primary/10",
          className
        )}
      >
        {inList ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Plus aria-hidden className="size-4" />
        )}
        {label}
      </Button>

      {/* Announced once, when the product goes in. The button's own text
          changes too, but a screen reader does not re-read a button it is
          already on. */}
      <span role="status" className="sr-only">
        {justAdded ? `${product.name} added to your list.` : ""}
      </span>
    </>
  );
}
