import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, FileCheck, Users, MessageCircle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingCalculator } from "@/components/pricing-calculator";
import { getServiceBySlug } from "@/lib/content";
import { ServiceIcon } from "@/lib/display";
import { formatCurrency } from "@/lib/utils";

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
    </div>
  );
}

