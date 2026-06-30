import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const status = params.status && params.status !== "all" ? params.status : undefined;
  const search = params.q?.trim() || undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { id: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      expert: { select: { name: true, email: true } },
    },
  });

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">All orders</h1>
      <p className="mt-1 text-slate-600">Platform-wide orders. Intervene if needed.</p>

      <Card className="mt-8 p-4">
        <form className="flex flex-wrap gap-2" method="get">
          <select name="status" defaultValue={params.status ?? "all"} className="h-9 px-3 rounded-md border border-slate-300 text-sm bg-white">
            <option value="all">All statuses</option>
            <option value="QUOTED">Quoted</option>
            <option value="PAID">Paid</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DISPUTED">Disputed</option>
          </select>
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by ID or title..."
            className="h-9 px-3 rounded-md border border-slate-300 text-sm flex-1 min-w-[200px]"
          />
          <button type="submit" className="h-9 px-4 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800">Filter</button>
        </form>
      </Card>

      {orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<FileText className="h-6 w-6" />} title="No orders match" />
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Expert</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 line-clamp-1">{o.title}</div>
                    <div className="text-xs text-slate-500">#{o.id.slice(-6)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.client?.name ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-700">{o.expert?.name ?? "–"}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {o.finalPrice ? formatCurrency(o.finalPrice, o.currency) : "–"}
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
