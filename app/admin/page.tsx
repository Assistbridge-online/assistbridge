import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Award,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Dashboard",
};

// --- Local presentational primitives ---------------------------------------
// We intentionally do NOT use the shared <Card> here — the admin overview
// uses tighter density and a "metabox" header strip (small uppercase title
// on a slate background) that's specific to WP-style admin consoles.

function MetaBox({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function AtAGlance({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  accent: "emerald" | "blue" | "amber" | "violet";
}) {
  const accentMap = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  } as const;
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 flex items-start gap-3">
      <div
        className={`shrink-0 h-10 w-10 rounded-md ring-1 flex items-center justify-center ${accentMap[accent]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">
          {value}
        </div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    PAID: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-violet-100 text-violet-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    REVISION_REQUESTED: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-slate-100 text-slate-700",
    DISPUTED: "bg-red-100 text-red-800",
    QUOTED: "bg-slate-100 text-slate-700",
  };
  const cls = palette[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// --- Page -----------------------------------------------------------------

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
  const platformFee = 0.15;
  const platformNet = monthRevenue * platformFee;

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-5">
      {/* ─── Welcome panel (WP-style) ─── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-md shadow-sm border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Admin Console
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              {dateLabel} — platform is operating normally.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              View orders
            </Link>
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
            >
              <Activity className="h-3.5 w-3.5" />
              Open inbox
            </Link>
          </div>
        </div>
      </div>

      {/* ─── At-a-glance stats (4 across on desktop) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AtAGlance
          label="Total users"
          value={totalUsers.toLocaleString()}
          sub="All roles"
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <AtAGlance
          label="Revenue · MTD"
          value={formatCurrency(platformNet)}
          sub={`${formatCurrency(monthRevenue)} gross · 15% fee`}
          icon={<DollarSign className="h-5 w-5" />}
          accent="emerald"
        />
        <AtAGlance
          label="Active orders"
          value={activeOrders.toLocaleString()}
          sub={`${completedOrdersAgg} completed total`}
          icon={<FileText className="h-5 w-5" />}
          accent="violet"
        />
        <AtAGlance
          label="Open disputes"
          value={openDisputes.toLocaleString()}
          sub={`${pendingExperts + pendingApps} pending review`}
          icon={<AlertCircle className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      {/* ─── Two-column main row: recent orders + side panel ─── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <MetaBox
          className="lg:col-span-2"
          title="Recent orders"
          action={
            <Link
              href="/admin/orders"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-2 font-bold">Order</th>
                    <th className="px-4 py-2 font-bold">Client → Expert</th>
                    <th className="px-4 py-2 font-bold">Status</th>
                    <th className="px-4 py-2 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 max-w-[14rem]">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-slate-900 hover:text-emerald-700 truncate block"
                        >
                          {o.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-mono">
                          #{o.id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600">
                        <span className="text-slate-900">
                          {o.client?.name ?? "—"}
                        </span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="text-slate-900">
                          {o.expert?.name ?? "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900 tabular-nums">
                        {o.finalPrice
                          ? formatCurrency(o.finalPrice, o.currency)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MetaBox>

        <div className="space-y-4">
          {/* Pending actions — clickable rows */}
          <MetaBox title="Pending actions">
            <ul className="divide-y divide-slate-100 -mx-4">
              <PendingRow
                href="/admin/experts"
                label="Expert applications"
                count={pendingExperts}
                tone="amber"
              />
              <PendingRow
                href="/admin/experts"
                label="Expert verifications"
                count={pendingApps}
                tone="amber"
              />
              <PendingRow
                href="/admin/disputes"
                label="Open disputes"
                count={openDisputes}
                tone="red"
              />
              <PendingRow
                href="/admin/support"
                label="Support replies"
                count={0}
                tone="blue"
              />
            </ul>
          </MetaBox>

          {/* Latest signups */}
          <MetaBox
            title="Latest signups"
            action={
              <Link
                href="/admin/users"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
              >
                All <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <ul className="space-y-2.5">
              {recent.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No users yet.</p>
              ) : (
                recent.map((u) => (
                  <li key={u.id} className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(u.name ?? u.email)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {u.name ?? "—"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {u.email}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {u.role}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </MetaBox>
        </div>
      </div>

      {/* ─── Bottom row: system health ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <HealthCell
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Auth"
          value="Operational"
          tone="emerald"
        />
        <HealthCell
          icon={<CreditCard className="h-4 w-4" />}
          label="Payments (Stripe)"
          value="Test mode"
          tone="amber"
        />
        <HealthCell
          icon={<Award className="h-4 w-4" />}
          label="Marketplace"
          value={`${activeOrders} active`}
          tone="blue"
        />
        <HealthCell
          icon={<Clock className="h-4 w-4" />}
          label="Avg response"
          value="< 24h"
          tone="emerald"
        />
      </div>
    </div>
  );
}

function PendingRow({
  href,
  label,
  count,
  tone,
}: {
  href: string;
  label: string;
  count: number;
  tone: "amber" | "red" | "blue";
}) {
  const toneCls = {
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  }[tone];
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition"
      >
        <span className="text-sm text-slate-700 group-hover:text-slate-900">
          {label}
        </span>
        <span
          className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded text-[11px] font-bold tabular-nums ${toneCls}`}
        >
          {count}
        </span>
      </Link>
    </li>
  );
}

function HealthCell({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "blue";
}) {
  const toneCls = {
    emerald: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
    blue: "text-blue-700 bg-blue-50",
  }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-3 flex items-center gap-3">
      <div className={`shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${toneCls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="text-sm font-semibold text-slate-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}