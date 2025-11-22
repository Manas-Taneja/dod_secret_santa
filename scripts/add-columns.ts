// Modify DATABASE_URL to disable prepared statements BEFORE any imports
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("prepared_statements")) {
  const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}prepared_statements=false`;
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📝 Adding new columns to User table...");
  
  try {
    // Add columns using raw SQL
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tshirtSize" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bottomsSize" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "shoeSize" TEXT`;
    
    console.log("✅ Columns added successfully!");
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.code === "42701") {
      console.log("✅ Columns already exist, skipping...");
    } else {
      throw error;
    }
  }
}

main()
  .catch((error) => {
    console.error("Error adding columns:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

