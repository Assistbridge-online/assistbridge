import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = await req.json();
    if (action !== "refund" && action !== "release") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const resolution = action === "refund" ? "Refunded in full to client." : "Released to expert.";
    const newOrderStatus = action === "refund" ? "CANCELLED" : "COMPLETED";
    await prisma.dispute.update({
      where: { id },
      data: { status: "RESOLVED", resolution },
    });
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (dispute) {
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: { status: newOrderStatus as any },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
