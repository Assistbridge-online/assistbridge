/**
 * POST /api/support/conversations/[id]/read
 *
 * Marks all messages up to and including the supplied messageId as
 * "read by the actor". Doesn't actually persist a read flag yet —
 * we derive read state from lastSeenAt vs lastMessageAt in the UI.
 * (Adding a `SupportRead` table is a v2 change; for v1 the heuristic
 * is good enough: if `lastSeenAt >= lastMessageAt` we count it read.)
 *
 * Even though no DB writes happen here, the SSE event lets the OTHER
 * side clear its "unread" badge in real-time.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveActor, authorizeTicketAccess, touchPresence } from "@/lib/support/auth";
import { publish } from "@/lib/support/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const readSchema = z.object({
  messageId: z.string().min(1).nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    /* allow empty body */
  }
  const parsed = readSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const actor = await resolveActor();
  if (!actor) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const auth = await authorizeTicketAccess(id, actor);
  if (!auth.allowed) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  // Validate the supplied messageId belongs to this ticket, if any.
  let lastRead: string | null = null;
  if (parsed.data.messageId) {
    const m = await prisma.supportMessage.findFirst({
      where: { id: parsed.data.messageId, ticketId: id },
      select: { id: true },
    });
    if (m) lastRead = m.id;
  }

  await touchPresence({
    ticketId: id,
    actorKind: actor.kind,
    actorId: actor.kind === "admin" ? actor.userId : actor.visitorId,
    isTyping: false,
  });

  publish({
    type: "read",
    ticketId: id,
    actorKind: actor.kind,
    lastReadMessageId: lastRead,
  });

  return NextResponse.json({ success: true });
}
