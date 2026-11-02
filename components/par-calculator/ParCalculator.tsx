"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MailCheck } from "lucide-react";
import { submitParCalculation } from "@/app/(marketing)/par-calculator/actions";
import {
  AMENITIES,
  BED_SIZES,
  SHEETING,
  SHEET_PAR,
  TOWEL_PAR,
  TOWEL_TYPES,
  defaultSheetsInput,
  defaultTowelsInput,
  type ParReport,
  type SheetsInput,
  type TowelsInput,
} from "@/lib/par-calculator";
import { cn } from "@/lib/utils";

/**
 * The two PAR calculators, Sheets and Towels, each four steps and then an
 * email.
 *
 * Laid out after the reference the client chose (Thomaston Mills): a tab per
 * calculator, a numbered step bar, Back and Next. The difference is the end.
 * Instead of showing the results, the last step asks where to send them, at
 * the client's request; see app/(marketing)/par-calculator/actions.ts for
 * when the results are shown on screen instead.
 *
 * Each tab keeps its own answers, so switching tabs mid-way loses nothing.
 */

type Tab = "sheets" | "towels";

const SHEET_STEPS = ["Bed Types", "Sheet Types", "Pillows", "PAR Level"];
const TOWEL_STEPS = ["Rooms", "Towels", "Amenities", "PAR Level"];

