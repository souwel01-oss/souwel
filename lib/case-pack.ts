/**
 * Quantities round up to whole cases.
 *
 * THE CLIENT'S "PER CASE" FIGURE IS ALSO THE MINIMUM ORDER. A wash cloth
 * packed 15 dz to a case is ordered in 15s, so 20 dz becomes 30: two full
 * cases. Every range rounds this way, in the unit its sheet sells in. Towels,
 * kitchen linen and the dozen-sold catalogue lines count in dozens. Bed
 * linen, salon towels and shop towels count in pieces, and lib/bed-linen.ts
 * and lib/spa-salon.ts round to their own case and pack figures.
 *
 * Plain functions with no catalogue import, so the client-side pickers and
 * tables can share them with the quote page.
 */

export type QuantityUnit = "dz" | "pcs";

export function roundUpToCase(n: number, perCase: number): number {
  return Math.ceil(n / perCase) * perCase;
}

/** "Quantity in dozens. Packed 15 dz per case, so it goes up in 15s." */
export function caseNote(perCase: number, unit: QuantityUnit): string {
  const counted = `Quantity in ${unit === "dz" ? "dozens" : "pieces"}.`;
  if (perCase <= 1) return counted;
  const n = perCase.toLocaleString("en-US");
  return `${counted} Packed ${n} ${unit} per case, so it goes up in ${n}s.`;
}

/** The quantity as staff read it in a request: "30 dz (2 cases)". */
export function caseQuantityLabel(quantity: number, perCase: number, unit: QuantityUnit): string {
  const amount = `${quantity.toLocaleString("en-US")} ${unit}`;
  if (perCase <= 1) return amount;
  const cases = quantity / perCase;
  return `${amount} (${cases.toLocaleString("en-US")} ${cases === 1 ? "case" : "cases"})`;
}
