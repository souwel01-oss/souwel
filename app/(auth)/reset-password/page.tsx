import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a New Password",
  robots: { index: false, follow: false },
};

/**
 * Better Auth sends the customer to /reset-password?token=… on success, and to
 * the same path with ?error=INVALID_TOKEN when the link has already been used
 * or has expired. Both are handled by the form, which shows the "request a new
 * one" screen rather than a dead password box.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return <ResetPasswordForm token={token ?? null} invalid={Boolean(error)} />;
}
