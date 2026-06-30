"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const createOrderSchema = z.object({
  title: z.string().min(5),
  discipline: z.string().min(1),
  service: z.string().optional(),
  brief: z.string().min(20),
  deadline: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = createOrderSchema.parse(input);
  const order = await prisma.order.create({
    data: {
      title: data.title,
      brief: data.brief,
      deadline: data.deadline ? new Date(data.deadline) : null,
      quotedPrice: data.budgetMax ?? null,
      clientId: session.user.id,
      status: "DRAFT",
    },
  });
  revalidatePath("/dashboard/orders");
  return order;
}

const saveOrderSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  brief: z.string().min(20, "Brief must be at least 20 characters"),
  serviceSlug: z.string().min(1, "Please select a service"),
  levelSlug: z.string().min(1, "Please select an academic level"),
  subject: z.string().min(1, "Please select a subject"),
  deadlineAt: z.string().min(1, "Please pick a deadline date and time"),
  deadlineDate: z.string().optional().default(""),
  deadlineTime: z.string().optional().default("17:00"),
  deadlineTimezone: z.string().optional().default("UTC"),
  pages: z.coerce.number().int().min(1),
  quotedPrice: z.coerce.number().min(0),
});

export async function saveCalculatorOrder(formData: FormData): Promise<{ ok: boolean; redirect?: string; error?: string }> {
  const session = await auth();
  let data;
  try {
    data = saveOrderSchema.parse({
      title: formData.get("title"),
      brief: formData.get("brief"),
      serviceSlug: formData.get("serviceSlug"),
      levelSlug: formData.get("levelSlug"),
      subject: formData.get("subject"),
      deadlineAt: formData.get("deadlineAt") ?? "",
      deadlineDate: formData.get("deadlineDate") ?? "",
      deadlineTime: formData.get("deadlineTime") ?? "17:00",
      deadlineTimezone: formData.get("deadlineTimezone") ?? "UTC",
      pages: formData.get("pages"),
      quotedPrice: formData.get("quotedPrice"),
    });
  } catch (err) {
    const zodErr = err as z.ZodError;
    return { ok: false, error: zodErr.issues[0]?.message ?? "Invalid input" };
  }

  const service = await prisma.service.findUnique({ where: { slug: data.serviceSlug } });
  const level = await prisma.academicLevel.findUnique({ where: { slug: data.levelSlug } });
  if (!service || !level) {
    return { ok: false, error: "Service or academic level not found" };
  }

  // Use the UTC ISO string the client computed from its local timezone
  const deadline = new Date(data.deadlineAt);
  if (isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
    return { ok: false, error: "Please pick a valid deadline date and time" };
  }
  const deadlineType: "standard" | "urgent" =
    deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "urgent" : "standard";

  if (!session?.user?.id) {
    const params = new URLSearchParams({
      title: data.title,
      brief: data.brief,
      serviceSlug: data.serviceSlug,
      levelSlug: data.levelSlug,
      subject: data.subject,
      deadlineAt: data.deadlineAt,
      deadlineDate: data.deadlineDate,
      deadlineTime: data.deadlineTime,
      deadlineTimezone: data.deadlineTimezone,
      pages: String(data.pages),
      quotedPrice: String(data.quotedPrice),
    });
    redirect(`/signup?pending=${encodeURIComponent(params.toString())}&returnTo=/dashboard/orders/new`);
  }

  const order = await prisma.order.create({
    data: {
      title: data.title,
      brief: data.brief,
      clientId: session.user.id,
      serviceId: service.id,
      academicLevelId: level.id,
      subject: data.subject,
      pageCount: data.pages,
      deadlineType,
      quotedPrice: data.quotedPrice,
      deadline,
      status: "DRAFT",
    },
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, redirect: `/dashboard/orders/${order.id}/upload` };
}

export async function markAttachmentsUploaded(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== session.user.id) {
    throw new Error("Not allowed");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { attachmentsUploaded: true },
  });
  revalidatePath(`/dashboard/orders/${orderId}`);
}

const completePendingSchema = z.object({
  title: z.string().min(5),
  brief: z.string().min(20),
  serviceSlug: z.string().min(1),
  levelSlug: z.string().min(1),
  subject: z.string().min(1),
  deadlineAt: z.string().min(1, "Please pick a deadline date and time"),
  deadlineDate: z.string().optional().default(""),
  deadlineTime: z.string().optional().default("17:00"),
  deadlineTimezone: z.string().optional().default("UTC"),
  pages: z.coerce.number().int().min(1),
  quotedPrice: z.coerce.number().min(0),
});

export async function completePendingOrder(formData: FormData): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  let data;
  try {
    data = completePendingSchema.parse({
      title: formData.get("title"),
      brief: formData.get("brief"),
      serviceSlug: formData.get("serviceSlug"),
      levelSlug: formData.get("levelSlug"),
      subject: formData.get("subject"),
      deadlineAt: formData.get("deadlineAt") ?? "",
      deadlineDate: formData.get("deadlineDate") ?? "",
      deadlineTime: formData.get("deadlineTime") ?? "17:00",
      deadlineTimezone: formData.get("deadlineTimezone") ?? "UTC",
      pages: formData.get("pages"),
      quotedPrice: formData.get("quotedPrice"),
    });
  } catch (err) {
    const zodErr = err as z.ZodError;
    return { ok: false, error: zodErr.issues[0]?.message ?? "Invalid order data" };
  }

  const service = await prisma.service.findUnique({ where: { slug: data.serviceSlug } });
  const level = await prisma.academicLevel.findUnique({ where: { slug: data.levelSlug } });
  if (!service || !level) return { ok: false, error: "Service or level not found" };

  const deadline = new Date(data.deadlineAt);
  if (isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
    return { ok: false, error: "Please pick a valid deadline date and time" };
  }
  const deadlineType: "standard" | "urgent" =
    deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "urgent" : "standard";

  const order = await prisma.order.create({
    data: {
      title: data.title,
      brief: data.brief,
      clientId: session.user.id,
      serviceId: service.id,
      academicLevelId: level.id,
      subject: data.subject,
      pageCount: data.pages,
      deadlineType,
      quotedPrice: data.quotedPrice,
      deadline,
      status: "DRAFT",
    },
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, orderId: order.id };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
  });
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/expert/orders/${orderId}`);
  return order;
}

export async function addMessage(orderId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!body.trim()) throw new Error("Message body required");
  const msg = await prisma.message.create({
    data: { orderId, fromUserId: session.user.id, body: body.trim() },
  });
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/expert/orders/${orderId}`);
  return msg;
}

export async function markOrderComplete(orderId: string) {
  await updateOrderStatus(orderId, "COMPLETED");
}

export async function requestRevision(orderId: string) {
  await updateOrderStatus(orderId, "REVISION_REQUESTED");
}

export async function openDispute(orderId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dispute = await prisma.dispute.create({
    data: { orderId, openedById: session.user.id, reason, status: "OPEN" },
  });
  await prisma.order.update({ where: { id: orderId }, data: { status: "DISPUTED" } });
  revalidatePath(`/dashboard/orders/${orderId}`);
  return dispute;
}
