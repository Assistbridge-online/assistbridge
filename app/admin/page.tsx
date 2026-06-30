import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatCard, StatusBadge, Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users, DollarSign, FileText, AlertCircle, TrendingUp, Activity, ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    pendingExperts,
    activeOrders,
    openDisputes,
    monthRevenueAgg,
    pendingApps,
    recent,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.expertProfile.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "IN_PROGRESS", "DELIVERED"] } } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }, status: { in: ["SUCCEEDED", "RELEASED"] } },
      _sum: { amount: true },
    }),
    prisma.expertApplication.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { client: { select: { name: true } }, expert: { select: { name: true } } } }),
  ]);

  const monthRevenue = monthRevenueAgg._sum.amount ?? 0;
  const platformFee = 0.15;
  const platformNet = monthRevenue * platformFee;

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin overview</h1>
      <p className="mt-1 text-slate-600">Platform health and recent activity.</p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={totalUsers.toLocaleString()} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Revenue (MTD)" value={formatCurrency(platformNet)} change={{ value: "platform net" }} icon={<DollarSign className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Active orders" value={activeOrders} icon={<FileText className="h-5 w-5" />} accent="primary" />
        <StatCard label="Open disputes" value={openDisputes} icon={<AlertCircle className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Recent orders
          </h2>
          {recentOrders.length === 0 ? (
            <EmptyState icon={<Activity className="h-6 w-6" />} title="No orders yet" />
          ) : (
            <ul className="mt-4 divide-y divide-slate-200">
              {recentOrders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{o.title}</div>
                    <div className="text-xs text-slate-500">#{o.id.slice(-6)} · {o.client?.name ?? "–"} → {o.expert?.name ?? "Unassigned"}</div>
                  </div>
                  <StatusBadge status={o.status} />
                  <div className="text-sm font-semibold text-slate-900 w-24 text-right">
                    {o.finalPrice ? formatCurrency(o.finalPrice, o.currency) : "–"}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Pending actions</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <Link href="/admin/experts" className="text-slate-700 hover:text-primary-700">Expert applications</Link>
                <span className="font-semibold text-amber-700">{pendingExperts}</span>
              </li>
              <li className="flex justify-between">
                <Link href="/admin/experts" className="text-slate-700 hover:text-primary-700">Expert verifications</Link>
                <span className="font-semibold text-amber-700">{pendingApps}</span>
              </li>
              <li className="flex justify-between">
                <Link href="/admin/disputes" className="text-slate-700 hover:text-primary-700">Open disputes</Link>
                <span className="font-semibold text-red-700">{openDisputes}</span>
              </li>
              <li className="flex justify-between">
                <Link href="/admin/users" className="text-slate-700 hover:text-primary-700">Total users</Link>
                <span className="font-semibold text-slate-700">{totalUsers}</span>
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Latest signups</h3>
            <ul className="mt-3 space-y-2.5">
              {recent.length === 0 ? (
                <p className="text-sm text-slate-500">No users yet.</p>
              ) : (
                recent.map((u) => (
                  <li key={u.id} className="flex items-center gap-2.5">
                    <Avatar name={u.name ?? u.email} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{u.name ?? "–"}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
