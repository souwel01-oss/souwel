import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic gate on the customer portal and the CRM.
 *
 * THIS IS NOT THE ACCESS CONTROL. It checks only that a session cookie is
 * PRESENT — it does not validate the signature, look the session up, or read
 * the role, because doing any of that means a database round trip on every
 * request to every matched route, and Prisma cannot run in the middleware
 * runtime anyway.
 *
 * The real check is `requireUser` / `requireRole` in the route's own layout,
 * on the server, against the session store. A forged or expired cookie sails
 * through here and is rejected there.
 *
 * What this buys is the redirect that would otherwise be slow and ugly: a
 * signed-out visitor is bounced before the portal shell renders, and `next`
 * carries their intended destination — which the layout guard cannot do as
 * precisely, because a layout does not know the full pathname it is wrapping.
 */
export function middleware(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  /**
   * Deliberately narrow. An inverted matcher — "everything except /api and
   * /_next" — is the common shape and it would put this on all twenty-four
   * static product pages and the homepage, adding a middleware invocation to
   * every request on a site whose public half needs no session at all.
   */
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
