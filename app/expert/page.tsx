import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, StatusBadge, EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, DollarSign, Star, CheckCircle2, ArrowRight, Inbox, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpertOverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeJobs, monthEarnings, expertProfile, myJobs, availableJobs, completedCount, rating] = await Promise.all([
    prisma.order.count({ where: { expertId: userId, status: { in: ["PAID", "IN_PROGRESS", "DELIVERED", "REVISION_REQUESTED"] } } }),
    prisma.payment.aggregate({ where: { order: { expertId: userId }, status: { in: ["SUCCEEDED", "RELEASED"] }, createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.expertProfile.findUnique({ where: { userId } }),
    prisma.order.findMany({ where: { expertId: userId }, orderBy: { updatedAt: "desc" }, take: 4, include: { client: { select: { name: true } } } }),
    prisma.order.findMany({ where: { expertId: null, status: { in: ["QUOTED", "PAID"] } }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.order.count({ where: { expertId: userId, status: "COMPLETED" } }),
    expertProfile?.rating ?? 0,
  ]);

  const platformFee = 0.15;
  const monthNet = (monthEarnings._sum.amount ?? 0) * (1 - platformFee);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-slate-600">Here&apos;s your expert dashboard at a glance.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/expert/jobs"><span className="inline-flex items-center gap-1">Browse available jobs <ArrowRight className="h-4 w-4" /></span></Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active jobs" value={activeJobs} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="This month" value={formatCurrency(monthNet)} change={{ value: `net of ${(platformFee * 100).toFixed(0)}% fee` }} icon={<DollarSign className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Rating" value={rating.toFixed(1)} icon={<Star className="h-5 w-5" />} accent="amber" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">My active jobs</h2>
            <Link href="/expert/orders" className="text-sm font-semibold text-primary-700 hover:text-primary-900">View all</Link>
          </div>
          {myJobs.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No jobs yet"
              description="Browse available jobs and apply to start working."
              action={
                <Button asChild>
                  <Link href="/expert/jobs"><span>Browse jobs</span></Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myJobs.map((j) => (
                <Link key={j.id} href={`/expert/orders/${j.id}`} className="block p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">{j.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">#{j.id.slice(-6)} · {j.client?.name ?? "Client"} · Due {j.deadline ? formatDate(j.deadline) : "–"}</div>
                    </div>
                    <StatusBadge status={j.status} />
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {j.finalPrice ? formatCurrency(j.finalPrice, j.currency) : <span className="text-slate-400">Quote pending</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-600" /> New jobs for you
            </h2>
            <Link href="/expert/jobs" className="text-sm font-semibold text-primary-700 hover:text-primary-900">View all</Link>
          </div>
          {availableJobs.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No open jobs right now. Check back later.</p>
          ) : (
            <div className="space-y-3">
              {availableJobs.slice(0, 3).map((j) => (
                <div key={j.id} className="p-3 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">{j.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Due {j.deadline ? formatDate(j.deadline) : "–"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-slate-900">
                        {j.finalPrice ? formatCurrency(j.finalPrice, j.currency) : <span className="text-slate-400">–</span>}
                      </div>
                      <Button size="sm" asChild className="mt-2">
                        <Link href={`/expert/orders/${j.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
