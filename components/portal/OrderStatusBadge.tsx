import { cn } from "@/lib/utils";

/**
 * Order status.
 *
 * COLOUR IS NEVER THE ONLY CARRIER. Each state has its own words, and the dot
 * is an addition to the label rather than a replacement for it — a status
 * column that distinguishes "shipped" from "cancelled" by hue alone is
 * unreadable to roughly one man in twelve.
 *
 * The palette is drawn from the brand's supporting jewel tones rather than the
 * usual green/amber/red traffic light, which would drop three colours into the
 * scheme that appear nowhere else on the site.
 */
const STYLES: Record<string, { label: string; className: string; dot: string }> = {
  PENDING: {
    label: "Pending",
    className: "border-premium/40 bg-premium/10 text-premium",
    dot: "bg-premium",
  },
  IN_PRODUCTION: {
    label: "In production",
    className: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  SHIPPED: {
    label: "Shipped",
    className: "border-olive/40 bg-olive/10 text-olive dark:text-[#9dbb72]",
    dot: "bg-olive dark:bg-[#9dbb72]",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-forest/40 bg-forest/10 text-forest dark:text-[#87b06e]",
    dot: "bg-forest dark:bg-[#87b06e]",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? {
    // An unknown status is shown as itself rather than swallowed. If the enum
    // grows and this map does not, the column says so instead of rendering a
    // blank cell.
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
