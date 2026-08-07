import Link from "next/link";
import type { Metadata } from "next";

/**
 * Registration scaffold. Implemented in Phase 4 (T050).
 *
 * See the note in ../login/page.tsx: the task ID belongs in this comment, not
 * in the rendered copy. "REGISTER" is a button in the site header, so this page
 * is one click from every marketing page.
 */

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function RegisterPlaceholderPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl">Create an Account</h1>
      <p className="text-muted-foreground mt-3">
        Account registration is not open yet. In the meantime you can request a quote without an
        account — no sign-up required.
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
