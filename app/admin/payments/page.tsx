import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { include: { client: { select: { name: true } }, expert: { select: { name: true } } } },
    },
  });

  const platformFeePercent = 0.15;
  const totals = payments.reduce(
    (acc, p) => {
      if (p.status === "SUCCEEDED" || p.status === "RELEASED") {
        acc.paid += p.amount;
        acc.platformNet += p.amount * platformFeePercent;
      }
      if (p.status === "REFUNDED") acc.refunded += p.amount;
      return acc;
    },
    { paid: 0, refunded: 0, platformNet: 0 }
  );

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Payments</h1>
      <p className="mt-1 text-slate-600">All platform transactions.</p>

      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-sm text-slate-500">Total volume (MTD)</div><div className="text-2xl font-bold">{formatCurrency(totals.paid)}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Platform net</div><div className="text-2xl font-bold text-emerald-700">{formatCurrency(totals.platformNet)}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Pending payouts</div><div className="text-2xl font-bold text-amber-700">–</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Refunds</div><div className="text-2xl font-bold text-slate-700">{formatCurrency(totals.refunded)}</div></Card>
      </div>

      {payments.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<CreditCard className="h-6 w-6" />} title="No payments yet" />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Client → Expert</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Platform fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{p.id.slice(-8)}</td>
                  <td className="px-4 py-3 text-slate-700">{p.order.client?.name ?? "–"} → {p.order.expert?.name ?? "–"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(p.amount, p.currency)}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{formatCurrency(p.amount * platformFeePercent, p.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
