import { prisma } from "@/lib/db";
import { FaqManager } from "@/components/admin/faq-manager";

export const metadata = { title: "Admin · FAQ" };

export default async function AdminFaqPage() {
  const items = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">FAQ</h1>
      <p className="mt-1 text-slate-600">Frequently asked questions shown on the FAQ page.</p>
      <div className="mt-8">
        <FaqManager items={items as any} />
      </div>
    </>
  );
}
