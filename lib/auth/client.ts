"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client.
 *
 * This is what Client Components import — never lib/auth/index.ts, which
 * carries the Prisma client and BETTER_AUTH_SECRET.
 *
 * No baseURL is set on purpose. Better Auth then calls /api/auth on the origin
 * the page was served from, which is correct on localhost, on every Vercel
 * preview URL, and on the production domain without any of them being listed
 * anywhere. Pinning it to NEXT_PUBLIC_APP_URL would bake one hostname in at
 * build time and break the other two.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
