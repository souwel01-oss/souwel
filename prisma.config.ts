import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local; plain `dotenv/config` only reads .env.
// Load both so the Prisma CLI sees the same values the app does.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

/**
 * Prisma 7 configuration.
 *
 * Connection URLs moved out of schema.prisma in Prisma 7. Migrations use the
 * DIRECT_URL (Supabase direct connection, port 5432) because Prisma Migrate
 * requires a session-mode connection — the pooled DATABASE_URL (pgbouncer,
 * port 6543) cannot run DDL reliably.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // NOT `env("DIRECT_URL")`. That helper throws the instant this config file
    // is loaded if the variable is missing, and this file is loaded by EVERY
    // Prisma CLI command — including `prisma generate`, which needs no
    // connection at all. That broke the Vercel build: there is no database
    // configured there yet, so `generate` could not run, `@prisma/client` was
    // never generated, and the type check failed with "has no exported member
    // 'PrismaClient'".
    //
    // Reading the variable directly means a missing URL is no longer a
    // config-load error. `migrate` and `seed` still need it and will now fail
    // on connect with Prisma's own message, which is the right place and the
    // right error for that.
    url: process.env.DIRECT_URL ?? "",
  },
});
