import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DisputeManager } from "@/components/admin/dispute-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Disputes" };

export default async function DisputesPage() {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          client: { select: { name: true } },
          expert: { select: { name: true } },
        },
      },
    },
  });

  const items = disputes.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    title: d.order.title,
    client: d.order.client?.name ?? "–",
    expert: d.order.expert?.name ?? "–",
    reason: d.reason,
    amount: d.order.finalPrice ?? 0,
    status: d.status,
    opened: d.createdAt.toISOString(),
    resolution: d.resolution,
  }));

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Disputes</h1>
      <p className="mt-1 text-slate-600">Mediate and resolve order disputes.</p>
      <div className="mt-8">
        <DisputeManager disputes={items} />
      </div>
    </>
  );
}
