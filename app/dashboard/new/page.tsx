import { redirect } from "next/navigation";
import { CheckCircle2, Upload, Shield, RefreshCw, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { PriceCalculator } from "@/components/price-calculator";
import { saveCalculatorOrder } from "@/lib/actions/orders";
import { getActiveServices, getActiveAcademicLevels } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?returnTo=/dashboard/new");

  const [services, levels] = await Promise.all([
    getActiveServices(),
    getActiveAcademicLevels(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a new brief</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the details below and see the price in real time. You can save the order
          and upload files before checkout.
        </p>
      </div>

      <PriceCalculator
        services={services.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          pricePerPage: s.pricePerPage,
          minPages: s.minPages,
          maxPages: s.maxPages,
          pageUnit: s.pageUnit,
          wordsPerPage: s.wordsPerPage,
        }))}
        levels={levels.map((l) => ({
          id: l.id,
          slug: l.slug,
          name: l.name,
        }))}
        action={saveCalculatorOrder}
        ctaLabel="Save order and continue"
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">1. Upload files</div>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">After saving, you&apos;ll be able to upload any reference materials or briefs.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">2. Secure payment</div>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Pay through Stripe or PayPal. Payment is held until you approve the work.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">3. 14-day revisions</div>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Request changes within 14 days of delivery. We mediate disputes personally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
