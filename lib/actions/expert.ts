"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function applyToJob(orderId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { expertId: session.user.id, status: "PAID" },
  });
  await prisma.message.create({
    data: { orderId, fromUserId: session.user.id, body: message || "I'd like to work on this." },
  });
  revalidatePath(`/expert/orders/${orderId}`);
  return order;
}

export async function submitDelivery(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
  revalidatePath(`/expert/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function updateExpertProfile(data: {
  bio?: string;
  headline?: string;
  hourlyRate?: number;
  expertise?: string[];
  languages?: string[];
  education?: string;
  yearsExp?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const profile = await prisma.expertProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });
  revalidatePath("/expert/profile");
  return profile;
}
