"use server";

import { z } from "zod";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Registration.
 *
 * WHY THIS IS A SERVER ACTION AND NOT A CLIENT-SIDE authClient.signUp CALL.
 *
 * Sign-up captures a company name, and a company name belongs on
 * CustomerProfile — it has no column on User. Doing it from the browser means
 * two requests: create the account, then save the profile. That second request
 * needs a session, and when email verification is enabled sign-up does not
 * produce one. The company name a customer just typed would be dropped on the
 * floor precisely when verification is switched on, which is the configuration
 * we want in production.
 *
 * Here both writes happen in one request, on the server, with no session
 * required for the second. The `nextCookies()` plugin in lib/auth is what lets
 * the session cookie Better Auth sets inside a Server Action survive the
 * response.
 *
 * The two writes are NOT in a transaction, deliberately. Better Auth owns the
 * user row and does not expose its write to an outer transaction. So the order
 * matters instead: the account is created first, and a failure to write the
 * profile leaves a usable account with a missing company name — recoverable
 * from the account page. The reverse order would leave an orphan profile and
 * no way to sign in.
 */

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export type RegisterResult =
  | { ok: true; signedIn: boolean }
  | { ok: false; field?: "name" | "company" | "email" | "password"; message: string };

export async function registerCustomer(input: unknown): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    // The client validates the same rules and shows them per-field; reaching
    // here means the request did not come from our form.
    return { ok: false, message: "Those details are not valid. Please check and try again." };
  }

  const { name, company, email, password } = parsed.data;

  let userId: string;
  let signedIn: boolean;

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        // Where the verification link lands. Sign-in rather than the dashboard:
        // verifying happens in whichever browser opened the email, which is
        // very often not the one that signed up.
        callbackURL: "/login?verified=1",
      },
    });

    userId = result.user.id;
    // No token means email verification is on and a session was withheld.
    signedIn = Boolean(result.token);
  } catch (error) {
    if (error instanceof APIError) {
      const code = (error.body as { code?: string } | undefined)?.code;
      if (code === "USER_ALREADY_EXISTS") {
        return {
          ok: false,
          field: "email",
          message: "An account already exists for this address.",
        };
      }
      return { ok: false, message: error.message || "Could not create your account." };
    }

    console.error("[auth] sign-up failed:", error);
    return {
      ok: false,
      message: "We could not create your account right now. Please try again in a moment.",
    };
  }

  try {
    await prisma.customerProfile.create({
      data: { userId, companyName: company, contactName: name },
    });
  } catch (error) {
    // Logged, not surfaced. The account exists and works; the company name can
    // be set on the account page. Failing the whole call here would tell the
    // customer registration failed when it did not, and a retry would then hit
    // "an account already exists".
    console.error("[auth] account created but CustomerProfile write failed:", error);
  }

  return { ok: true, signedIn };
}
