/**
 * POST /api/support/conversations/[id]/typing
 *
 * Visitor or admin sets their `isTyping` flag for this ticket. The
 * SSE channel fans the change out to the other side. Bumps
 * `SupportPresence.lastSeenAt` so the other side can show "Online
 * now" too.
 *
 * Visitor auth is via the chat_vid cookie; admin is via NextAuth.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { resolveActor, authorizeTicketAccess, touchPresence } from "@/lib/support/auth";
import { publish } from "@/lib/support/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const typingSchema = z.object({ isTyping: z.boolean() });

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
  const parsed = typingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Missing isTyping" }, { status: 400 });
  }
  const { isTyping } = parsed.data;

  const actor = await resolveActor();
  if (!actor) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const auth = await authorizeTicketAccess(id, actor);
  if (!auth.allowed) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  await touchPresence({
    ticketId: id,
    actorKind: actor.kind,
    actorId: actor.kind === "admin" ? actor.userId : actor.visitorId,
    isTyping,
  });

  publish({
    type: "typing",
    ticketId: id,
    actorKind: actor.kind,
    isTyping,
  });

  return NextResponse.json({ success: true });
}
