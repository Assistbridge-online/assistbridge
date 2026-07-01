"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, CheckCircle2, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DISCIPLINES } from "@/lib/utils";

// Initials helper (no children's photos used anywhere)
const i = (a: string, b: string) => `${a[0]}${b[0]}`.toUpperCase();

// Use a stable pool of adult portrait photos. The `randomuser.me` API
// exposes adult user portraits only and lets us pin a specific photo by
// seed. We map each expert to a deterministic seed so the same expert
// always shows the same face across renders.
const photo = (seed: number) => `https://randomuser.me/api/portraits/${seed % 2 === 0 ? "men" : "women"}/${(seed * 17) % 90}.jpg`;

const experts: {
  id: number;
  name: string;
  headline: string;
  initials: string;
  country: string;
  rating: number;
  jobs: number;
  expertise: string[];
  photoSeed: number;
}[] = [
  { id: 1,  name: "Dr. Sarah Chen",         headline: "Biostatistician, PhD",            initials: i("S","C"), country: "Singapore",  rating: 4.9, jobs: 87,  expertise: ["Mathematics & Statistics", "Medicine & Health"], photoSeed: 11 },
  { id: 2,  name: "James O'Brien",         headline: "Full-stack engineer",              initials: i("J","O"), country: "Ireland",    rating: 5.0, jobs: 124, expertise: ["Technology & Computing"], photoSeed: 22 },
  { id: 3,  name: "Aisha Mwangi",           headline: "Economist, MA Oxford",             initials: i("A","M"), country: "Kenya",      rating: 4.8, jobs: 56,  expertise: ["Business & Finance", "Humanities & Social Sciences"], photoSeed: 33 },
  { id: 4,  name: "Marco Rossi",            headline: "Mechanical engineer",              initials: i("M","R"), country: "Italy",      rating: 4.9, jobs: 73,  expertise: ["Science & Engineering"], photoSeed: 44 },
  { id: 5,  name: "Hana Yamada",           headline: "Linguist and translator",          initials: i("H","Y"), country: "Japan",      rating: 4.9, jobs: 91,  expertise: ["Humanities & Social Sciences"], photoSeed: 55 },
  { id: 6,  name: "Liam Foster",            headline: "Data scientist",                  initials: i("L","F"), country: "Australia",  rating: 4.7, jobs: 48,  expertise: ["Technology & Computing", "Mathematics & Statistics"], photoSeed: 66 },
  { id: 7,  name: "Sofia Garcia",           headline: "Graphic designer, MFA",           initials: i("S","G"), country: "Spain",      rating: 5.0, jobs: 102, expertise: ["Arts & Design"], photoSeed: 77 },
  { id: 8,  name: "Daniel Kruger",          headline: "Lawyer, LLM",                      initials: i("D","K"), country: "Germany",    rating: 4.8, jobs: 39,  expertise: ["Law & Policy"], photoSeed: 88 },
  { id: 9,  name: "Priya Nair",             headline: "Mechanical engineer, MTech",      initials: i("P","N"), country: "India",      rating: 4.7, jobs: 64,  expertise: ["Science & Engineering"], photoSeed: 13 },
  { id: 10, name: "Lucas Almeida",          headline: "Software architect",              initials: i("L","A"), country: "Brazil",     rating: 4.9, jobs: 88,  expertise: ["Technology & Computing"], photoSeed: 24 },
  { id: 11, name: "Dr. Amelia Hart",        headline: "Clinical psychologist, PhD",        initials: i("A","H"), country: "United Kingdom", rating: 4.9, jobs: 52, expertise: ["Medicine & Health", "Humanities & Social Sciences"], photoSeed: 35 },
  { id: 12, name: "Noah Bergstrom",         headline: "Mechanical design engineer",      initials: i("N","B"), country: "Sweden",     rating: 4.6, jobs: 41,  expertise: ["Science & Engineering"], photoSeed: 46 },
  { id: 13, name: "Yuki Watanabe",         headline: "Frontend engineer",               initials: i("Y","W"), country: "Japan",      rating: 4.8, jobs: 79,  expertise: ["Technology & Computing", "Arts & Design"], photoSeed: 57 },
  { id: 14, name: "Camila Restrepo",        headline: "Public health researcher, MPH",    initials: i("C","R"), country: "Colombia",   rating: 4.9, jobs: 67,  expertise: ["Medicine & Health"], photoSeed: 68 },
  { id: 15, name: "Tomas Novak",            headline: "Backend engineer",                initials: i("T","N"), country: "Czech Republic", rating: 4.7, jobs: 58, expertise: ["Technology & Computing"], photoSeed: 79 },
  { id: 16, name: "Dr. Olivia Mensah",      headline: "Public health, DrPH",              initials: i("O","M"), country: "Ghana",      rating: 5.0, jobs: 34,  expertise: ["Medicine & Health"], photoSeed: 12 },
  { id: 17, name: "Henrik Larsson",         headline: "Renewable energy engineer",        initials: i("H","L"), country: "Denmark",    rating: 4.8, jobs: 49,  expertise: ["Science & Engineering"], photoSeed: 23 },
  { id: 18, name: "Mei Lin Zhao",           headline: "Mandarin and Cantonese translator", initials: i("M","Z"), country: "China",      rating: 4.9, jobs: 92,  expertise: ["Humanities & Social Sciences"], photoSeed: 34 },
  { id: 19, name: "Elena Petrova",          headline: "Marketing analyst",               initials: i("E","P"), country: "Bulgaria",   rating: 4.7, jobs: 63,  expertise: ["Business & Finance"], photoSeed: 45 },
  { id: 20, name: "Khalid Rahman",          headline: "Renewable energy engineer, MSc",   initials: i("K","R"), country: "Bangladesh", rating: 4.6, jobs: 38,  expertise: ["Science & Engineering"], photoSeed: 56 },
  { id: 21, name: "Dr. Wei Zhang",          headline: "PhD in pure mathematics",         initials: i("W","Z"), country: "Singapore",  rating: 4.9, jobs: 44,  expertise: ["Mathematics & Statistics"], photoSeed: 67 },
  { id: 22, name: "Beatriz Costa",          headline: "UX researcher",                   initials: i("B","C"), country: "Portugal",   rating: 4.8, jobs: 55,  expertise: ["Arts & Design", "Humanities & Social Sciences"], photoSeed: 78 },
  { id: 23, name: "Felix Schmidt",          headline: "Civil engineer",                  initials: i("F","S"), country: "Austria",    rating: 4.7, jobs: 71,  expertise: ["Science & Engineering"], photoSeed: 89 },
  { id: 24, name: "Aaliyah Khan",           headline: "Pharmacist, PharmD",              initials: i("A","K"), country: "Pakistan",   rating: 4.9, jobs: 29,  expertise: ["Medicine & Health"], photoSeed: 14 },
  { id: 25, name: "Lucia Bianchi",          headline: "Italian translator",              initials: i("L","B"), country: "Italy",      rating: 4.8, jobs: 86,  expertise: ["Humanities & Social Sciences"], photoSeed: 25 },
  { id: 26, name: "Theo van den Berg",      headline: "Quantitative analyst",             initials: i("T","V"), country: "Netherlands", rating: 4.7, jobs: 47,  expertise: ["Mathematics & Statistics", "Business & Finance"], photoSeed: 36 },
  { id: 27, name: "Rina Patel",             headline: "Mobile app developer",            initials: i("R","P"), country: "India",      rating: 4.8, jobs: 81,  expertise: ["Technology & Computing"], photoSeed: 47 },
  { id: 28, name: "Dr. Magnus Berg",        headline: "PhD, organic chemistry",          initials: i("M","B"), country: "Norway",     rating: 4.9, jobs: 36,  expertise: ["Science & Engineering"], photoSeed: 58 },
  { id: 29, name: "Amara Diallo",           headline: "Sociologist",                      initials: i("A","D"), country: "Senegal",    rating: 4.7, jobs: 42,  expertise: ["Humanities & Social Sciences"], photoSeed: 69 },
  { id: 30, name: "Krzysztof Nowak",        headline: "Embedded systems engineer",       initials: i("K","N"), country: "Poland",     rating: 4.8, jobs: 60,  expertise: ["Technology & Computing"], photoSeed: 10 },
  { id: 31, name: "Ines Marques",           headline: "Graphic designer",                initials: i("I","M"), country: "Portugal",   rating: 4.9, jobs: 73,  expertise: ["Arts & Design"], photoSeed: 21 },
  { id: 32, name: "Dr. Rajesh Iyer",        headline: "PhD, electrical engineering",     initials: i("R","I"), country: "India",      rating: 4.8, jobs: 51,  expertise: ["Science & Engineering"], photoSeed: 32 },
  { id: 33, name: "Hannah Olsen",           headline: "Marketing copywriter",            initials: i("H","O"), country: "Denmark",    rating: 4.9, jobs: 68,  expertise: ["Business & Finance", "Arts & Design"], photoSeed: 43 },
  { id: 34, name: "Diego Velasquez",        headline: "Spanish translator",             initials: i("D","V"), country: "Mexico",     rating: 4.7, jobs: 54,  expertise: ["Humanities & Social Sciences"], photoSeed: 54 },
  { id: 35, name: "Anya Kowalski",          headline: "Frontend engineer, React",       initials: i("A","K"), country: "Poland",     rating: 4.8, jobs: 77,  expertise: ["Technology & Computing"], photoSeed: 65 },
  { id: 36, name: "Dr. Hugo Lambert",       headline: "PhD, theoretical physics",       initials: i("H","L"), country: "France",     rating: 5.0, jobs: 27,  expertise: ["Science & Engineering"], photoSeed: 76 },
  { id: 37, name: "Saoirse Murphy",         headline: "Editor and proofreader",          initials: i("S","M"), country: "Ireland",    rating: 4.9, jobs: 95,  expertise: ["Humanities & Social Sciences", "Arts & Design"], photoSeed: 87 },
  { id: 38, name: "Mateo Silva",            headline: "Data engineer",                   initials: i("M","S"), country: "Argentina",  rating: 4.7, jobs: 59,  expertise: ["Technology & Computing", "Mathematics & Statistics"], photoSeed: 16 },
  { id: 39, name: "Dr. Imani Okeke",         headline: "PhD, public health",              initials: i("I","O"), country: "Nigeria",    rating: 4.9, jobs: 41,  expertise: ["Medicine & Health"], photoSeed: 27 },
  { id: 40, name: "Yannick Dubois",         headline: "DevOps engineer",                 initials: i("Y","D"), country: "France",     rating: 4.8, jobs: 64,  expertise: ["Technology & Computing"], photoSeed: 38 },
  { id: 41, name: "Linnea Strom",           headline: "Environmental scientist",         initials: i("L","S"), country: "Sweden",     rating: 4.7, jobs: 38,  expertise: ["Science & Engineering"], photoSeed: 49 },
  { id: 42, name: "Mateus Oliveira",        headline: "Business analyst",               initials: i("M","O"), country: "Brazil",     rating: 4.6, jobs: 49,  expertise: ["Business & Finance"], photoSeed: 50 },
  { id: 43, name: "Dr. Greta Bauer",        headline: "PhD, applied linguistics",       initials: i("G","B"), country: "Germany",    rating: 4.9, jobs: 33,  expertise: ["Humanities & Social Sciences"], photoSeed: 61 },
  { id: 44, name: "Eduardo Pinheiro",      headline: "Architect, MArch",                initials: i("E","P"), country: "Brazil",     rating: 4.8, jobs: 42,  expertise: ["Arts & Design", "Science & Engineering"], photoSeed: 72 },
  { id: 45, name: "Nadia Khoury",           headline: "Arabic and French translator",    initials: i("N","K"), country: "Lebanon",    rating: 4.9, jobs: 61,  expertise: ["Humanities & Social Sciences"], photoSeed: 83 },
  { id: 46, name: "Erik Lindqvist",         headline: "iOS developer",                  initials: i("E","L"), country: "Sweden",     rating: 4.7, jobs: 53,  expertise: ["Technology & Computing"], photoSeed: 18 },
  { id: 47, name: "Dr. Adaeze Nwosu",       headline: "PhD, public policy",             initials: i("A","N"), country: "Nigeria",    rating: 4.8, jobs: 28,  expertise: ["Law & Policy", "Humanities & Social Sciences"], photoSeed: 29 },
  { id: 48, name: "Maja Kowalski",          headline: "Illustrator",                     initials: i("M","K"), country: "Poland",     rating: 4.9, jobs: 70,  expertise: ["Arts & Design"], photoSeed: 40 },
  { id: 49, name: "Ravi Krishnan",          headline: "QA engineer",                    initials: i("R","K"), country: "India",      rating: 4.7, jobs: 56,  expertise: ["Technology & Computing"], photoSeed: 51 },
  { id: 50, name: "Olu Adetunji",           headline: "Mechanical engineer, MSc",       initials: i("O","A"), country: "Nigeria",    rating: 4.6, jobs: 35,  expertise: ["Science & Engineering"], photoSeed: 62 },
];

