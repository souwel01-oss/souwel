"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CRM_NAV } from "@/components/crm/nav";
import { roleLabel } from "@/lib/auth/roles";

/**
 * CRM top bar.
 *
 * The title is derived from CRM_NAV rather than passed in by each page: a
 * layout cannot read its child's props, and the alternative — every page
 * naming itself — is how a heading ends up disagreeing with the sidebar item
 * that led to it. Longest match wins so /admin does not shadow /admin/users.
 *
 * The role badge is not decoration. Admin and Sales see the same screens with
 * different controls available, and "why can I not change this role" is the
 * first question a Sales user asks. Showing which account they are on answers
 * it before they ask.
 */
export function CrmTopBar({
  user,
}: {
  user: { name: string; email: string; image?: string | null; role: string };
}) {
  const pathname = usePathname();

  const title =
    [...CRM_NAV]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ??
    "CRM";

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-7">
      {/* pl-14 on mobile clears the fixed hamburger, which sits at top-left. */}
      <div className="flex min-w-0 items-center gap-3 pl-14 lg:pl-0">
        <h1 className="font-heading text-foreground truncate text-[1.15rem]">{title}</h1>
        <span className="border-premium/40 bg-premium/10 text-premium hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-[0.1em] uppercase sm:inline">
          {roleLabel(user.role)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} tone="light" />
      </div>
    </header>
  );
}
