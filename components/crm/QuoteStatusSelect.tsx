"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateQuoteStatus } from "@/app/(crm)/actions";
import { QUOTE_STATUS_LABELS } from "@/components/crm/QuoteStatusBadge";
import { cn } from "@/lib/utils";

const ORDER = ["REQUESTED", "QUOTED", "ACCEPTED", "DECLINED", "FULFILLED"] as const;

/**
 * Inline status change on a lead.
 *
 * NO CONFIRMATION STEP HERE, unlike the role and account controls, and the
 * difference is deliberate: moving a quote from requested to quoted is routine,
 * reversible in one more click, and something sales does dozens of times a day.
 * A confirm dialog on a routine reversible action trains people to dismiss
 * confirm dialogs, which is what makes the irreversible one dangerous.
 *
 * Both Admin and Sales may do this — it is the one mutation Sales owns.
 *
 * `router.refresh()` rather than local state: the change also moves the quote
 * between filter buckets and alters the pipeline counters on the overview, and
 * optimistically patching one cell would leave the rest of the page lying.
 */
export function QuoteStatusSelect({
  quoteId,
  status,
  compact = false,
}: {
  quoteId: string;
  status: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    if (next === status) return;
    startTransition(async () => {
      const result = await updateQuoteStatus({ quoteId, status: next });
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <span className="relative inline-flex items-center">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label="Quote status"
        aria-busy={pending}
        className={cn(
          "border-input bg-card text-foreground focus-visible:border-primary focus-visible:ring-primary/25 rounded-lg border text-[12.5px] outline-none focus-visible:ring-4 disabled:opacity-60",
          compact ? "h-8 pr-7 pl-2.5" : "h-9 pr-8 pl-3",
          pending && "pr-8"
        )}
      >
        {ORDER.map((s) => (
          <option key={s} value={s}>
            {QUOTE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {pending ? (
        <Loader2
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute right-2 size-3.5 animate-spin"
        />
      ) : null}
    </span>
  );
}
