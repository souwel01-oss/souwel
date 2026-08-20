import { cn } from "@/lib/utils";

/**
 * Quote status, worded for the customer.
 *
 * THE LABELS ARE NOT THE ENUM. `REQUESTED` and `QUOTED` are how the database
 * and the sales team think about a quote; "Awaiting price" and "Price ready"
 * are what the person who asked for it actually wants to know. The CRM keeps
 * its own vocabulary — see FilterChips on /admin/leads — because staff sorting
 * a pipeline and a buyer checking on one request are not reading for the same
 * thing.
 *
 * COLOUR IS NEVER THE ONLY CARRIER, same rule as OrderStatusBadge: every state
 * has distinct words, and the dot is an addition to the label rather than a
 * substitute for it.
 */
const STYLES: Record<string, { label: string; className: string; dot: string }> = {
  REQUESTED: {
    label: "Awaiting price",
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  QUOTED: {
    label: "Price ready",
    className: "border-premium/40 bg-premium/10 text-premium",
    dot: "bg-premium",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "border-forest/40 bg-forest/10 text-forest dark:text-[#87b06e]",
    dot: "bg-forest dark:bg-[#87b06e]",
  },
  DECLINED: {
    label: "Declined",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? {
    // Shown as itself rather than swallowed, so a grown enum says so instead
    // of rendering an empty pill.
    label: status,
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap",
        style.className
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
