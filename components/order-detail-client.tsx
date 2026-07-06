"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, StatusBadge, Avatar } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Paperclip, Send, Download, CheckCircle2, AlertCircle, FileText, CreditCard,
  MessageCircle, RefreshCw, Wallet, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  startStripeCheckout,
  startPayPalCheckout,
  startPaystackCheckout,
  releaseFundsAction,
  requestRevisionAction,
  markCompleteAction,
} from "@/lib/actions/checkout";

type Gateway = "stripe" | "paystack";

const GATEWAYS: { id: Gateway; label: string; icon: typeof Wallet }[] = [
  { id: "stripe", label: "Stripe", icon: CreditCard },
  { id: "paystack", label: "Paystack", icon: Wallet },
];

interface OrderData {
  id: string;
  title: string;
  status: "DRAFT" | "QUOTED" | "PAID" | "IN_PROGRESS" | "DELIVERED" | "REVISION_REQUESTED" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  expert: { name: string; img: number; country: string; rating: number };
  amount: number;
  currency: string;
  created: string;
  deadline: string;
  brief: string;
  files: { name: string; size: string }[];
  deliveries: { name: string; size: string; date: string }[];
  messages: { from: string; body: string; time: string; expert: boolean }[];
  payment: { method: string; ref: string; status: "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED" | "RELEASED"; date: string };
}

function PaymentErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const gateway = searchParams.get("gateway");
  if (error !== "payment") return null;
  const niceName =
    gateway === "stripe" ? "Stripe" : gateway === "paypal" ? "PayPal" : gateway === "paystack" ? "Paystack" : "Payment";
  return (
    <div className="mb-5 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">Payment setup incomplete</h3>
        <p className="text-sm text-amber-800 mt-1">
          {niceName} is not configured yet, so we couldn&apos;t process your payment. Your order has been saved. Try paying again, or contact support.
        </p>
      </div>
    </div>
  );
}

