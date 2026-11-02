"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { sendReportEmail } from "@/lib/auth/email";
import { buildReference } from "@/lib/quote-reference";
import { parInputSchema, parReport, parReportText, type ParReport } from "@/lib/par-calculator";

/**
 * The PAR calculator's last step: the buyer gives an email and gets their
 * results.
 *
 * EVERY SUBMISSION IS A LEAD. It is written as a `Quote` with no line items,
 * the same shape as the contact form (see app/(marketing)/contact/actions.ts),
 * so it lands in the CRM's leads table with the full calculation as its
 * message. Someone sizing linen for a whole property is exactly who Sales
 * wants to hear from.
 *
 * THE REPORT IS ALWAYS RETURNED. When the email goes, the page says so and
 * shows nothing else, as the client asked. When it cannot go, because no email
 * transport is configured or Resend refused it, the page shows the results
 * instead of promising an email that will never arrive.
 */

const submissionSchema = z.object({
  email: z.string().trim().email("That does not look like an email address.").max(254),
  calculation: parInputSchema,
  /** Honeypot, as on the contact form: a person never sees or fills it. */
  website: z.string().max(0).optional(),
});

export type ParSubmitResult =
  { ok: true; emailed: boolean; report: ParReport } | { ok: false; message: string };

export async function submitParCalculation(input: unknown): Promise<ParSubmitResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message:
        first?.path[0] === "email"
          ? first.message
          : "Some of the numbers could not be read. Please check them and try again.",
    };
  }
  const { email, calculation, website } = parsed.data;
  const report = parReport(calculation);

  // Accepted silently, as on the contact form: no lead, no email.
  if (website) return { ok: true, emailed: false, report };

  const text = parReportText(report);
  try {
    await saveLead(email, `Par calculator: ${report.title}\n\n${text}`);
  } catch (error) {
    // Logged, not shown: the buyer still gets their results.
    console.error("Par calculator lead not saved:", error);
  }

  const emailed = await sendReportEmail({
    to: email,
    subject: `Your ${report.title} results from Souwel`,
    text: `Here are the results of your ${report.title} calculation.\n\n${text}\n`,
    intro: `Here are the results of your ${report.title} calculation. Reply to this email if you would like a quotation for any of it.`,
    sections: [
      { heading: "Your linen needs", rows: report.needs },
      { heading: "Your selections", rows: report.selections },
    ],
    totals: report.totals.map((t) => ({ label: t.label, value: t.value.toLocaleString("en-US") })),
  });

  return { ok: true, emailed, report };
}

async function saveLead(email: string, message: string) {
  const sessionUser = await getSessionUser();
  const profile = sessionUser
    ? await prisma.customerProfile.findUnique({
        where: { userId: sessionUser.id },
        select: { id: true },
      })
    : null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await prisma.quote.create({
        data: {
          reference: buildReference(),
          customerProfileId: profile?.id ?? null,
          // As on the contact form, a signed-in customer is not also filed as
          // a guest.
          guestEmail: profile ? null : email,
          industry: "Hospitality",
          customerMessage: message,
        },
        select: { id: true },
      });
      return;
    } catch (error) {
      const isReferenceCollision =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isReferenceCollision) throw error;
    }
  }
}
