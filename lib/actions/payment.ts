"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { siteConfig } from "@/lib/site";
import { sendEmail } from "@/lib/email";
import { createCheckoutSession, createPaymentIntent, refundPayment } from "@/lib/stripe";
import { createOrder as createPayPalOrder, captureOrder as capturePayPalOrder } from "@/lib/paypal";
import {
  initializeTransaction,
  verifyTransaction,
  refundTransaction,
  isSupportedCurrency,
} from "@/lib/paystack";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

async function getOrderForClient(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, expert: true, service: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.clientId !== userId) throw new Error("Forbidden");
  return order;
}

export async function payOrderWithStripe(orderId: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);
  const amount = order.finalPrice ?? order.budget ?? 0;
  if (amount <= 0) throw new Error("Invalid order amount");

  await prisma.payment.upsert({
    where: { id: `${order.id}-stripe` },
    update: { status: "PENDING" },
    create: {
      id: `${order.id}-stripe`,
      orderId: order.id,
      gateway: "STRIPE",
      amount,
      currency: order.currency,
      status: "PENDING",
    },
  });

  const baseUrl = siteConfig.url;
  const { url } = await createCheckoutSession({
    orderId: order.id,
    amount,
    currency: order.currency,
    successUrl: `${baseUrl}/dashboard/orders/${order.id}/success`,
    cancelUrl: `${baseUrl}/dashboard/orders/${order.id}`,
    customerEmail: user.email ?? undefined,
    description: order.service?.name ?? order.title,
    metadata: { orderId: order.id, userId: user.id },
  });

  return { url };
}

export async function payOrderWithPayPal(orderId: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);
  const amount = order.finalPrice ?? order.budget ?? 0;
  if (amount <= 0) throw new Error("Invalid order amount");

  await prisma.payment.upsert({
    where: { id: `${order.id}-paypal` },
    update: { status: "PENDING" },
    create: {
      id: `${order.id}-paypal`,
      orderId: order.id,
      gateway: "PAYPAL",
      amount,
      currency: order.currency,
      status: "PENDING",
    },
  });

  const baseUrl = siteConfig.url;
  const { approvalUrl, id: paypalOrderId } = await createPayPalOrder({
    amount,
    currency: order.currency,
    description: order.service?.name ?? order.title,
    customId: order.id,
    returnUrl: `${baseUrl}/dashboard/orders/${order.id}/paypal/success?token=${paypalOrderIdPlaceholder()}`,
    cancelUrl: `${baseUrl}/dashboard/orders/${order.id}`,
  });

  return { url: approvalUrl, paypalOrderId };
}

function paypalOrderIdPlaceholder() {
  return "{paypalOrderId}";
}

export async function payOrderWithPaystack(orderId: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);
  const amount = order.finalPrice ?? order.budget ?? 0;
  if (amount <= 0) throw new Error("Invalid order amount");

  if (!isSupportedCurrency(order.currency)) {
    throw new Error(
      `Paystack does not support ${order.currency}. Update the order currency to one of: NGN, GHS, ZAR, USD.`
    );
  }

  // We use `${orderId}-paystack` as a stable Payment row id so upserts
  // are idempotent. The Paystack transaction reference is also stashed on
  // the row when verify confirms the charge (used by refundOrder).
  await prisma.payment.upsert({
    where: { id: `${order.id}-paystack` },
    update: { status: "PENDING" },
    create: {
      id: `${order.id}-paystack`,
      orderId: order.id,
      gateway: "PAYSTACK",
      amount,
      currency: order.currency,
      status: "PENDING",
    },
  });

  const baseUrl = siteConfig.url;
  const { authorizationUrl, reference } = await initializeTransaction({
    email: user.email ?? "",
    amount,
    currency: order.currency,
    reference: orderId,
    callbackUrl: `${baseUrl}/dashboard/orders/${order.id}/paystack/success`,
    metadata: { orderId: order.id, userId: user.id },
  });

  // Persist the Paystack reference immediately so webhooks + manual verify
  // can find the payment row even before the user returns to /success.
  await prisma.payment.update({
    where: { id: `${order.id}-paystack` },
    data: { gatewayRef: reference },
  });

  return { url: authorizationUrl, reference };
}

