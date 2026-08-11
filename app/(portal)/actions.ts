"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

/**
 * Profile update.
 *
 * THE USER ID COMES FROM THE SESSION, NEVER FROM THE FORM. A Server Action is
 * a public HTTP endpoint — anyone can post to it with any body they like — so
 * a `userId` field in the payload would be an invitation to edit someone
 * else's company details. The only identity this trusts is the one Better Auth
 * resolves from the cookie.
 */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  companyName: z.string().trim().min(2, "Enter your company name.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  addressLine1: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ProfileResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

export async function updateProfile(input: unknown): Promise<ProfileResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const { name, companyName, phone, addressLine1, city, country } = parsed.data;
  const blankToNull = (v?: string) => (v && v.length > 0 ? v : null);

  try {
    await prisma.$transaction([
      // The display name lives on User because that is what the session and the
      // header read; the company and address live on CustomerProfile. Both in
      // one transaction so the header can never show a name the account page
      // has just failed to save.
      prisma.user.update({ where: { id: user.id }, data: { name } }),
      prisma.customerProfile.upsert({
        where: { userId: user.id },
        // upsert, not update: an account created through Google or Apple never
        // passed through the registration form, so it has no profile row yet
        // and this is the first time one is written.
        create: {
          userId: user.id,
          companyName,
          contactName: name,
          phone: blankToNull(phone),
          addressLine1: blankToNull(addressLine1),
          city: blankToNull(city),
          country: blankToNull(country),
        },
        update: {
          companyName,
          contactName: name,
          phone: blankToNull(phone),
          addressLine1: blankToNull(addressLine1),
          city: blankToNull(city),
          country: blankToNull(country),
        },
      }),
    ]);
  } catch (error) {
    console.error("[portal] profile update failed:", error);
    return { ok: false, message: "We could not save your details. Please try again." };
  }

  /**
   * Re-reads the session with the cookie cache bypassed.
   *
   * lib/auth caches the session in a signed cookie for five minutes to keep the
   * header off the database on every request. That cache holds a COPY of the
   * user, including the name just changed — so without this, the account page
   * shows the new name while the header keeps the old one for up to five
   * minutes, which reads as a failed save. Asking for a fresh read rewrites the
   * cookie, and the nextCookies() plugin is what lets that Set-Cookie survive a
   * Server Action's response.
   */
  try {
    await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
  } catch (error) {
    // Not worth failing the save over — the write succeeded, and the stale
    // header corrects itself when the cache expires.
    console.error("[portal] session cache refresh failed:", error);
  }

  revalidatePath("/dashboard", "layout");

  return { ok: true };
}
