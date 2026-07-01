import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, X, HelpCircle, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceCalculator } from "@/components/price-calculator";
import { getActiveAcademicLevels, getActiveFaqs, getActiveServices, getActiveSubjects } from "@/lib/content";
import { saveCalculatorOrder } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing",
  description: "Per-page pricing by academic level. Transparent, no hidden fees.",
};

export default async function PricingPage() {
  const [academicLevels, allFaqs, services, subjects] = await Promise.all([
    getActiveAcademicLevels(),
    getActiveFaqs(),
    getActiveServices(),
    getActiveSubjects(),
  ]);

  const pricingFaqs = allFaqs.filter((f) => f.category === "Pricing");

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Per-page pricing by academic level.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              You pay per page, slide, sheet, or hour. The price depends on which academic
              level the work is for. You see the exact quote before paying.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== PRICE CALCULATOR ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
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
                levels={academicLevels.map((l) => ({
                  id: l.id,
                  slug: l.slug,
                  name: l.name,
                }))}
                subjects={subjects.map((s) => ({
                  id: s.id,
                  name: s.name,
                  levelSlug: s.levelSlug,
                  department: s.department,
                  courseCode: s.courseCode,
                  description: s.description,
                  priceMultiplier: s.priceMultiplier,
                }))}
                action={saveCalculatorOrder}
                requireAuth={false}
                ctaLabel="Save order and continue"
                themed
              />
            </div>

            <aside className="lg:col-span-4 space-y-4">
              <div className="lg:sticky lg:top-24">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/60 mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80"
                    alt="Calculator and documents on a wooden desk"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <Card className="p-5">
                  <p className="text-sm font-bold text-slate-900 mb-3">How pricing works</p>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {[
                      "Per-page price varies by service",
                      "Multiplied by academic level",
                      "Adjusted by subject within the level",
                      "Urgent deadline adds 50%",
                      "Minimum pages apply to some services",
                    ].map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===================== WHAT'S INCLUDED ===================== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What&apos;s included</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Every task includes the essentials.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                You don&apos;t pay extra for the platform features that make expert work safe and reliable.
                These are included on every project, at every academic level.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "Vetted, credential-checked experts",
                "Secure payment processing",
                "In-platform messaging",
                "File sharing & version control",
                "14-day revision window",
                "Dispute resolution",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== NO SURPRISES ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/60 order-2 lg:order-1">
              <Image
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=80"
                alt="Calculator and documents on a wooden desk"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">No surprises</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                What you never pay.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                We never charge clients extra for the basics. The price you see in your quote
                is the price you pay, before any platform fee is added.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "No platform fees added on top of your quote",
                  "No hidden service charges",
                  "No subscription required",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <X className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING FAQ ===================== */}
      {pricingFaqs.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pricing FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Questions about cost.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
              {pricingFaqs.map((f) => (
                <Card key={f.id} className="p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-slate-900">{f.question}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Start a project</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  See your exact cost before you pay.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Post a project, get a transparent quote with the price broken down by academic
                  level, and only pay once you approve the work.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post a project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Talk to us
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"
                  alt="Business meeting with documents"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