const RATING_OPTIONS = [4.9, 4.7, 4.5, 4.0];
const PAGE_SIZE = 12;

export function ExpertsPageClient() {
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"rating" | "jobs" | "name">("rating");
  const [page, setPage] = useState(1);

  const toggleDiscipline = (d: string) => {
    setPage(1);
    setSelectedDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const clearFilters = () => {
    setSelectedDisciplines([]);
    setMinRating(0);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = experts.filter((e) => {
      if (selectedDisciplines.length > 0) {
        const match = selectedDisciplines.some((d) => e.expertise.includes(d));
        if (!match) return false;
      }
      if (minRating > 0 && e.rating < minRating) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "jobs") return b.jobs - a.jobs;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [selectedDisciplines, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), totalPages));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const activeFilterCount =
    selectedDisciplines.length + (minRating > 0 ? 1 : 0);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="container-x relative py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Expert network</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Browse the people behind the work.
            </h1>
            <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-2xl">
              Find the right expert for your project. Browse specialists across every
              major discipline. Every one of them went through a written application, a
              paid sample task, and a short interview before joining.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Hand-vetted, not auto-accepted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ratings from real projects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Message before you pay
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DIRECTORY ===================== */}
      <section>
        <div className="container-x py-12 md:py-16">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* ===================== FILTERS ===================== */}
            <aside className="space-y-4">
              <Card className="p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-900 tracking-tight">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-900 text-white px-2 py-0.5">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Discipline</h4>
                  <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {DISCIPLINES.map((d) => {
                      const checked = selectedDisciplines.includes(d);
                      return (
                        <label
                          key={d}
                          className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDiscipline(d)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <span className={checked ? "font-semibold text-slate-900" : ""}>{d}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Min. rating</h4>
                  <div className="mt-3 space-y-1.5">
                    {RATING_OPTIONS.map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === r}
                          onChange={() => { setMinRating(r); setPage(1); }}
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        {r}+ stars
                      </label>
                    ))}
                    {minRating > 0 && (
                      <button
                        type="button"
                        onClick={() => { setMinRating(0); setPage(1); }}
                        className="text-[10px] text-slate-500 hover:text-slate-900 underline"
                      >
                        Any rating
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </aside>

            {/* ===================== RESULTS ===================== */}
            <div>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                  {activeFilterCount > 0 ? "Filtered results" : "All available experts"}
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="text-sm h-9 px-3 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="rating">Highest rated</option>
                    <option value="jobs">Most projects</option>
                    <option value="name">Name (A to Z)</option>
                  </select>
                </div>
              </div>

              {paginated.length === 0 ? (
                <Card className="p-12 text-center">
                  <h3 className="font-semibold text-slate-900 tracking-tight">No experts match your filters</h3>
                  <p className="mt-1 text-sm text-slate-500">Try removing a filter or two.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Reset filters
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {paginated.map((e) => (
                      <Link key={e.id} href={`/experts/${e.id}`} className="block">
                        <Card hover className="p-5 h-full hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
                              <Image
                                src={photo(e.photoSeed)}
                                alt={`Portrait of ${e.name}`}
                                fill
                                sizes="56px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-slate-900 tracking-tight truncate">{e.name}</h3>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-label="Vetted" />
                              </div>
                              <p className="text-sm text-slate-600 truncate">{e.headline}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <MapPin className="h-3 w-3" aria-hidden="true" /> {e.country}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {e.expertise.map((x) => (
                              <span key={x} className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {x}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                              <span className="font-semibold text-slate-900">{e.rating}</span>
                              <span className="text-xs text-slate-500 ml-1">({e.jobs} projects)</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* ===================== PAGINATION ===================== */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                      <p className="text-xs text-slate-500">
                        Page <span className="font-semibold text-slate-700">{safePage}</span> of{" "}
                        <span className="font-semibold text-slate-700">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage <= 1}
                          onClick={() => goToPage(safePage - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Prev
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (totalPages <= 7) return true;
                            if (p === 1 || p === totalPages) return true;
                            return Math.abs(p - safePage) <= 1;
                          })
                          .map((p, idx, arr) => {
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && p - prev > 1;
                            return (
                              <span key={p} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-1 text-xs text-slate-400">…</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => goToPage(p)}
                                  className={`h-8 min-w-8 px-2.5 text-xs font-semibold rounded-md ${
                                    p === safePage
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  {p}
                                </button>
                              </span>
                            );
                          })}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage >= totalPages}
                          onClick={() => goToPage(safePage + 1)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-14">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Are you an expert?</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Join the network.
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  We add 1 to 2 experts a month. If you do high-quality work and want a
                  steady stream of projects, send a short sample and we will be in touch.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/become-an-expert"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Apply to join <ArrowUpDown className="h-3.5 w-3.5 rotate-45" />
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80"
                  alt="Team collaborating in a bright meeting room with sticky notes on the wall"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
