import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge, Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ role?: string; verified?: string; q?: string }> }) {
  const params = await searchParams;
  const role = params.role && params.role !== "all" ? params.role : undefined;
  const verified = params.verified === "verified" ? true : params.verified === "unverified" ? false : undefined;
  const search = params.q?.trim() || undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(verified === true ? { emailVerified: { not: null } } : {}),
      ...(verified === false ? { emailVerified: null } : {}),
      ...(search ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { ordersAsClient: true, ordersAsExpert: true } },
    },
  });

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Users</h1>
      <p className="mt-1 text-slate-600">All clients, experts, and admins.</p>

      <Card className="mt-8 p-4">
        <form className="flex flex-wrap gap-2" method="get">
          <select name="role" defaultValue={params.role ?? "all"} className="h-9 px-3 rounded-md border border-slate-300 text-sm bg-white">
            <option value="all">All roles</option>
            <option value="CLIENT">Clients</option>
            <option value="EXPERT">Experts</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select name="verified" defaultValue={params.verified ?? "all"} className="h-9 px-3 rounded-md border border-slate-300 text-sm bg-white">
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name or email..."
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm flex-1 min-w-[200px]"
          />
          <button type="submit" className="h-9 px-4 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800">Filter</button>
        </form>
      </Card>

      {users.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<Users className="h-6 w-6" />} title="No users match" />
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name ?? u.email} size={32} />
                      <div>
                        <div className="font-medium text-slate-900">{u.name ?? "–"}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                  <td className="px-4 py-3 text-slate-700">–</td>
                  <td className="px-4 py-3">
                    {u.emailVerified ? <span className="text-emerald-600 text-xs font-semibold">✓ Yes</span> : <span className="text-slate-500 text-xs">No</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u._count.ordersAsClient + u._count.ordersAsExpert}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
