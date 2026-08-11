"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PORTAL_NAV } from "@/components/portal/nav";

/**
 * Portal top bar.
 *
 * The user is passed down from the server layout rather than read with
 * useSession here — inside the portal the session has already been verified on
 * the server, so re-fetching it in the browser would add a request to show
 * something the page could not have rendered without.
 *
 * That is the opposite of the marketing header's choice, and deliberately so:
 * see the note in components/auth/HeaderAuth.tsx.
 */
export function PortalTopBar({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const pathname = usePathname();

  /**
   * Title comes from PORTAL_NAV rather than being passed in by each page.
   * A layout cannot see its child's props, so the alternative is every page
   * repeating its own name — which is exactly how a heading ends up disagreeing
   * with the sidebar item that led to it. Longest match wins so /dashboard does
   * not shadow /dashboard/orders.
   */
  const title =
    [...PORTAL_NAV]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ??
    "Customer Portal";

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-7">
      <h1 className="font-heading text-foreground truncate text-[1.15rem]">{title}</h1>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} tone="light" />
      </div>
    </header>
  );
}
