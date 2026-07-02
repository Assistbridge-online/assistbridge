/**
 * Dev-only endpoint that fabricates an email.received event so we
 * can exercise the inbox end-to-end without a live Resend domain.
 *
 * Disabled outside development — refuses to run when NODE_ENV is
 * production.
 *
 * Body:
 *   POST /api/admin/test/support-inbound
 *   {
 *     "from": "Test Customer <test@example.com>",
 *     "subject": "Need help with my order",
 *     "body": "Hi, I'm stuck on the checkout page.",
 *     "inReplyTo": "<optional-existing-message-id>"
 *   }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Disabled in production" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const from = String(body.from ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const text = String(body.body ?? "").trim();
  const inReplyTo = body.inReplyTo ? String(body.inReplyTo) : undefined;

  if (!from || !subject || !text) {
    return NextResponse.json(
      { error: "from, subject, body are required" },
      { status: 400 },
    );
  }

  // Generate a Message-ID that looks RFC-compliant.
  const messageId = `<${crypto.randomUUID()}@dev.assistbridge.online>`;

  // Look up the matching inbound ticket by In-Reply-To (or create a new one).
  let ticketId: string | null = null;
  if (inReplyTo) {
    const target = await prisma.supportMessage.findUnique({
      where: { messageId: inReplyTo },
      select: { ticketId: true },
    });
    if (target) ticketId = target.ticketId;
  }

  if (!ticketId) {
    const ticket = await prisma.supportTicket.create({
      data: {
        rootMessageId: messageId,
        fromEmail: parseEmail(from),
        fromName: parseName(from),
        subject,
        status: "OPEN",
        lastMessageAt: new Date(),
      },
    });
    ticketId = ticket.id;
  } else {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { lastMessageAt: new Date() },
    });
  }

  const saved = await prisma.supportMessage.create({
    data: {
      ticketId,
      direction: "INBOUND",
      fromEmail: parseEmail(from),
      fromName: parseName(from),
      messageId,
      inReplyTo: inReplyTo ?? null,
      references: inReplyTo ?? null,
      bodyText: text,
      bodyHtml: `<p>${text.replace(/\n/g, "<br/>")}</p>`,
      isFirst: false,
    },
  });

  const messageCount = await prisma.supportMessage.count({
    where: { ticketId },
  });
  if (messageCount === 1) {
    await prisma.supportMessage.update({
      where: { id: saved.id },
      data: { isFirst: true },
    });
  }

  return NextResponse.json({
    ok: true,
    ticketId,
    messageId,
  });
}

function parseEmail(from: string): string {
  const m = from.match(/<([^>]+)>/);
  if (m) return m[1].toLowerCase();
  return from.toLowerCase();
}

function parseName(from: string): string | null {
  const m = from.match(/^\s*"?([^"<]*)"?\s*<[^>]+>\s*$/);
  if (m && m[1].trim()) return m[1].trim();
  return null;
}