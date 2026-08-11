import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { enabledSocialProviders } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Sign In",
  // Sign-in pages carry no content worth ranking and attract credential-stuffing
  // traffic when indexed.
  robots: { index: false, follow: false },
};

/**
 * `next` is validated before it ever reaches a component — see
 * lib/auth/redirect.ts. It arrives from the query string and would otherwise
 * be a working open redirect on a page people are about to type a password
 * into.
 *
 * Which social buttons render is decided HERE rather than in the client
 * component, because only the server can see whether the credentials exist.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // Already signed in — a sign-in form is not what this person needs.
  if (await getSessionUser()) redirect(next);

  return (
    <LoginForm
      providers={enabledSocialProviders}
      next={next}
      justVerified={params.verified === "1"}
      justReset={params.reset === "1"}
    />
  );
}
