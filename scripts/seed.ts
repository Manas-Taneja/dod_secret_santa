import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Resetting database...");
  await prisma.wishlistItem.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("secret123", 10);

  const [alex, blair, casey] = await prisma.$transaction([
    prisma.user.create({
      data: {
        displayName: "alex",
        hashedPassword: password,
      },
    }),
    prisma.user.create({
      data: {
        displayName: "blair",
        hashedPassword: password,
      },
    }),
    prisma.user.create({
      data: {
        displayName: "casey",
        hashedPassword: password,
      },
    }),
  ]);

  await prisma.wishlistItem.createMany({
    data: [
      {
        userId: alex.id,
        title: "Noise-cancelling headphones",
        priority: 1,
        url: "https://example.com/headphones",
      },
      {
        userId: alex.id,
        title: "Chemex coffee maker",
        priority: 2,
      },
      {
        userId: blair.id,
        title: "Wool scarf",
        priority: 1,
      },
      {
        userId: casey.id,
        title: "Board game: Cascadia",
        priority: 1,
      },
    ],
  });

  console.log("✅ Seed data created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

