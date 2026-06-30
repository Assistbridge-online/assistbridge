import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { sendEmail, escapeHtml } from "@/lib/email";
import { getOrderDetails, verifyWebhookSignature } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    status?: string;
    custom_id?: string;
    purchase_units?: {
      custom_id?: string;
      reference_id?: string;
      payments?: {
        captures?: {
          id: string;
          status: string;
          amount: { currency_code: string; value: string };
        }[];
      };
    }[];
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const event = body as PayPalWebhookEvent;

  const transmissionId = req.headers.get("paypal-transmission-id");
  const transmissionTime = req.headers.get("paypal-transmission-time");
  const transmissionSig = req.headers.get("paypal-transmission-sig");
  const authAlgo = req.headers.get("paypal-auth-algo");
  const certUrl = req.headers.get("paypal-cert-url");
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (process.env.NODE_ENV === "production" && webhookId) {
    if (!transmissionId || !transmissionTime || !transmissionSig || !authAlgo || !certUrl) {
      return NextResponse.json({ error: "Missing PayPal headers" }, { status: 400 });
    }
    try {
      const verification = await verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: event,
      });
      if (verification.verification_status !== "SUCCESS") {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } catch (error) {
      console.error("[paypal:webhook:verify]", error);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }
  }

  try {
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        await handleOrderApproved(event);
        break;
      case "PAYMENT.CAPTURE.COMPLETED":
        await handleCaptureCompleted(event);
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
        await handleCaptureRefunded(event);
        break;
      default:
        console.log("[paypal:webhook:unhandled]", event.event_type);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paypal:webhook:handler]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleOrderApproved(event: PayPalWebhookEvent) {
  const orderId = event.resource.custom_id ?? event.resource.purchase_units?.[0]?.custom_id;
  if (!orderId || !event.resource.id) return;

  try {
    const details = await getOrderDetails(event.resource.id);
    const id = (details as { id?: string }).id ?? event.resource.id;
    console.log("[paypal:order:approved]", { orderId, paypalOrderId: id });
  } catch (error) {
    console.error("[paypal:order:approved:fetch]", error);
  }
}

async function handleCaptureCompleted(event: PayPalWebhookEvent) {
  const orderId =
    event.resource.custom_id ??
    event.resource.purchase_units?.[0]?.custom_id;
  if (!orderId) return;

  const capture = event.resource.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true },
  });
  if (!order) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-paypal` },
    update: { status: "SUCCEEDED", gatewayRef: capture.id },
    create: {
      id: `${orderId}-paypal`,
      orderId,
      gateway: "PAYPAL",
      amount: parseFloat(capture.amount.value),
      currency: capture.amount.currency_code,
      status: "SUCCEEDED",
      gatewayRef: capture.id,
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
      html: `<p>Hi ${escapeHtml(order.client.name ?? "there")},</p><p>Your PayPal payment for <strong>${escapeHtml(order.title)}</strong> was successful. Your expert has been notified and will start work shortly.</p><p><a href="${siteConfig.url}/dashboard/orders/${order.id}">View order</a></p>`,
    });
  }
}

async function handleCaptureRefunded(event: PayPalWebhookEvent) {
  const orderId =
    event.resource.custom_id ??
    event.resource.purchase_units?.[0]?.custom_id;
  if (!orderId) return;

  const payment = await prisma.payment.findFirst({
    where: { orderId, gateway: "PAYPAL" },
    include: { order: { include: { client: true } } },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED" },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  if (payment.order.client?.email) {
    await sendEmail({
      to: payment.order.client.email,
      subject: `Refund processed for order #${payment.order.id.slice(-8)}`,
      html: `<p>Hi ${escapeHtml(payment.order.client.name ?? "there")},</p><p>Your PayPal payment for this order has been refunded. Funds typically appear in your account within 3–5 business days.</p>`,
    });
  }
}
