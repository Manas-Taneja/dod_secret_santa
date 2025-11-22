// CRITICAL: Modify DATABASE_URL BEFORE importing PrismaClient
// This must happen at module load time, before any Prisma code runs
if (process.env.NODE_ENV === "development" && process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  
  // For Supabase pooler, use pgbouncer mode which disables prepared statements
  if (url.includes("pooler.supabase.com")) {
    // Remove existing query params and add pgbouncer
    const urlObj = new URL(url);
    urlObj.searchParams.set("pgbouncer", "true");
    url = urlObj.toString();
  } else if (!url.includes("prepared_statements")) {
    // For other connections, disable prepared statements directly
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}prepared_statements=false`;
  }
  
  process.env.DATABASE_URL = url;
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  _prismaConnectionCount: number | undefined;
};

function createPrismaClient() {
  // Force disconnect and clear existing client on every hot reload
  if (globalForPrisma.prisma) {
    globalForPrisma.prisma.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  // Increment connection count to force new connections
  globalForPrisma._prismaConnectionCount = (globalForPrisma._prismaConnectionCount || 0) + 1;

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

// Always create a fresh client in development to avoid prepared statement caching
export const prisma = 
  process.env.NODE_ENV === "development" 
    ? createPrismaClient()
    : (globalForPrisma.prisma ?? createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

