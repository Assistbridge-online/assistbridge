import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { sendEmail, escapeHtml } from "@/lib/email";
import { verifyWebhookSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaystackChargeEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    status: string;
    channel?: string;
    customer?: { email: string };
    metadata?: { orderId?: string };
  };
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: PaystackChargeEvent;
  try {
    event = verifyWebhookSignature(rawBody, signature) as PaystackChargeEvent;
  } catch (error) {
    console.error("[paystack:webhook:verify]", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "charge.failed":
        await handleChargeFailed(event.data);
        break;
      case "refund.processed":
        await handleRefundProcessed(event.data);
        break;
      default:
        console.log("[paystack:webhook:unhandled]", event.event);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paystack:webhook:handler]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function orderIdFrom(event: PaystackChargeEvent["data"]): string | null {
  return event.metadata?.orderId ?? event.reference ?? null;
}

async function handleChargeSuccess(data: PaystackChargeEvent["data"]) {
  const orderId = orderIdFrom(data);
  if (!orderId) return;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true },
  });
  if (!order) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-paystack` },
    update: { status: "SUCCEEDED", gatewayRef: data.reference },
    create: {
      id: `${orderId}-paystack`,
      orderId,
      gateway: "PAYSTACK",
      amount: data.amount / 100,
      currency: (data.currency ?? "USD").toUpperCase(),
      status: "SUCCEEDED",
      gatewayRef: data.reference,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  if (order.client?.email) {
    await sendEmail({
      to: order.client.email,
      subject: `Payment received for order #${order.id.slice(-8)}`,
      html: `<p>Hi ${escapeHtml(order.client.name ?? "there")},</p><p>Your Paystack payment for <strong>${escapeHtml(order.title)}</strong> was successful. Your expert has been notified and will start work shortly.</p><p><a href="${siteConfig.url}/dashboard/orders/${order.id}">View order</a></p>`,
    });
  }
}

async function handleChargeFailed(data: PaystackChargeEvent["data"]) {
  const orderId = orderIdFrom(data);
  if (!orderId) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-paystack` },
    update: { status: "FAILED", gatewayRef: data.reference },
    create: {
      id: `${orderId}-paystack`,
      orderId,
      gateway: "PAYSTACK",
      amount: data.amount / 100,
      currency: (data.currency ?? "USD").toUpperCase(),
      status: "FAILED",
      gatewayRef: data.reference,
    },
  });
}

async function handleRefundProcessed(data: PaystackChargeEvent["data"]) {
  const payment = await prisma.payment.findFirst({
    where: { gatewayRef: data.reference, gateway: "PAYSTACK" },
    include: { order: { include: { client: true } } },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED" },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "CANCELLED" },
  });

  if (payment.order.client?.email) {
    await sendEmail({
      to: payment.order.client.email,
      subject: `Refund processed for order #${payment.order.id.slice(-8)}`,
      html: `<p>Hi ${escapeHtml(payment.order.client.name ?? "there")},</p><p>A refund of <strong>${(data.amount / 100).toFixed(2)} ${escapeHtml((data.currency ?? "USD").toUpperCase())}</strong> has been processed for your order. Funds typically appear in your account within 3–5 business days.</p>`,
    });
  }
}
