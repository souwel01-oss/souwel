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
