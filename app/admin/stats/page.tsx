import { prisma } from "@/lib/db";
import { StatManager } from "@/components/admin/stat-manager";


export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Site stats" };

export default async function AdminStatsPage() {
  const items = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Site stats</h1>
      <p className="mt-1 text-slate-600">The numbers shown on the home page and about page hero.</p>
      <div className="mt-8">
        <StatManager items={items} />
      </div>
    </>
  );
}
