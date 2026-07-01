"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth, signIn } from "@/auth";
import { sendEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";
import {
  payOrderWithStripe,
  payOrderWithPayPal,
  markOrderPaid,
  releaseFundsToExpert,
  refundOrder,
  completePayPalPayment,
} from "@/lib/actions/payment";

export type CheckoutData = {
  title: string;
  brief: string;
  serviceSlug: string;
  levelSlug: string;
  subject: string;
  deadlineAt: string;
  pages: number;
  price: number;
};

function getBaseUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ─── Original payment/delivery actions ─── */

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

/* ─── Guest checkout / Stripe-first flow ─── */

export async function createCheckoutAction(formData: FormData) {
  const title = formData.get("title") as string;
  const brief = formData.get("brief") as string;
  const serviceSlug = formData.get("serviceSlug") as string;
  const levelSlug = formData.get("levelSlug") as string;
  const subject = formData.get("subject") as string;
  const deadlineAt = formData.get("deadlineAt") as string;
  const pages = parseInt(formData.get("pages") as string, 10);
  const price = parseFloat(formData.get("quotedPrice") as string);

  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." };
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: Math.round(price * 100),
        product_data: { name: title || "Project order" },
      },
      quantity: 1,
    }],
    success_url: `${getBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/pricing`,
    metadata: {
      title, brief, serviceSlug, levelSlug, subject, deadlineAt,
      pages: pages.toString(),
      price: price.toString(),
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");

  return { ok: true as const, redirect: session.url };
}

export async function registerAfterPayment(sessionId: string, name: string, email: string, password: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { ok: false as const, error: "Payment has not been completed." };
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { ok: false as const, error: "An account with this email already exists. Please sign in." };
  }

  const meta = session.metadata as Record<string, string> | null;
  if (!meta) {
    return { ok: false as const, error: "Session data missing." };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationCode.create({
    data: { email: email.toLowerCase(), code, expiresAt },
  });

  const baseUrl = getBaseUrl();
  await sendEmail({
    to: email,
    subject: "Verify your email — AssistBridge",
    html: `
      <p>Hi ${name},</p>
      <p>Your payment was successful. Please use the code below to verify your email and create your account:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f1f5f9;border-radius:8px;font-family:monospace;">${code}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>After verification, you will be logged in automatically.</p>
      <p><a href="${baseUrl}/verify-email?email=${encodeURIComponent(email.toLowerCase())}&session_id=${sessionId}">Click here to verify</a></p>
    `,
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
  });

  return {
    ok: true as const,
    email: email.toLowerCase(),
    sessionId,
    name,
    password,
    code,
  };
}

export async function confirmVerificationCode(email: string, code: string, name: string, password: string, sessionId: string) {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email: email.toLowerCase(),
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false as const, error: "Invalid or expired code. Please request a new one." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      hashedPassword,
      emailVerified: new Date(),
      role: "CLIENT",
    },
  });

  await prisma.clientProfile.create({
    data: { userId: user.id },
  });

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const meta = session.metadata as Record<string, string>;

  const service = await prisma.service.findUnique({ where: { slug: meta.serviceSlug } });
  const level = await prisma.academicLevel.findUnique({ where: { slug: meta.levelSlug } });

  const deadline = new Date(meta.deadlineAt);
  const deadlineType = !isNaN(deadline.getTime()) && (deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000)
    ? "urgent" : "standard";

  const order = await prisma.order.create({
    data: {
      title: meta.title,
      brief: meta.brief,
      clientId: user.id,
      serviceId: service?.id,
      academicLevelId: level?.id,
      subject: meta.subject,
      pageCount: parseInt(meta.pages, 10),
      quotedPrice: parseFloat(meta.price),
      deadline: !isNaN(deadline.getTime()) ? deadline : null,
      deadlineType,
      status: "PAID",
    },
  });

  await prisma.payment.create({
    data: {
      id: `${order.id}-stripe`,
      orderId: order.id,
      gateway: "STRIPE",
      amount: parseFloat(meta.price),
      currency: "USD",
      status: "SUCCEEDED",
      gatewayRef: session.payment_intent as string ?? session.id,
    },
  });

  return {
    ok: true as const,
    redirectTo: `/dashboard/orders/${order.id}`,
    email: email.toLowerCase(),
  };
}

export async function resendVerificationCode(email: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationCode.create({
    data: { email: email.toLowerCase(), code, expiresAt },
  });

  await sendEmail({
    to: email,
    subject: "New verification code — AssistBridge",
    html: `<p>Your new verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f1f5f9;border-radius:8px;font-family:monospace;">${code}</p><p>Expires in 10 minutes.</p>`,
    text: `Your verification code is: ${code}`,
  });

  return { ok: true as const };
}
