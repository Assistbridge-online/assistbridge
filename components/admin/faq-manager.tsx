"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Faq { id: string; question: string; answer: string; category: string; order: number; active: boolean; }
const blank: Faq = { id: "", question: "", answer: "", category: "General", order: 0, active: true };
const CATEGORIES = ["General", "Pricing", "Payments", "Experts", "Process"];

export function FaqManager({ items }: { items: Faq[] }) {
  const [editing, setEditing] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.question || !editing.answer) { toast.error("Question and answer required"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/faqs", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
      setEditing(null);
      window.location.reload();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} FAQ</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Category</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Order</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
            <label className="flex items-end gap-2 text-sm pb-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="rounded" /> Active</label>
          </div>
          <div><label className="text-sm font-medium">Question *</label><input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Answer *</label><textarea rows={5} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
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
        <Button onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> Add FAQ</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Category</th><th className="px-4 py-3">Question</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">{f.category}</span></td>
                <td className="px-4 py-3 text-slate-900">{f.question}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...f })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(f.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
