import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Calculator, GraduationCap, Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceCalculator } from "@/components/price-calculator";
import { saveCalculatorOrder } from "@/lib/actions/orders";
import { getActiveServices, getActiveAcademicLevels, getActiveSubjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Price calculator",
  description: "See the exact price for your assignment before you commit. No signup required.",
};

export default async function CalculatorPage() {
  const [services, levels, subjects] = await Promise.all([
    getActiveServices(),
    getActiveAcademicLevels(),
    getActiveSubjects(),
  ]);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="container-x relative py-14 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live price calculator
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                See your exact price in 30 seconds. No signup needed.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-2xl">
                Pick your service, your academic level, the subject, and how soon you need
                the work. We add it up and show you the total. Like the calculator on
                your favourite freelancer site, just a bit more honest about how it works.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  No credit card to check
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Save and come back later
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Per-page, per-level, per-subject pricing
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200/60">
                  <Image
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80"
                    alt="Calculator and documents on a wooden desk"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 lg:-left-6 bg-white rounded-2xl shadow-2xl px-4 py-3 hidden sm:flex items-center gap-3 ring-1 ring-slate-200/60">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Real-time pricing</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">No guessing</div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 lg:-right-6 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 hidden sm:block">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Median order</div>
                  <div className="text-base font-bold">$42 / page</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CALCULATOR ===================== */}
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
                levels={levels.map((l) => ({
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
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900">How pricing works</h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {[
                      "Per-page price varies by service",
                      "Multiplied by academic level (High School through Professional)",
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

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">After you save</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              What happens next.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                i: <FileText className="h-5 w-5" />,
                n: "1",
                t: "Sign in or create an account",
                d: "We save your order details so you don't lose them. New here? Creating an account takes 30 seconds.",
              },
              {
                i: <Clock className="h-5 w-5" />,
                n: "2",
                t: "Upload your files",
                d: "Add any reference materials, briefs, rubrics, or examples your expert will need to do the work well.",
              },
              {
                i: <GraduationCap className="h-5 w-5" />,
                n: "3",
                t: "Pay and we start work",
                d: "Pay through Stripe or PayPal. Payment is held until you approve the final delivery. Most matches happen in under 4 hours.",
              },
            ].map((s) => (
              <Card key={s.n} className="p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  {s.i}
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white text-center">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                Ready to see your price?
              </h2>
              <p className="mt-3 text-base text-slate-300 max-w-xl mx-auto">
                Scroll back up and use the calculator. It takes 30 seconds.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 bg-white !text-slate-900 hover:!bg-emerald-50"
              >
                <Link href="#calculator">
                  <span className="inline-flex items-center gap-2">Go to calculator <ArrowRight className="h-4 w-4" /></span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
