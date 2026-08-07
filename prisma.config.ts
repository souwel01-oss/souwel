import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

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
    url: env("DIRECT_URL"),
  },
});
