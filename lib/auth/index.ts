import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db/prisma";
import { authEnv } from "@/lib/env";
import { emailTransportConfigured, sendAuthEmail } from "@/lib/auth/email";
import { resolveBaseUrl } from "@/lib/base-url";

/**
 * Better Auth server instance — the single source of authentication truth.
 *
 * SERVER ONLY. Importing this from a Client Component pulls the Prisma client
 * and BETTER_AUTH_SECRET toward the browser bundle. Components talk to
 * lib/auth/client.ts instead; server code uses lib/auth/session.ts.
 *
 * The Prisma models this maps onto (User/Session/Account/Verification) already
 * existed in prisma/schema.prisma and were written to Better Auth's field
 * names, so there is no field mapping here.
 */

/**
 * OAuth providers are registered ONLY when their credentials are present.
 *
 * This is the difference between "Google sign-in is not set up yet" and "the
 * whole auth system is down". Better Auth throws at init on a provider with an
 * empty clientId, so an unconditional block would mean nobody could sign in
 * with a password either, on a site where the client has not yet been through
 * Apple's developer portal.
 *
 * The UI reads the same signal — see `enabledSocialProviders` below — so an
 * unconfigured provider's button is not rendered at all, rather than rendered
 * and then failing on click.
 */
function socialProviders() {
  const providers: NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]> = {};

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APPLE_CLIENT_ID, APPLE_CLIENT_SECRET } =
    process.env;

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    };
  }

  if (APPLE_CLIENT_ID && APPLE_CLIENT_SECRET) {
    providers.apple = {
      clientId: APPLE_CLIENT_ID,
      // NOT a password. Apple's "client secret" is a short-lived ES256 JWT you
      // sign yourself from a .p8 key, and it expires after at most six months.
      // See README §Apple — this variable has to be regenerated on a schedule.
      clientSecret: APPLE_CLIENT_SECRET,
      // Only needed if a native iOS app ever shares this backend.
      appBundleIdentifier: process.env.APPLE_BUNDLE_IDENTIFIER || undefined,
    };
  }

  return providers;
}

/** Which social buttons the sign-in UI should render. Safe to send to the client. */
export const enabledSocialProviders = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
} as const;

export const auth = betterAuth({
  secret: authEnv().BETTER_AUTH_SECRET,
  baseURL: authEnv().BETTER_AUTH_URL,
  // Preview deployments get a generated hostname that is not in BETTER_AUTH_URL.
  // Without this, every OAuth callback and cookie on a preview build is rejected
  // as cross-origin.
  trustedOrigins: [resolveBaseUrl()],

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // Tied to whether we can actually send the mail. Hard-coding `true` on a
    // site with no transport means a customer signs up, is told to check their
    // inbox, and can never sign in.
    requireEmailVerification: emailTransportConfigured(),
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your Souwel password",
        body: "We received a request to reset the password on your Souwel account. This link expires in one hour. If you did not ask for this, you can ignore this message — your password will not change.",
        action: "Reset password",
        url,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your Souwel account",
        body: "Confirm this address to finish setting up your Souwel account.",
        action: "Verify email",
        url,
      });
    },
  },

  socialProviders: socialProviders(),

  user: {
    additionalFields: {
      /**
       * `input: false` IS THE SECURITY CONTROL HERE, not decoration.
       *
       * Every field Better Auth knows about is otherwise writable through the
       * public sign-up endpoint. Without this, `POST /api/auth/sign-up/email`
       * with `{"role":"ADMIN"}` in the body creates an administrator — no
       * exploit needed, just a field name. `input: false` makes the server
       * ignore any client-supplied value.
       *
       * The default also lives on the database column
       * (`role Role @default(CUSTOMER)`), so a row created by any other path
       * still lands as a customer. Two independent guarantees, because
       * privilege escalation is not a place for one.
       */
      role: {
        type: "string",
        input: false,
        defaultValue: "CUSTOMER",
        returned: true,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      /**
       * Google and Apple both verify the address they hand us, so linking a
       * social login to an existing password account for the SAME address is
       * safe and is what a customer expects.
       *
       * Trusting an unverified provider here would be an account-takeover
       * route: sign up at that provider with someone else's address, then log
       * straight into their Souwel account.
       */
      trustedProviders: ["google", "apple"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    cookieCache: {
      // Avoids a database round trip on every request that only needs to know
      // "is someone signed in" — which, with a header on every page, is all of
      // them. Short enough that a sign-out or role change is picked up quickly.
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // MUST BE LAST in the plugin list. It flushes Better Auth's Set-Cookie
  // headers through Next's cookies() API, which is the only way a session
  // cookie set inside a Server Action survives the response.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
