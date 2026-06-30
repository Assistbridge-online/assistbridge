"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Discipline { id: string; name: string; slug: string; description: string; longDescription: string | null; icon: string | null; tools: string | null; servicesList: string | null; order: number; active: boolean; }
const blank: Discipline = { id: "", name: "", slug: "", description: "", longDescription: "", icon: "Microscope", tools: "", servicesList: "", order: 0, active: true };
const ICONS = ["Microscope","Stethoscope","Briefcase","Code2","PenLine","Award","Sparkles","Users","Calculator","Globe","Wrench"];

export function DisciplineManager({ items }: { items: Discipline[] }) {
  const [editing, setEditing] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.name || !editing.description) { toast.error("Name and description required"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/disciplines", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
      setEditing(null);
      window.location.reload();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/disciplines?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} discipline</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Name *</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div><label className="text-sm font-medium">Slug</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Short description *</label><input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Long description</label><textarea rows={3} value={editing.longDescription ?? ""} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
          <div><label className="text-sm font-medium">Icon</label><select value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">{ICONS.map((i) => <option key={i}>{i}</option>)}</select></div>
          <div><label className="text-sm font-medium">Order</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Services (pipe-separated)</label><input value={editing.servicesList ?? ""} onChange={(e) => setEditing({ ...editing, servicesList: e.target.value })} placeholder="e.g. Lab report writing|Experimental design|FEA modeling" className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Tools (pipe-separated)</label><input value={editing.tools ?? ""} onChange={(e) => setEditing({ ...editing, tools: e.target.value })} placeholder="e.g. MATLAB, SolidWorks, ANSYS, AutoCAD" className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="rounded" /> Active</label>
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
        <Button onClick={() => setEditing({ ...blank })}><Plus className="h-4 w-4" /> Add discipline</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                <td className="px-4 py-3 text-slate-600 line-clamp-2 max-w-md">{d.description}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${d.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{d.active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing({ ...d })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(d.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
