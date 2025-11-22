// Modify DATABASE_URL to disable prepared statements BEFORE any imports
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("prepared_statements")) {
  const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}prepared_statements=false`;
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Resetting database...");
  
  // Disconnect any existing connections first
  await prisma.$disconnect();
  
  // Recreate client to get fresh connection
  const freshPrisma = new PrismaClient();
  
  try {
    // Delete all data using unsafe raw SQL to avoid prepared statement issues
    await freshPrisma.$executeRawUnsafe('TRUNCATE TABLE "WishlistItem" CASCADE');
    await freshPrisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');
    
    console.log("✅ Database reset complete.");
  } finally {
    await freshPrisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error("Error resetting database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

