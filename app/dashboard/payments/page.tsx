import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, CreditCard, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const payments = await prisma.payment.findMany({
    where: { order: { clientId: userId } },
    orderBy: { createdAt: "desc" },
    include: { order: { select: { id: true, title: true } } },
  });

  const totals = payments.reduce(
    (acc, p) => {
      if (p.status === "SUCCEEDED" || p.status === "RELEASED") acc.paid += p.amount;
      if (p.status === "REFUNDED") acc.refunded += p.amount;
      return acc;
    },
    { paid: 0, refunded: 0 }
  );

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Payments</h1>
      <p className="mt-1 text-slate-600">Your complete payment history and invoices.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total paid</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totals.paid)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Refunded</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totals.refunded)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Average order</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {payments.length > 0 ? formatCurrency(Math.round(totals.paid / payments.length)) : formatCurrency(0)}
          </div>
        </Card>
      </div>

      {payments.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No payments yet"
            description="When you complete a payment, it will appear here with an invoice you can download."
            action={
              <a href="/dashboard/new" className="inline-flex h-11 px-5 rounded-lg bg-primary-700 text-white text-sm font-semibold items-center gap-2 hover:bg-primary-800">
                <CreditCard className="h-4 w-4" /> Submit a request
              </a>
            }
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-slate-500">#{p.id.slice(-8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700 line-clamp-1">{p.order.title}</div>
                    <div className="text-xs text-slate-500">#{p.order.id.slice(-6)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.gateway}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(p.amount, p.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600" aria-label="Download invoice">
                      <Download className="h-4 w-4" />
                    </button>
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
