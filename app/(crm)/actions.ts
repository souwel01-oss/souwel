"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAdminUser, getStaffUser } from "@/lib/auth/session";
import { isAssignableRole, roleLabel } from "@/lib/auth/roles";
import type { Prisma } from "@prisma/client";

/**
 * CRM mutations.
 *
 * EVERY EXPORTED FUNCTION HERE RE-CHECKS THE ROLE, even though the pages that
 * call them sit behind a guarded layout. A Server Action is a public POST
 * endpoint with a stable id — the layout guard decides who can SEE the button,
 * and nothing more. Anyone who has loaded this bundle once can call these for
 * as long as their session lasts.
 *
 * The two tiers are not decoration either:
 *   getStaffUser  — Admin or Sales. Moving a quote through its statuses.
 *   getAdminUser  — Admin only. Anything that changes who can do what.
 *
 * Sales failing the second tier is the point. A Sales account able to grant
 * roles can grant itself Admin, at which point the distinction has never
 * existed.
 */

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

const DENIED: ActionResult = {
  ok: false,
  message: "You do not have permission to do that.",
};

// ---------------------------------------------------------------------------
// Users — Admin only
// ---------------------------------------------------------------------------

const roleInput = z.object({
  userId: z.string().min(1),
  role: z.string().refine(isAssignableRole, "Unknown role."),
});

export async function updateUserRole(input: unknown): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return DENIED;

  const parsed = roleInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That role is not valid." };

  const { userId, role } = parsed.data;

  /**
   * AN ADMIN CANNOT DEMOTE THEMSELVES.
   *
   * Not paternalism — it is the one change that cannot be undone from inside
   * the product. The moment the update lands, the acting user fails every
   * admin guard including this action, so if they were the last Admin the role
   * controls are now unreachable by anybody and the only fix is a hand-written
   * SQL statement against production.
   */
  if (userId === admin.id) {
    return {
      ok: false,
      message: "You cannot change your own role. Ask another administrator.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });
  if (!target) return { ok: false, message: "That user no longer exists." };
  if (target.role === role) {
    return { ok: true, message: `${target.name} is already ${roleLabel(role)}.` };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Prisma.UserUpdateInput["role"] },
    });
  } catch (error) {
    console.error("[crm] role change failed:", error);
    return { ok: false, message: "Could not change the role. Please try again." };
  }

  await logAgainstCustomer(userId, admin.id, `Role changed to ${roleLabel(role)} by ${admin.name}.`);

  revalidatePath("/admin/users");
  return { ok: true, message: `${target.name} is now ${roleLabel(role)}.` };
}

const statusInput = z.object({
  userId: z.string().min(1),
  active: z.boolean(),
});

export async function setUserActive(input: unknown): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return DENIED;

  const parsed = statusInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That request is not valid." };

  const { userId, active } = parsed.data;

  // Same reasoning as the role guard: deactivating yourself ends your own
  // session's access on the next request.
  if (userId === admin.id) {
    return { ok: false, message: "You cannot deactivate your own account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!target) return { ok: false, message: "That user no longer exists." };

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          banned: !active,
          banReason: active ? null : "Deactivated by an administrator",
          banExpires: null,
        },
      }),
      // Deactivation has to end the sessions that already exist, or the account
      // stays usable until each one expires — up to thirty days of access after
      // being switched off, which is not what anyone means by "deactivate".
      ...(active ? [] : [prisma.session.deleteMany({ where: { userId } })]),
    ]);
  } catch (error) {
    console.error("[crm] account status change failed:", error);
    return { ok: false, message: "Could not change the account status." };
  }

  await logAgainstCustomer(
    userId,
    admin.id,
    `Account ${active ? "activated" : "deactivated"} by ${admin.name}.`
  );

  revalidatePath("/admin/users");
  return {
    ok: true,
    message: `${target.name}'s account is now ${active ? "active" : "inactive"}.`,
  };
}

// ---------------------------------------------------------------------------
// Quotes — Admin or Sales
// ---------------------------------------------------------------------------

const QUOTE_STATUSES = ["REQUESTED", "QUOTED", "ACCEPTED", "DECLINED", "FULFILLED"] as const;

const quoteStatusInput = z.object({
  quoteId: z.string().min(1),
  status: z.enum(QUOTE_STATUSES),
});

const ACTION_FOR_STATUS = {
  QUOTED: "QUOTE_RESPONDED",
  ACCEPTED: "QUOTE_ACCEPTED",
  DECLINED: "QUOTE_DECLINED",
  REQUESTED: "QUOTE_REQUESTED",
  FULFILLED: "QUOTE_RESPONDED",
} as const;

export async function updateQuoteStatus(input: unknown): Promise<ActionResult> {
  const staff = await getStaffUser();
  if (!staff) return DENIED;

  const parsed = quoteStatusInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That status is not valid." };

  const { quoteId, status } = parsed.data;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, reference: true, status: true, customerProfileId: true },
  });
  if (!quote) return { ok: false, message: "That quote no longer exists." };
  if (quote.status === status) {
    return { ok: true, message: `${quote.reference} is already ${status.toLowerCase()}.` };
  }

  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status,
        // quotedAt is stamped the first time a price goes out and never
        // rewritten — it is the date on the document the customer received.
        ...(status === "QUOTED" ? { quotedAt: new Date() } : {}),
        respondedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[crm] quote status change failed:", error);
    return { ok: false, message: "Could not update the quote." };
  }

  /**
   * ActivityLog requires a customerProfileId, and a guest quote has none.
   *
   * That is a real gap rather than a thing to paper over: the spec asks for
   * every status change to be logged to the customer's history, and a guest
   * has no history to log against until they register. Writing the entry
   * against some placeholder profile would be worse — it would attribute one
   * company's activity to another.
   */
  if (quote.customerProfileId) {
    await writeActivity(
      quote.customerProfileId,
      staff.id,
      ACTION_FOR_STATUS[status],
      `${quote.reference} moved from ${quote.status.toLowerCase()} to ${status.toLowerCase()} by ${staff.name}.`
    );
  }

  revalidatePath("/admin/leads");
  revalidatePath("/dashboard");
  return { ok: true, message: `${quote.reference} is now ${status.toLowerCase()}.` };
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

async function writeActivity(
  customerProfileId: string,
  actorId: string,
  action: Prisma.ActivityLogCreateInput["action"],
  description: string
) {
  try {
    await prisma.activityLog.create({
      data: { customerProfileId, actorId, action, description },
    });
  } catch (error) {
    // Never fails the caller. The business change has already been written and
    // committed; losing the audit line is bad but reversing a completed role
    // change because its log entry failed is worse.
    console.error("[crm] activity log write failed:", error);
  }
}

/** Log against a user's own customer profile, if they have one. */
async function logAgainstCustomer(userId: string, actorId: string, description: string) {
  const profile = await prisma.customerProfile
    .findUnique({ where: { userId }, select: { id: true } })
    .catch(() => null);

  if (!profile) return;
  await writeActivity(profile.id, actorId, "PROFILE_UPDATED", description);
}
