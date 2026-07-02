/**
 * POST /api/support/conversations/[id]/email-transcript
 *
 * Visitor-side ask: "send me an email copy of this conversation."
 * Validates that the email is supplied, sends the rendered thread
 * through Resend from support@, and records a tag so it shows in
 * the admin panel.
 *
 * Why a separate endpoint rather than baking it into /widget/start:
 * it's a distinct intent (after the conversation already exists),
 * and admin can also trigger it from `/admin/support/[id]` via the
 * existing `replyToTicket` flow.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { authorizeTicketAccess } from "@/lib/support/auth";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email().optional(),
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
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  // Auth: visitor cookie OR fallback to the email they typed just now.
  const jar = await cookies();
  const visitorId = jar.get("chat_vid")?.value ?? null;
  const actor = visitorId ? { kind: "visitor" as const, visitorId } : null;
  const auth = await authorizeTicketAccess(id, actor);
  if (!auth.allowed) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const targetEmail = (parsed.data.email ?? ticket.visitorEmail ?? "").trim().toLowerCase();
  if (!targetEmail) {
    return NextResponse.json(
      { success: false, error: "Please provide an email address." },
      { status: 400 },
    );
  }

  const html = renderTranscriptHtml(ticket.subject, ticket.messages);
  const text = ticket.messages.map((m) => `[${m.direction}] ${m.fromName ?? m.fromEmail}\n${m.bodyText}`).join("\n\n---\n\n");

  await sendEmail({
    to: targetEmail,
    from: `AssistBridge Support <${siteConfig.supportEmail}>`,
    subject: `Copy of your conversation: ${ticket.subject}`,
    html,
    text,
    tags: [
      { name: "ticket_id", value: ticket.id },
      { name: "direction", value: "transcript" },
    ],
  });

  return NextResponse.json({ success: true });
}

function renderTranscriptHtml(subject: string, messages: Array<{ direction: string; fromName: string | null; fromEmail: string; bodyHtml: string; createdAt: Date }>) {
  const rows = messages
    .map(
      (m) => `
        <div style="border-left:3px solid ${m.direction === "INBOUND" ? "#1e40af" : "#059669"};margin:12px 0;padding:8px 12px;background:#f8fafc;border-radius:4px;">
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">
            <strong>${escape(m.fromName ?? m.fromEmail)}</strong>
            <span style="color:#94a3b8;"> · ${m.createdAt.toUTCString()}</span>
          </div>
          <div style="font-size:14px;color:#0f172a;line-height:1.5;">${m.bodyHtml}</div>
        </div>`,
    )
    .join("");
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;">
      <h2 style="margin:0 0 8px;color:#1e3a8a;">Conversation transcript</h2>
      <p style="margin:0 0 16px;color:#475569;">Here's a copy of your conversation with AssistBridge Support: <strong>${escape(subject)}</strong></p>
      ${rows}
      <p style="margin-top:24px;color:#94a3b8;font-size:12px;">Need to add to this conversation? Just reply to this email and it'll thread back to us.</p>
    </div>`;
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
