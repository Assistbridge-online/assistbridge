"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Config {
  pageUnitLabel: string;
  wordsPerPage: number;
  platformFeePercent: number;
  rushDeliveryDays: number;
  rushMultiplier: number;
  studentDiscountPercent: number;
  nonProfitDiscountPercent: number;
}

export function PricingConfigForm({ initial }: { initial: Config }) {
  const [data, setData] = useState<Config>(initial);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
    try {
      const res = await fetch("/api/admin/pricing-config", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      toast.success("Saved");
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">Global pricing config</h2>
      <p className="text-sm text-slate-600 mb-4">Affects how the per-page calculator and site-wide pricing copy renders.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Page unit label</label>
          <input value={data.pageUnitLabel} onChange={(e) => setData({ ...data, pageUnitLabel: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Words per page</label>
          <input type="number" min="1" value={data.wordsPerPage} onChange={(e) => setData({ ...data, wordsPerPage: parseInt(e.target.value) || 250 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Platform fee (%)</label>
          <input type="number" step="0.1" min="0" value={data.platformFeePercent} onChange={(e) => setData({ ...data, platformFeePercent: parseFloat(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Rush delivery (days)</label>
          <input type="number" min="1" value={data.rushDeliveryDays} onChange={(e) => setData({ ...data, rushDeliveryDays: parseInt(e.target.value) || 3 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Rush multiplier (e.g., 1.5 = +50%)</label>
          <input type="number" step="0.05" min="1" value={data.rushMultiplier} onChange={(e) => setData({ ...data, rushMultiplier: parseFloat(e.target.value) || 1.5 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Student discount (%)</label>
          <input type="number" step="0.1" min="0" value={data.studentDiscountPercent} onChange={(e) => setData({ ...data, studentDiscountPercent: parseFloat(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Non-profit discount (%)</label>
          <input type="number" step="0.1" min="0" value={data.nonProfitDiscountPercent} onChange={(e) => setData({ ...data, nonProfitDiscountPercent: parseFloat(e.target.value) || 0 })} className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} loading={loading}><Save className="h-4 w-4" /> Save config</Button>
      </div>
    </Card>
  );
}
