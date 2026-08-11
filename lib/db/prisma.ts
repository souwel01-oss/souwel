import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { dbEnv } from "@/lib/env";

/**
 * Prisma client singleton.
 *
 * Guarded against Next.js hot-reload creating a new client (and a new connection
 * pool) on every edit, which exhausts Supabase's connection limit in dev.
 *
 * Prisma 7 connects through a driver adapter rather than a schema-level URL.
 * The pooled DATABASE_URL is correct here — migrations use DIRECT_URL separately
 * via prisma.config.ts.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: dbEnv().DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
