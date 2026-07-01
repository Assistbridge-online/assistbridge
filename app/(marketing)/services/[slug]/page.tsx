import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, BookOpen, Tag, FileCheck, Users, Sparkles, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingCalculator } from "@/components/pricing-calculator";
import { getActiveServices, getServiceBySlug } from "@/lib/content";
import { ServiceIcon, splitPipes } from "@/lib/display";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  return { title: s?.name ?? "Service" };
}

const categoryImages: Record<string, string> = {
  "Editing & Proofreading": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
  "Academic Writing": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80",
  "Research Assistance": "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1200&q=80",
  "Data Analysis": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  "Translation": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const deliverables = splitPipes(service.deliverables);
  const heroImage = categoryImages[service.category] ?? "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80";

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                All services
              </Link>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {service.category}
                </span>
                {service.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ServiceIcon name={service.icon} />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                  {service.name}
                </h1>
              </div>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
                {service.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  {service.turnaroundDays} day{service.turnaroundDays === 1 ? "" : "s"} delivery
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Min {service.minPages} {service.pageUnit}{service.minPages === 1 ? "" : "s"}
                </span>
                {service.maxPages && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>Max {service.maxPages} {service.pageUnit}s</span>
                  </>
                )}
              </div>
            </div>
            <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60">
              <Image
                src={heroImage}
                alt={service.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING + DELIVERABLES ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {deliverables.length > 0 && (
                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What you get</p>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                    Every deliverable, included.
                  </h2>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">
                    No hidden fees, no surprise add-ons. Here is exactly what you receive
                    with every order.
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {deliverables.map((d, i) => (
                      <div
                        key={d}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          i % 5 === 0 ? "bg-emerald-100 text-emerald-700" :
                          i % 5 === 1 ? "bg-amber-100 text-amber-700" :
                          i % 5 === 2 ? "bg-sky-100 text-sky-700" :
                          i % 5 === 3 ? "bg-violet-100 text-violet-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-slate-700 leading-relaxed pt-1.5">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  From request to delivery.
                </h2>
                <ol className="mt-6 space-y-3">
                  {[
                    { t: "Post a brief with your task details", d: "Tell us what you need. The more context, the better the match." },
                    { t: "Get a transparent quote from an expert", d: "Within hours, you receive a quote with a clear price and timeline." },
                    { t: "Pay securely and collaborate in-platform", d: "Message, share files, and request revisions from your dashboard." },
                    { t: "Approve and release payment", d: "When you are happy with the work, payment releases to the expert." },
                  ].map((s, i) => (
                    <li key={s.t} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900">{s.t}</p>
                        <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {service.discipline && (
                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Related field</p>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                    This service belongs to {service.discipline.name}.
                  </h2>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">
                    Experts in this field are credential-checked and have hands-on experience.
                    Browse all <Link href={`/disciplines/${sl(service.discipline.name)}`} className="text-emerald-700 font-bold underline underline-offset-4 hover:text-emerald-800">{service.discipline.name} services</Link>.
                  </p>
                </div>
              )}
            </div>

            <aside>
              <div className="lg:sticky lg:top-24 space-y-4">
                <Card className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(service.pricePerPage)}</span>
                    <span className="text-slate-500 text-sm">/{service.pageUnit}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    A page = {service.wordsPerPage} words. Final price varies by academic level.
                  </p>
                  <PricingCalculator
                    serviceId={service.id}
                    serviceName={service.name}
                    pricePerPage={service.pricePerPage}
                    minPages={service.minPages}
                    maxPages={service.maxPages ?? undefined}
                    pageUnit={service.pageUnit}
                    wordsPerPage={service.wordsPerPage}
                    turnaroundDays={service.turnaroundDays}
                    rushMultiplier={1.5}
                  />
                </Card>

                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Need a custom quote?</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      Larger or unusual projects? We handle custom scopes.
                    </p>
                    <Link href="/contact" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800">
                      Contact us →
                    </Link>
                  </div>
                </Card>

                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Are you an expert?</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      Join our network and take on projects like this.
                    </p>
                    <Link href="/become-an-expert" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-800">
                      Apply to join →
                    </Link>
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Get started</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Ready to request {service.name}?
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Post a brief and we will match you with a vetted expert within hours.
                  You only pay when you approve the work.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/new?service=${service.slug}`}
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Request this service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Browse all services
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                  alt="Two professionals collaborating at a desk"
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

function sl(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}
