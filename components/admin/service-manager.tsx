"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: string;
  icon: string;
  pricePerPage: number;
  minPages: number;
  maxPages: number | null;
  pageUnit: string;
  wordsPerPage: number;
  turnaroundDays: number;
  deliverables: string | null;
  featured: boolean;
  active: boolean;
  order: number;
}

interface Discipline { id: string; name: string }

const ICONS = ["Microscope","PenLine","Calculator","Wrench","Code2","Briefcase","Sparkles","Users","Globe","Award","Stethoscope","FileText"];
const UNITS = ["page","slide","sheet","hour","minute"];
const CATEGORIES = ["Editing & Proofreading","Academic Writing","Research Assistance","Data Analysis","Software Development","Business Plans & Reports","Translation","Arts & Design","Tutoring & Coaching","Engineering Design","Custom Project"];

const blank: Service = {
  id: "", name: "", slug: "", description: "", shortDescription: null, category: "Custom Project",
  icon: "Sparkles", pricePerPage: 10, minPages: 1, maxPages: null, pageUnit: "page", wordsPerPage: 250,
  turnaroundDays: 7, deliverables: null, featured: false, active: true, order: 0,
};

export function ServiceManager({ services, disciplines }: { services: Service[]; disciplines: Discipline[] }) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  function startNew() { setEditing({ ...blank }); }
  function startEdit(s: Service) { setEditing({ ...s }); }

  async function save() {
    if (!editing) return;
    if (!editing.name || !editing.description) {
      toast.error("Name and description are required");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    Object.entries(editing).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    try {
      const res = await fetch("/api/admin/services", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success(editing.id ? "Service updated" : "Service created");
      setEditing(null);
      window.location.reload();
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); window.location.reload(); }
  }

  if (editing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{editing.id ? "Edit" : "New"} service</h2>
          <button onClick={() => setEditing(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Name *</label>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Slug (auto if blank)</label>
            <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Description *</label>
            <textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Short description (1 sentence)</label>
            <input value={editing.shortDescription ?? ""} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Discipline</label>
            <select value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">
              <option value="">None</option>
              {disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Icon</label>
            <select value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">
              {ICONS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Price per unit ($) *</label>
            <input type="number" min="0" step="0.01" value={editing.pricePerPage} onChange={(e) => setEditing({ ...editing, pricePerPage: parseFloat(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Unit</label>
            <select value={editing.pageUnit} onChange={(e) => setEditing({ ...editing, pageUnit: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white">
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Words per page</label>
            <input type="number" min="1" value={editing.wordsPerPage} onChange={(e) => setEditing({ ...editing, wordsPerPage: parseInt(e.target.value) || 250 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Min units</label>
            <input type="number" min="1" value={editing.minPages} onChange={(e) => setEditing({ ...editing, minPages: parseInt(e.target.value) || 1 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Max units (optional)</label>
            <input type="number" min="1" value={editing.maxPages ?? ""} onChange={(e) => setEditing({ ...editing, maxPages: e.target.value ? parseInt(e.target.value) : null })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Turnaround (days)</label>
            <input type="number" min="1" value={editing.turnaroundDays} onChange={(e) => setEditing({ ...editing, turnaroundDays: parseInt(e.target.value) || 7 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Deliverables (pipe-separated)</label>
            <input value={editing.deliverables ?? ""} onChange={(e) => setEditing({ ...editing, deliverables: e.target.value })} placeholder="e.g. Tracked changes|Clean final|Methods write-up" className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="rounded" />
              Active (visible on site)
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">Order</span>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-20 h-9 rounded-md border border-slate-300 px-2 text-sm" />
            </div>
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
        <Button onClick={startNew}><Plus className="h-4 w-4" /> Add service</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">/{s.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{s.category}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">${s.pricePerPage}/{s.pageUnit}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.featured && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Featured</span>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(s)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
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
