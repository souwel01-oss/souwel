import { requireRole } from "@/lib/auth/session";

/**
 * Staff-only shell.
 *
 * The CRM is still a placeholder page, but the guard goes on NOW rather than
 * when the screens are built. Until this existed, /admin returned 200 to
 * anyone — and an unguarded route is exactly the kind of thing that stops
 * being noticed once the placeholder stops looking like one.
 *
 * A customer who reaches here is sent to their own dashboard rather than shown
 * a 403: telling them the route exists and is merely forbidden is more than
 * they need to know.
 */
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  await requireRole("/admin", ["ADMIN", "SALES"]);

  return <>{children}</>;
}
