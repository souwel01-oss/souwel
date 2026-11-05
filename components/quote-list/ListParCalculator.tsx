"use client";

import { useId, useState } from "react";
import { Calculator } from "lucide-react";
import { SHEET_PAR } from "@/lib/par-calculator";
import { cn } from "@/lib/utils";

/**
 * "Calculate PAR" for the whole list, once, above the Request a Quote button.
 *
 * One property, so the rooms and the PAR level are asked once. What differs
 * per product is how many each room or bed needs (one wash cloth, two hand
 * towels), so each row of the list gets its own small "per room" box. The
 * result for a row is rooms x per room x PAR, rounded up to the row's pack,
 * and it is only written to the list when the buyer presses the button.
 */
const LIMIT = 9_999_999;

const whole = (text: string) => (/^\d{1,6}$/.test(text.trim()) ? Number(text) : 0);

export type ParRow = {
  key: string;
  name: string;
  /** The row's pack: a quantity goes up in whole steps of this. */
  step: number;
  max: number;
  apply: (quantity: number) => void;
};

export function ListParCalculator({ rows }: { rows: ParRow[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState("");
  const [par, setPar] = useState<number>(SHEET_PAR.default);
  const [perRoom, setPerRoom] = useState<Record<string, string>>({});

  const perFor = (key: string) => whole(perRoom[key] ?? "1");
  const resultFor = (row: ParRow) => {
    const needed = whole(rooms) * perFor(row.key) * par;
    return needed > 0
      ? Math.min(Math.ceil(needed / row.step) * row.step, Math.min(row.max, LIMIT))
      : 0;
  };
  const anything = rows.some((r) => resultFor(r) > 0);

  const field =
    "border-input bg-card text-foreground focus-visible:ring-ring h-9 w-full rounded-lg border px-2.5 text-[13.5px] tabular-nums outline-none focus-visible:ring-2";

  const applyAll = () => {
    for (const row of rows) {
      const result = resultFor(row);
      if (result > 0) row.apply(result);
    }
    setOpen(false);
  };

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="text-primary-strong hover:underline focus-visible:ring-ring dark:text-primary inline-flex items-center gap-1.5 rounded-sm text-[13px] font-semibold focus-visible:ring-2 focus-visible:outline-none"
      >
        <Calculator aria-hidden className="size-4" />
        Calculate PAR
      </button>

      {open ? (
        <div
          id={`${id}-panel`}
          className="border-border bg-muted/40 mt-2 max-h-[40dvh] space-y-3 overflow-y-auto overscroll-contain rounded-lg border p-3"
        >
          <label className="text-muted-foreground block text-[12px]">
            Rooms or beds
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              placeholder="e.g. 80"
              className={cn(field, "mt-1")}
            />
          </label>

          <fieldset>
            <legend className="text-muted-foreground text-[12px]">PAR level</legend>
            <div className="mt-1 flex gap-1.5">
              {Array.from({ length: SHEET_PAR.max }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPar(level)}
                  aria-pressed={par === level}
                  className={cn(
                    "focus-visible:ring-ring h-9 flex-1 rounded-lg border text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    par === level
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <ul className="divide-border divide-y">
            {rows.map((row) => {
              const result = resultFor(row);
              return (
                <li key={row.key} className="py-2.5">
                  <p className="text-foreground text-[12.5px] leading-snug font-medium">
                    {row.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <label className="text-muted-foreground flex items-center gap-2 text-[12px]">
                      Per room or bed
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={perRoom[row.key] ?? "1"}
                        onChange={(e) => setPerRoom((p) => ({ ...p, [row.key]: e.target.value }))}
                        className={cn(field, "w-16")}
                      />
                    </label>
                    <p className="text-muted-foreground text-[12.5px]" aria-live="polite">
                      {result > 0 ? (
                        <>
                          ={" "}
                          <span className="text-foreground font-semibold">
                            {result.toLocaleString("en-US")}
                          </span>
                          {row.step > 1
                            ? ` (${(result / row.step).toLocaleString("en-US")} packs of ${row.step.toLocaleString("en-US")})`
                            : ""}
                        </>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="text-muted-foreground text-[12px] leading-relaxed">
            Rooms × per room × PAR, rounded up to whole packs.
          </p>

          <button
            type="button"
            disabled={!anything}
            onClick={applyAll}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring h-10 w-full rounded-lg text-[13.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use these quantities
          </button>
        </div>
      ) : null}
    </div>
  );
}
