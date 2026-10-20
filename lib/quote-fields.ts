/**
 * Choices offered on the public quote form.
 *
 * IN ONE PLACE BECAUSE THREE THINGS HAVE TO AGREE: the <select> a visitor sees,
 * the server action that validates what comes back, and the CRM that displays
 * it. A band typed into the markup and a band typed into a zod enum drift the
 * first time one of them is edited, and the failure is silent — the option
 * renders, the visitor picks it, the server drops it.
 *
 * PLAIN STRINGS, STORED AS WRITTEN. These are not parsed into numbers anywhere:
 * they are a band a buyer self-selects, and turning "$500K–$2M" into a range of
 * integers would invent a precision the answer does not have. Sales reads the
 * band; nothing computes with it.
 */
export const ANNUAL_VOLUME_BANDS = [
  "$25K–$100K",
  "$100K–$500K",
  "$500K–$2M",
  "$2M–$5M",
  "$5M–$10M",
  "$10M+",
] as const;

export type AnnualVolumeBand = (typeof ANNUAL_VOLUME_BANDS)[number];

/**
 * Length limits the quote form, its page and its server action all enforce.
 *
 * HERE FOR THE SAME REASON AS THE BANDS ABOVE: three files have to agree. The
 * page builds the enquiry line and the prefilled message, the textarea stops
 * the buyer typing past the limit, and the action refuses anything longer. A
 * limit raised in one and not the others produces a request the form happily
 * builds and the server then rejects.
 *
 * THE MESSAGE LIMIT IS SIZED TO A FULL QUOTE LIST, not to a paragraph of
 * prose. A list sent from the drawer arrives with each range product's
 * specification written into the message — about 300 characters for a typical
 * product, 2,500 for the 56-line table cloth. The longest list the site
 * allows (25 products, every line of each selected) measures about 11,600, so
 * this leaves that room and still some for what the buyer adds underneath.
 */
export const QUOTE_ENQUIRY_MAX = 160;
export const QUOTE_MESSAGE_MAX = 15_000;
