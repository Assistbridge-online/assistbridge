import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Production-safe seed. Only sets up the system-required singleton config.
 * No demo data, no fake users, no fake orders. Safe to run on a live database.
 *
 * For local development with sample data, run `npm run db:seed:demo` instead.
 */
async function main() {
  console.log("Seeding system config...");

  await prisma.pricingConfig.upsert({
    where: { singleton: "singleton" },
    update: {},
    create: {
      singleton: "singleton",
      pageUnitLabel: "page",
      wordsPerPage: 250,
      platformFeePercent: 15,
      rushDeliveryDays: 3,
      rushMultiplier: 1.5,
      studentDiscountPercent: 10,
      nonProfitDiscountPercent: 10,
    },
  });

  console.log("✓ Pricing config initialized.");
  console.log("\nSystem is ready. Use the admin panel to add content.");
  console.log("Tip: run `npm run db:seed:demo` to populate sample data for local development.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
