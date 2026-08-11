"use client";

import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Form primitives shared by every auth screen.
 *
 * Three rules are baked in here rather than left to each form to remember:
 *
 *   1. LABELS ARE ALWAYS VISIBLE. Placeholder-as-label disappears the moment
 *      typing starts, which is precisely when a person checks whether they are
 *      in the right box.
 *   2. THE ERROR SITS ON THE FIELD. A summary at the top of the form makes the
 *      reader map a message back to a control themselves, and on a phone the
 *      offending field is usually off-screen by then.
 *   3. THE ERROR IS WIRED, NOT JUST DRAWN. `aria-invalid` plus
 *      `aria-describedby` is what makes a screen reader read the message when
 *      focus lands on the field; colour and an icon alone reach neither a
 *      screen-reader user nor a colour-blind one.
 */

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, className, id, ...props }: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId} className="text-foreground/80 text-[13px] font-semibold">
        {label}
      </Label>

      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(
          "border-input bg-card text-foreground placeholder:text-muted-foreground/60 h-11 w-full rounded-lg border px-3.5 text-[15px]",
          "transition-[border-color,box-shadow,background-color] outline-none",
          "focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-4",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
          className
        )}
        {...props}
      />

      {hint && !error ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="text-destructive flex items-start gap-1.5 text-xs font-medium"
        >
          <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Password input with a reveal control.
 *
 * The toggle is a real button inside the field, not an overlaid icon: it needs
 * to be reachable by keyboard and to announce its state, and `aria-pressed` is
 * what carries "the password is currently visible" to a screen reader. It is
 * also `tabIndex={-1}` — sighted keyboard users tab from password straight to
 * submit, and a stop on a visibility toggle between the two is friction on the
 * hot path.
 */
export function PasswordField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId} className="text-foreground/80 text-[13px] font-semibold">
        {label}
      </Label>

      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            "border-input bg-card text-foreground placeholder:text-muted-foreground/60 h-11 w-full rounded-lg border pr-12 pl-3.5 text-[15px]",
            "transition-[border-color,box-shadow,background-color] outline-none",
            "focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-4",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
            className
          )}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        </button>
      </div>

      {hint && !error ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-destructive flex items-start gap-1.5 text-xs font-medium">
          <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Form-level message — the errors that belong to the request rather than to a
 * field ("email or password is incorrect", "that address is already
 * registered").
 *
 * `role="alert"` so it is announced when it appears. Without it a keyboard or
 * screen-reader user presses Sign in, nothing is spoken, and the only feedback
 * is a colour they may not be looking at.
 */
export function FormAlert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const isError = kind === "error";
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed",
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground"
      )}
    >
      {isError ? (
        <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 aria-hidden className="text-primary mt-0.5 size-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

/**
 * Primary submit.
 *
 * Uses --primary-strong rather than --primary: white on raw brand blue is
 * 3.05:1, which fails AA for button text. See the token comment in globals.css.
 *
 * The label is REPLACED while pending, not merely dimmed, and `aria-busy` says
 * so out loud. A spinner beside an unchanged "Sign in" reads as "press it
 * again" to anyone who cannot see the spin.
 */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
  className,
  ...props
}: React.ComponentProps<"button"> & { pending: boolean; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending}
      className={cn(
        "bg-primary-strong text-primary-strong-foreground relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold tracking-[0.01em]",
        "transition-[transform,box-shadow,filter] duration-200 ease-[var(--ease-out)]",
        "hover:brightness-110 hover:shadow-[0_8px_24px_-10px_var(--primary)] active:translate-y-px",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100",
        className
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 aria-hidden className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
