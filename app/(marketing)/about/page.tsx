import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Target,
  Heart,
  Globe,
  Award,
  Users,
  Lightbulb,
  Compass,
  Shield,
  Briefcase,
  MapPin,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveTestimonials, getSiteStats } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "About",
  description: "How AssistBridge got started, what we believe, and how we work.",
};

export default async function AboutPage() {
  const [testimonials, stats] = await Promise.all([
    getActiveTestimonials(),
    getSiteStats(),
  ]);

  const statValues = Object.fromEntries(stats.map((s) => [s.label, s.value]));
  const disciplines = statValues.disciplines ?? "12";
  const experts = statValues.experts ?? "250+";
  const tasks = statValues.tasks ?? "1,200+";
  const countries = statValues.countries ?? "60+";

  const values = [
    {
      i: <Target className="h-5 w-5" />,
      t: "Quality over volume",
      d: "We turn down more work than we accept. The experts who join our network go through a 3-step vetting process, and the briefs that come in are matched carefully, not assigned automatically.",
    },
    {
      i: <Heart className="h-5 w-5" />,
      t: "Honest about the hard parts",
      d: "Expert work has real trade-offs. Some tasks take longer than expected, some need revisions, some need a different expert. We communicate these trade-offs up front instead of hiding them.",
    },
    {
      i: <Shield className="h-5 w-5" />,
      t: "We only release payment with your approval",
      d: "Payments are held until you approve the work. If something goes wrong, payment stays on hold until we work out a resolution. Both sides know exactly when money moves and why.",
    },
    {
      i: <Compass className="h-5 w-5" />,
      t: "Built for the long term",
      d: "Most of our experts have been with us for 2+ years. Most of our clients come back. We would rather build a relationship-based platform than a one-off marketplace.",
    },
  ];

  const milestones = [
    {
      year: "2022",
      t: "Started as a shared spreadsheet",
      d: "Before AssistBridge existed, our founding team kept a shared spreadsheet of experts we had personally vetted. We would refer them to friends and colleagues. That informal list became the first version of the platform.",
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80",
    },
    {
      year: "2023",
      t: "First paid task, first dispute",
      d: "We launched a private beta in March 2023 with a small group of vetted experts across 4 disciplines. The first month, we processed 40 tasks. The first dispute came in week 6. We learned more from that one dispute than from the 40 successful tasks combined.",
      img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80",
    },
    {
      year: "2024",
      t: "Public launch, 12 disciplines",
      d: "We opened the platform publicly in January 2024. By the end of the year, we had crossed 1,000 completed tasks and expanded to 12 disciplines spanning sciences, humanities, business, and creative work.",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    },
    {
      year: "2025",
      t: "Today: still building",
      d: `We work with ${experts} vetted experts in ${countries} countries. About 70% of our clients come back for a second project. We still process every dispute personally, and we still write most of our own copy. We have a lot left to build.`,
      img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=80",
    },
  ];

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="container-x relative py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              We started {siteConfig.name} because the alternatives were bad.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Freelancing platforms were a coin flip. Agencies took 40 to 60 percent off the top.
              And everyone we knew in research, engineering, and operations had at least one
              story of a project that went sideways. We thought we could do better.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Fully remote
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Small team
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                Bootstrapped
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="border-y border-slate-200 bg-white">
        <div className="container-x py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: experts, l: "Vetted experts", s: "Each one interviewed, credential-checked, and trial-reviewed" },
              { v: disciplines, l: "Disciplines", s: "From physics to philosophy, economics to engineering" },
              { v: tasks, l: "Tasks delivered", s: "From 1-page edits to multi-month research collaborations" },
              { v: countries, l: "Countries", s: "Clients on every inhabited continent" },
            ].map((s) => (
              <div key={s.l} className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{s.v}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{s.l}</div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[14rem] mx-auto md:mx-0">{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TIMELINE ===================== */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Our story</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              How we got here.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              A short history. We are not the kind of company that pretends everything was
              always going according to plan. Here is what actually happened.
            </p>
          </div>

          <div className="space-y-16">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/60">
                    <Image
                      src={m.img}
                      alt={m.t}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="text-sm font-bold uppercase tracking-wider text-emerald-700">{m.year}</div>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{m.t}</h3>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">{m.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MISSION & VISION ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="rounded-2xl bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary-500/10 blur-3xl" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">What we are trying to do</h3>
                <p className="mt-3 text-slate-300 leading-relaxed">
                  Make it possible for anyone, anywhere, to get expert help on the work that
                  matters to them. We focus on the parts that existing platforms get wrong:
                  matching quality, fair expert pay, and honest dispute resolution.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 md:p-10 relative overflow-hidden">
              <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">What we are working toward</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                A future where finding the right expert for a project is as easy as finding a
                good restaurant. Where experts can build sustainable careers on platforms
                that actually have their back. Where the work gets done right the first time,
                more often than not.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {[
                  "An expert network of 1,000+ vetted specialists across 20+ disciplines",
                  "Average match time under 2 hours for most task types",
                  "Dispute resolution handled by humans, within 24 hours",
                ].map((g) => (
                  <li key={g} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VALUES ===================== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What we stand for</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Four things we keep coming back to.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                We do not have a poster of core values on the wall. We have a few principles
                that come up in every hard decision. These are the ones we keep coming back to.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {values.map((v) => (
                <Card key={v.t} className="p-6 hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    {v.i}
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{v.t}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{v.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW WE WORK ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How we work</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                A small team, no layers, fast decisions.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                We are a small team. There is no customer support department because everyone
                handles support. The person who approves your expert is the same person who
                handles the dispute if something goes wrong.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  "Everyone on the team is in the on-call rotation for support",
                  "We answer most messages within 2 hours during business hours",
                  "We publish a public status page for any platform incidents",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/60">
              <Image
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80"
                alt="Team collaborating around a table with laptops"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute -bottom-4 -right-4 lg:-right-6 bg-white rounded-2xl shadow-2xl px-4 py-3 hidden sm:flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Small remote team</div>
                  <div className="text-xs text-slate-500">Async-first, no meetings before noon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">In their words</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                What people actually say about us.
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                We do not cherry-pick. These are unedited quotes from clients and experts
                who agreed to be quoted. We have more in our archive if you want them.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <Card key={t.id} className="p-6 hover:shadow-md transition-shadow">
                  <p className="text-slate-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                    <Image
                      src={`https://i.pravatar.cc/100?img=${t.avatarSeed ?? 1}`}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.role}{t.country ? ` · ${t.country}` : ""}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== CONTACT INFO ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Get in touch</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Where to reach us.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Pick the channel that fits. We answer most messages within one business day.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {[
              {
                i: <Mail className="h-5 w-5" />,
                t: "Press & partnerships",
                v: "press@assistbridge.online",
                d: "For media inquiries, podcast appearances, and partnership discussions.",
              },
              {
                i: <Briefcase className="h-5 w-5" />,
                t: "Careers",
                v: "careers@assistbridge.online",
                d: "We are a small team and add roles slowly. Send a sample of your work and a note on what you would want to work on.",
              },
              {
                i: <Mail className="h-5 w-5" />,
                t: "Support",
                v: siteConfig.email,
                d: "For client or expert support. We answer within 1 business day, usually faster.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  {c.i}
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{c.t}</h3>
                <a href={`mailto:${c.v}`} className="mt-1 text-sm text-slate-700 font-medium hover:text-emerald-700 hover:underline">{c.v}</a>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{c.d}</p>
              </div>
            ))}
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
                  Try us on something small first.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  We do not expect you to commit to a big project on your first try. Post a
                  small task, see how it goes. If the work is good, we will be here when you
                  need us again.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/new"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post a brief <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/become-an-expert"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Apply to be an expert
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80"
                  alt="Person working at a desk with a laptop"
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
