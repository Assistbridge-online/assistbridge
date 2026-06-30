"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface Dispute {
  id: string;
  orderId: string;
  title: string;
  client: string;
  expert: string;
  reason: string;
  amount: number;
  status: string;
  opened: string;
  resolution: string | null;
}

export function DisputeManager({ disputes }: { disputes: Dispute[] }) {
  const [items, setItems] = useState(disputes);
  const [pending, startTransition] = useTransition();

  function resolve(id: string, action: "refund" | "release") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setItems((arr) => arr.map((d) => d.id === id ? { ...d, status: "RESOLVED", resolution: action === "refund" ? "Refunded in full to client." : "Released to expert." } : d));
        toast.success(action === "refund" ? "Refund issued to client." : "Funds released to expert.");
      } else {
        toast.error("Failed");
      }
    });
  }

  if (items.length === 0) {
    return <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No disputes" description="No open or resolved disputes." />;
  }

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <Card key={d.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{d.title}</h3>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-1 text-sm text-slate-600">
                #{d.orderId.slice(-6)} · {d.client} vs {d.expert} · {formatCurrency(d.amount)} · Opened {formatDate(d.opened)}
              </div>
              <p className="mt-2 text-sm text-slate-700"><strong>Reason:</strong> {d.reason}</p>
              {d.resolution && <p className="mt-2 text-sm text-emerald-700"><strong>Resolution:</strong> {d.resolution}</p>}
            </div>
            {d.status !== "RESOLVED" && (
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="outline" size="sm"><MessageSquare className="h-3.5 w-3.5" /> Contact parties</Button>
                <Button onClick={() => resolve(d.id, "refund")} size="sm" className="bg-emerald-700 hover:bg-emerald-800" loading={pending}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Refund client
                </Button>
                <Button onClick={() => resolve(d.id, "release")} size="sm" variant="outline" loading={pending}>
                  <X className="h-3.5 w-3.5" /> Release to expert
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