export function ParCalculator() {
  const [tab, setTab] = useState<Tab>("sheets");
  const tabsId = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Calculator"
        className="border-border flex justify-center gap-2 border-b"
      >
        {(["sheets", "towels"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${tabsId}-${key}-tab`}
            aria-controls={`${tabsId}-${key}`}
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "focus-visible:ring-ring -mb-px border-b-2 px-6 py-3 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
              tab === key
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {key === "sheets" ? "Sheets" : "Towels"}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-sheets`}
        aria-labelledby={`${tabsId}-sheets-tab`}
        hidden={tab !== "sheets"}
      >
        <SheetsCalculator />
      </div>
      <div
        role="tabpanel"
        id={`${tabsId}-towels`}
        aria-labelledby={`${tabsId}-towels-tab`}
        hidden={tab !== "towels"}
      >
        <TowelsCalculator />
      </div>
    </div>
  );
}

/* ── Sheets ─────────────────────────────────────────────────────────────── */

function SheetsCalculator() {
  const [input, setInput] = useState<SheetsInput>(defaultSheetsInput);
  const [step, setStep] = useState(0);
  const sizes = BED_SIZES.filter((size) => input.beds[size.key] > 0);
  const anyBeds = sizes.length > 0;

  return (
    <CalculatorFrame
      title="Hotel Linen PAR Calculator"
      steps={SHEET_STEPS}
      step={step}
      setStep={setStep}
      canAdvance={step !== 0 || anyBeds}
      blockedHint="Enter at least one bed to continue."
      input={input}
      onReset={() => {
        setInput(defaultSheetsInput());
        setStep(0);
      }}
    >
      {step === 0 ? (
        <StepBody heading="Enter the number of each bed size">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {BED_SIZES.map((size) => (
              <NumberBox
                key={size.key}
                label={`${size.label} Beds`}
                value={input.beds[size.key]}
                max={100_000}
                onChange={(n) => setInput((s) => ({ ...s, beds: { ...s.beds, [size.key]: n } }))}
              />
            ))}
          </div>
        </StepBody>
      ) : step === 1 ? (
        <StepBody heading="How do you make your beds?">
          <fieldset className="grid gap-3">
            <legend className="sr-only">Sheet type</legend>
            {SHEETING.map((option) => (
              <ChoiceRow
                key={option.key}
                type="radio"
                name="sheeting"
                label={option.label}
                checked={input.sheeting === option.key}
                onChange={() => setInput((s) => ({ ...s, sheeting: option.key }))}
              />
            ))}
          </fieldset>
        </StepBody>
      ) : step === 2 ? (
        <StepBody heading="How many pillowcases per bed?">
          <div className="grid gap-3">
            {sizes.map((size) => (
              <fieldset key={size.key} className="border-premium/30 rounded-xl border p-4 sm:p-5">
                <legend className="text-primary px-1 text-sm font-semibold">
                  {size.label} Beds
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  {(["standard", "king"] as const).map((kind) => (
                    <NumberBox
                      key={kind}
                      label={kind === "standard" ? "Standard Pillowcases" : "King Pillowcases"}
                      value={input.pillowcases[size.key][kind]}
                      max={100}
                      onChange={(n) =>
                        setInput((s) => ({
                          ...s,
                          pillowcases: {
                            ...s.pillowcases,
                            [size.key]: { ...s.pillowcases[size.key], [kind]: n },
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </StepBody>
      ) : (
        <StepBody heading="Set your desired PAR level">
          <div className="grid gap-3">
            {sizes.map((size) => (
              <ParSlider
                key={size.key}
                label={`${size.label} PAR Level`}
                value={input.par[size.key]}
                range={SHEET_PAR}
                onChange={(n) => setInput((s) => ({ ...s, par: { ...s.par, [size.key]: n } }))}
              />
            ))}
          </div>
        </StepBody>
      )}
    </CalculatorFrame>
  );
}

/* ── Towels ─────────────────────────────────────────────────────────────── */

function TowelsCalculator() {
  const [input, setInput] = useState<TowelsInput>(defaultTowelsInput);
  const [step, setStep] = useState(0);

  return (
    <CalculatorFrame
      title="Towel PAR Calculator"
      steps={TOWEL_STEPS}
      step={step}
      setStep={setStep}
      canAdvance={step !== 0 || input.rooms > 0}
      blockedHint="Enter how many rooms you have to continue."
      input={input}
      onReset={() => {
        setInput(defaultTowelsInput());
        setStep(0);
      }}
    >
      {step === 0 ? (
        <StepBody heading="How many rooms do you have?">
          <div className="mx-auto w-full max-w-[12rem]">
            <NumberBox
              label="Number of Rooms"
              value={input.rooms}
              max={100_000}
              onChange={(n) => setInput((s) => ({ ...s, rooms: n }))}
            />
          </div>
        </StepBody>
      ) : step === 1 ? (
        <StepBody heading="How many of each towel type per room?">
          <div className="grid gap-3">
            {TOWEL_TYPES.map((type) => (
              <NumberBox
                key={type.key}
                inline
                label={type.label}
                value={input.perRoom[type.key]}
                max={100}
                onChange={(n) =>
                  setInput((s) => ({ ...s, perRoom: { ...s.perRoom, [type.key]: n } }))
                }
              />
            ))}
          </div>
        </StepBody>
      ) : step === 2 ? (
        <StepBody heading="Do you have any of these amenities?">
          <fieldset className="grid gap-3">
            <legend className="sr-only">Amenities</legend>
            {AMENITIES.map((amenity) => (
              <ChoiceRow
                key={amenity.key}
                type="checkbox"
                name="amenities"
                label={amenity.label}
                checked={input.amenities[amenity.key]}
                onChange={(checked) =>
                  setInput((s) => ({
                    ...s,
                    amenities: { ...s.amenities, [amenity.key]: checked },
                  }))
                }
              />
            ))}
          </fieldset>
        </StepBody>
      ) : (
        <StepBody heading="Set your desired PAR level">
          <ParSlider
            label="Overall Towel PAR Level"
            value={input.par}
            range={TOWEL_PAR}
            onChange={(n) => setInput((s) => ({ ...s, par: n }))}
          />
        </StepBody>
      )}
    </CalculatorFrame>
  );
}

/* ── Shared frame: step bar, buttons, and the email step ─────────────────── */

type Outcome = { emailed: boolean; email: string; report: ParReport };

function CalculatorFrame({
  title,
  steps,
  step,
  setStep,
  canAdvance,
  blockedHint,
  input,
  onReset,
  children,
}: {
  title: string;
  steps: string[];
  step: number;
  setStep: (step: number) => void;
  canAdvance: boolean;
  blockedHint: string;
  input: SheetsInput | TowelsInput;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState<"steps" | "email">("steps");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const last = step === steps.length - 1;
  const bodyRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // After Next or Back, move focus to the new step's heading so a keyboard
  // or screen-reader user lands on the question, not at the top of the page.
  useEffect(() => {
    if (!moved.current) return;
    bodyRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus();
  }, [step, stage, outcome]);

  const go = (next: () => void) => {
    moved.current = true;
    next();
  };

  const restart = () =>
    go(() => {
      setOutcome(null);
      setStage("steps");
      onReset();
    });

  return (
    <div className="border-border bg-card mx-auto mt-10 max-w-3xl rounded-2xl border p-5 shadow-[0_18px_40px_-28px_rgb(10_37_64/0.35)] sm:p-8">
      <h2 className="font-heading text-primary text-center text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>

      <StepBar steps={steps} reached={stage === "email" ? steps.length : step + 1} />

      <div ref={bodyRef} className="mt-8">
        {outcome ? (
          <OutcomeView outcome={outcome} onRestart={restart} />
        ) : stage === "email" ? (
          <EmailStep
            input={input}
            onBack={() => go(() => setStage("steps"))}
            onDone={(o) => go(() => setOutcome(o))}
          />
        ) : (
          <>
            {children}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => go(() => setStep(step - 1))}
                  className={secondaryButton}
                >
                  <ArrowLeft aria-hidden className="size-4" />
                  Back
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => go(() => (last ? setStage("email") : setStep(step + 1)))}
                className={primaryButton}
              >
                {last ? "Calculate Results" : "Next"}
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
            {!canAdvance ? (
              <p className="text-muted-foreground mt-3 text-center text-[13px]">{blockedHint}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function StepBar({ steps, reached }: { steps: string[]; reached: number }) {
  return (
    <ol className="relative mt-8 grid grid-cols-4">
      {/* The rail behind the circles. */}
      <span
        aria-hidden
        className="bg-border absolute top-[18px] right-[12.5%] left-[12.5%] h-0.5 rounded-full"
      />
      {steps.map((label, i) => {
        const done = i < reached;
        return (
          <li
            key={label}
            aria-current={i === reached - 1 ? "step" : undefined}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold tracking-wide sm:text-xs",
                done ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepBody({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        data-step-heading
        tabIndex={-1}
        className="text-foreground mb-6 text-center text-lg font-semibold outline-none"
      >
        {heading}
      </h3>
      {children}
    </div>
  );
}

function EmailStep({
  input,
  onBack,
  onDone,
}: {
  input: SheetsInput | TowelsInput;
  onBack: () => void;
  onDone: (outcome: Outcome) => void;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const hintId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await submitParCalculation({
        email,
        calculation: input,
        website: String(form.get("website") ?? ""),
      });
      if (result.ok) onDone({ emailed: result.emailed, email, report: result.report });
      else setError(result.message);
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md">
      <h3
        data-step-heading
        tabIndex={-1}
        className="text-foreground text-center text-lg font-semibold outline-none"
      >
        Where should we send your results?
      </h3>
      <p className="text-muted-foreground mt-2 text-center text-[14px] leading-relaxed">
        Your full linen breakdown will be emailed to you.
      </p>

      <div className="mt-6 grid gap-2">
        <label htmlFor={emailId} className="text-foreground/80 text-[13px] font-semibold">
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          required
          autoComplete="email"
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@property.com"
          className={inputClass}
        />
        <p id={hintId} className="text-muted-foreground text-[12.5px]">
          We use it to send your results and to follow up if you ask for a quotation.
        </p>
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-destructive mt-4 text-center text-[13px] font-medium">
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onBack} className={secondaryButton}>
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </button>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Sending…" : "Email My Results"}
          {pending ? null : <ArrowRight aria-hidden className="size-4" />}
        </button>
      </div>
    </form>
  );
}

function OutcomeView({ outcome, onRestart }: { outcome: Outcome; onRestart: () => void }) {
  const { emailed, email, report } = outcome;

  if (emailed) {
    return (
      <div className="text-center">
        <MailCheck aria-hidden className="text-primary mx-auto size-10" />
        <h3
          data-step-heading
          tabIndex={-1}
          className="text-foreground mt-4 text-xl font-semibold outline-none"
        >
          Your results are on their way
        </h3>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
          We have sent your {report.title} results to{" "}
          <span className="text-foreground font-semibold break-all">{email}</span>. If they are not
          in your inbox in a few minutes, check your spam folder.
        </p>
        <button type="button" onClick={onRestart} className={cn(secondaryButton, "mt-7")}>
          Start Over
        </button>
      </div>
    );
  }

  // No email went, so the results are shown here rather than promised.
  return (
    <div>
      <h3
        data-step-heading
        tabIndex={-1}
        className="text-foreground text-center text-lg font-semibold outline-none"
      >
        Your linen inventory needs
      </h3>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-center text-[14px] leading-relaxed">
        We could not email your results just now, so here they are. Our team has your details and
        can send them again.
      </p>

      <div className={cn("mt-6 grid gap-3", report.totals.length > 1 && "sm:grid-cols-2")}>
        {report.totals.map((total) => (
          <div key={total.label} className="border-border rounded-xl border p-5 text-center">
            <p className="text-foreground/80 text-[15px] font-semibold">{total.label}</p>
            <p className="text-primary mt-2 text-4xl font-bold">
              {total.value.toLocaleString("en-US")}
            </p>
          </div>
        ))}
      </div>

      <div className="border-primary bg-primary/5 mt-4 rounded-xl border-l-4 p-5 sm:p-6">
        <ReportList heading="Your Linen Needs" rows={report.needs} />
        <hr className="border-primary/30 my-5" />
        <ReportList heading="Your Selections" rows={report.selections} />
      </div>

      <div className="mt-7 text-center">
        <button type="button" onClick={onRestart} className={secondaryButton}>
          Start Over
        </button>
      </div>
    </div>
  );
}

function ReportList({ heading, rows }: { heading: string; rows: ParReport["needs"] }) {
  return (
    <div>
      <h4 className="font-heading text-primary text-xl font-semibold">{heading}</h4>
      <dl className="mt-3 grid gap-1.5 text-[14px]">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-foreground text-right font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Inputs ─────────────────────────────────────────────────────────────── */

function NumberBox({
  label,
  value,
  max,
  onChange,
  inline = false,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (n: number) => void;
  /** Label and box on one row, as in the towels list. */
  inline?: boolean;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        inline
          ? "border-premium/30 bg-muted/30 flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
          : "grid gap-2 text-center"
      )}
    >
      <label htmlFor={id} className="text-foreground/80 text-[13px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        // Selecting on focus lets a buyer type over the 0 instead of after it.
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? 0 : Math.min(Math.max(n, 0), max));
        }}
        className={cn(inputClass, "text-center", inline && "w-24 shrink-0")}
      />
    </div>
  );
}

function ChoiceRow({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-[15px] transition-colors",
        "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2",
        checked
          ? "border-primary bg-primary/5 text-foreground"
          : "border-premium/30 bg-muted/30 text-foreground/80 hover:border-primary/60"
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary size-[18px] shrink-0"
      />
      <span className="font-medium">{label}</span>
      {checked && type === "checkbox" ? (
        <Check aria-hidden className="text-primary ml-auto size-4" />
      ) : null}
    </label>
  );
}

function ParSlider({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: { min: number; max: number };
  onChange: (n: number) => void;
}) {
  const id = useId();
  const marks = Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);
  return (
    <div className="border-premium/30 rounded-xl border px-4 py-4 sm:px-5">
      <label htmlFor={id} className="text-foreground/80 text-[13px] font-semibold">
        {label}: <span className="text-foreground font-bold">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-primary mt-4 block w-full cursor-pointer"
      />
      <div aria-hidden className="text-muted-foreground mt-1 flex justify-between text-[11px]">
        {marks.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

const inputClass =
  "border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/25 h-11 w-full rounded-lg border px-3.5 text-[15px] outline-none focus-visible:ring-4";

const primaryButton =
  "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-lg px-6 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-lg border px-6 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";
