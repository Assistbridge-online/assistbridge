"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { siteConfig } from "@/lib/site";
import {
  payOrderWithStripe,
  payOrderWithPayPal,
  markOrderPaid,
  releaseFundsToExpert,
  refundOrder,
  completePayPalPayment,
} from "@/lib/actions/payment";

export async function startStripeCheckout(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  try {
    const { url } = await payOrderWithStripe(orderId);
    if (url) redirect(url);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function startPayPalCheckout(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  try {
    const { url } = await payOrderWithPayPal(orderId);
    if (url) redirect(url);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function completePayPal(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const paypalOrderId = String(formData.get("paypalOrderId") || "");
  if (!orderId || !paypalOrderId) return { error: "Missing data" };
  try {
    await completePayPalPayment(orderId, paypalOrderId);
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function releaseFundsAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  try {
    await releaseFundsToExpert(orderId);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function requestRevisionAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "REVISION_REQUESTED" },
  });
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/expert/orders/${orderId}`);
  return { success: true };
}

export async function markCompleteAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  try {
    await releaseFundsToExpert(orderId);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function submitDeliveryAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) return { error: "Missing orderId" };
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };
  if (order.expertId !== session.user.id) return { error: "Forbidden" };
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "DELIVERED" },
  });
  revalidatePath(`/expert/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function saveAsDraft(formData: FormData) {
  const orderId = await createOrderFromForm(formData, false);
  if (!orderId) return { error: "Failed to create draft" };
  redirect(`/dashboard/orders/${orderId}`);
}

export async function submitAndPayWithStripe(formData: FormData) {
  try {
    const orderId = await createOrderFromForm(formData, true);
    if (!orderId) return { error: "Failed to create order" };
    const { url } = await payOrderWithStripe(orderId);
    if (url) {
      return { ok: true, url, orderId };
    }
    return { ok: false, error: "No checkout URL returned", orderId };
  } catch (e) {
    console.error("[submitAndPayWithStripe]", e);
    return { ok: false, error: (e as Error).message };
  }
}

export async function submitAndPayWithPayPal(formData: FormData) {
  try {
    const orderId = await createOrderFromForm(formData, true);
    if (!orderId) return { error: "Failed to create order" };
    const { url } = await payOrderWithPayPal(orderId);
    if (url) {
      return { ok: true, url, orderId };
    }
    return { ok: false, error: "No checkout URL returned", orderId };
  } catch (e) {
    console.error("[submitAndPayWithPayPal]", e);
    return { ok: false, error: (e as Error).message };
  }
}

async function createOrderFromForm(formData: FormData, isQuote: boolean): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = String(formData.get("title") || "").trim();
  const serviceId = String(formData.get("serviceId") || "") || null;
  const brief = String(formData.get("brief") || "").trim();
  const deadline = String(formData.get("deadline") || "") || null;
  const pageCount = parseInt(String(formData.get("pageCount") || "0"), 10) || null;
  const rush = formData.get("rush") === "on" || formData.get("rush") === "true";

  if (!title || !brief) throw new Error("Title and brief are required");

  const service = serviceId
    ? await prisma.service.findUnique({ where: { id: serviceId } })
    : null;

  let finalPrice = 0;
  if (service && pageCount) {
    const base = pageCount * service.pricePerPage;
    finalPrice = rush ? base * service.rushMultiplier : base;
    finalPrice = Math.round(finalPrice * 100) / 100;
  } else if (service) {
    finalPrice = service.minPages * service.pricePerPage;
  } else if (pageCount) {
    finalPrice = pageCount * 50;
  }

  const order = await prisma.order.create({
    data: {
      clientId: session.user.id,
      serviceId: service?.id,
      title,
      brief,
      pageCount,
      deadline: deadline ? new Date(deadline) : null,
      budget: finalPrice,
      finalPrice,
      currency: "USD",
      status: isQuote ? "QUOTED" : "DRAFT",
    },
  });

  await prisma.message.create({
    data: {
      orderId: order.id,
      fromUserId: session.user.id,
      body: `Initial brief:\n\n${brief}`,
    },
  });

  revalidatePath("/dashboard/orders");
  return order.id;
}

export async function createDraftOrder(input: {
  serviceId?: string;
  title: string;
  brief: string;
  pageCount?: number;
  deadline?: string;
  budgetMax?: number;
  rush?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const service = input.serviceId
    ? await prisma.service.findUnique({ where: { id: input.serviceId } })
    : null;

  const pageCount = input.pageCount ?? 1;
  const pricePerPage = service?.pricePerPage ?? 0;
  const rushMultiplier = input.rush ? 1.5 : 1;
  const finalPrice = Math.round(pageCount * pricePerPage * rushMultiplier * 100) / 100;

  const order = await prisma.order.create({
    data: {
      clientId: session.user.id,
      serviceId: service?.id,
      title: input.title,
      brief: input.brief,
      pageCount,
      deadline: input.deadline ? new Date(input.deadline) : null,
      budget: finalPrice,
      finalPrice,
      currency: "USD",
      status: "QUOTED",
    },
  });

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}
