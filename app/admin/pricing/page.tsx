import { prisma } from "@/lib/db";
import { PricingTierManager } from "@/components/admin/pricing-tier-manager";
import { PricingConfigForm } from "@/components/admin/pricing-config-form";

export const metadata = { title: "Admin · Pricing" };

export default async function AdminPricingPage() {
  const [tiers, config] = await Promise.all([
    prisma.pricingTier.findMany({ orderBy: { order: "asc" } }),
    prisma.pricingConfig.upsert({
      where: { singleton: "singleton" },
      update: {},
      create: { singleton: "singleton" },
    }),
  ]);
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Pricing</h1>
      <p className="mt-1 text-slate-600">Manage pricing tiers and global config.</p>
      <div className="mt-8 space-y-8">
        <PricingConfigForm initial={{
          pageUnitLabel: config.pageUnitLabel,
          wordsPerPage: config.wordsPerPage,
          platformFeePercent: config.platformFeePercent,
          rushDeliveryDays: config.rushDeliveryDays,
          rushMultiplier: config.rushMultiplier,
          studentDiscountPercent: config.studentDiscountPercent,
          nonProfitDiscountPercent: config.nonProfitDiscountPercent,
        }} />
        <PricingTierManager items={tiers as any} />
      </div>
    </>
  );
}
