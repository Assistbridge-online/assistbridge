import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard-widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Inbox, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; minBudget?: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const minBudget = params.minBudget ? parseFloat(params.minBudget) : undefined;

  const jobs = await prisma.order.findMany({
    where: {
      expertId: null,
      status: { in: ["QUOTED", "PAID"] },
      ...(search ? { OR: [{ title: { contains: search } }, { brief: { contains: search } }] } : {}),
      ...(minBudget ? { finalPrice: { gte: minBudget } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { service: { select: { name: true, category: true } } },
  });

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Available jobs</h1>
      <p className="mt-1 text-slate-600">Open requests waiting for an expert. Apply to start working.</p>

      <Card className="mt-8 p-4">
        <form className="flex flex-wrap gap-2" method="get">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search jobs..."
              className="h-9 w-full pl-9 pr-3 rounded-md border border-slate-300 text-sm"
            />
          </div>
          <select name="minBudget" defaultValue={params.minBudget ?? ""} className="h-9 px-3 rounded-md border border-slate-300 text-sm bg-white">
            <option value="">Any budget</option>
            <option value="50">$50+</option>
            <option value="200">$200+</option>
            <option value="500">$500+</option>
            <option value="1000">$1,000+</option>
          </select>
          <button type="submit" className="h-9 px-4 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800">Filter</button>
        </form>
      </Card>

      {jobs.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No open jobs right now"
            description="Check back later. New requests come in throughout the day."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((j) => (
            <Card key={j.id} hover className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{j.title}</h3>
                    {j.service && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-accent-50 text-accent-700">
                        {j.service.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-slate-600 line-clamp-2">{j.brief}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Due {j.deadline ? formatDate(j.deadline) : "–"}</span>
                    {j.pageCount && <span>~{j.pageCount} pages</span>}
                    <span>#{j.id.slice(-6)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-slate-900">
                    {j.finalPrice ? formatCurrency(j.finalPrice, j.currency) : <span className="text-slate-400">–</span>}
                  </div>
                  <Button asChild className="mt-2">
                    <Link href={`/expert/orders/${j.id}`}>View &amp; apply</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