export async function completePaystackPayment(orderId: string, reference: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);

  const txn = await verifyTransaction(reference);
  if (txn.status !== "success") {
    throw new Error(`Payment not successful (status: ${txn.status}).`);
  }
  if (!user.email || txn.customer?.email?.toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("Payment was made by a different email than this account.");
  }

  await markOrderPaid(orderId, "PAYSTACK", txn.reference);

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `Payment received for order #${order.id.slice(-8)}`,
      html: `<p>Hi ${escapeHtml(user.name ?? "there")},</p><p>Your Paystack payment of ${escapeHtml((txn.amount / 100).toFixed(2))} ${escapeHtml(txn.currency)} has been received. Your expert will be notified and start work shortly.</p>`,
    });
  }

  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true, status: txn.status };
}

export async function completePayPalPayment(orderId: string, paypalOrderId: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);

  const capture = await capturePayPalOrder(paypalOrderId) as {
    status: string;
    purchase_units?: { payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[] } }[];
  };

  const captureData = capture.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captureData) throw new Error("PayPal capture returned no data");

  await markOrderPaid(orderId, "PAYPAL", captureData.id);

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `Payment received for order #${order.id.slice(-8)}`,
      html: `<p>Hi ${escapeHtml(user.name ?? "there")},</p><p>Your PayPal payment of ${escapeHtml(captureData.amount.value)} ${escapeHtml(captureData.amount.currency_code)} has been received. Your expert will be notified and start work shortly.</p>`,
    });
  }

  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true, status: captureData.status };
}

export async function markOrderPaid(
  orderId: string,
  gateway: "STRIPE" | "PAYPAL" | "PAYSTACK",
  gatewayRef: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  await prisma.payment.upsert({
    where: { id: `${orderId}-${gateway.toLowerCase()}` },
    update: {
      status: "SUCCEEDED",
      gatewayRef,
    },
    create: {
      id: `${orderId}-${gateway.toLowerCase()}`,
      orderId,
      gateway,
      amount: order.finalPrice ?? order.budget ?? 0,
      currency: order.currency,
      status: "SUCCEEDED",
      gatewayRef,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function releaseFundsToExpert(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { expert: true, client: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.clientId !== user.id) throw new Error("Forbidden");
  if (order.status !== "DELIVERED") throw new Error("Order must be delivered before funds can be released");

  const payment = await prisma.payment.findFirst({
    where: { orderId, status: "SUCCEEDED" },
  });
  if (!payment) throw new Error("No successful payment found");

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "RELEASED" },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED" },
  });

  if (order.expert?.email) {
    await sendEmail({
      to: order.expert.email,
      subject: `Funds released for order #${order.id.slice(-8)}`,
      html: `<p>Great news! The client has approved the delivery for <strong>${escapeHtml(order.title)}</strong>. Funds have been released to your account.</p>`,
    });
  }

  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function refundOrder(orderId: string, amount?: number) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.clientId !== user.id) throw new Error("Forbidden");

  const payment = await prisma.payment.findFirst({
    where: { orderId, status: "SUCCEEDED" },
  });
  if (!payment || !payment.gatewayRef) throw new Error("No refundable payment");

  if (payment.gateway === "STRIPE") {
    const result = await refundPayment(payment.gatewayRef, amount);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    return { success: true, refundId: result.id };
  }

  if (payment.gateway === "PAYSTACK") {
    if (!payment.gatewayRef) throw new Error("No Paystack reference found on payment");
    const result = await refundTransaction({
      transactionReference: payment.gatewayRef,
      amount,
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    return { success: true, refundId: result.id };
  }

  throw new Error("Refund for this gateway must be processed manually");
}

export async function createEmbeddedPaymentIntent(orderId: string) {
  const user = await requireUser();
  const order = await getOrderForClient(orderId, user.id);
  const amount = order.finalPrice ?? order.budget ?? 0;
  if (amount <= 0) throw new Error("Invalid order amount");

  return createPaymentIntent({
    amount,
    currency: order.currency,
    metadata: { orderId: order.id, userId: user.id },
    customerEmail: user.email ?? undefined,
    description: order.service?.name ?? order.title,
  });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Human-readable gateway label for display (e.g. "Stripe", "PayPal",
 * "Paystack"). Use this in any UI that renders a `Payment.gateway` value.
 */
export async function formatGateway(gateway: string): Promise<string> {
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
