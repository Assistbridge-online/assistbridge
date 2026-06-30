"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.id;
}

export async function approveExpert(applicationId: string) {
  await requireAdmin();
  await prisma.expertApplication.update({
    where: { id: applicationId },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin/experts");
}

export async function rejectExpert(applicationId: string) {
  await requireAdmin();
  await prisma.expertApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin/experts");
}

export async function refundPayment(paymentId: string) {
  await requireAdmin();
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED" },
  });
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/payments");
}

export async function resolveDispute(disputeId: string, action: "refund" | "release", resolution: string) {
  await requireAdmin();
  const dispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: "RESOLVED", resolution },
  });
  const newOrderStatus = action === "refund" ? "CANCELLED" : "COMPLETED";
  await prisma.order.update({
    where: { id: dispute.orderId },
    data: { status: newOrderStatus as any },
  });
  revalidatePath("/admin/disputes");
}
