import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, HelpCircle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveDisciplines, getSiteStats } from "@/lib/content";
import { DisciplineIcon, disciplineSlug, splitPipes } from "@/lib/display";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getActiveDisciplines();
  const d = all.find((x) => disciplineSlug(x.name) === slug);
  if (!d) return { title: "Discipline not found" };
  return { title: d.name, description: `Vetted experts in ${d.name} — research, writing, data analysis, and more.` };
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
    <div className="bg-white">
      {/* ===================== BREADCRUMBS ===================== */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/disciplines" className="hover:text-gray-900">Disciplines</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium">{discipline.name}</span>
          </div>
        </div>
      </div>

      {/* ===================== PAGE HEADER ===================== */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <DisciplineIcon name={discipline.icon} className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{discipline.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{totalExperts} vetted experts available</p>
            </div>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl">
            {discipline.longDescription ?? discipline.description}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Button asChild>
              <Link href="/calculator">Request help in {discipline.name}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/experts">Browse {discipline.name.toLowerCase()} experts</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ===================== CONTENT + SIDEBAR ===================== */}
      {services.length > 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What we offer in {discipline.name}</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {services.map((s) => (
                  <div key={s} className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-200 bg-white">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside>
              <div className="lg:sticky lg:top-24 space-y-5">
                {tools.length > 0 && (
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Tools & platforms</h3>
                    <p className="text-xs text-gray-600 mb-3">Our experts are proficient in these tools.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((t) => (
                        <span key={t} className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-5 bg-gray-900 text-white">
                  <h4 className="text-sm font-semibold">Ready to start?</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Describe your task and we will match you with a {discipline.name.toLowerCase()} expert within 24 hours.
                  </p>
                  <Button asChild className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Link href="/calculator">Request assistance</Link>
                  </Button>
                </Card>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Have a question?</Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Card className="p-12 text-center max-w-lg mx-auto">
            <HelpCircle className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 font-bold text-gray-900">Services being added</h3>
            <p className="mt-1 text-sm text-gray-600">We are curating services for this discipline. Check back soon or contact us.</p>
            <Button asChild className="mt-6">
              <Link href="/contact">Contact us</Link>
            </Button>
          </Card>
        </div>
      )}

      {/* ===================== RELATED DISCIPLINES ===================== */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other disciplines you may need</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((d) => (
                <Link
                  key={d.id}
                  href={`/disciplines/${disciplineSlug(d.name)}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm transition"
                >
                  <div className="h-9 w-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                    <DisciplineIcon name={d.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">{d.name}</div>
                    <div className="text-xs text-gray-500">Vetted experts available</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

