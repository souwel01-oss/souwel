"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { registerCustomer } from "@/app/(auth)/actions";
import { Field, FormAlert, PasswordField, SubmitButton } from "@/components/auth/fields";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { AuthHeading, OrDivider, useAuthEntrance } from "@/components/auth/shell";

/**
 * Password rules are stated on the field BEFORE submission, as a hint, and the
 * messages here repeat them one at a time. Rejecting a password against rules
 * that were never shown is the single most common way to make someone abandon
 * a sign-up.
 */
const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    company: z.string().trim().min(2, "Enter your company name."),
    email: z
      .string()
      .min(1, "Enter your work email address.")
      .email("That does not look like an email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[a-zA-Z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirm: z.string().min(1, "Re-enter your password."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The two passwords do not match.",
  });

type FieldKey = "name" | "company" | "email" | "password" | "confirm";
type FieldErrors = Partial<Record<FieldKey, string>>;

export function RegisterForm({
  providers,
  next,
}: {
  providers: { google: boolean; apple: boolean };
  next: string;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [verifySentTo, setVerifySentTo] = useState<string | null>(null);

  useAuthEntrance(root);

  function clear(key: FieldKey) {
    setFieldErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirm: String(form.get("confirm") ?? ""),
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);

    /**
     * Goes through our own server action rather than authClient.signUp, so the
     * company name is written to CustomerProfile in the same request — see the
     * note in app/(auth)/actions.ts.
     *
     * NOTE ON `role`: it is not sent, and could not be honoured if it were —
     * lib/auth marks the field `input: false`. Every account created here is a
     * CUSTOMER, and staff accounts are made by an administrator.
     */
    const result = await registerCustomer({
      name: parsed.data.name,
      company: parsed.data.company,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!result.ok) {
      setPending(false);
      if (result.field) {
        setFieldErrors({ [result.field]: result.message });
      } else {
        setFormError(result.message);
      }
      return;
    }

    // Two legitimate outcomes. With email verification required, sign-up does
    // NOT produce a session — telling the visitor they are in would be a lie,
    // and they would bounce off the login page seconds later.
    if (!result.signedIn) {
      setPending(false);
      setVerifySentTo(parsed.data.email);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  if (verifySentTo) {
    return (
      <div ref={root}>
        <AuthHeading eyebrow="Almost there" title="Check your email" />
        <div data-auth-item className="mt-6 grid gap-5">
          <FormAlert kind="success">
            We have sent a verification link to <strong>{verifySentTo}</strong>. Open it to finish
            setting up your account.
          </FormAlert>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            The link is valid for one hour. If it does not arrive, check your spam folder — or{" "}
            <Link href="/login" className="auth-link">
              try signing in
            </Link>{" "}
            to have another one sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={root}>
      <AuthHeading
        eyebrow="Customer portal"
        title="Create an account"
        subtitle={
          <>
            Already registered?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="auth-link">
              Sign in
            </Link>
            .
          </>
        }
      />

      <div data-auth-item className="mt-7">
        <SocialSignIn providers={providers} callbackURL={next} disabled={pending} />
      </div>

      {providers.google || providers.apple ? <OrDivider /> : null}

      <form onSubmit={onSubmit} noValidate className="grid gap-4" data-auth-item>
        {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Emmad Sadiq"
          disabled={pending}
          error={fieldErrors.name}
          onChange={() => clear("name")}
        />

        <Field
          label="Company"
          name="company"
          autoComplete="organization"
          placeholder="Company name"
          disabled={pending}
          error={fieldErrors.company}
          onChange={() => clear("company")}
        />

        <Field
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={pending}
          error={fieldErrors.email}
          onChange={() => clear("email")}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="At least 8 characters, including a letter and a number."
          disabled={pending}
          error={fieldErrors.password}
          onChange={() => clear("password")}
        />

        <PasswordField
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={pending}
          error={fieldErrors.confirm}
          onChange={() => clear("confirm")}
        />

        <SubmitButton pending={pending} pendingLabel="Creating account…" className="mt-1">
          Create account
        </SubmitButton>
      </form>

      <p data-auth-item className="text-muted-foreground mt-6 text-xs leading-relaxed">
        Accounts are for tracking quotations and orders. Souwel never shows pricing publicly and
        takes no payment through this site.
      </p>
    </div>
  );
}
