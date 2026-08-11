/**
 * Sanitiser for the `?next=` parameter the auth pages carry.
 *
 * THIS IS AN OPEN-REDIRECT GUARD, NOT TIDYING UP. `next` comes from the query
 * string, so it is attacker-controlled: a link to
 *
 *     https://souwel.com/login?next=https://souwe1.com/login
 *
 * is a genuine Souwel URL, on a genuine Souwel sign-in page, that hands the
 * visitor to a look-alike the moment they authenticate — and they arrive there
 * already trusting the page they just came from. Phishing kits do exactly this
 * because the first hop is real.
 *
 * Only a path on this site survives. Anything else falls back to the dashboard.
 *
 * Rejected, specifically:
 *   - absolute URLs of any scheme        https://evil.com, javascript:...
 *   - protocol-relative URLs             //evil.com — a browser treats these
 *                                        as absolute, which is why checking
 *                                        only for a leading "/" is not enough
 *   - backslash variants                 /\evil.com, which some browsers
 *                                        normalise to //evil.com
 *   - embedded control characters, which a browser strips before navigating,
 *     so they can carry a payload past a naive string check
 */
const DEFAULT_DESTINATION = "/dashboard";

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function safeNext(raw: string | string[] | undefined | null): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return DEFAULT_DESTINATION;

  // Must be a path, and must not be able to become an authority.
  if (!value.startsWith("/")) return DEFAULT_DESTINATION;
  if (value.startsWith("//")) return DEFAULT_DESTINATION;
  if (value.includes("\\")) return DEFAULT_DESTINATION;
  if (CONTROL_CHARS.test(value)) return DEFAULT_DESTINATION;

  // Sending someone back to an auth page after they authenticate is a loop.
  if (/^\/(login|register|forgot-password|reset-password)\b/.test(value)) {
    return DEFAULT_DESTINATION;
  }

  return value;
}
