import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPlaceholderPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16">
      <h1 className="font-heading text-3xl">Customer Portal</h1>
      <p className="text-muted-foreground mt-3">
        Placeholder — implemented in Phase 4 (T054–T064).
      </p>
    </main>
  );
}
