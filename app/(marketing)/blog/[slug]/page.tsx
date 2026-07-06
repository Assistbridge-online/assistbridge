import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, BookOpen, User, MessageSquare, Reply, Facebook } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/blog/share-buttons";
import { formatDate } from "@/lib/utils";
import { getPostBySlug, getPublishedPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

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

  // Sort posts by publishedAt for prev/next navigation
  const sorted = [...allPosts].sort(
    (a, b) =>
      new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
  );
  const currentIdx = sorted.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextPost = currentIdx >= 0 && currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

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
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Posted by</span>
                <Link href="#author-bio" className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-900">
                  <User className="h-3.5 w-3.5" />
                  AssistBridge Editorial
                </Link>
              </span>
              <span className="text-slate-300">/</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </span>
              <span className="text-slate-300">/</span>
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-900"
              >
                <Tag className="h-3.5 w-3.5" />
                {post.category}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {readMinutes} min read
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

            {/* Tags + Share */}
            <div id="tags" className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="inline-flex items-center px-3 py-1 rounded-sm bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 border border-emerald-100"
                  >
                    {post.category}
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-3 py-1 rounded-sm bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Academic
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-3 py-1 rounded-sm bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Research
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-3 py-1 rounded-sm bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200"
                  >
                    Expert Help
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 text-right">Share</p>
                <ShareButtons slug={post.slug} />
              </div>
            </div>

            {/* Author Bio */}
            <div id="author-bio" className="mt-10 p-6 md:p-8 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-5 items-start">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 text-2xl font-bold">
                AB
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="#" className="text-lg font-bold text-slate-900 hover:text-emerald-700">
                    AssistBridge Editorial
                  </Link>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Verified Author
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  The AssistBridge editorial team writes practical guides, expert interviews, and
                  field-tested strategies on research, data analysis, programming, and getting expert
                  help online. We have helped over 1,200 clients across 60+ countries.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={siteConfig.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Link>
                  <Link
                    href={siteConfig.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Link>
                  <Link
                    href={`mailto:${siteConfig.email}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                    aria-label="Email"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Post navigation: prev / next */}
            {(prevPost || nextPost) && (
              <nav className="mt-10 grid sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1.5">
                      <ArrowLeft className="h-3.5 w-3.5" /> Previous Post
                    </div>
                    <h4 className="mt-2 text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 line-clamp-2">
                      {prevPost.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-right"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1.5">
                      Next Post <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="mt-2 text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 line-clamp-2">
                      {nextPost.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>
            )}

            {/* Comments / Leave a Reply */}
            <div id="comments" className="mt-12">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
                Leave a Reply
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Your email address will not be published. Required fields are marked{" "}
                <span className="text-red-500">*</span>
              </p>

              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Share your thoughts…"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website</label>
                    <input
                      type="url"
                      placeholder="https://"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    Save my name and email in this browser for the next time I comment.
                  </label>
                </div>
                <Button type="submit" size="md" variant="primary">
                  Post Comment
                </Button>
              </form>

              <div className="mt-8 p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-sm text-slate-600">
                <p>
                  <strong>Want a private reply?</strong>{" "}
                  <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">
                    Send us a message
                  </Link>{" "}
                  or{" "}
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    chat on WhatsApp
                  </a>
                  .
                </p>
              </div>
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

      {/* Article Schema */}
      <Script id="article-schema" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
          author: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
          },
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${siteConfig.url}/blog/${post.slug}`,
          },
          wordCount,
        })}
      </Script>
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