export function OrderDetailClient({ order }: { order: OrderData }) {
  const [tab, setTab] = useState("messages");
  const [newMessage, setNewMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [selectedGateway, setSelectedGateway] = useState<Gateway>("stripe");

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    toast.success("Message sent (demo mode)");
    setNewMessage("");
  }

  function handlePay(gateway: Gateway) {
    const fd = new FormData();
    fd.append("orderId", order.id);
    startTransition(async () => {
      const action =
        gateway === "stripe"
          ? startStripeCheckout
          : gateway === "paypal"
          ? startPayPalCheckout
          : startPaystackCheckout;
      const res = await action(fd);
      if (res && "error" in res) {
        toast.error(res.error);
      }
    });
  }

  function actionWith(name: string, fn: (fd: FormData) => Promise<any>, msg: string) {
    return () => {
      const fd = new FormData();
      fd.append("orderId", order.id);
      startTransition(async () => {
        const res = await fn(fd);
        if (res?.error) toast.error(res.error);
        else { toast.success(msg); window.location.reload(); }
      });
    };
  }

  return (
    <Suspense fallback={null}>
      <PaymentErrorBanner />
      <div className="mb-6">
        <Link href="/dashboard/orders" className="text-sm text-primary-700 hover:text-primary-900">← Back to orders</Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{order.title}</h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span>Order <strong className="text-slate-900">{order.id}</strong></span>
            <span>·</span>
            <span>Created {formatDate(order.created)}</span>
            <span>·</span>
            <span>Due {formatDate(order.deadline)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(order.status === "QUOTED" || order.status === "DRAFT") && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {GATEWAYS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGateway(g.id)}
                    className={`px-3 py-2 text-sm font-medium transition border-r last:border-r-0 border-slate-200 ${
                      selectedGateway === g.id ? "bg-primary-700 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <Button onClick={() => handlePay(selectedGateway)} loading={pending}>
                {(() => {
                  const Icon = GATEWAYS.find((g) => g.id === selectedGateway)?.icon ?? CreditCard;
                  return <Icon className="h-4 w-4" />;
                })()}
                Pay {formatCurrency(order.amount, order.currency)}
              </Button>
            </div>
          )}
          {order.status === "DELIVERED" && (
            <>
              <Button variant="outline" onClick={actionWith("rev", requestRevisionAction, "Revision requested")} loading={pending}>
                <RefreshCw className="h-4 w-4" /> Request revision
              </Button>
              <Button onClick={actionWith("complete", markCompleteAction, "Order completed! Funds released.")} loading={pending}>
                <CheckCircle2 className="h-4 w-4" /> Mark as complete
              </Button>
            </>
          )}
          {(order.status === "IN_PROGRESS" || order.status === "PAID") && (
            <Button variant="outline" onClick={() => toast.info("Dispute opened. Our team will respond within 24 hours.")}>
              <AlertCircle className="h-4 w-4" /> Open dispute
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <Tabs
            tabs={[
              { id: "messages", label: "Messages" },
              { id: "files", label: "Files" },
              { id: "details", label: "Details" },
              { id: "payment", label: "Payment" },
            ]}
            active={tab}
            onChange={setTab}
          />

          <div className="mt-6">
            {tab === "messages" && (
              <Card className="p-5">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {order.messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.expert ? "" : "flex-row-reverse"}`}>
                      <Avatar name={m.from} src={m.expert ? `https://i.pravatar.cc/100?img=${order.expert.img}` : undefined} size={36} />
                      <div className={`flex-1 max-w-[80%] ${m.expert ? "" : "text-right"}`}>
                        <div className="text-xs text-slate-500 mb-1">{m.from} · {m.time}</div>
                        <div className={`inline-block text-left rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${m.expert ? "bg-slate-100 text-slate-800" : "bg-primary-700 text-white"}`}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="mt-5 pt-5 border-t border-slate-200 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="button" className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50" aria-label="Attach file">
                    <Paperclip className="h-4 w-4 text-slate-600" />
                  </button>
                  <Button type="submit"><Send className="h-4 w-4" /></Button>
                </form>
              </Card>
            )}

            {tab === "files" && (
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900">Your uploads</h3>
                  <ul className="mt-3 space-y-2">
                    {order.files.map((f) => (
                      <li key={f.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{f.name}</div>
                            <div className="text-xs text-slate-500">{f.size}</div>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600"><Download className="h-4 w-4" /></button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900">Deliveries from expert</h3>
                  <ul className="mt-3 space-y-2">
                    {order.deliveries.map((d) => (
                      <li key={d.name} className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-emerald-700" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{d.name}</div>
                            <div className="text-xs text-slate-500">{d.size} · {formatDate(d.date)}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Download</Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {tab === "details" && (
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900">Task brief</h3>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{order.brief}</p>
              </Card>
            )}

            {tab === "payment" && (
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900">Payment details</h3>
                {(order.status === "QUOTED" || order.status === "DRAFT") ? (
                  <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-900 font-medium">Payment pending</p>
                    <p className="text-sm text-amber-800 mt-1">Use the Pay button at the top to complete your order.</p>
                  </div>
                ) : (
                  <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                    <div><div className="text-slate-500">Amount</div><div className="font-semibold text-slate-900 mt-0.5">{formatCurrency(order.amount, order.currency)}</div></div>
                    <div><div className="text-slate-500">Method</div><div className="font-semibold text-slate-900 mt-0.5">{order.payment.method}</div></div>
                    <div><div className="text-slate-500">Status</div><div className="mt-0.5"><StatusBadge status={order.payment.status} /></div></div>
                    <div><div className="text-slate-500">Paid on</div><div className="font-semibold text-slate-900 mt-0.5">{formatDate(order.payment.date)}</div></div>
                    <div className="sm:col-span-2"><div className="text-slate-500">Reference</div><div className="font-mono text-xs text-slate-900 mt-0.5">{order.payment.ref}</div></div>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Button variant="outline"><Download className="h-4 w-4" /> Download invoice</Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your expert</h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={order.expert.name} src={`https://i.pravatar.cc/100?img=${order.expert.img}`} size={48} />
              <div>
                <div className="font-semibold text-slate-900">{order.expert.name}</div>
                <div className="text-xs text-slate-500">{order.expert.country}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-amber-500">★</span>
              <span className="font-semibold text-slate-900">{order.expert.rating}</span>
              <span className="text-slate-500">rating</span>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/experts/1"><span>View profile</span></Link>
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Order summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Service fee</span><span className="font-semibold text-slate-900">{formatCurrency(order.amount * 0.85, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Platform fee (15%)</span><span className="font-semibold text-slate-900">{formatCurrency(order.amount * 0.15, order.currency)}</span></div>
              <div className="pt-2 border-t border-slate-200 flex justify-between"><span className="font-semibold text-slate-900">Total</span><span className="font-bold text-slate-900">{formatCurrency(order.amount, order.currency)}</span></div>
            </div>
          </Card>
        </aside>
      </div>
    </Suspense>
  );
}
