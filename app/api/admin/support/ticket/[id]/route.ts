/**
 * GET /api/admin/support/ticket/[id]
 *
 * Returns the same shape that the admin ticket page renders. The SSE
 * route hits this on every new_message event so the admin thread
 * updates without a full page reload.
 *
 * Auth: admin only (PROTECTED by the NextAuth proxy in `proxy.ts`
 * which matches /admin/*).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      attachments: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!ticket) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    channel: ticket.channel,
    fromEmail: ticket.fromEmail,
    fromName: ticket.fromName,
    visitorName: ticket.visitorName,
    visitorEmail: ticket.visitorEmail,
    createdAt: ticket.createdAt.toISOString(),
    lastMessageAt: ticket.lastMessageAt.toISOString(),
    assignee: ticket.assignee
      ? { id: ticket.assignee.id, name: ticket.assignee.name ?? "", email: ticket.assignee.email ?? "" }
      : null,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      channel: m.channel,
      fromEmail: m.fromEmail,
      fromName: m.fromName,
      bodyText: m.bodyText,
      bodyHtml: m.bodyHtml,
      messageId: m.messageId,
      createdAt: m.createdAt.toISOString(),
      attachmentIds: ticket.attachments
        .filter((a) => a.messageId === m.id)
        .map((a) => a.id),
    })),
    attachments: ticket.attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      contentType: a.contentType,
      size: a.size,
      messageId: a.messageId,
      storedUrl: a.storedUrl,
    })),
  });
}
