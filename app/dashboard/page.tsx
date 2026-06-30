import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, StatusBadge, Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency } from "@/lib/utils";
import {
  FileText, CheckCircle2, DollarSign, MessageSquare, ArrowRight, Plus,
  Inbox,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [activeCount, completedCount, totalSpentAgg, unreadCount, recentOrders, user] = await Promise.all([
    prisma.order.count({ where: { clientId: userId, status: { in: ["QUOTED", "PAID", "IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"] } } }),
    prisma.order.count({ where: { clientId: userId, status: "COMPLETED" } }),
    prisma.payment.aggregate({ where: { order: { clientId: userId }, status: { in: ["SUCCEEDED", "RELEASED"] } }, _sum: { amount: true } }),
    prisma.message.count({ where: { order: { clientId: userId }, fromUserId: { not: userId } } }),
    prisma.order.findMany({
      where: { clientId: userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { expert: { select: { name: true, image: true } }, service: { select: { name: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const totalSpent = totalSpentAgg._sum.amount ?? 0;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {firstName}</h1>
          <p className="mt-1 text-slate-600">Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <Button asChild><Link href="/dashboard/new"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> New Request</span></Link></Button>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active orders" value={activeCount} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} icon={<DollarSign className="h-5 w-5" />} accent="accent" />
        <StatCard label="Unread messages" value={unreadCount} icon={<MessageSquare className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No orders yet"
              description="Submit your first request and we'll match you with a vetted expert within 24 hours."
              action={
                <Button asChild>
                  <Link href="/dashboard/new"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Create your first request</span></Link>
                </Button>
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Expert</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/orders/${o.id}`} className="block">
                          <div className="font-medium text-slate-900 line-clamp-1">{o.title}</div>
                          <div className="text-xs text-slate-500">#{o.id.slice(-6)}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={o.expert?.name ?? "Unassigned"} size={28} />
                          <span className="text-slate-700">{o.expert?.name ?? "Unassigned"}</span>
                        </div>
                      </td>
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
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Link href="/dashboard/new" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center"><Plus className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">New request</div>
                    <div className="text-xs text-slate-500">Submit a task</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/experts" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent-50 text-accent-700 flex items-center justify-center"><MessageSquare className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Browse experts</div>
                    <div className="text-xs text-slate-500">Find someone specific</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/messages" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center"><MessageSquare className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Messages</div>
                    <div className="text-xs text-slate-500">{unreadCount} unread</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary-50/50 to-accent-50/30 border-primary-200">
            <h3 className="font-semibold text-slate-900">Need help?</h3>
            <p className="mt-1 text-sm text-slate-600">Our team replies within 1 business day.</p>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href="/contact"><span>Contact support</span></Link>
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
