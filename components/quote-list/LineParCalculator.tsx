"use client";

import { useId, useState } from "react";
import { Calculator } from "lucide-react";
import { SHEET_PAR } from "@/lib/par-calculator";
import { cn } from "@/lib/utils";

/**
 * "Calculate PAR" for one row of the quote list.
 *
 * A buyer who has added a towel or a sheet usually knows their property, not
 * the quantity: 80 rooms, two bath towels each, PAR 3. This turns that into the
 * figure for the quantity box, which is the same sum the Par Calculator page
 * does (rooms × per room × PAR, see lib/par-calculator.ts).
 *
 * IT ONLY PROPOSES. The result is applied when the buyer presses the button, and
 * the list's own setter rounds it up to the line's step, so a case-packed line
 * still ends on a whole case. The sum is in whatever unit the quantity box
 * counts, so a dozen line is "dozens per room".
 */
const LIMIT = 9_999_999;

const whole = (text: string) => (/^\d{1,6}$/.test(text.trim()) ? Number(text) : 0);

export function LineParCalculator({
  step,
  max,
  onApply,
}: {
  step: number;
  max: number;
  onApply: (quantity: number) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState("");
  const [perRoom, setPerRoom] = useState("1");
  const [par, setPar] = useState<number>(SHEET_PAR.default);

  const needed = whole(rooms) * whole(perRoom) * par;
  // What the list will actually hold: up to a whole step, within the ceiling.
  const result = needed > 0 ? Math.min(Math.ceil(needed / step) * step, Math.min(max, LIMIT)) : 0;

  const field =
    "border-input bg-card text-foreground focus-visible:ring-ring h-9 w-full rounded-lg border px-2.5 text-[13.5px] tabular-nums outline-none focus-visible:ring-2";

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="text-primary-strong hover:underline focus-visible:ring-ring dark:text-primary inline-flex items-center gap-1.5 rounded-sm text-[12.5px] font-semibold focus-visible:ring-2 focus-visible:outline-none"
      >
        <Calculator aria-hidden className="size-3.5" />
        Calculate PAR
      </button>

      {open ? (
        <div
          id={`${id}-panel`}
          className="border-border bg-muted/40 mt-2 space-y-3 rounded-lg border p-3"
        >
          <div className="grid grid-cols-2 gap-2.5">
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
            <label className="text-muted-foreground block text-[12px]">
              Per room or bed
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={perRoom}
                onChange={(e) => setPerRoom(e.target.value)}
                className={cn(field, "mt-1")}
              />
            </label>
          </div>

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

          <p className="text-muted-foreground text-[12.5px] leading-relaxed" aria-live="polite">
            {result > 0 ? (
              <>
                {whole(rooms).toLocaleString("en-US")} × {whole(perRoom).toLocaleString("en-US")}{" "}
                × PAR {par} ={" "}
                <span className="text-foreground font-semibold">
                  {result.toLocaleString("en-US")}
                </span>
                {result !== needed ? " (rounded up to a whole pack)" : ""}
              </>
            ) : (
              "Enter how many rooms or beds you have."
            )}
          </p>

          <button
            type="button"
            disabled={result === 0}
            onClick={() => {
              onApply(result);
              setOpen(false);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring h-9 w-full rounded-lg text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use this quantity
          </button>
        </div>
      ) : null}
    </div>
  );
}
