import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatDate } from "@/lib/utils";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Experts" };

export default async function AdminExpertsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = params.status && params.status !== "all" ? params.status : undefined;

  const applications = await prisma.expertApplication.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
  });

  const verified = await prisma.expertProfile.findMany({
    where: status === "VERIFIED" ? { status: "VERIFIED" } : status ? { status: status as any } : {},
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = applications.length + verified.length;
  const pending = applications.filter((a) => a.status === "PENDING").length;
  const approved = verified.filter((e) => e.status === "VERIFIED").length;

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Expert applications</h1>
      <p className="mt-1 text-slate-600">Vet and approve experts joining the platform.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Card className="p-5"><div className="text-sm text-slate-500">Pending</div><div className="text-2xl font-bold text-amber-700">{pending}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Approved</div><div className="text-2xl font-bold text-emerald-700">{approved}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">Total applications</div><div className="text-2xl font-bold text-slate-700">{total}</div></Card>
      </div>

      {applications.length > 0 && (
        <div className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Applications</h2>
          {applications.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar name={a.name} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{a.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{a.status}</span>
                  </div>
                  <div className="text-sm text-slate-600">{a.email} · ${a.hourlyRate}/hr · {formatDate(a.createdAt)}</div>
                  <div className="mt-2 text-xs text-slate-500">Expertise: {a.expertise}</div>
                  <p className="mt-2 text-sm text-slate-700">{a.bio}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button className="h-9 px-4 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800">Approve</button>
                  <button className="h-9 px-4 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reject</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {verified.length > 0 && (
        <div className="mt-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Approved experts</h2>
          {verified.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar name={e.user.name ?? ""} src={e.user.name ? `https://i.pravatar.cc/100?u=${e.userId}` : undefined} size={56} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{e.user.name}</h3>
                  <div className="text-sm text-slate-600">{e.user.email} · {e.headline} · ${e.hourlyRate}/hr</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.expertise.split(",").map((x) => (
                      <span key={x} className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">{x}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm text-amber-600">★ {e.rating.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">{e.completedJobs} jobs</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {applications.length === 0 && verified.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={<Award className="h-6 w-6" />} title="No applications yet" />
        </div>
      )}
    </>
  );
}
