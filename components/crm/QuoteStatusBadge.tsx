import { cn } from "@/lib/utils";

/**
 * Quote status.
 *
 * Same rule as the order badge: colour is never the only carrier. Every state
 * has its own word and the dot is an addition, not a substitute.
 *
 * These are STATUS colours, drawn from the reserved status roles rather than
 * from the chart series palette. Reusing --chart-1 here would mean "quoted"
 * and "leads" were the same blue for two unrelated reasons, and a reader who
 * learned one would misread the other.
 */
export const QUOTE_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Awaiting price",
  QUOTED: "Quoted",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  FULFILLED: "Fulfilled",
};

const STYLES: Record<string, { className: string; dot: string }> = {
  REQUESTED: { className: "border-premium/40 bg-premium/10 text-premium", dot: "bg-premium" },
  QUOTED: {
    className: "border-primary/40 bg-primary/10 text-primary-strong dark:text-primary",
    dot: "bg-primary",
  },
  ACCEPTED: {
    className: "border-forest/40 bg-forest/10 text-forest dark:text-[#87b06e]",
    dot: "bg-forest dark:bg-[#87b06e]",
  },
  DECLINED: {
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  FULFILLED: {
    className: "border-olive/40 bg-olive/10 text-olive dark:text-[#9dbb72]",
    dot: "bg-olive dark:bg-[#9dbb72]",
  },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? {
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
      {/* An unrecognised status shows itself rather than a blank cell — if the
          enum grows and this map does not, the table says so. */}
      {QUOTE_STATUS_LABELS[status] ?? status}
    </span>
  );
}
