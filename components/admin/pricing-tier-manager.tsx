"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Tier { id: string; name: string; slug: string; blurb: string; pricePerPage: number | null; minPages: number; includedPages: number | null; flatPrice: number | null; features: string; ctaLabel: string; ctaHref: string; featured: boolean; order: number; active: boolean; }
const blank: Tier = { id: "", name: "", slug: "", blurb: "", pricePerPage: null, minPages: 1, includedPages: null, flatPrice: null, features: "", ctaLabel: "Get started", ctaHref: "/dashboard/new", featured: false, order: 0, active: true };

export function PricingTierManager({ items }: { items: Tier[] }) {
  const [editing, setEditing] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.name) { toast.error("Name required"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/pricing-tiers", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
      setEditing(null);
      window.location.reload();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/pricing-tiers?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} pricing tier</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Name *</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Slug</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Blurb</label><input value={editing.blurb} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Price per page ($, or leave blank)</label><input type="number" step="0.01" value={editing.pricePerPage ?? ""} onChange={(e) => setEditing({ ...editing, pricePerPage: e.target.value ? parseFloat(e.target.value) : null })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Flat price ($, optional)</label><input type="number" step="0.01" value={editing.flatPrice ?? ""} onChange={(e) => setEditing({ ...editing, flatPrice: e.target.value ? parseFloat(e.target.value) : null })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Min pages</label><input type="number" min="1" value={editing.minPages} onChange={(e) => setEditing({ ...editing, minPages: parseInt(e.target.value) || 1 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Included pages</label><input type="number" min="0" value={editing.includedPages ?? ""} onChange={(e) => setEditing({ ...editing, includedPages: e.target.value ? parseInt(e.target.value) : null })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">CTA label</label><input value={editing.ctaLabel} onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">CTA link</label><input value={editing.ctaHref} onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Features (pipe-separated)</label><textarea rows={3} value={editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} placeholder="Best for 1–10 page tasks|Standard turnaround|Email support" className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="rounded" /> Featured (most popular)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="rounded" /> Active</label>
          <div className="md:col-span-2"><label className="text-sm font-medium">Order</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-24 h-9 rounded-md border border-slate-300 px-2 text-sm" /></div>
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
        <Button onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> Add tier</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Tier</th><th className="px-4 py-3">Pricing</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    {t.name}
                    {t.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="text-xs text-slate-500">{t.blurb}</div>
                </td>
                <td className="px-4 py-3 text-slate-900">
                  {t.pricePerPage ? <span><strong>{formatCurrency(t.pricePerPage)}</strong>/page</span> : t.flatPrice ? formatCurrency(t.flatPrice) : "Custom"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${t.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{t.active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...t })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(t.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
