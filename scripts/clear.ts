import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing database...");
  await prisma.wishlistItem.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

