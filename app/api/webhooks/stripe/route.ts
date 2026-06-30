import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { sendEmail, escapeHtml } from "@/lib/email";
import { constructWebhookEvent } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(payload, signature);
  } catch (error) {
    console.error("[stripe:webhook:verify]", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        console.log("[stripe:webhook:unhandled]", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe:webhook:handler]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true },
  });
  if (!order) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-stripe` },
    update: {
      status: "SUCCEEDED",
      gatewayRef: session.payment_intent as string ?? session.id,
    },
    create: {
      id: `${orderId}-stripe`,
      orderId,
      gateway: "STRIPE",
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "usd").toUpperCase(),
      status: "SUCCEEDED",
      gatewayRef: (session.payment_intent as string) ?? session.id,
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
      html: `<p>Hi ${escapeHtml(order.client.name ?? "there")},</p><p>Your payment for <strong>${escapeHtml(order.title)}</strong> was successful. Your expert has been notified and will start working on your project.</p><p><a href="${siteConfig.url}/dashboard/orders/${order.id}">View order</a></p>`,
    });
  }
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-stripe` },
    update: { status: "SUCCEEDED", gatewayRef: intent.id },
    create: {
      id: `${orderId}-stripe`,
      orderId,
      gateway: "STRIPE",
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      status: "SUCCEEDED",
      gatewayRef: intent.id,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) return;

  await prisma.payment.upsert({
    where: { id: `${orderId}-stripe` },
    update: { status: "FAILED", gatewayRef: intent.id },
    create: {
      id: `${orderId}-stripe`,
      orderId,
      gateway: "STRIPE",
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      status: "FAILED",
      gatewayRef: intent.id,
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const intentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!intentId) return;

  const payment = await prisma.payment.findFirst({
    where: { gatewayRef: intentId, gateway: "STRIPE" },
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
      html: `<p>Hi ${escapeHtml(payment.order.client.name ?? "there")},</p><p>A refund of <strong>${(charge.amount_refunded / 100).toFixed(2)} ${escapeHtml(charge.currency.toUpperCase())}</strong> has been processed for your order. It may take 5–10 business days to appear on your statement.</p>`,
    });
  }
}
