import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Better Auth's own endpoints: /api/auth/sign-in, /sign-up, /callback/google,
 * /verify-email, /reset-password, and the rest.
 *
 * This is the ONLY route in the app that Better Auth serves directly; every
 * other auth surface is a page that talks to these through lib/auth/client.ts.
 *
 * `force-dynamic` because every request here reads or writes a session cookie.
 * Without it a prerender attempt at build time would evaluate the handler with
 * no request context.
 */
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth.handler);
