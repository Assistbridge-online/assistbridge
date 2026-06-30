import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Inbox, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const params = await searchParams;
  const statusFilter = params.status && params.status !== "all" ? params.status : undefined;
  const search = params.q?.trim() || undefined;

  const orders = await prisma.order.findMany({
    where: {
      clientId: userId,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { id: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { expert: { select: { name: true, image: true } } },
  });

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My orders</h1>
          <p className="mt-1 text-slate-600">All your requests, quotes, and deliveries in one place.</p>
        </div>
        <Button asChild><Link href="/dashboard/new"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> New Request</span></Link></Button>
      </div>

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
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search by title or order ID..."
              className="h-9 w-full pl-9 pr-3 rounded-md border border-slate-300 text-sm"
            />
          </div>
          <button type="submit" className="h-9 px-4 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800">Filter</button>
        </form>
      </Card>

      {orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No orders yet"
            description="When you submit a request, it will appear here. You'll get matched with a vetted expert within 24 hours."
            action={
              <Button asChild>
                <Link href="/dashboard/new"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Submit your first request</span></Link>
              </Button>
            }
          />
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Expert</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/orders/${o.id}`}>
                      <div className="font-medium text-slate-900 hover:text-primary-700 line-clamp-1">{o.title}</div>
                      <div className="text-xs text-slate-500">#{o.id.slice(-6)}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.expert?.name ?? "Unassigned"} size={28} />
                      <span className="text-slate-700">{o.expert?.name ?? "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.deadline ? formatDate(o.deadline) : "–"}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {o.finalPrice ? formatCurrency(o.finalPrice, o.currency) : <span className="text-slate-400">–</span>}
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
