import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Global Prisma client singleton for Next.js.
 * Uses Prisma 7 driver adapter pattern with PostgreSQL.
 *
 * The client is created lazily — on the first real query — through a Proxy,
 * so that merely importing this module never throws. This keeps `next build`
 * and route-module evaluation working even when DATABASE_URL isn't available
 * yet (e.g. Vercel's build stage before env vars are injected). The clear
 * error only surfaces if an actual database call is attempted without a
 * configured connection.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Create a .env file with DATABASE_URL=postgresql://..."
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: defers client construction until the first property access
// (i.e. the first query). All existing `prisma.<model>.<method>()` call
// sites keep working unchanged.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
