import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Shield, Globe, Clock, Award, Sparkles, Plus } from "lucide-react";
import { getActiveDisciplines, getActiveServices, getSiteStats } from "@/lib/content";
import { DisciplineIcon, disciplineSlug } from "@/lib/display";

export const dynamic = "force-dynamic";

export const metadata = { title: "Disciplines", description: "Every discipline covered by AssistBridge." };

export default async function DisciplinesPage() {
  const [disciplines, services, stats] = await Promise.all([
    getActiveDisciplines(),
    getActiveServices(),
    getSiteStats(),
  ]);

  const totalServices = services.length;
  const totalExperts = stats.find((s) => s.label === "experts")?.value ?? "50+";
  const totalCountries = stats.find((s) => s.label === "countries")?.value ?? "60+";

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Disciplines</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Every major discipline. Covered.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              From quantum physics to qualitative sociology. From structural engineering to
              UX research. We vet specialists across every major academic and professional
              discipline so you find the right expert, fast.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-6">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{disciplines.length}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">Disciplines</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{totalServices}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{totalExperts}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">Vetted experts</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{totalCountries}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ALL DISCIPLINES ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Full catalog</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Browse by field.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Each discipline has dedicated, credential-checked experts ready to take on your project.
              We are adding new fields every month.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {disciplines.map((d) => (
              <Link
                key={d.id}
                href={`/disciplines/${disciplineSlug(d.name)}`}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shrink-0 group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all duration-300">
                  <DisciplineIcon name={d.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900">{d.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>
            ))}
            <Link
              href="/dashboard/new"
              className="group flex items-start gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="h-11 w-11 rounded-lg bg-slate-200 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-all">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">Don&apos;t see your discipline?</div>
                <div className="mt-0.5 text-xs text-slate-500 leading-relaxed">Post a brief and we&apos;ll find an expert within 24 hours.</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&q=80"
                  alt="Team working together in a modern office"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Why it works</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Experts, not generalists.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Every expert is vetted for domain expertise, communication, and reliability.
                You get matched with someone who actually works in your field.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { i: <Shield className="h-5 w-5" />, t: "Vetted specialists", d: "Credential checks, portfolio reviews, and trial projects for every expert." },
                  { i: <Search className="h-5 w-5" />, t: "Live expert directory", d: "Browse 50+ profiles with ratings, bios, and sample work before you buy." },
                  { i: <Globe className="h-5 w-5" />, t: "Worldwide coverage", d: "Serving clients across 60+ countries with multi-currency support." },
                  { i: <Clock className="h-5 w-5" />, t: "Match in hours", d: "Most briefs get matched with a qualified expert within 4 hours." },
                  { i: <Award className="h-5 w-5" />, t: "Publication-ready", d: "Work meets academic and professional standards. 14-day revision window." },
                  { i: <Sparkles className="h-5 w-5" />, t: "No commitment", d: "Post a brief for free. Pay only when you accept the quote." },
                ].map((f) => (
                  <div key={f.t} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      {f.i}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{f.t}</div>
                      <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Don't see your field?</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  We add new disciplines every month.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  If your project falls outside our listed disciplines, post a brief with a
                  description and we will find an expert for you, usually within 24 hours.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/new"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post a brief <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
