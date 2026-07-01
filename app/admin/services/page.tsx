import { prisma } from "@/lib/db";
import { ServiceManager } from "@/components/admin/service-manager";


export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Services" };

export default async function AdminServicesPage() {
  const [services, disciplines] = await Promise.all([
    prisma.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.discipline.findMany({ orderBy: { order: "asc" } }),
  ]);
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Services</h1>
      <p className="mt-1 text-slate-600">Manage the service catalog shown to clients.</p>
      <div className="mt-8">
        <ServiceManager services={services as any} disciplines={disciplines} />
      </div>
    </>
  );
}
