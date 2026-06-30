import { prisma } from "@/lib/db";
import { TeamManager } from "@/components/admin/team-manager";

export const metadata = { title: "Admin · Team" };

export default async function AdminTeamPage() {
  const items = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Team</h1>
      <p className="mt-1 text-slate-600">Team members shown on the about page.</p>
      <div className="mt-8">
        <TeamManager items={items as any} />
      </div>
    </>
  );
}
