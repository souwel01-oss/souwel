import { requireRole } from "@/lib/auth/session";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { CrmTopBar } from "@/components/crm/CrmTopBar";

/**
 * CRM shell.
 *
 * The role check is repeated here even though app/(crm)/layout.tsx already
 * runs it. That is not redundancy for its own sake — this layout renders the
 * navigation and passes `user.role` down to decide which controls exist, so it
 * needs the user anyway, and `getSessionUser` is request-cached so the second
 * call costs nothing. Having the guard adjacent to the thing it protects also
 * means moving this file cannot silently unprotect it.
 *
 * Neither guard is the last line: every Server Action in app/(crm)/actions.ts
 * re-checks independently, because an action is its own endpoint.
 */
export default async function CrmShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("/admin", ["ADMIN", "SALES"]);

  return (
    <div className="bg-background flex min-h-dvh flex-1">
      {/* Ambient field, cooler and flatter than the customer portal's. The glass
          is reserved for stat cards and headers here — a data-dense table wants
          a plain, opaque ground behind it, not a tint that fights the text. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(56rem 36rem at 8% -6%, rgb(11 151 255 / 0.16), transparent 62%)," +
            "radial-gradient(42rem 30rem at 100% 0%, rgb(201 168 76 / 0.16), transparent 64%)",
        }}
      />

      <CrmSidebar role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <CrmTopBar
          user={{ name: user.name, email: user.email, image: user.image, role: user.role }}
        />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-12 sm:px-7">{children}</main>
      </div>
    </div>
  );
}
