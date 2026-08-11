"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { Field, FormAlert, PasswordField, SubmitButton } from "@/components/auth/fields";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { AuthHeading, OrDivider, useAuthEntrance } from "@/components/auth/shell";

const schema = z.object({
  email: z.string().min(1, "Enter your email address.").email("That does not look like an email address."),
  password: z.string().min(1, "Enter your password."),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

/**
 * Sign-in.
 *
 * VALIDATION RUNS TWICE, ON PURPOSE. The client checks shape only — is this an
 * email, is the password box empty — so an obvious typo costs no round trip.
 * Everything that decides whether the credentials are real happens on the
 * server, in Better Auth. Nothing here is a security control.
 *
 * Errors are shown where they belong: format problems on the field, the
 * "email or password is incorrect" answer above the form, because it is
 * deliberately not attributable to either field.
 */
export function LoginForm({
  providers,
  next,
  justVerified,
  justReset,
}: {
  providers: { google: boolean; apple: boolean };
  next: string;
  justVerified?: boolean;
  justReset?: boolean;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  useAuthEntrance(root);

  /**
   * Re-send the verification email.
   *
   * Reports success even if the call fails. The endpoint is unauthenticated and
   * takes an arbitrary address, so a truthful "no such account" here would let
   * anyone enumerate the customer list — the same reason the reset form gives
   * one answer to everything.
   */
  async function resend() {
    if (!needsVerification) return;
    setResendState("sending");
    try {
      await authClient.sendVerificationEmail({
        email: needsVerification,
        callbackURL: "/login?verified=1",
      });
    } catch (error) {
      console.error("[auth] resend verification failed:", error);
    }
    setResendState("sent");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setNeedsVerification(null);

    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        nextErrors[key] ??= issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    const { error } = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setPending(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(parsed.data.email);
        return;
      }
      setFormError(
        error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "Email or password is incorrect."
          : (error.message ?? "Could not sign you in. Please try again.")
      );
      return;
    }

    // router.refresh() matters: the header renders the signed-in state from a
    // server component, so without it the user lands on the dashboard with the
    // navbar still offering "Sign In".
    router.replace(next);
    router.refresh();
  }

  return (
    <div ref={root}>
      <AuthHeading
        eyebrow="Customer portal"
        title="Sign in"
        subtitle={
          <>
            No account yet?{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="auth-link">
              Create one
            </Link>
            .
          </>
        }
      />

      <div data-auth-item className="mt-7 grid gap-4">
        {justVerified ? (
          <FormAlert kind="success">
            Your email is verified. Sign in to reach your dashboard.
          </FormAlert>
        ) : null}

        {justReset ? (
          <FormAlert kind="success">
            Your password has been changed. Sign in with the new one.
          </FormAlert>
        ) : null}

        <SocialSignIn providers={providers} callbackURL={next} disabled={pending} />
      </div>

      {providers.google || providers.apple ? <OrDivider /> : null}

      <form onSubmit={onSubmit} noValidate className="grid gap-4" data-auth-item>
        {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

        {needsVerification ? (
          <FormAlert kind="error">
            This address has not been verified yet. Check your inbox for the link we sent to{" "}
            <strong>{needsVerification}</strong>
            {resendState === "sent" ? (
              <> — a fresh one is on its way.</>
            ) : (
              <>
                , or{" "}
                <button
                  type="button"
                  onClick={resend}
                  disabled={resendState === "sending"}
                  className="auth-link cursor-pointer bg-transparent p-0 disabled:cursor-wait disabled:opacity-70"
                >
                  {resendState === "sending" ? "sending…" : "send it again"}
                </button>
                .
              </>
            )}
          </FormAlert>
        ) : null}

        <Field
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={pending}
          error={fieldErrors.email}
          onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
        />

        <div className="grid gap-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={pending}
            error={fieldErrors.password}
            onChange={() => setFieldErrors((p) => ({ ...p, password: undefined }))}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="auth-link text-xs">
              Forgot your password?
            </Link>
          </div>
        </div>

        <SubmitButton pending={pending} pendingLabel="Signing in…" className="mt-1">
          Sign in
        </SubmitButton>
      </form>

      {/* No link on "request a quote" — /quote is not built yet, and pointing a
          reassurance at a 404 is worse than leaving it as plain text. */}
      <p data-auth-item className="text-muted-foreground mt-7 text-xs leading-relaxed">
        You can request a quote without an account — signing in is only needed to track it.
      </p>
    </div>
  );
}
