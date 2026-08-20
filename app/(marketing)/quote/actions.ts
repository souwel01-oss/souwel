"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasProductPage } from "@/lib/product-slugs";
import { buildReference } from "@/lib/quote-reference";

/**
 * Public "Request a Quote" submission (FR-005).
 *
 * WHY A GUEST CAN SUBMIT AT ALL. This is the front door of the whole site: a
 * buyer comparing suppliers will not create an account before asking a price.
 * `Quote` carries `guestName`/`guestEmail`/`guestCompany`/`guestPhone` for
 * exactly this, and the CRM's leads view already renders both shapes in one
 * table. So an anonymous request is a first-class lead, not a lesser one.
 *
 * WHEN THE VISITOR IS SIGNED IN the guest fields are left null and the quote is
 * attached to their CustomerProfile instead — otherwise the same person would
 * appear in the CRM twice, once as a customer and once as a stranger, and their
 * history would split in half.
 *
 * NO PRICING IS ACCEPTED OR RETURNED HERE. `QuoteItem.unitPrice` stays null;
 * only Sales and Admin write it, from the CRM. A price field on this form would
 * break the core constraint of the project.
 */

const MAX_ITEMS = 25;

const itemSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  notes: z.string().trim().max(500).optional(),
});

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please give us a name.").max(120),
  email: z.string().trim().email("That does not look like an email address."),
  company: z.string().trim().min(2, "Please give us a company name.").max(160),
  // REQUIRED, unlike on the contact form. A quote request is the start of a
  // supply conversation about quantities and specifications, and that gets
  // settled on a call — a lead with no number costs Sales a day per round trip.
  // The minimum is 6 rather than a pattern: phone numbers vary by country far
  // more than a regex can usefully describe, and a validator that rejects a
  // real number is worse than one that accepts a bad one.
  phone: z.string().trim().min(6, "Please give us a phone number.").max(40),
  message: z.string().trim().max(2000).optional(),
  items: z.array(itemSchema).min(1, "Add at least one product.").max(MAX_ITEMS),
});

export type QuoteRequestResult = { ok: true; reference: string } | { ok: false; message: string };

export async function submitQuoteRequest(input: unknown): Promise<QuoteRequestResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Please check the form and try again." };
  }
  const { name, email, company, phone, message, items } = parsed.data;

  // Reject slugs that are not real products before touching the database. The
  // slug arrives from a query string, so it is attacker-controlled.
  const unknown = items.find((i) => !hasProductPage(i.slug));
  if (unknown) {
    return { ok: false, message: "One of those products is no longer available." };
  }

  // Collapse duplicates — the same product can be added twice from two pages.
  const bySlug = new Map<string, { slug: string; quantity: number; notes?: string }>();
  for (const item of items) {
    const existing = bySlug.get(item.slug);
    if (existing) {
      existing.quantity += item.quantity;
      existing.notes = existing.notes ?? item.notes;
    } else {
      bySlug.set(item.slug, { ...item });
    }
  }
  const merged = [...bySlug.values()];

  const products = await prisma.product.findMany({
    where: { slug: { in: merged.map((i) => i.slug) } },
    select: { id: true, slug: true },
  });
  const productIdBySlug = new Map(products.map((p) => [p.slug, p.id]));

  if (productIdBySlug.size !== merged.length) {
    // The catalogue is missing from the database — see prisma/seed-catalog.ts.
    // Say so plainly rather than dropping the request on the floor: the visitor
    // needs to know their message did NOT reach anyone.
    return {
      ok: false,
      message:
        "We could not record that request against our catalogue. Please email us directly and we will pick it up.",
    };
  }

  const sessionUser = await getSessionUser();
  const profile = sessionUser
    ? await prisma.customerProfile.findUnique({
        where: { userId: sessionUser.id },
        select: { id: true },
      })
    : null;

  // A collision on the random tail is unlikely but not impossible, and the
  // column is unique. Retry rather than show the visitor an error for something
  // that has nothing to do with them.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = buildReference();
    try {
      await prisma.$transaction(async (tx) => {
        const quote = await tx.quote.create({
          data: {
            reference,
            customerProfileId: profile?.id ?? null,
            // Guest columns stay null for a signed-in customer, so the CRM
            // shows one identity rather than two.
            guestName: profile ? null : name,
            guestEmail: profile ? null : email,
            guestCompany: profile ? null : company,
            guestPhone: profile ? null : phone,
            customerMessage: message || null,
            items: {
              create: merged.map((item) => ({
                productId: productIdBySlug.get(item.slug)!,
                quantity: item.quantity,
                customerNotes: item.notes || null,
              })),
            },
          },
          select: { id: true, reference: true },
        });

        // Activity is per customer, so there is nothing to log for a guest —
        // the lead itself is the record until they have an account.
        if (profile) {
          await tx.activityLog.create({
            data: {
              customerProfileId: profile.id,
              actorId: sessionUser?.id ?? null,
              action: "QUOTE_REQUESTED",
              description: `Quote ${quote.reference} requested with ${merged.length} product${
                merged.length === 1 ? "" : "s"
              }.`,
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

  return { ok: false, message: "Something went wrong saving your request. Please try again." };
}
