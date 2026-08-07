import Link from "next/link";
import type { Metadata } from "next";

/**
 * Sign-in scaffold. Implemented in Phase 4 (T051).
 *
 * The task ID stays HERE, in the comment, and out of the rendered copy. It was
 * previously printed on the page — and this route is linked from "SIGN IN" in
 * the site header, so a customer clicking it was shown an internal ticket
 * reference. Placeholder pages that are reachable from public navigation have
 * to read as unfinished product, not as a leaked backlog.
 */

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPlaceholderPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl">Sign In</h1>
      <p className="text-muted-foreground mt-3">
        Customer sign-in is not available yet. You can still request a quote without an account.
      </p>
      <Link
        href="/"
        className="text-primary focus-visible:ring-ring mt-6 inline-block rounded-sm text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
      >
        Back to homepage
      </Link>
    </main>
  );
}
