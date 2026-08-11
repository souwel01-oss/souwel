"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";
import { AuthHeading, useAuthEntrance } from "@/components/auth/shell";

const schema = z.string().min(1, "Enter your email address.").email("That does not look like an email address.");

export function ForgotPasswordForm() {
  const root = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  /** Shape problem with what was typed — belongs on the field. */
  const [fieldError, setFieldError] = useState<string | null>(null);
  /** The request failed — belongs above the form, not attached to the input. */
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useAuthEntrance(root);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setFieldError(null);
    setPending(true);
    const { error: apiError } = await authClient.requestPasswordReset({
      email: parsed.data,
      redirectTo: "/reset-password",
    });
    setPending(false);

    if (apiError) {
      setFormError(apiError.message ?? "Could not send the link. Please try again.");
      return;
    }

    /**
     * DELIBERATELY THE SAME ANSWER WHETHER OR NOT THE ADDRESS EXISTS.
     *
     * "No account found for that email" turns this form into a free
     * membership oracle: anyone can test a list of addresses against the
     * customer base and learn who buys from Souwel. Better Auth's endpoint
     * already declines to distinguish the two; this copy has to match, or the
     * UI leaks what the API was careful not to.
     */
    setSentTo(parsed.data);
  }

  if (sentTo) {
    return (
      <div ref={root}>
        <AuthHeading eyebrow="Password reset" title="Check your email" />
        <div data-auth-item className="mt-6 grid gap-5">
          <FormAlert kind="success">
            If <strong>{sentTo}</strong> has an account with us, a reset link is on its way. It
            expires in one hour.
          </FormAlert>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Nothing arrived? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="auth-link cursor-pointer bg-transparent p-0"
            >
              try a different address
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={root}>
      <AuthHeading
        eyebrow="Password reset"
        title="Forgot your password?"
        subtitle="Give us the email on your account and we will send a link to set a new password."
      />

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4" data-auth-item>
        {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

        <Field
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={pending}
          error={fieldError ?? undefined}
          onChange={() => setFieldError(null)}
        />

        <SubmitButton pending={pending} pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </form>

      <p data-auth-item className="text-muted-foreground mt-7 text-[13px]">
        Remembered it?{" "}
        <Link href="/login" className="auth-link">
          Back to sign in
        </Link>
        .
      </p>
    </div>
  );
}
