/**
 * Role constants and predicates. PURE — safe on both server and client.
 *
 * THIS FILE MUST NOT IMPORT lib/auth/session, lib/auth OR ANYTHING THAT
 * REACHES THEM. It did, once, and the build failed with `pg` and
 * `next/headers` being traced into the browser bundle: three client components
 * import `roleLabel` for a badge, and that one import dragged the Prisma
 * client, the driver adapter and BETTER_AUTH_SECRET along behind it.
 *
 * This is the same split — and the same mistake — as lib/auth/user.ts. The
 * rule: if a Client Component needs it, it lives in a module with no server
 * imports at all. The guards that read a session live in lib/auth/session.ts.
 */

export const STAFF_ROLES = ["ADMIN", "SALES"] as const;
export const ASSIGNABLE_ROLES = ["CUSTOMER", "SALES", "ADMIN"] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function isStaff(role: string): boolean {
  return role === "ADMIN" || role === "SALES";
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}

export function isAssignableRole(value: unknown): value is AssignableRole {
  return typeof value === "string" && (ASSIGNABLE_ROLES as readonly string[]).includes(value);
}

/** Human label for a role, for tables and badges. */
export function roleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "SALES":
      return "Sales";
    case "CUSTOMER":
      return "Customer";
    default:
      return role;
  }
}
