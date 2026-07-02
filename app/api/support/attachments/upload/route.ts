/**
 * POST /api/support/attachments/upload
 *
 * Web-channel attachment upload. Writes the bytes to Vercel Blob
 * (free tier: 500 MB included), records a `SupportAttachment` row
 * with `storedUrl` set and `resendAttachmentId = null`.
 *
 * The companion email-channel path keeps Resend as the source of
 * bytes (existing behaviour in lib/support/inbox.ts and the existing
 * /api/admin/support/attachments/[id] stream route — we don't touch
 * them).
 *
 * Visitor auth via chat_vid cookie; admin auth via NextAuth.
 *
 * Note on size limits:
 *   - We cap at 25 MB here. Vercel Blob free tier allows larger files
 *     via signed upload tokens, but the chat widget UI doesn't need
 *     to ship huge files — and the SSE-broadcast download path means
 *     smaller = faster delivered.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveActor } from "@/lib/support/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
]);
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const paramsSchema = z.object({
  ticketId: z.string().min(1),
  messageId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let actor = await resolveActor();
  if (!actor) {
    const jar = await cookies();
    const visitorId = jar.get("chat_vid")?.value ?? null;
    if (visitorId) actor = { kind: "visitor", visitorId };
  }
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Could not parse upload" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ success: false, error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { success: false, error: `Unsupported file type: ${file.type}` },
      { status: 400 },
    );
  }
  const meta = paramsSchema.safeParse({
    ticketId: form.get("ticketId"),
    messageId: form.get("messageId") ?? undefined,
  });
  if (!meta.success) {
    return NextResponse.json({ success: false, error: "Missing ticketId" }, { status: 400 });
  }

  // Authorize the actor can attach to this ticket.
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: meta.data.ticketId },
    select: { id: true, channel: true, visitorId: true },
  });
  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  }
  if (actor.kind === "visitor" && ticket.visitorId !== actor.visitorId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Push to Vercel Blob.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `support/${ticket.id}/${randomUUID()}-${safeName}`;
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  const att = await prisma.supportAttachment.create({
    data: {
      ticketId: ticket.id,
      messageId: meta.data.messageId ?? null,
      resendAttachmentId: null,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      storedUrl: blob.url,
    },
    select: { id: true, storedUrl: true, filename: true, size: true, contentType: true },
  });

  return NextResponse.json({ success: true, attachment: att });
}
