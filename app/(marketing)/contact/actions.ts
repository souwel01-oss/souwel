"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { buildReference } from "@/lib/quote-reference";
import { CONTACT_TOPICS } from "@/lib/contact-info";

/**
 * Public contact-form submission.
 *
 * WHY THIS WRITES A `Quote` AND NOT A NEW `ContactMessage` MODEL.
 *
 * The schema already has exactly the row this needs: `Quote` carries
 * guestName / guestEmail / guestCompany / guestPhone / customerMessage for
 * anonymous submissions, the CRM's leads table already renders both the guest
 * and the registered-customer shape, and `listLeads` already tolerates a quote
 * with no line items. A parallel model would mean a second table, a second
 * migration, and a second inbox in the CRM for staff to remember to check —
 * and the message a stranger sends through "Contact us" IS a lead. It belongs
 * in the same queue as the ones sent through "Request a quote".
 *
 * WHAT DISTINGUISHES THE TWO in the CRM is the item count: a quote request
 * always carries at least one product (the form refuses to submit otherwise),
 * a contact enquiry always carries none. `toLeadRow` in lib/db/crm.ts turns
 * that zero into the words "General enquiry" so nobody has to know the trick.
 *
 * NO PRICING IS ACCEPTED OR RETURNED HERE, same as the quote form.
 */

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please give us a name.").max(120),
  email: z.string().trim().email("That does not look like an email address."),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  topic: z.enum(CONTACT_TOPICS).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — ten characters at least.")
    .max(4000),
  /**
   * Honeypot. A real person never sees this field, so anything in it came from
   * a bot filling every input on the page. The form is public and unauthed;
   * without this the CRM leads table becomes a spam folder within a week.
   */
  website: z.string().max(0).optional(),
});

export type ContactResult = { ok: true; reference: string } | { ok: false; message: string };

export async function submitContactMessage(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Please check the form and try again." };
  }
  const { name, email, company, phone, topic, message, website } = parsed.data;

  // Silently accept the honeypot rather than erroring. Telling a bot which
  // check it failed is how the next request gets past it, and there is no
  // human on the other end to inconvenience.
  if (website) return { ok: true, reference: buildReference() };

  const sessionUser = await getSessionUser();
  const profile = sessionUser
    ? await prisma.customerProfile.findUnique({
        where: { userId: sessionUser.id },
        select: { id: true },
      })
    : null;

  const body = topic ? `Enquiry — ${topic}\n\n${message}` : message;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = buildReference();
    try {
      await prisma.$transaction(async (tx) => {
        await tx.quote.create({
          data: {
            reference,
            customerProfileId: profile?.id ?? null,
            // Guest columns stay null for a signed-in customer, so the same
            // person does not appear in the CRM twice.
            guestName: profile ? null : name,
            guestEmail: profile ? null : email,
            guestCompany: profile ? null : company || null,
            guestPhone: profile ? null : phone || null,
            customerMessage: body,
            // No `items` — that absence is what marks this as an enquiry.
          },
          select: { id: true },
        });

        if (profile) {
          await tx.activityLog.create({
            data: {
              customerProfileId: profile.id,
              actorId: sessionUser?.id ?? null,
              action: "QUOTE_REQUESTED",
              description: `Contact enquiry ${reference}${topic ? ` — ${topic}` : ""}.`,
            },
          });
        }
      });

      return { ok: true, reference };
    } catch (error) {
      const isReferenceCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isReferenceCollision) throw error;
    }
  }

  return { ok: false, message: "Something went wrong sending your message. Please try again." };
}
