import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Dashboard",
};

function StatusDot({ status }: { status: string }) {
  const palette: Record<string, string> = {
    PAID: "bg-blue-500",
    IN_PROGRESS: "bg-violet-500",
    DELIVERED: "bg-emerald-500",
    REVISION_REQUESTED: "bg-amber-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-gray-400",
    DISPUTED: "bg-red-500",
    QUOTED: "bg-gray-400",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${palette[status] ?? "bg-gray-400"}`} />
  );
}

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    pendingExperts,
    activeOrders,
    openDisputes,
    monthRevenueAgg,
    pendingApps,
    completedOrdersAgg,
    recent,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.expertProfile.count({ where: { status: "PENDING" } }),
    prisma.order.count({
      where: { status: { in: ["PAID", "IN_PROGRESS", "DELIVERED"] } },
    }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.payment.aggregate({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        status: { in: ["SUCCEEDED", "RELEASED"] },
      },
      _sum: { amount: true },
    }),
    prisma.expertApplication.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        client: { select: { name: true } },
        expert: { select: { name: true } },
      },
    }),
  ]);

  const monthRevenue = monthRevenueAgg._sum.amount ?? 0;
  const platformNet = monthRevenue * 0.15;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={totalUsers.toLocaleString()}
          sub="All roles"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Revenue MTD"
          value={formatCurrency(platformNet)}
          sub={`${formatCurrency(monthRevenue)} gross`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Active orders"
          value={activeOrders.toLocaleString()}
          sub={`${completedOrdersAgg} completed`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Open disputes"
          value={openDisputes.toLocaleString()}
          sub={`${pendingExperts + pendingApps} pending review`}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Recent orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Client → Expert</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 max-w-[14rem]">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-gray-900 hover:text-gray-700 truncate block"
                        >
                          {o.title}
                        </Link>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          #{o.id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        <span className="text-gray-900">{o.client?.name ?? "—"}</span>
                        <span className="mx-1.5 text-gray-300">&rarr;</span>
                        <span className="text-gray-900">{o.expert?.name ?? "Unassigned"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <StatusDot status={o.status} />
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900 tabular-nums">
                        {o.finalPrice ? formatCurrency(o.finalPrice, o.currency) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Pending actions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <PendingRow href="/admin/experts" label="Expert applications" count={pendingExperts} />
              <PendingRow href="/admin/experts" label="Expert verifications" count={pendingApps} />
              <PendingRow href="/admin/disputes" label="Open disputes" count={openDisputes} />
              <PendingRow href="/admin/support" label="Support replies" count={0} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Latest signups</h3>
              <Link
                href="/admin/users"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                View all
              </Link>
            </div>
            <div className="p-2">
              {recent.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No users yet.</p>
              ) : (
                <ul className="space-y-1">
                  {recent.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
                        {(u.name ?? u.email)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {u.name ?? "—"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {u.email}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{u.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function PendingRow({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm text-gray-900 font-medium tabular-nums">{count}</span>
    </Link>
  );
}