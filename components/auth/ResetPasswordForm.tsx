"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { FormAlert, PasswordField, SubmitButton } from "@/components/auth/fields";
import { AuthHeading, useAuthEntrance } from "@/components/auth/shell";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[a-zA-Z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirm: z.string().min(1, "Re-enter your new password."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The two passwords do not match.",
  });

type FieldErrors = Partial<Record<"password" | "confirm", string>>;

/**
 * Set a new password from an emailed link.
 *
 * The token arrives in the query string and is passed straight through — it is
 * never displayed, and never put anywhere it could end up in a screenshot or a
 * bug report.
 *
 * A missing token is handled as its own screen rather than as an error on the
 * form. Someone who lands here without one has usually clicked an expired
 * link, and what they need is the way to request another, not a disabled
 * password box.
 */
export function ResetPasswordForm({ token, invalid }: { token: string | null; invalid?: boolean }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useAuthEntrance(root);

  if (!token || invalid) {
    return (
      <div ref={root}>
        <AuthHeading eyebrow="Password reset" title="This link has expired" />
        <div data-auth-item className="mt-6 grid gap-5">
          <FormAlert kind="error">
            Reset links are valid for one hour and can only be used once.
          </FormAlert>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            <Link href="/forgot-password" className="auth-link">
              Request a new link
            </Link>{" "}
            and we will email you another one.
          </p>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    // Re-checked rather than relying on the guard above: this is a hoisted
    // function declaration, so TypeScript will not carry that narrowing in
    // here — and the assertion it would otherwise need is exactly the kind
    // that survives a later refactor after it has stopped being true.
    if (!token) return;

    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: String(form.get("password") ?? ""),
      confirm: String(form.get("confirm") ?? ""),
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    const { error } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token,
    });

    if (error) {
      setPending(false);
      setFormError(
        error.code === "INVALID_TOKEN"
          ? "This link is no longer valid. Request a new one."
          : (error.message ?? "Could not change your password. Please try again.")
      );
      return;
    }

    // Straight to sign-in rather than auto-signing in. Whoever set the password
    // should prove they can use it, and a reset is exactly the moment to
    // confirm the credential works before the session is handed over.
    router.replace("/login?reset=1");
  }

  return (
    <div ref={root}>
      <AuthHeading
        eyebrow="Password reset"
        title="Set a new password"
        subtitle="Choose something you have not used on this account before."
      />

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4" data-auth-item>
        {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="At least 8 characters, including a letter and a number."
          disabled={pending}
          error={fieldErrors.password}
          onChange={() => setFieldErrors((p) => ({ ...p, password: undefined }))}
        />

        <PasswordField
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={pending}
          error={fieldErrors.confirm}
          onChange={() => setFieldErrors((p) => ({ ...p, confirm: undefined }))}
        />

        <SubmitButton pending={pending} pendingLabel="Saving…" className="mt-1">
          Change password
        </SubmitButton>
      </form>
    </div>
  );
}
