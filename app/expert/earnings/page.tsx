import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatCard, StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, DollarSign, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allPayments, monthEarnings, availableAgg] = await Promise.all([
    prisma.payment.findMany({
      where: { order: { expertId: userId } },
      orderBy: { createdAt: "desc" },
      include: { order: { select: { id: true, title: true, client: { select: { name: true } } } } },
    }),
    prisma.payment.aggregate({ where: { order: { expertId: userId }, createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { order: { expertId: userId }, status: "SUCCEEDED" }, _sum: { amount: true } }),
  ]);

  const platformFee = 0.15;
  const earnings = allPayments.map((p) => ({
    ...p,
    gross: p.amount,
    fee: p.amount * platformFee,
    net: p.amount * (1 - platformFee),
  }));
  const totalNet = earnings.reduce((s, e) => s + e.net, 0);
  const monthNet = (monthEarnings._sum.amount ?? 0) * (1 - platformFee);
  const available = (availableAgg._sum.amount ?? 0) * (1 - platformFee);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-1 text-slate-600">Track your payouts and earnings history.</p>
        </div>
        <button className="h-11 px-5 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 inline-flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Request payout
        </button>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <StatCard label="Available balance" value={formatCurrency(available)} icon={<DollarSign className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Total earned" value={formatCurrency(totalNet)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="This month" value={formatCurrency(monthNet)} />
      </div>

      {earnings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No earnings yet"
            description="Once you complete a job, your earnings will appear here."
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Fee (15%)</th>
                <th className="px-4 py-3">Net</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {earnings.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 line-clamp-1">{e.order.title}</div>
                    <div className="text-xs text-slate-500">{e.order.client?.name ?? "–"} · #{e.order.id.slice(-6)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(e.gross, e.currency)}</td>
                  <td className="px-4 py-3 text-slate-700">-{formatCurrency(e.fee, e.currency)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatCurrency(e.net, e.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600"><Download className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
