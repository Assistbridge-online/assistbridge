import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Search, Clock, BookOpen, Mail, Rss, ChevronLeft, ChevronRight, User, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/blog/category-dropdown";
import { formatDate } from "@/lib/utils";
import { getPublishedPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AssistBridge Blog: Insights on Research, Data, and Expert Help",
  description:
    "Practical guides, expert interviews, and field-tested strategies for academic research, data analysis, statistical consulting, programming, and getting expert help online. Updated weekly.",
  alternates: { canonical: "/blog" },
};

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const params = await searchParams;
  const search = params.q?.trim().toLowerCase() || undefined;
  const activeCategory = params.category || "All";
  const pageNum = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const allPosts = await getPublishedPosts();
  const categories = ["All", ...Array.from(new Set(allPosts.map((p) => p.category)))];

  const filtered = allPosts.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (search) {
      const hay = (p.title + " " + p.excerpt).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(pageNum, totalPages);
  const startIdx = (safePage - 1) * POSTS_PER_PAGE;
  const posts = filtered.slice(startIdx, startIdx + POSTS_PER_PAGE);
  const featured = safePage === 1 && activeCategory === "All" && !search ? posts[0] : null;
  const rest = featured ? posts.slice(1) : posts;

  const popular = allPosts.slice(0, 4);
  const recent = allPosts.slice(0, 5);
  const archiveMonths = groupByMonth(allPosts);

  return (
    <>
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 via-white to-white border-b border-slate-200/70">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="container-x relative py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">The AssistBridge Blog</p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Field notes, guides, and expert takes on getting work done well.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Practical writing for students, researchers, founders, and operators who need
              research, analysis, or technical work, without the runaround. {allPosts.length}+
              articles, updated weekly.
            </p>

            <form className="mt-7 flex gap-2 max-w-md" method="get">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                <input
                  type="search"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search articles…"
                  className="h-11 w-full pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
                />
                {params.category && <input type="hidden" name="category" value={params.category} />}
              </div>
              <Button type="submit" size="md">Search</Button>
            </form>
          </div>
        </div>
      </header>

      <Section className="!py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const isActive = activeCategory === c;
              const href = c === "All" ? "/blog" : `/blog?category=${encodeURIComponent(c)}`;
              return (
                <Link
                  key={c}
                  href={href}
                  className={
                    "inline-flex items-center px-4 h-9 rounded-sm text-sm font-medium transition-colors " +
                    (isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700")
                  }
                >
                  {c}
                </Link>
              );
            })}
          </div>
          <span className="ml-auto text-xs text-slate-500">
            Showing 1–{Math.min(POSTS_PER_PAGE, filtered.length)} of {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            {search ? ` for "${search}"` : ""}
          </span>
        </div>
      </Section>

      <div className="container-x pb-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-10">
                <Card hover className="overflow-hidden">
                  <div className="grid lg:grid-cols-2">
                    <div className="relative aspect-[16/10] lg:aspect-auto bg-slate-100 overflow-hidden">
                      {featured.image && (
                        <Image
                          src={featured.image}
                          alt={featured.title}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-7 sm:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-sm bg-emerald-700 text-white font-bold uppercase tracking-wider">
                          {featured.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                        {featured.title}
                      </h2>
                      <p className="mt-3 text-base text-slate-600 leading-relaxed line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          By <span className="text-slate-700 font-medium">AssistBridge Editorial</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {featured.publishedAt ? formatDate(featured.publishedAt) : "Draft"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {featured.readTime}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          0 Comments
                        </span>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-emerald-700 group-hover:gap-2.5 transition-all">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {rest.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-7">
                {rest.map((p) => (
                  <article key={p.id} className="group bg-white">
                      <Link href={`/blog/${p.slug}`} className="block">
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          {p.image && (
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {p.category}
                            </span>
                          </div>
                        </div>
                        <div className="pt-5">
                          <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {p.excerpt}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pb-5 border-b border-slate-200">
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
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-emerald-700 group-hover:gap-2.5 transition-all">
                              Read More <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                ))}
              </div>
            ) : !featured ? (
              <Card className="p-12 text-center">
                <Search className="h-10 w-10 mx-auto text-slate-300" />
                <h3 className="mt-4 font-semibold text-slate-900">No articles found</h3>
                <p className="mt-1 text-sm text-slate-600">Try a different search term or category.</p>
                <Link href="/blog" className="mt-4 inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-900">
                  Clear filters
                </Link>
              </Card>
            ) : null}

            {totalPages > 1 && (
              <Pagination current={safePage} total={totalPages} search={search} category={activeCategory} />
            )}
          </div>

          <aside className="space-y-6">
            <Card className="p-5 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 border-emerald-200/60">
              <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">Get expert help</p>
              <p className="mt-2 text-sm text-slate-700">
                Post your brief and we&apos;ll match you with a vetted specialist. Pay only when you approve the work.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-4 inline-flex items-center justify-center w-full h-9 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Post a brief
              </Link>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Popular articles
              </p>
              <ul className="space-y-3">
                {popular.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100 shrink-0">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-700">
                          {p.title}
                        </h4>
                        <span className="text-xs text-slate-500">{p.readTime}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Categories
              </p>
              <CategoryDropdown
                categories={categories
                  .filter((c) => c !== "All")
                  .map((c) => ({ name: c, count: allPosts.filter((p) => p.category === c).length }))}
                active={activeCategory}
              />
            </Card>

            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Archives
              </p>
              <ul className="space-y-1.5">
                {archiveMonths.slice(0, 6).map((a) => (
                  <li key={a.label}>
                    <Link
                      href={`/blog?q=${encodeURIComponent(a.label)}`}
                      className="flex items-center justify-between text-sm text-slate-700 hover:text-primary-700 py-1"
                    >
                      <span>{a.label}</span>
                      <span className="text-xs text-slate-400">{a.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Stay in the loop
              </p>
              <p className="text-sm text-slate-700">
                One email a week with new articles, expert tips, and platform updates.
              </p>
              <form className="mt-3 space-y-2">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button type="submit" size="sm" className="w-full">Subscribe</Button>
              </form>
              <p className="mt-2 text-[11px] text-slate-500">No spam. Unsubscribe anytime.</p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Follow</p>
              <div className="flex items-center gap-2">
                <a href="/rss.xml" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors" aria-label="RSS feed">
                  <Rss className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors text-xs font-bold" aria-label="Twitter">𝕏</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors text-xs font-bold" aria-label="LinkedIn">in</a>
                <a href="mailto:hello@assistbridge.online" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors" aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function groupByMonth(posts: { publishedAt: string | Date | null }[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    if (!p.publishedAt) continue;
    const d = new Date(p.publishedAt);
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

function Pagination({
  current,
  total,
  search,
  category,
}: {
  current: number;
  total: number;
  search?: string;
  category?: string;
}) {
  const buildHref = (n: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category && category !== "All") params.set("category", category);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return `/blog${qs ? "?" + qs : ""}`;
  };

  // Window of at most 5 page numbers, centered around current when possible
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const isFirst = current === 1;
  const isLast = current === total;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, current - 1))}
        aria-label="Previous page"
        aria-disabled={isFirst}
        className={
          "h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-medium " +
          (isFirst
            ? "bg-white text-slate-300 border border-slate-200 pointer-events-none"
            : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700")
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((n) => {
        const isCurrent = n === current;
        return (
          <Link
            key={n}
            href={buildHref(n)}
            aria-current={isCurrent ? "page" : undefined}
            className={
              "h-9 min-w-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium " +
              (isCurrent
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50")
            }
          >
            {n}
          </Link>
        );
      })}

      <Link
        href={buildHref(Math.min(total, current + 1))}
        aria-label="Next page"
        aria-disabled={isLast}
        className={
          "h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-medium " +
          (isLast
            ? "bg-white text-slate-300 border border-slate-200 pointer-events-none"
            : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700")
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
