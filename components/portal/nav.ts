import { LayoutGrid, Package, User } from "lucide-react";

/**
 * Portal navigation.
 *
 * EVERY ENTRY HERE RESOLVES. Quotations, documents and the activity history
 * all belong in this list eventually and are all in the data model, but a
 * sidebar item that 404s inside a customer's own account reads as a broken
 * product rather than an unfinished one. They go in when their route does.
 */
export const PORTAL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/account", label: "Manage My Account", icon: User },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
] as const;
