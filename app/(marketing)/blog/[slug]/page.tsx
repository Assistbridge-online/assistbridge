import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, BookOpen, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ShareButtons } from "@/components/blog/share-buttons";
import { formatDate } from "@/lib/utils";
import { getPostBySlug, getPublishedPosts } from "@/lib/content";

type Params = { slug: string };
type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} | AssistBridge Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.image ? [post.image] : [],
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  const fallback = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const relatedPosts = related.length > 0 ? related : fallback;

  const paragraphs = post.body.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const headings: { level: 2 | 3; text: string; id: string }[] = [];
  for (const p of paragraphs) {
    if (p.startsWith("## ")) headings.push({ level: 2, text: p.slice(3), id: slugify(p.slice(3)) });
    else if (p.startsWith("### ")) headings.push({ level: 3, text: p.slice(4), id: slugify(p.slice(4)) });
  }
  const wordCount = post.body.split(/\s+/).length;
  const readTimeNum = wordCount / 220;
  const readMinutes = Math.max(1, Math.round(readTimeNum));

  return (
    <article>
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 via-white to-white border-b border-slate-200/70">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="container-x relative pt-10 pb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>

          <div className="mt-6 max-w-3xl">
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider hover:text-emerald-900"
            >
              <Tag className="h-3 w-3" /> {post.category}
            </Link>
            <h1 className="mt-3 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readMinutes} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {wordCount.toLocaleString()} words
              </span>
            </div>
          </div>
        </div>
      </header>

      {post.image && (
        <div className="container-x mt-8">
          <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-x mt-10">
        <div className="grid lg:grid-cols-[1fr_240px] gap-10">
          <div className="max-w-2xl">
            {headings.length > 0 && (
              <div className="mb-8 p-5 rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 to-white">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                  In this article
                </p>
                <ul className="space-y-1.5 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${h.id}`}
                        className={
                          "hover:text-primary-700 transition-colors " +
                          (h.level === 2 ? "font-medium text-slate-800" : "text-slate-600")
                        }
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="prose-content space-y-6">
              {paragraphs.map((p, i) => {
                if (p.startsWith("## ")) {
                  return (
                    <h2 key={i} id={slugify(p.slice(3))} className="text-2xl font-bold tracking-tight text-slate-900 pt-4">
                      {p.slice(3)}
                    </h2>
                  );
                }
                if (p.startsWith("### ")) {
                  return (
                    <h3 key={i} id={slugify(p.slice(4))} className="text-xl font-bold tracking-tight text-slate-900 pt-2">
                      {p.slice(4)}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="text-slate-700 leading-relaxed text-lg">
                    {renderInline(p)}
                  </p>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tagged</p>
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                >
                  #{post.category.toLowerCase().replace(/\s+/g, "-")}
                </Link>
              </div>
              <ShareButtons slug={post.slug} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Need this done?
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Post your project and we&apos;ll match you with a vetted specialist.
                </p>
                <Link
                  href="/calculator"
                  className="mt-4 inline-flex items-center justify-center w-full h-9 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Post a project
                </Link>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Author
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 text-white flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">AssistBridge Editorial</div>
                    <div className="text-xs text-slate-500">Research & writing</div>
                  </div>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-20 border-t border-slate-200 bg-slate-50/50">
          <div className="container-x py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Keep reading</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Related articles
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900"
              >
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group">
                  <Card hover className="overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[16/10] bg-slate-100">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : null}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-primary-800 line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1">{p.excerpt}</p>
                      <span className="mt-3 text-xs text-slate-500">{p.readTime} read</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderInline(text: string): React.ReactNode {
  try {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {p.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            className="text-emerald-700 underline hover:text-emerald-900"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={i}>{p}</span>;
    });
  } catch {
    return <span>{text}</span>;
  }
}

