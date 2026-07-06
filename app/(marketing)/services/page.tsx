import Link from "next/link";
import {
  ArrowRight, ArrowDown, ArrowUpRight, CheckCircle2, Sparkles, FileText, BarChart3, Globe, BookOpen, Wrench, MessageSquare, Layers, Award, Clock, Zap, ShieldCheck, Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveServices, getActiveFaqs } from "@/lib/content";
import { ServiceIcon } from "@/lib/display";
import { formatCurrency } from "@/lib/utils";
import { FaqList } from "@/components/faq-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services - Every service you need, under one roof | AssistBridge",
  description:
    "From a quick edit to a multi-chapter thesis. Browse all services by category with transparent pricing, vetted experts, and on-time delivery.",
};

const process = [
  {
    n: "01",
    icon: FileText,
    title: "Tell us what you need",
    text: "Fill the brief form with your task, deadline, and any reference files. The more context, the better the match.",
    duration: "~5 min",
  },
  {
    n: "02",
    icon: BarChart3,
    title: "Get a transparent quote",
    text: "Within hours, you receive a quote from a vetted expert with a clear breakdown of cost and timeline.",
    duration: "Within 4 hours",
  },
  {
    n: "03",
    icon: MessageSquare,
    title: "Collaborate in-platform",
    text: "Message, share files, request revisions, and track progress from your dashboard. Everything in one place.",
    duration: "Ongoing",
  },
  {
    n: "04",
    icon: Award,
    title: "Approve and release payment",
    text: "Once you are happy with the final work, approve the delivery. Funds release to the expert.",
    duration: "1 click",
  },
];

const promises = [
  { icon: ShieldCheck, title: "100% payment protection", text: "Funds held in escrow. Released only when you approve the work." },
  { icon: Clock, title: "On-time delivery", text: "Most tasks delivered on or before the deadline, with live progress updates." },
  { icon: Sparkles, title: "Transparent pricing", text: "You see the exact cost before paying. No hourly surprises, no hidden fees." },
  { icon: Award, title: "Money-back guarantee", text: "If the work misses the brief, we issue a full or partial refund." },
];

