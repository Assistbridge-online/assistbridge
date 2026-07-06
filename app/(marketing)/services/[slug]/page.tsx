import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Clock, FileCheck, Users, MessageCircle, ChevronRight, ArrowRight, Star, Award, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingCalculator } from "@/components/pricing-calculator";
import { getServiceBySlug, getActiveServices } from "@/lib/content";
import { ServiceIcon } from "@/lib/display";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  if (!s) return { title: "Service not found" };
  return { title: s.name, description: s.shortDescription ?? s.description ?? `${s.name} by AssistBridge — vetted experts.` };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const allServices = await getActiveServices();
  const relatedServices = allServices
    .filter((s) => s.id !== service.id && (s.category === service.category || (service.discipline && s.disciplineId === service.disciplineId)))
    .slice(0, 3);

  const deliverables = (service.deliverables || "").split("|").map((d) => d.trim()).filter(Boolean);

  return (
    <div className="bg-white">
      {/* ===================== BREADCRUMBS ===================== */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/services" className="hover:text-gray-900">Services</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium">{service.name}</span>
          </div>
        </div>
      </div>

      {/* ===================== PAGE HEADER ===================== */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ServiceIcon name={service.icon} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{service.category}</p>
            </div>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl">
            {service.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {service.turnaroundDays} day{service.turnaroundDays === 1 ? "" : "s"} delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-gray-400" />
              Min {service.minPages} {service.pageUnit}{service.minPages === 1 ? "" : "s"}
            </span>
            {service.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===================== CONTENT + SIDEBAR ===================== */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* -------- MAIN CONTENT -------- */}
          <div className="lg:col-span-2 space-y-8">

            {/* Table of contents */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">On this page</h3>
              <ul className="space-y-2">
                {deliverables.length > 0 && (
                  <li><Link href="#deliverables" className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline">What&rsquo;s included</Link></li>
                )}
                <li><Link href="#how-it-works" className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline">How it works</Link></li>
                {service.discipline && (
                  <li><Link href="#related" className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline">Related field</Link></li>
                )}
                <li><Link href="#pricing" className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline">Pricing</Link></li>
              </ul>
            </Card>

            {/* What's included */}
            {deliverables.length > 0 && (
              <div id="deliverables">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What&rsquo;s included</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {deliverables.map((d) => (
                    <div key={d} className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-200 bg-white">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div id="how-it-works">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>
              <div className="space-y-3">
                {[
                  { t: "Post a project with your task details", d: "Tell us what you need. The more context, the better the match." },
                  { t: "Get a transparent quote from an expert", d: "Within hours, you receive a quote with a clear price and timeline." },
                  { t: "Pay securely and collaborate in-platform", d: "Message, share files, and request revisions from your dashboard." },
                  { t: "Approve and release payment", d: "When you are happy with the work, payment releases to the expert." },
                ].map((s, i) => (
                  <div key={s.t} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white">
                    <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.t}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related field */}
            {service.discipline && (
              <div id="related">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Related field</h2>
                <p className="text-sm text-gray-600">
                  This service belongs to <strong>{service.discipline.name}</strong>. Experts in this field
                  are credential-checked and have hands-on experience.&nbsp;
                  <Link href={`/disciplines/${service.discipline.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}`} className="text-emerald-700 font-semibold hover:underline">
                    Browse all {service.discipline.name} services &rarr;
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* -------- SIDEBAR -------- */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5" id="pricing">

              {/* Pricing card */}
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{formatCurrency(service.pricePerPage)}</span>
                    <span className="text-gray-500">/{service.pageUnit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{service.wordsPerPage} words per page</p>
                </div>
                <hr className="my-4 border-gray-200" />
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

              {/* Need a custom quote? */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Need a custom quote?</p>
                    <p className="text-xs text-gray-600 mt-1">Larger or unusual projects? We handle custom scopes.</p>
                    <Link href="/contact" className="mt-2 inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800">
                      Contact us &rarr;
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Are you an expert? */}
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Are you an expert?</p>
                    <p className="text-xs text-gray-600 mt-1">Join our network and take on projects like this.</p>
                    <Link href="/become-an-expert" className="mt-2 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800">
                      Apply to join &rarr;
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Request CTA */}
              <Button asChild className="w-full">
                <Link href={`/calculator?service=${service.slug}`}>
                  Request this service
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* Provider / About the expert box (WordPress-style) */}
      <div className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 flex items-start gap-5">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                AB
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">About the provider</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Vetted experts, hand-picked from {siteConfig.stats.experts}+ applicants</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Every expert on AssistBridge is interviewed, credential-checked, and trial-reviewed.
                  For <strong>{service.name}</strong>, we typically assign specialists with at least 3 years
                  of experience in {service.discipline?.name ?? "their field"} and a track record of high-rated deliveries.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> 4.8/5 average rating
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% payment protection
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600" /> 14-day revision window
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/experts"
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                  >
                    Meet our experts <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/become-an-expert"
                    className="inline-flex items-center h-9 px-4 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-white"
                  >
                    Apply to join
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { v: `${siteConfig.stats.tasksCompleted}+`, l: "Tasks delivered" },
                { v: `${siteConfig.stats.experts}+`, l: "Vetted experts" },
                { v: `${siteConfig.stats.countriesServed}+`, l: "Countries" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-2xl font-bold text-slate-900">{s.v}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related services */}
      {relatedServices.length > 0 && (
        <div>
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">You may also need</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Related services
                </h2>
              </div>
              <Link href="/services" className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5">
                All services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedServices.map((rs) => (
                <Link
                  key={rs.id}
                  href={`/services/${rs.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <ServiceIcon name={rs.icon} />
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-700">
                    {rs.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {rs.shortDescription ?? rs.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>From {formatCurrency(rs.pricePerPage)}/{rs.pageUnit}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Schema */}
      <Script id="faq-schema" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `How much does ${service.name} cost?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Pricing starts at ${formatCurrency(service.pricePerPage)} per ${service.pageUnit} with a minimum of ${service.minPages} ${service.pageUnit}s. The final price depends on the academic level, deadline, and complexity. Use the pricing calculator on this page for an instant estimate.`,
              },
            },
            {
              "@type": "Question",
              name: "What is the turnaround time?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `Standard delivery is ${service.turnaroundDays} day${service.turnaroundDays === 1 ? "" : "s"}. Rush delivery is available at 1.5x the standard price — use the calculator to compare.`,
              },
            },
            {
              "@type": "Question",
              name: "How do I request a revision?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `You have 14 days from delivery to request unlimited revisions at no extra cost. Simply message your expert through your dashboard with the changes you need.`,
              },
            },
            {
              "@type": "Question",
              name: "Is my payment secure?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `Yes. All payments are processed through Stripe or Paystack, both PCI-compliant payment gateways. Funds are held securely and only released when you approve the final delivery.`,
              },
            },
            {
              "@type": "Question",
              name: "Do you offer refunds?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "If the delivered work does not meet the agreed brief, you are eligible for a full refund. We also offer partial refunds for incomplete or unsatisfactory deliveries subject to our refund policy.",
              },
            },
          ],
        })}
      </Script>
    </div>
  );
}

