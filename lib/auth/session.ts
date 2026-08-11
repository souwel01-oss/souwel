import { cache } from "react";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin, isStaff } from "@/lib/auth/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
};

/**
 * The signed-in user for this request, or null.
 *
 * Wrapped in React's `cache` so the layout, the header and the page each get
 * the same result from one lookup — without it, rendering a single dashboard
 * page hits the session store three times.
 *
 * FAILS CLOSED, AND DELIBERATELY DOES NOT THROW. If the session store is
 * unreachable this returns null rather than propagating, which has two
 * consequences, both of them the ones we want:
 *
 *   - public pages keep rendering, signed-out. The marketing site has no
 *     database dependency of its own, and it should not acquire one just
 *     because the header can show a name.
 *   - protected pages see "not signed in" and redirect to /login. An outage
 *     can never turn into access granted.
 *
 * The error is logged, not swallowed silently — a site quietly signing
 * everyone out is otherwise very hard to diagnose.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const { id, name, email, emailVerified, image } = session.user;
    return {
      id,
      name,
      email,
      emailVerified,
      image,
      // `role` is an additional field; present at runtime, typed loosely here
      // so this module does not depend on Better Auth's inference generics.
      role: (session.user as { role?: string }).role ?? "CUSTOMER",
    };
  } catch (error) {
    /**
     * NOT EVERY THROW HERE IS AN ERROR. `headers()` throws a control-flow
     * signal — DYNAMIC_SERVER_USAGE — that Next uses to discover a route
     * cannot be prerendered, and `redirect()` further down this module throws
     * NEXT_REDIRECT. Swallowing either breaks the framework rather than the
     * feature: the build log filled with "session lookup failed" for routes
     * that were merely dynamic, and a redirect inside a guard would silently
     * become a no-op.
     *
     * unstable_rethrow lets Next's own signals through and leaves only genuine
     * failures — an unreachable session store — to the fail-closed path below.
     */
    unstable_rethrow(error);
    console.error("[auth] session lookup failed — treating request as signed out:", error);
    return null;
  }
});

/**
 * Guard for any page that must not render to a stranger.
 *
 * `next` carries the blocked path so sign-in can return the visitor to where
 * they were going. Without it, a bookmarked deep link into the portal always
 * dumps the customer on the dashboard root after login.
 */
export async function requireUser(currentPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return user;
}

/**
 * The signed-in user if they are Admin or Sales, otherwise null.
 *
 * WHY THIS RETURNS NULL RATHER THAN REDIRECTING, unlike requireRole below.
 * These two are for SERVER ACTIONS. An action is called by JavaScript that is
 * waiting for a result; a thrown NEXT_REDIRECT there surfaces as an
 * unexplained page jump instead of "you are not allowed to do that". Pages
 * redirect, actions refuse.
 *
 * EVERY CRM ACTION CALLS ONE OF THESE, including the ones behind a guarded
 * layout. The layout guard protects the PAGE. A Server Action is its own
 * public HTTP endpoint with its own id, reachable by anyone who has ever
 * loaded the bundle — a customer who signs in once can post to the role-change
 * action forever unless the action itself checks.
 */
export async function getStaffUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && isStaff(user.role) ? user : null;
}

/**
 * The signed-in user if they are an Admin, otherwise null.
 *
 * Sales deliberately fails this. Sales can move a quote through its statuses
 * but cannot grant anyone a role — including themselves, which is the actual
 * risk. A Sales account that can promote itself to Admin is not a Sales
 * account.
 */
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && isAdmin(user.role) ? user : null;
}

/** Guard for staff-only surfaces (the CRM). */
export async function requireRole(
  currentPath: string,
  roles: readonly string[]
): Promise<SessionUser> {
  const user = await requireUser(currentPath);
  if (!roles.includes(user.role)) {
    // Not "403 for a customer" — a customer has no business knowing the CRM
    // exists at this URL. Sending them to their own dashboard neither confirms
    // nor denies the route.
    redirect("/dashboard");
  }
  return user;
}
