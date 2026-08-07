import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default function AdminPlaceholderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="font-heading text-3xl">Admin CRM</h1>
      <p className="text-muted-foreground mt-3">
        Placeholder — implemented in Phase 5 (T065–T088).
      </p>
    </main>
  );
}
