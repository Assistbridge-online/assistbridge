import { prisma } from "@/lib/db";
import { BlogManager } from "@/components/admin/blog-manager";

export const metadata = { title: "Admin · Blog" };

export default async function AdminBlogPage() {
  const items = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  const serialised = items.map((p) => ({ ...p, publishedAt: p.publishedAt?.toISOString() ?? null }));
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-1 text-slate-600">Articles shown on the blog index.</p>
      <div className="mt-8">
        <BlogManager items={serialised as any} />
      </div>
    </>
  );
}
