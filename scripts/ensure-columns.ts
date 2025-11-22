// Modify DATABASE_URL to disable prepared statements BEFORE any imports
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  if (url.includes("pooler.supabase.com")) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("pgbouncer", "true");
    process.env.DATABASE_URL = urlObj.toString();
  } else if (!url.includes("prepared_statements")) {
    const separator = url.includes("?") ? "&" : "?";
    process.env.DATABASE_URL = `${url}${separator}prepared_statements=false`;
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking and adding columns...");
  
  try {
    // Check if columns exist by trying to query them
    await prisma.$queryRaw`SELECT "tshirtSize", "bottomsSize", "shoeSize" FROM "User" LIMIT 1`;
    console.log("✅ All columns already exist!");
  } catch (error: any) {
    if (error.message?.includes("does not exist") || error.code === "42703") {
      console.log("📝 Adding missing columns...");
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tshirtSize" TEXT');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bottomsSize" TEXT');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "shoeSize" TEXT');
      console.log("✅ Columns added successfully!");
    } else {
      throw error;
    }
  }
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

