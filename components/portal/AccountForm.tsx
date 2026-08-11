"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { updateProfile } from "@/app/(portal)/actions";
import { Field, FormAlert } from "@/components/auth/fields";
import { cn } from "@/lib/utils";

type Values = {
  name: string;
  companyName: string;
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
};

/**
 * Editable profile.
 *
 * SAVE IS DISABLED UNTIL SOMETHING CHANGES, and the button says what it did
 * afterwards. A form whose only feedback is a toast that has already faded
 * leaves people pressing Save twice to check it worked.
 *
 * Validation mirrors the server action's Zod schema. The server's copy is the
 * one that counts — this one exists so a 40-character phone number is caught
 * without a round trip.
 */
export function AccountForm({ initial, email }: { initial: Values; email: string }) {
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<Values>(initial);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const dirty = (Object.keys(values) as (keyof Values)[]).some((k) => values[k] !== saved[k]);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
    setJustSaved(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setPending(true);

    const result = await updateProfile(values);
    setPending(false);

    if (!result.ok) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.message) setFormError(result.message);
      return;
    }

    setFieldErrors({});
    setSaved(values);
    setJustSaved(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 px-5 py-5 sm:px-6">
      {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          disabled={pending}
          error={fieldErrors.name || undefined}
        />

        <Field
          label="Company"
          value={values.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          autoComplete="organization"
          disabled={pending}
          error={fieldErrors.companyName || undefined}
        />
      </div>

      {/*
        Email is shown but not editable, and the reason is stated rather than
        left as a mystery disabled box. Changing a sign-in address has to be
        confirmed at the NEW address or it is an account-takeover route — and
        that confirmation needs an email transport, which is not configured yet
        (see lib/auth/email.ts). A field that accepted the change and silently
        did nothing would be worse than one that explains itself.
      */}
      <div className="grid gap-2">
        <span className="text-foreground/80 text-[13px] font-semibold">Sign-in email</span>
        <div className="border-input bg-muted/40 text-muted-foreground flex h-11 items-center rounded-lg border px-3.5 text-[15px]">
          {email}
        </div>
        <p className="text-muted-foreground text-xs">
          Changing this needs confirmation at the new address. Contact your Souwel representative
          in the meantime.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Phone"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="Optional"
          disabled={pending}
          error={fieldErrors.phone || undefined}
        />

        <Field
          label="Country"
          value={values.country}
          onChange={(e) => set("country", e.target.value)}
          autoComplete="country-name"
          placeholder="Optional"
          disabled={pending}
          error={fieldErrors.country || undefined}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Address"
          value={values.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
          autoComplete="address-line1"
          placeholder="Optional"
          disabled={pending}
          error={fieldErrors.addressLine1 || undefined}
        />

        <Field
          label="City"
          value={values.city}
          onChange={(e) => set("city", e.target.value)}
          autoComplete="address-level2"
          placeholder="Optional"
          disabled={pending}
          error={fieldErrors.city || undefined}
        />
      </div>

      <div className="border-border/50 mt-1 flex items-center justify-end gap-4 border-t pt-5">
        {justSaved && !dirty ? (
          <p className="text-muted-foreground flex items-center gap-1.5 text-[13px]" role="status">
            <Check aria-hidden className="text-primary size-4" />
            Saved
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !dirty}
          aria-busy={pending}
          className={cn(
            "bg-primary-strong text-primary-strong-foreground inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-[13.5px] font-semibold",
            "transition-[transform,box-shadow,filter] duration-200 ease-[var(--ease-out)]",
            "hover:brightness-110 hover:shadow-[0_8px_24px_-10px_var(--primary)] active:translate-y-px",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none",
            // Disabled is a DIFFERENT COLOUR, not a faded one. `opacity-50` on
            // the light-blue dark-mode fill still reads as a live button
            // against a near-black card — checked it on screen and it was
            // indistinguishable from enabled. Dropping to the muted surface
            // makes "nothing to save" unambiguous in both themes.
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:brightness-100 disabled:hover:shadow-none"
          )}
        >
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}
