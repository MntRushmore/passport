import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create workshops using a generic global code
  await prisma.workshop.createMany({
    data: [
      {
        id: 1,
        title: "Glaze",
        emoji: "🍩",
        description: "Create a delicious donut-themed web app...",
        clubCode: "global",
      },
      {
        id: 2,
        title: "Grub",
        emoji: "🍟",
        description: "Build a fast food ordering system...",
        clubCode: "global",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });