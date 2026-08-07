import { z } from "zod";

/**
 * Typed, fail-fast environment access.
 *
 * Server secrets are validated lazily (on first access) rather than at module load,
 * so that Phase 1–3 work — which needs no database or Cloudinary — can run before
 * those credentials exist. Once a consumer actually reads a value, a missing or
 * malformed variable throws immediately with a clear message.
 */

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Supabase pooled connection)"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required (Supabase direct connection)"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(
      32,
      "BETTER_AUTH_SECRET must be at least 32 chars — generate with: openssl rand -base64 32"
    ),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default(""),
});

type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | null = null;

/**
 * Validated server-only environment. Throws on first access if anything is missing.
 * Never import this into a Client Component.
 */
export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment configuration:\n${issues}\n\nCopy .env.example to .env.local and fill in the missing values.`
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Public environment. Safe in both server and client components.
 * Values must be referenced statically so Next.js can inline them at build time.
 */
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});
