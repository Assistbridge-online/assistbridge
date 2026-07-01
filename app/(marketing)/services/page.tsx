import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles, FileText, BarChart3, Globe, BookOpen, Wrench, MessageSquare, Layers, Award, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveServices, getActiveFaqs } from "@/lib/content";
import { ServiceIcon } from "@/lib/display";
import { formatCurrency } from "@/lib/utils";
import { FaqList } from "@/components/faq-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Services", description: "Browse all services offered by AssistBridge." };

const categoryImages: Record<string, { img: string; alt: string }> = {
  "Editing & Proofreading": {
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    alt: "Notebook with a fountain pen on a wooden desk for editing and proofreading",
  },
  "Academic Writing": {
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    alt: "Research notes and a fountain pen for academic writing",
  },
  "Research Assistance": {
    img: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1200&q=80",
    alt: "Open research books and notebooks for research assistance",
  },
  "Data Analysis": {
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    alt: "Laptop showing charts and data for data analysis",
  },
  "Translation": {
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
    alt: "Person reading a foreign book for translation services",
  },
};

const process = [
  {
    n: "1",
    icon: FileText,
    bg: "bg-emerald-100 text-emerald-700",
    title: "Tell us what you need",
    text: "Fill the brief form with your task, deadline, and any reference files. The more context, the better the match.",
  },
  {
    n: "2",
    icon: BarChart3,
    bg: "bg-amber-100 text-amber-700",
    title: "Get a transparent quote",
    text: "Within hours, you receive a quote from a vetted expert with a clear breakdown of cost and timeline.",
  },
  {
    n: "3",
    icon: MessageSquare,
    bg: "bg-sky-100 text-sky-700",
    title: "Collaborate in-platform",
    text: "Message, share files, request revisions, and track progress from your dashboard. Everything in one place.",
  },
  {
    n: "4",
    icon: Award,
    bg: "bg-violet-100 text-violet-700",
    title: "Approve and release payment",
    text: "Once you are happy with the final work, approve the delivery. Funds release to the expert.",
  },
];

const benefits = [
  { icon: Sparkles, bg: "bg-emerald-100 text-emerald-700", t: "Transparent pricing", d: "You receive a quote before any payment. No hourly surprises, no hidden fees." },
  { icon: Layers, bg: "bg-amber-100 text-amber-700", t: "Milestone-based", d: "Larger projects can be split into milestones with phased payments for control." },
  { icon: Clock, bg: "bg-sky-100 text-sky-700", t: "On-time delivery", d: "Most tasks are delivered on or before the agreed deadline, with live progress updates." },
  { icon: Award, bg: "bg-violet-100 text-violet-700", t: "Money-back guarantee", d: "If the delivered work does not meet the brief, we will issue a full or partial refund." },
];

