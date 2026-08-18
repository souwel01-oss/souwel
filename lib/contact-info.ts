/**
 * The company's real-world contact details — the ONE place they are written
 * down. The contact page, the footer and (later) the LocalBusiness structured
 * data all read from here, so a change of phone number is a change of one line.
 *
 * ============================================================================
 * EVERY `null` BELOW IS AWAITING A REAL VALUE FROM THE CLIENT.
 * ============================================================================
 *
 * They are null rather than plausible-looking placeholders on purpose. A fake
 * phone number on a live B2B contact page is worse than no phone number: a
 * buyer dials it, reaches a stranger or a dead line, and does not try again.
 * A missing channel costs one lead; a wrong one costs trust.
 *
 * The page renders only the channels that are filled in, so filling any of
 * these in is the entire deployment step — no markup changes needed. Until
 * then the enquiry form is the working channel, and it genuinely works: it
 * writes a lead straight into the CRM.
 */

export type PostalAddress = {
  /** Street lines, in order. */
  lines: string[];
  city: string;
  /** State / province code, e.g. "TX". */
  region: string;
  postalCode: string;
  country: string;
};

export const CONTACT = {
  /** General enquiries inbox. */
  email: null as string | null,
  /** Optional second inbox for sales, if it differs from the general one. */
  salesEmail: null as string | null,
  /** Display form, e.g. "+1 (713) 555-0100". `tel:` is derived from it. */
  phone: null as string | null,
  /** Optional WhatsApp number in international digits, e.g. "17135550100". */
  whatsapp: null as string | null,
  address: null as PostalAddress | null,
  /** Opening hours, shown as written. Central Time — the office is in Texas. */
  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM (CT)" },
    { days: "Saturday", time: "By appointment" },
    { days: "Sunday", time: "Closed" },
  ] as { days: string; time: string }[],
  /**
   * The promise made on the page. Keep it one the team can actually keep —
   * this is the first commitment a new buyer sees Souwel make.
   */
  responseTime: "one business day",
  /** Where the business operates from, safe to state today. */
  baseCity: "Houston, Texas",
} as const;

/** `tel:` href for CONTACT.phone — digits and a leading +, nothing else. */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}

/** The address as one line, for a footer or a map link. */
export function addressLine(address: PostalAddress): string {
  return [
    ...address.lines,
    `${address.city}, ${address.region} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * What a contact enquiry can be about.
 *
 * Lives HERE and not beside the server action that validates it, because
 * app/(marketing)/contact/actions.ts carries "use server" — such a module may
 * only export async functions. Exporting this array from there compiled
 * cleanly and then failed at runtime with "i.map is not a function": the
 * client received a server-reference proxy rather than an array. A plain
 * module is the right home for a plain constant.
 *
 * Kept as a fixed list rather than a free-text subject line: it is one tap on
 * a phone instead of a sentence, and it gives sales something sortable.
 */
export const CONTACT_TOPICS = [
  "Pricing and quotes",
  "Product samples",
  "An existing order",
  "Becoming a supplier or partner",
  "Something else",
] as const;
