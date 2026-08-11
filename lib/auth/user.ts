/**
 * Pure helpers about a user, importable from BOTH server and client.
 *
 * Kept out of lib/auth/session.ts on purpose: that module imports next/headers
 * and the Better Auth server instance, so a Client Component pulling one
 * function out of it would drag the Prisma client and BETTER_AUTH_SECRET
 * toward the browser bundle. Nothing in here touches a request or a secret.
 */

/** Initials for the avatar fallback: "Emmad Sadiq" -> "ES", "souwel" -> "SO". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** First name for the compact header label; falls back to the whole string. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
