import { z } from "zod";

/**
 * Typed, fail-fast environment access.
 *
 * VALIDATED IN SLICES, NOT AS ONE BLOCK. There used to be a single
 * `serverEnv()` covering database + auth + Cloudinary together, which meant
 * opening the sign-in page threw because CLOUDINARY_API_SECRET was blank —
 * a credential sign-in has nothing to do with. One missing value anywhere took
 * down every server feature.
 *
 * Each slice below is validated on first access by the code that actually
 * needs it, so a missing Cloudinary key breaks image upload and nothing else.
 * The error still fires immediately and still names the exact variable.
 */

function slice<T extends z.ZodType>(name: string, schema: T) {
  let cached: z.infer<T> | null = null;

  return function read(): z.infer<T> {
    if (cached) return cached;

    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(
        `Invalid ${name} environment configuration:\n${issues}\n\n` +
          `Copy .env.example to .env.local and fill in the missing values.`
      );
    }

    cached = parsed.data;
    return cached;
  };
}

/** Database connection. Required by lib/db/prisma.ts and by Better Auth. */
export const dbEnv = slice(
  "database",
  z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required (pooled connection)"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required (direct connection, used by migrations)"),
  })
);

/**
 * Better Auth core secrets.
 *
 * OAuth client IDs and the email transport are deliberately NOT here. They are
 * optional by design — see lib/auth/index.ts, where a provider is registered
 * only if its pair of variables is present. Requiring them would mean nobody
 * could sign in with a password until Google and Apple were both configured.
 */
export const authEnv = slice(
  "auth",
  z.object({
    BETTER_AUTH_SECRET: z
      .string()
      .min(
        32,
        "BETTER_AUTH_SECRET must be at least 32 chars — generate with: openssl rand -base64 32"
      ),
    BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  })
);

/** Cloudinary. Only read by upload/transform code. */
export const cloudinaryEnv = slice(
  "cloudinary",
  z.object({
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  })
);

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default(""),
});

/**
 * Public environment. Safe in both server and client components.
 * Values must be referenced statically so Next.js can inline them at build time.
 */
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});
