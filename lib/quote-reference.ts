/**
 * Human-readable reference for anything that lands in the CRM's leads table,
 * e.g. SW-2608-4F7K.
 *
 * Staff quote this on the phone, so it has to be short and unambiguous to read
 * aloud. The random tail uses an alphabet with I, O, 0 and 1 removed for the
 * same reason.
 *
 * Lives in its own module because two entry points now mint one: the
 * request-a-quote form and the contact form. Both write a `Quote` row, both
 * need the tail to look the same to whoever reads it back.
 */
export function buildReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  let tail = "";
  for (let i = 0; i < 4; i += 1) {
    tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SW-${yy}${mm}-${tail}`;
}