export default async function ServicesPage() {
  const [services, allFaqs] = await Promise.all([getActiveServices(), getActiveFaqs()]);
  const serviceFaqs = allFaqs.filter((f) => f.category === "Services");

  const categories = new Map<string, typeof services>();
  for (const s of services) {
    const arr = categories.get(s.category) ?? [];
    arr.push(s);
    categories.set(s.category, arr);
  }
  const categoryList = Array.from(categories.entries());

  const featuredServices = categoryList.slice(0, 3).map(([, items]) => items[0]);

  const categoryIcons: Record<string, any> = {
    "Editing & Proofreading": BookOpen,
    "Academic Writing": FileText,
    "Research Assistance": Globe,
    "Data Analysis": BarChart3,
    "Translation": Wrench,
  };

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Our services</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                Every service you need,
                <br />
                under one roof.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
                All services are priced per page, slide, sheet, or hour. You see the exact cost
                before paying. Submit a request and we will match you with the right expert in
                under four hours.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/calculator">
                    <span className="inline-flex items-center gap-2">
                      Post a project <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing"><span>See pricing</span></Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">At a glance</p>
              <dl className="mt-5 grid grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden">
                {[
                  { v: services.length || "—", l: "Services available" },
                  { v: categoryList.length || "—", l: "Categories" },
                  { v: "250+", l: "Vetted experts" },
                  { v: "1,200+", l: "Projects delivered" },
                ].map((s) => (
                  <div key={s.l} className="bg-white p-5">
                    <div className="text-3xl font-bold text-slate-900 tabular-nums">{s.v}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  4.8/5 average rating
                </span>
                <span className="text-slate-300">•</span>
                <span>14-day revision window</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED SERVICES (bento) ===================== */}
      {featuredServices.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="container-x py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Featured</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  The most-requested services.
                </h2>
              </div>
              <Link
                href="#all-services"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-900 hover:gap-2.5 transition-all"
              >
                See all services <ArrowDown className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {featuredServices.map((s, i) => {
                const size = i === 0 ? "lg:col-span-2" : "lg:col-span-1";
                return (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 md:p-8 hover:border-slate-900 hover:shadow-xl transition-all flex flex-col ${size} ${i === 0 ? "min-h-[280px]" : "min-h-[220px]"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <ServiceIcon name={s.icon} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {s.category}
                      </span>
                    </div>
                    <h3 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                      {s.name}
                    </h3>
                    <p className="mt-3 text-base text-slate-600 leading-relaxed line-clamp-3 flex-1">
                      {s.shortDescription ?? s.description}
                    </p>
                    <div className="mt-6 pt-5 border-t border-slate-200 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Starting from
                        </div>
                        <div className="mt-1 text-xl font-bold text-slate-900">
                          {formatCurrency(s.pricePerPage)}<span className="text-sm font-normal text-slate-500">/{s.pageUnit}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 group-hover:gap-2.5 transition-all">
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== ALL SERVICES BY CATEGORY ===================== */}
      <section id="all-services" className="bg-slate-50 border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Browse</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              All services by category.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              From a quick edit to a multi-chapter thesis. Pick a service to see the price
              by academic level, deliverables, and turnaround time.
            </p>
          </div>

          {categoryList.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="font-semibold text-slate-900">No services yet</h3>
              <p className="mt-1 text-sm text-slate-600">Add services from the admin panel to display them here.</p>
            </Card>
          ) : (
            <div className="space-y-14">
              {categoryList.map(([cat, items]) => {
                const CategoryIcon = categoryIcons[cat] ?? Layers;
                return (
                  <div key={cat}>
                    <div className="flex items-end justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{cat}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {items.length} service{items.length === 1 ? "" : "s"} in this category
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((s) => (
                        <Link
                          key={s.id}
                          href={`/services/${s.slug}`}
                          className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-900 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                              <ServiceIcon name={s.icon} />
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {s.turnaroundDays}d
                            </span>
                          </div>
                          <h4 className="mt-4 text-base font-bold text-slate-900 leading-snug">
                            {s.name}
                          </h4>
                          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {s.shortDescription ?? s.description}
                          </p>
                          <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900">
                              From {formatCurrency(s.pricePerPage)}/{s.pageUnit}
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-500 group-hover:text-slate-900 transition-colors">
                              Details <ArrowUpRight className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===================== PROCESS ===================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x pt-16 md:pt-20 pb-4">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Process</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              How our services work.
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              Every service follows the same clear process. Post a project, get matched with a
              vetted expert, collaborate in-platform, and release payment when you are happy
              with the work.
            </p>
          </div>
        </div>

        <div className="container-x pb-16 md:pb-20">
          <div className="hidden lg:block mb-10">
            <div className="relative">
              <div className="absolute top-5 left-[7%] right-[7%] h-px bg-slate-200" aria-hidden="true" />
              <div className="relative grid grid-cols-4 gap-4">
                {process.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.n} className="flex flex-col items-center text-center">
                      <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center ring-4 ring-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Step {p.n}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">{p.title}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {process.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.n} className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-900 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Step {p.n}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {p.text}
                  </p>
                  <div className="mt-4 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {p.duration}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===================== PROMISES (what's included) ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">What's included</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                Platform promises on every project.
              </h2>
              <p className="mt-4 text-base text-slate-200 leading-relaxed">
                You do not pay extra for the platform features that make expert work safe and
                reliable. These are included on every project, at every academic level.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/calculator"
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-sky-50 transition-colors"
                >
                  Post a project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <ul className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
              {promises.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-white text-indigo-700 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-sm text-slate-200 leading-relaxed">{p.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      {serviceFaqs.length > 0 && (
        <section className="bg-white border-t border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Questions about our services.
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Everything you need to know about pricing, turnaround, revisions, and how the
                process works. Can not find your answer?{" "}
                <Link href="/contact" className="text-slate-900 font-semibold underline underline-offset-2 hover:text-slate-700">Contact our team</Link>.
              </p>
            </div>
            <FaqList
              faqs={serviceFaqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
              variant="flat"
            />
          </div>
        </section>
      )}

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-indigo-800 to-violet-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Request a service</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Can not find what you need?
                </h2>
                <p className="mt-4 text-base text-sky-50/90 max-w-xl leading-relaxed">
                  Send us a brief describing the work. We will match you with the right expert
                  and give you a transparent quote.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-indigo-900 text-[15px] font-semibold hover:bg-sky-50 transition-colors"
                  >
                    Post a project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Have a question?
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 mb-4">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider">Fast turnaround</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { v: "4h", l: "Avg match" },
                      { v: "24h", l: "First draft" },
                      { v: "14d", l: "Revisions" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl bg-white/10 ring-1 ring-white/20 p-4">
                        <div className="text-2xl font-bold tabular-nums">{s.v}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-sky-100">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
