import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ExpertOrderClient } from "@/components/expert-order-client";

const DEMO_JOBS: Record<string, any> = {
  "ORD-2841": {
    id: "ORD-2841", title: "Statistical analysis for climate paper", status: "IN_PROGRESS",
    client: { name: "Robert K.", country: "United States" },
    amount: 850, earnings: 722, deadline: "2026-02-15",
    brief: "I need a comprehensive statistical analysis of climate data from 1990-2024...",
    messages: [
      { from: "Robert K.", body: "Please interpolate using linear interpolation. Also, can we add significance testing for the trend?", time: "2026-01-16 14:08" },
      { from: "You", body: "Perfect, will do. I'll have a first draft of the analysis by Friday.", time: "2026-01-16 14:32" },
      { from: "Robert K.", body: "Sounds great, thanks!", time: "2026-01-16 15:01" },
    ],
  },
  "ORD-2830": {
    id: "ORD-2830", title: "Multilevel modeling for education study", status: "DELIVERED",
    client: { name: "Mei L.", country: "Australia" },
    amount: 600, earnings: 510, deadline: "2026-01-25",
    brief: "Multilevel modeling analysis for education research study. Sample of 60 schools, 30 students each.",
    messages: [{ from: "You", body: "First draft uploaded!", time: "2026-01-24 10:00" }],
  },
};

export default async function ExpertOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { client: true },
  });
  if (order) {
    return <ExpertOrderClient job={{
      id: order.id,
      title: order.title,
      status: order.status,
      client: { name: order.client.name ?? "Client", country: "—" },
      amount: order.finalPrice ?? 0,
      earnings: (order.finalPrice ?? 0) * 0.85,
      deadline: order.deadline?.toISOString() ?? new Date().toISOString(),
      brief: order.brief,
      messages: [],
    }} />;
  }
  const demo = DEMO_JOBS[id];
  if (demo) return <ExpertOrderClient job={demo} />;
  notFound();
}
