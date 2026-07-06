import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrderDetailClient } from "@/components/order-detail-client";

function formatGateway(gateway: string): string {
  switch (gateway.toUpperCase()) {
    case "STRIPE":
      return "Stripe";
    case "PAYPAL":
      return "PayPal";
    case "PAYSTACK":
      return "Paystack";
    default:
      return gateway;
  }
}

export const dynamic = "force-dynamic";
const DEMO_ORDERS: Record<string, any> = {
  "ORD-2841": {
    id: "ORD-2841", title: "Statistical analysis for climate paper", status: "IN_PROGRESS",
    expert: { name: "Dr. Sarah Chen", img: 1, country: "Singapore", rating: 4.9 },
    amount: 850, currency: "USD", created: "2026-01-15", deadline: "2026-02-15",
    brief: "I need a comprehensive statistical analysis of climate data from 1990-2024...",
    files: [{ name: "climate_data_2024.csv", size: "12.4 MB" }, { name: "research_brief.pdf", size: "1.2 MB" }],
    deliveries: [{ name: "analysis_v1.pdf", size: "3.8 MB", date: "2026-01-22" }],
    messages: [
      { from: "Dr. Sarah Chen", body: "Thanks for the brief. I've reviewed the data and have a few clarifying questions. Could you confirm whether the missing values should be interpolated or treated as NA?", time: "2026-01-16 10:24", expert: true },
      { from: "You", body: "Please interpolate using linear interpolation. Also, can we add significance testing for the trend?", time: "2026-01-16 14:08", expert: false },
      { from: "Dr. Sarah Chen", body: "Perfect, will do. I'll have a first draft of the analysis by Friday.", time: "2026-01-16 14:32", expert: true },
      { from: "Dr. Sarah Chen", body: "First draft is uploaded! Let me know what you think.", time: "2026-01-22 09:15", expert: true },
    ],
    payment: { method: "Stripe", ref: "pi_3ONxxx", status: "SUCCEEDED", date: "2026-01-15" },
  },
  "ORD-2837": {
    id: "ORD-2837", title: "Thesis chapter 3: methodology rewrite", status: "DELIVERED",
    expert: { name: "Aisha Mwangi", img: 3, country: "Kenya", rating: 4.8 },
    amount: 420, currency: "USD", created: "2026-01-12", deadline: "2026-01-25",
    brief: "Rewrite of chapter 3 for doctoral thesis, focused on methodology section. Needs academic tone, proper citations, and clearer logical structure.",
    files: [{ name: "chapter_3_draft.docx", size: "0.8 MB" }],
    deliveries: [{ name: "chapter_3_rewrite.docx", size: "0.9 MB", date: "2026-01-22" }],
    messages: [
      { from: "Aisha Mwangi", body: "First draft of the rewrite is ready for your review.", time: "2026-01-22 11:00", expert: true },
    ],
    payment: { method: "Stripe", ref: "pi_3ONabc", status: "SUCCEEDED", date: "2026-01-12" },
  },
  "ORD-2855": {
    id: "ORD-2855", title: "Time-series forecasting for retail sales", status: "QUOTED",
    expert: { name: "Liam Foster", img: 6, country: "Australia", rating: 4.7 },
    amount: 950, currency: "USD", created: "2026-01-25", deadline: "2026-02-20",
    brief: "Forecast 12 months of retail sales using time-series methods. Need confidence intervals and model diagnostics.",
    files: [], deliveries: [], messages: [],
    payment: { method: "Pending", ref: "—", status: "PENDING", date: "—" },
  },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { client: true, expert: true, service: true, payments: true },
  });

  if (order) {
    const data = {
      id: order.id,
      title: order.title,
      status: order.status as any,
      expert: { name: order.expert?.name ?? "Unassigned", img: 1, country: "—", rating: 4.9 },
      amount: order.finalPrice ?? order.budget ?? 0,
      currency: order.currency,
      created: order.createdAt.toISOString(),
      deadline: order.deadline?.toISOString() ?? new Date().toISOString(),
      brief: order.brief,
      files: [],
      deliveries: [],
      messages: [],
      payment: {
        method: formatGateway(order.payments[0]?.gateway ?? "Pending"),
        ref: order.payments[0]?.gatewayRef ?? "—",
        status: (order.payments[0]?.status ?? "PENDING") as any,
        date: order.payments[0]?.createdAt.toISOString() ?? "—",
      },
    };
    return <OrderDetailClient order={data} />;
  }

  const demo = DEMO_ORDERS[id];
  if (demo) {
    return <OrderDetailClient order={demo} />;
  }

  notFound();
}
