/**
 * POST /api/support/conversations/[id]/messages
 *
 * Visitor sends a message on an open web-channel ticket. Stores the
 * INBOUND SupportMessage and publishes a `new_message` event over
 * SSE so the admin sees it without a page reload.
 *
 * Visitors cannot send on email-channel tickets — those flow strictly
 * through the Resend webhook. Admin replies go through the existing
 * `replyToTicket` server action (lib/actions/support.ts) which also
 * emails the customer and publishes the event from there.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { authorizeTicketAccess, getRequestHost, mintWebMessageId } from "@/lib/support/auth";
import { publish } from "@/lib/support/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sendSchema = z.object({
  body: z.string().trim().min(1).max(5_000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = sendSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Message cannot be empty." }, { status: 400 });
  }
  const { body } = parsed.data;

  // Authorize: visitor can only send on their own open ticket.
  const jar = await cookies();
  const visitorId = jar.get("chat_vid")?.value ?? null;
  const auth = await authorizeTicketAccess(
    id,
    visitorId ? { kind: "visitor", visitorId } : null,
  );
  if (!auth.allowed || !auth.ticket) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Only web-channel tickets can be replied to via this endpoint.
  // (For email tickets the visitor must reply via email.)
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { channel: true, status: true, visitorEmail: true, visitorName: true },
  });
  if (!ticket || ticket.channel !== "web") {
    return NextResponse.json(
      { success: false, error: "This conversation is not open on the web channel." },
      { status: 400 },
    );
  }
  if (ticket.status === "CLOSED") {
    return NextResponse.json(
      { success: false, error: "This conversation has been closed. Please start a new one." },
      { status: 409 },
    );
  }

  const host = await getRequestHost();
  const messageId = mintWebMessageId(host);

  const saved = await prisma.supportMessage.create({
    data: {
      ticketId: id,
      direction: "INBOUND",
      channel: "web",
      fromEmail: ticket.visitorEmail ?? "visitor@assistbridge.online",
      fromName: ticket.visitorName ?? null,
      messageId,
      bodyText: body,
      bodyHtml: body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>"),
      isFirst: false,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  await prisma.supportTicket.update({
    where: { id },
    data: {
      lastMessageAt: saved.createdAt,
      status: ticket.status === "CLOSED" ? "OPEN" : ticket.status,
    },
  });

  publish({
    type: "new_message",
    ticketId: id,
    messageId: saved.id,
    at: saved.createdAt.toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: {
      id: saved.id,
      body,
      createdAt: saved.createdAt.toISOString(),
    },
  });
}
