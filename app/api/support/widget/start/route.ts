/**
 * POST /api/support/widget/start
 *
 * Called by the livechat widget on first open. Validates that the
 * visitor has provided both a name AND a real email (that's our v1
 * policy — otherwise the outbound reply through Resend has nowhere to
 * go). Returns the visitorId we'll persist in the `chat_vid` cookie
 * and the open ticket id for this visitor (creating a fresh one if
 * the previous one was closed).
 *
 * Idempotent on visitorId: if the cookie already points at an open
 * ticket we return that, not a new one. If that ticket was closed
 * we open a new one (and keep the visitorId stable so the visitor
 * sees their previous threads).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const startSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(5_000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Name, email and a first message are required." },
      { status: 400 },
    );
  }
  const { name, email, message } = parsed.data;

  const jar = await cookies();
  let visitorId = jar.get("chat_vid")?.value;
  if (!visitorId) {
    visitorId = randomUUID();
  }

  // Look for an OPEN/PENDING ticket already bound to this visitor.
  const existing = await prisma.supportTicket.findFirst({
    where: {
      visitorId,
      status: { in: ["OPEN", "PENDING"] },
    },
    select: { id: true, subject: true, status: true },
    orderBy: { lastMessageAt: "desc" },
  });

  let ticketId: string;
  let isNew = false;
  if (existing) {
    ticketId = existing.id;
    await prisma.supportTicket.update({
      where: { id: existing.id },
      data: { visitorName: name, visitorEmail: email },
    });
  } else {
    // Synthesize a rootMessageId; we'll mint a real Message-ID for
    // the first message body below and overwrite this with the same.
    const subject = `Live chat: ${name}`;
    const ticket = await prisma.supportTicket.create({
      data: {
        rootMessageId: `<web-${randomUUID()}@assistbridge.online>`,
        fromEmail: email,
        fromName: name,
        subject,
        channel: "web",
        visitorId,
        visitorName: name,
        visitorEmail: email,
        lastMessageAt: new Date(),
      },
    });
    ticketId = ticket.id;
    isNew = true;
  }

  // Persist the first message on the new ticket (or as the next
  // message on an existing one).
  const messageId = `<${randomUUID()}@assistbridge.online>`;
  await prisma.supportMessage.create({
    data: {
      ticketId,
      direction: "INBOUND",
      channel: "web",
      fromEmail: email,
      fromName: name,
      messageId,
      inReplyTo: null,
      references: null,
      bodyText: message,
      bodyHtml: escapeText(message),
      isFirst: isNew,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { lastMessageAt: new Date() },
  });

  // Set the visitor cookie on the response so subsequent requests
  // (and the page reload) carry the same identity.
  const res = NextResponse.json({
    success: true,
    visitorId,
    ticketId,
    isNew,
  });
  res.cookies.set("chat_vid", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1y
  });
  // Also expose to document.cookie so the SSE query param can pick it
  // up without server-side reading. (The widget is a client component
  // — `document.cookie` is the only API available there.)
  // We set a parallel NON-http-only cookie just for the client to read.
  res.cookies.set("chat_vid_pub", visitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

function escapeText(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}
