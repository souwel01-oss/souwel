import { FileText, LayoutGrid, Package, User } from "lucide-react";

/**
 * Portal navigation.
 *
 * EVERY ENTRY HERE RESOLVES. Documents and the activity history both belong in
 * this list eventually and are both in the data model, but a sidebar item that
 * 404s inside a customer's own account reads as a broken product rather than
 * an unfinished one. They go in when their route does — which is what
 * "My Quotes" just did.
 *
 * FOUR ITEMS, WHICH IS THE CEILING. The mobile presentation of this list is a
 * fixed bottom bar, and five is where a bottom bar stops working — see the
 * note in PortalSidebar. Documents cannot simply be appended when it lands;
 * something will have to move behind an overflow or into the account page.
 */
export const PORTAL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/quotes", label: "My Quotes", icon: FileText },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/account", label: "Manage My Account", icon: User },
] as const;
