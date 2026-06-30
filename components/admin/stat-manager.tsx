"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Stat { id: string; label: string; value: string; order: number; }
const blank: Stat = { id: "", label: "", value: "", order: 0 };

const PRESETS = [
  { label: "disciplines", hint: "Disciplines covered (e.g., 12)" },
  { label: "experts", hint: "Vetted experts (e.g., 250+)" },
  { label: "tasks", hint: "Tasks completed (e.g., 1,200+)" },
  { label: "countries", hint: "Countries served (e.g., 60+)" },
];

export function StatManager({ items }: { items: Stat[] }) {
  const [editing, setEditing] = useState<Stat | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.label || !editing.value) { toast.error("Label and value required"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/stats", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
      setEditing(null);
      window.location.reload();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/stats?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} stat</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Label (key)</label>
            <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
            <div className="mt-2 flex flex-wrap gap-1">
              {PRESETS.map((p) => (
                <button type="button" key={p.label} onClick={() => setEditing({ ...editing, label: p.label })} className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200">{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Value (displayed)</label>
            <input value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Order</label>
            <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
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
        <Button onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> Add stat</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Label</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Order</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-sm">{s.label}</td>
                <td className="px-4 py-3 text-slate-900 font-semibold">{s.value}</td>
                <td className="px-4 py-3 text-slate-700">{s.order}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...s })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(s.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
