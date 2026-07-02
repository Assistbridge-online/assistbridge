/**
 * GET /api/support/widget/ticket
 *
 * Visitor-side hydration. Called by the chat widget on page load (or
 * reload) to recover the conversation bound to the chat_vid cookie so
 * the visitor's history is visible. Returns 404 if no open ticket
 * exists — the widget then shows the "name + email + first message"
 * intake form.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const visitorId = jar.get("chat_vid")?.value;
  if (!visitorId) {
    return NextResponse.json({ found: false, reason: "no_cookie" }, { status: 200 });
  }
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      visitorId,
      status: { in: ["OPEN", "PENDING"] },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          direction: true,
          channel: true,
          fromName: true,
          fromEmail: true,
          bodyText: true,
          createdAt: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
  if (!ticket) {
    return NextResponse.json({ found: false, reason: "no_open_ticket" }, { status: 200 });
  }
  return NextResponse.json({
    found: true,
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      visitorName: ticket.visitorName,
      visitorEmail: ticket.visitorEmail,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        channel: m.channel,
        fromName: m.fromName,
        fromEmail: m.fromEmail,
        body: m.bodyText,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}
