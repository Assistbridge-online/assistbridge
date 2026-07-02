"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Save, X, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Post { id: string; slug: string; title: string; excerpt: string; body: string; category: string; image: string | null; readTime: string; published: boolean; publishedAt: string | null; }
const blank: Post = { id: "", slug: "", title: "", excerpt: "", body: "", category: "General", image: "", readTime: "5 min", published: false, publishedAt: null };

export function BlogManager({ items }: { items: Post[] }) {
  const [editing, setEditing] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.title || !editing.excerpt || !editing.body) { toast.error("Title, excerpt, and body required"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/blog", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
      setEditing(null);
      window.location.reload();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} post</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Title *</label><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <div><label className="text-sm font-medium">Slug (auto if blank)</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <div><label className="text-sm font-medium">Category</label><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <div><label className="text-sm font-medium">Read time</label><input value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Cover image URL</label><input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Excerpt *</label><textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Body * (use blank lines between paragraphs)</label><textarea rows={12} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-mono" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="rounded" /> Published</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save} loading={loading}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> New post</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">{p.category}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 text-xs">{p.publishedAt ? formatDate(p.publishedAt) : "–"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/social/posts/new?source=BLOG_POST&sourceId=${p.id}&title=${encodeURIComponent(p.title)}&body=${encodeURIComponent(shareBodyFor(p))}&link=${encodeURIComponent(shareLinkFor(p.slug))}&imageUrl=${encodeURIComponent(p.image ?? "")}`}
                    title="Share to social media"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                  >
                    <Share2 className="h-4 w-4" />
                  </Link>
                  <button onClick={() => setEditing({ ...p })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// --- Helpers used by the "Share to social" button ---

/**
 * The prefill post body for the social composer. Use the excerpt so we
 * stay within character limits on all platforms (LinkedIn 3k, FB 63k,
 * IG 2.2k). Operators can edit in the composer before publishing.
 */
function shareBodyFor(p: Post): string {
  return `${p.excerpt}\n\n${p.title}`;
}

/**
 * Canonical URL of the public blog post. Uses NEXT_PUBLIC_APP_URL so it
 * works in both dev and prod without hardcoding the domain.
 */
function shareLinkFor(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://assistbridge.online";
  return `${base.replace(/\/$/, "")}/blog/${slug}`;
}
