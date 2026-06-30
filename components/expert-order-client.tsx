"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, StatusBadge, Avatar } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Send, Paperclip, Upload, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { submitDeliveryAction } from "@/lib/actions/checkout";

export function ExpertOrderClient({ job }: { job: any }) {
  const [tab, setTab] = useState("workspace");
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Message sent (demo mode)");
    setMsg("");
  }

  function submitDelivery() {
    const fd = new FormData();
    fd.append("orderId", job.id);
    startTransition(async () => {
      const res = await submitDeliveryAction(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Delivery submitted!"); window.location.reload(); }
    });
  }

  return (
    <>
      <Link href="/expert/orders" className="text-sm text-primary-700 hover:text-primary-900">← Back to my jobs</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Order <strong className="text-slate-900">{job.id}</strong> · Due {formatDate(job.deadline)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(job.status === "PAID" || job.status === "IN_PROGRESS") && (
            <Button onClick={submitDelivery} loading={pending}>
              <Upload className="h-4 w-4" /> Submit delivery
            </Button>
          )}
          {job.status === "DELIVERED" && (
            <span className="text-sm text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Awaiting client approval
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <Tabs
            tabs={[
              { id: "workspace", label: "Workspace" },
              { id: "files", label: "Files" },
              { id: "details", label: "Brief" },
            ]}
            active={tab}
            onChange={setTab}
          />

          <div className="mt-6">
            {tab === "workspace" && (
              <Card className="p-5">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {job.messages.map((m: any, i: number) => (
                    <div key={i} className={`flex gap-3 ${m.from === "You" ? "flex-row-reverse" : ""}`}>
                      <Avatar name={m.from} size={36} />
                      <div className={`flex-1 max-w-[80%] ${m.from === "You" ? "text-right" : ""}`}>
                        <div className="text-xs text-slate-500 mb-1">{m.from} · {m.time}</div>
                        <div className={`inline-block text-left rounded-2xl px-4 py-2.5 text-sm ${m.from === "You" ? "bg-accent-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="mt-5 pt-5 border-t border-slate-200 flex gap-2">
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button type="button" className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50"><Paperclip className="h-4 w-4 text-slate-600" /></button>
                  <Button type="submit"><Send className="h-4 w-4" /></Button>
                </form>
              </Card>
            )}

            {tab === "files" && (
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900">Client files</h3>
                  <p className="text-sm text-slate-500 mt-2">No files uploaded yet.</p>
                </Card>
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900">My deliveries</h3>
                  <p className="text-sm text-slate-500 mt-2">No deliveries submitted yet.</p>
                </Card>
              </div>
            )}

            {tab === "details" && (
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900">Client brief</h3>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{job.brief}</p>
              </Card>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Client</h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={job.client.name} size={48} />
              <div>
                <div className="font-semibold text-slate-900">{job.client.name}</div>
                <div className="text-xs text-slate-500">{job.client.country}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Earnings</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Client paid</span><span className="font-semibold text-slate-900">{formatCurrency(job.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Platform fee (15%)</span><span className="font-semibold text-slate-900">-{formatCurrency(job.amount * 0.15)}</span></div>
              <div className="pt-2 border-t border-slate-200 flex justify-between"><span className="font-semibold text-slate-900">You earn</span><span className="font-bold text-emerald-700">{formatCurrency(job.earnings)}</span></div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
