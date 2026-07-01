import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, HelpCircle, Shield, Clock, Award, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getActiveDisciplines, getDisciplineBySlug, getSiteStats } from "@/lib/content";
import { DisciplineIcon, disciplineSlug, splitPipes } from "@/lib/display";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const disciplines = await getActiveDisciplines();
  return disciplines.map((d) => ({ slug: disciplineSlug(d.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getActiveDisciplines();
  const d = all.find((x) => disciplineSlug(x.name) === slug);
  return { title: d?.name ?? "Discipline" };
}

export default async function DisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [all, stats] = await Promise.all([getActiveDisciplines(), getSiteStats()]);
  const discipline = all.find((d) => disciplineSlug(d.name) === slug);
  if (!discipline) notFound();

  const tools = splitPipes(discipline.tools);
  const services = splitPipes(discipline.servicesList);
  const related = all.filter((d) => d.id !== discipline.id).slice(0, 4);
  const totalExperts = stats.find((s) => s.label === "experts")?.value ?? "50+";

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/40 via-emerald-50/20 to-white" />
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="w-full px-4 sm:px-6 lg:px-10 relative pt-10 pb-16 md:pt-14 md:pb-20">
          <div className="max-w-[1440px] mx-auto">
            <Link href="/disciplines" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              All disciplines
            </Link>

            <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/20">
                    <DisciplineIcon name={discipline.icon} className="h-7 w-7" />
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">{discipline.name}</h1>
                </div>
                <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {discipline.longDescription ?? discipline.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600" />
                    {totalExperts} vetted experts
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Match in under 4 hours
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Quality guaranteed
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/dashboard/new">Request help in {discipline.name} <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={`/experts`}>Browse {discipline.name.toLowerCase()} experts</Link>
                  </Button>
                </div>
              </div>

              <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60">
                <Image
                  src={
                    discipline.slug === "science-engineering" ? "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&q=80" :
                    discipline.slug === "medicine-health" ? "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&q=80" :
                    discipline.slug === "business-finance" ? "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=80" :
                    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&q=80"
                  }
                  alt={discipline.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES + TOOLS ===================== */}
      {services.length > 0 ? (
        <section>
          <div className="container-x py-16 md:py-20">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Services</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  What we offer in {discipline.name}.
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Every service is delivered by a credential-checked specialist with domain experience.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <div key={s} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-slate-900">{s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {tools.length > 0 && (
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-base font-bold tracking-tight text-slate-900">Tools & platforms</h3>
                    <p className="mt-1 text-sm text-slate-600">Our experts are proficient in the tools your project demands.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tools.map((t) => (
                        <span key={t} className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
                <Card className="mt-5 p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-xl transition-shadow">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                  <h4 className="mt-3 text-base font-bold">Ready to start?</h4>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Describe your task and we will match you with a {discipline.name.toLowerCase()} expert within 24 hours.
                  </p>
                  <Button asChild className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Link href="/dashboard/new">Request Assistance</Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="container-x py-16 md:py-20">
            <Card className="p-12 text-center max-w-lg mx-auto">
              <HelpCircle className="h-12 w-12 mx-auto text-slate-300" />
              <h3 className="mt-4 font-bold tracking-tight text-slate-900">Services being added</h3>
              <p className="mt-1 text-sm text-slate-600">We are curating services for this discipline. Check back soon or contact us.</p>
              <Button asChild className="mt-6">
                <Link href="/contact">Contact us</Link>
              </Button>
            </Card>
          </div>
        </section>
      )}

      {/* ===================== RELATED DISCIPLINES ===================== */}
      {related.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container-x py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Related fields</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Other disciplines you may need.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((d) => (
                <Link
                  key={d.id}
                  href={`/disciplines/${disciplineSlug(d.name)}`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <DisciplineIcon name={d.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">{d.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Vetted experts available</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{discipline.name}</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Get matched with an expert today.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Post a brief, get matched with a vetted {discipline.name.toLowerCase()} specialist,
                  and start collaborating within hours.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/new"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post a brief <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