export default async function ServicesPage() {
  const [services, allFaqs] = await Promise.all([getActiveServices(), getActiveFaqs()]);
  const serviceFaqs = allFaqs.filter((f) => f.category === "Services");

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Our services</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                Every service you need, under one roof.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                All services are priced <strong>per page, slide, sheet, or hour</strong>. You see the exact
                cost before paying. Submit a request and we will match you with the right expert.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/calculator"><span className="inline-flex items-center gap-2">Post a project <ArrowRight className="h-4 w-4" /></span></Link>
                </Button>
                <Button asChild size="lg" variant="outline"><Link href="/pricing"><span>See pricing</span></Link></Button>
              </div>
            </div>
            <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60">
              <Image
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80"
                alt="Open notebook with a fountain pen and research materials on a desk"
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

      {/* ===================== FEATURED + GRID ===================== */}
      {services.length === 0 ? (
        <section>
          <div className="container-x py-16">
            <Card className="p-12 text-center">
              <h3 className="mt-4 font-semibold text-slate-900">No services yet</h3>
              <p className="mt-1 text-sm text-slate-600">Add services from the admin panel to display them here.</p>
            </Card>
          </div>
        </section>
      ) : (
        <>
          {/* Featured services by category */}
          <section>
            <div className="container-x py-16 md:py-20">
              <div className="max-w-2xl mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Browse</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  All services by category.
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  From a quick edit to a multi-chapter thesis. Pick a service to see the price
                  by academic level, deliverables, and turnaround time.
                </p>
              </div>

              {(() => {
                const categories = new Map<string, typeof services>();
                for (const s of services) {
                  const arr = categories.get(s.category) ?? [];
                  arr.push(s);
                  categories.set(s.category, arr);
                }
                return Array.from(categories.entries()).map(([cat, items], idx) => {
                  const cfg = categoryImages[cat] ?? { img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80", alt: `${cat} workspace` };
                  const featured = items[0];
                  const rest = items.slice(1);
                  return (
                    <div key={cat} className={idx > 0 ? "mt-16" : ""}>
                      <div className="flex items-end justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{cat}</h3>
                          <p className="mt-1 text-sm text-slate-500">{items.length} service{items.length === 1 ? "" : "s"} in this category</p>
                        </div>
                      </div>
                      <div className="grid lg:grid-cols-12 gap-5">
                        <Link
                          href={`/services/${featured.slug}`}
                          className="lg:col-span-7 group relative overflow-hidden rounded-2xl ring-1 ring-slate-200/60 min-h-[280px] flex flex-col justify-end"
                        >
                          <div className="absolute inset-0">
                            <Image
                              src={cfg.img}
                              alt={cfg.alt}
                              fill
                              sizes="(max-width: 1024px) 100vw, 58vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/20" />
                          </div>
                          <div className="relative p-6 md:p-8 text-white">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 font-bold">Featured</div>
                            <h4 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">{featured.name}</h4>
                            <p className="mt-2 text-sm text-slate-200 max-w-md leading-relaxed line-clamp-2">
                              {featured.shortDescription ?? featured.description}
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 group-hover:gap-2.5 transition-all">
                              Explore service <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </Link>
                        <div className="lg:col-span-5 grid sm:grid-cols-2 gap-3">
                          {rest.slice(0, 4).map((s) => (
                            <Link
                              key={s.id}
                              href={`/services/${s.slug}`}
                              className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition"
                            >
                              <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                                <ServiceIcon name={s.icon} />
                              </div>
                              <h4 className="mt-3 text-sm font-bold text-slate-900">{s.name}</h4>
                              <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {s.shortDescription ?? s.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                      {rest.length > 4 && (
                        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {rest.slice(4).map((s) => (
                            <Link
                              key={s.id}
                              href={`/services/${s.slug}`}
                              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 transition"
                            >
                              <div className="h-9 w-9 rounded-md bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <ServiceIcon name={s.icon} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 truncate">{s.name}</div>
                                <div className="text-xs text-slate-500">Pricing by academic level</div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all ml-auto shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        </>
      )}

      {/* ===================== HOW SERVICES WORK ===================== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Process</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              How our services work.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every service follows the same clear process. Post a project, get matched with a vetted
              expert, collaborate in-platform, and release payment when you are happy with the work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${p.bg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="absolute top-6 right-6 text-3xl font-bold text-slate-200 leading-none">{p.n}</div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== WHAT YOU GET ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60 order-2 lg:order-1">
              <Image
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&q=80"
                alt="Professional working at a desk with documents and laptop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What you get</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Included with every service.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                You do not pay extra for the platform features that make expert work safe and
                reliable. These are included on every project, at every academic level.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.t} className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${b.bg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{b.t}</div>
                        <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">{b.d}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      {serviceFaqs.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Questions about our services.
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Everything you need to know about pricing, turnaround, revisions, and how the
                process works. Can not find your answer?{" "}
                <Link href="/contact" className="text-emerald-700 font-semibold hover:text-emerald-800">Contact our team</Link>.
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
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Request a service</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Can not find what you need?
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Send us a brief describing the work. We will match you with the right expert
                  and give you a transparent quote.
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
                    Have a question?
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

