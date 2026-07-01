import { prisma } from "@/lib/db";
import { DisciplineManager } from "@/components/admin/discipline-manager";


export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Disciplines" };

export default async function AdminDisciplinesPage() {
  const disciplines = await prisma.discipline.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Disciplines</h1>
      <p className="mt-1 text-slate-600">Manage the disciplines shown on the site.</p>
      <div className="mt-8">
        <DisciplineManager items={disciplines as any} />
      </div>
    </>
  );
}
