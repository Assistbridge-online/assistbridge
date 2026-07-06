import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Search,
  Star,
  User,
  Users,
  BookOpen,
  Clock,
  Shield,
  Sparkles,
  Globe,
  Award,
  FileCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingTopics } from "@/components/trending-topics";

import {
  getActiveDisciplines,
  getActiveServices,
  getActiveTestimonials,
  getPublishedPosts,
  getSiteStats,
} from "@/lib/content";
import { DisciplineIcon, ServiceIcon, disciplineSlug } from "@/lib/display";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const statLabels: Record<string, string> = {
  disciplines: "Disciplines covered",
  experts: "Vetted experts",
  tasks: "Tasks completed",
  countries: "Countries served",
};

export default async function HomePage() {
  const results = await Promise.allSettled([
    getActiveDisciplines(),
    getActiveServices(),
    getActiveTestimonials(),
    getSiteStats(),
    getPublishedPosts(),
  ]);
  const disciplines = results[0].status === "fulfilled" ? results[0].value : [];
  const services = results[1].status === "fulfilled" ? results[1].value : [];
  const testimonials = results[2].status === "fulfilled" ? results[2].value : [];
  const stats = results[3].status === "fulfilled" ? results[3].value : [];
  const posts = results[4].status === "fulfilled" ? results[4].value : [];
  const latestPosts = posts.slice(0, 3);

  const steps = [
    {
      n: "01",
      icon: FileCheck,
      iconBg: "bg-emerald-100 text-emerald-700",
      t: "Post your project",
      d: "Describe what you need, the deadline, your budget, and any reference files. The more context, the better the match.",
      points: ["Structured brief form", "Attach reference files", "Set deadline and budget"],
      img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80",
      alt: "Open notebook with a pen and a coffee cup on a wooden desk",
    },
    {
      n: "02",
      icon: Search,
      iconBg: "bg-amber-100 text-amber-700",
      t: "Get matched with a vetted expert",
      d: "Within hours, you receive quotes from pre-vetted experts. Compare profiles, ratings, and pricing, then pick the one you trust.",
      points: ["1–3 expert proposals", "Transparent fixed pricing", "Ratings and sample work visible"],
      img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80",
      alt: "Two professionals reviewing project details on a tablet",
    },
    {
      n: "03",
      icon: CreditCard,
      iconBg: "bg-sky-100 text-sky-700",
      t: "Pay securely and start",
d: "Once you approve the quote, you pay through Stripe or Paystack. Your expert is notified and starts work immediately. We never see your card details.",
      points: ["Pay via Stripe or Paystack", "Payment held until approval", "Expert starts work"],
      img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80",
      alt: "Hand holding a credit card over a secure online checkout form",
    },
    {
      n: "04",
      icon: MessageSquare,
      iconBg: "bg-violet-100 text-violet-700",
      t: "Collaborate and track progress",
      d: "Message your expert, share files, get draft deliveries, and request revisions. You see progress updates in your dashboard so you always know where things stand.",
      points: ["Message in-platform", "Share files securely", "Get progress updates"],
      img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=80",
      alt: "Laptop screen showing a project dashboard with charts and progress tracking",
    },
    {
      n: "05",
      icon: CheckCircle2,
      iconBg: "bg-rose-100 text-rose-700",
      t: "Approve and release payment",
      d: "When you are happy with the work, approve the final delivery. Payment releases to your expert. You have 14 days to request revisions if anything needs tweaking.",
      points: ["Review final delivery", "Release payment", "14 days for revisions"],
      img: "https://images.unsplash.com/photo-1606326608690-4e0281b1e588?w=900&q=80",
      alt: "Hands signing and stamping a finished document on a desk",
    },
  ];

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-emerald-50/20 to-white" />
        <div className="absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute top-0 -right-40 -z-10 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-primary-200/30 via-accent-200/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-200/30 via-primary-100/30 to-transparent blur-3xl" />

        <div className="w-full px-4 sm:px-6 lg:px-10 relative pt-10 pb-16 md:pt-14 md:pb-20">
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-[1fr_1.25fr] gap-10 items-stretch">
            <div className="animate-fade-in flex flex-col justify-center h-full lg:pl-10">
              <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                AssistBridge:
                <span className="block sm:inline">
                  {" "}the expert
                </span>
                <br className="hidden sm:block" />{" "}
                <span>
                  you need,{" "}
                <span className="relative inline-block">
                  <span className="gradient-text">on call.</span>
                  <svg
                    viewBox="0 0 200 8"
                    className="absolute -bottom-1 left-0 w-full h-2 text-emerald-500 animate-hero-underline"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5 Q 50 1, 100 4 T 198 3"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                </span>
              </h1>

              <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-xl">
                Send your brief at 9am. Have a qualified specialist working on it by lunch.
                From a 3-page statistical analysis to a 60-slide investor deck. Pay by the page,
                keep the work, and release the funds only when you&apos;re happy.
              </p>

              <ul className="mt-6 flex flex-col gap-2.5 max-w-md">
                {[
                  { text: "Free to post. Pay only when you accept the work", em: "Pay only" },
                  { text: "Most matches happen in under 4 hours", em: "under 4 hours" },
                  { text: "14 days to request revisions, no questions asked", em: "14 days" },
                  { text: "Full refund if the work misses the brief", em: "Full refund" },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span>
                      {item.text.split(item.em).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <strong className="text-slate-900 font-semibold">{item.em}</strong>}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/calculator"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-slate-900 text-white text-[15px] font-semibold shadow-sm shadow-slate-900/10 hover:bg-primary-800 hover:shadow-lg hover:shadow-primary-700/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  <span>Post a project</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/experts"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-emerald-600 text-white text-[15px] font-semibold border border-emerald-700 shadow-sm shadow-emerald-600/20 hover:bg-accent-600 hover:border-accent-700 hover:shadow-md hover:shadow-accent-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Search className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  <span>Browse experts</span>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in h-full">
              <div className="relative h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1400&q=80"
                  alt="Workspace with a laptop and notebook in soft natural light"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS (magazine alternating) ===================== */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container-x py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              From brief to delivery. In five clear steps.
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              We have stripped the friction out of getting expert help. No bidding wars,
              no opaque pricing, no disappearing freelancers. Just a clear, professional process.
            </p>
          </div>

          <div className="mt-12 space-y-20">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="grid lg:grid-cols-2 gap-10 items-center"
                >
                  <div className={`relative ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60">
                      <Image
                        src={s.img}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-5 -right-5 lg:-right-6 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 px-5 py-4 hidden sm:flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step {s.n}</div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{s.t}</div>
                      </div>
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {s.n}
                      </span>
                      Step {s.n}
                    </div>
                    <h3 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                      {s.t}
                    </h3>
                    <p className="mt-4 text-base text-slate-600 leading-relaxed">
                      {s.d}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <LinkButton href="/how-it-works" size="lg" variant="outline">
              Read the full process <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES (featured + grid) ===================== */}
      {services.length > 0 && (
        <section>
          <div className="container-x py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What we do</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Services tailored to your discipline.
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  From a quick data cleanup to a multi-chapter thesis. We have an expert for that.
                </p>
              </div>
              {services.length > 6 && (
                <Link
                  href="/services"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 shrink-0"
                >
                  All {services.length} services <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {services.slice(0, 1).map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="lg:col-span-7 group relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 md:p-10 min-h-[320px] flex flex-col justify-end"
                >
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80"
                      alt="Research notes and a fountain pen on a writing pad"
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                  </div>
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 font-bold">Featured service</div>
                    <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">{s.name}</h3>
                    <p className="mt-2 text-sm text-slate-300 max-w-md leading-relaxed line-clamp-2">
                      {s.shortDescription ?? s.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 group-hover:gap-2.5 transition-all">
                      Explore service <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}

              <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
                {services.slice(1, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                      <ServiceIcon name={s.icon} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900">{s.name}</h3>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {s.shortDescription ?? s.description}
                    </p>
                    <div className="mt-4 text-xs text-slate-500">Pricing varies by academic level</div>
                  </Link>
                ))}
              </div>
            </div>

            {services.length > 5 && (
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.slice(5, 9).map((s) => (
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
        </section>
      )}

      {/* ===================== DISCIPLINES (categorized) ===================== */}
      {disciplines.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Coverage</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Every major academic and professional discipline.
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Browse by field. Each discipline has dedicated, credential-checked experts
                ready to take on your project.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {disciplines.map((d, i) => {
                const isLarge = i % 6 === 0 || i % 6 === 3;
                return (
                  <Link
                    key={d.id}
                    href={`/disciplines/${disciplineSlug(d.name)}`}
                    className={
                      "group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg " +
                      (isLarge ? "sm:col-span-2 lg:col-span-1 sm:flex-row sm:items-center" : "")
                    }
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-600 transition-colors">
                      <DisciplineIcon name={d.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold tracking-tight text-slate-900">{d.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">Vetted experts available</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== WHY ASSISTBRIDGE (stats + image) ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1000&q=80"
                  alt="Team collaborating around a laptop in a modern workspace"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 lg:-left-6 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 px-6 py-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">100% payment protection</div>
                    <div className="text-xs text-slate-500">Funds released on approval</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Why AssistBridge</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Built for trust, speed, and quality.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Every part of the process is designed to protect both sides. Your money,
                your data, and your time. Here&apos;s how.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { i: <Shield className="h-5 w-5" />, t: "Vetted experts", d: "Every expert is interviewed, credential-checked, and trial-reviewed." },
                  { i: <Globe className="h-5 w-5" />, t: "Global reach", d: "Serving clients in 60+ countries with multi-currency support." },
                  { i: <Clock className="h-5 w-5" />, t: "On-time delivery", d: "Deadlines you can rely on. Live progress updates in your dashboard." },
                  { i: <Award className="h-5 w-5" />, t: "Quality guaranteed", d: "14-day revision window. Not happy? Open a dispute and we&apos;ll make it right." },
                ].map((f) => (
                  <div key={f.t} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      {f.i}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{f.t}</div>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {stats.length > 0 && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-200 pt-10">
              {stats.map((s) => (
                <div key={s.id} className="text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{s.value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {statLabels[s.label] ?? s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Client stories</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Trusted by students, researchers, and teams.
              </h2>
            </div>
            <div className="mt-10">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* ===================== LATEST FROM OUR BLOG ===================== */}
      {latestPosts.length > 0 && (
        <section>
          <div className="container-x py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">From the blog</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Field notes and expert takes.
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Practical guides, expert interviews, and lessons learned from the work we do every day.
                </p>
              </div>
              <Link
                href="/blog"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 shrink-0"
              >
                View all articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-7">
              {latestPosts.map((p) => (
                <article key={p.id} className="group bg-white">
                  <Link href={`/blog/${p.slug}`} className="block">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-sm bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {p.category}
                      </span>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {p.excerpt}
                      </p>
                      <div className="mt-4 pb-5 border-b border-slate-200 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-slate-700 font-medium">AssistBridge</span>
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {p.publishedAt ? formatDate(p.publishedAt) : "Draft"}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {p.readTime}
                        </span>
                      </div>
                      <div className="mt-4 pb-6">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-900 group-hover:gap-2.5 transition-all">
                          Continue Reading <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TRENDING TOPICS ===================== */}
      <TrendingTopics />

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
                  Ready when you are. No commitment, no card.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Post your first project in under five minutes. Get matched with a vetted
                  expert, pay securely through Stripe or Paystack, and release payment only when the
                  work is done.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post your first project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                  alt="Two people working together at a desk"
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


