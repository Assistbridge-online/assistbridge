/**
 * Inbound email → ticket upsert.
 *
 * Called by the Resend webhook (app/api/webhooks/resend/route.ts)
 * when an email.received event arrives. Strategy:
 *
 *   1. If the inbound email has an `In-Reply-To` header that matches an
 *      existing SupportMessage, append to that ticket. This is how
 *      customer replies into the same Gmail thread end up on the same
 *      ticket.
 *
 *   2. Otherwise treat this as a brand-new conversation and create a
 *      fresh SupportTicket.
 *
 * The webhook is the only place that should ever create new tickets
 * (or new inbound messages) — outbound messages are written by
 * lib/actions/support.ts after a successful Resend send.
 *
 * Body + attachments are fetched via the Resend SDK (the webhook
 * event itself only carries metadata).
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface InboundEvent {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    received_for?: string[];
    message_id: string;
    subject: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition?: string;
      content_id?: string;
    }>;
  };
}

interface ParsedInbound {
  fromEmail: string;
  fromName: string | null;
  subject: string;
  messageId: string;
  inReplyTo: string | null;
  references: string | null;
  bodyText: string;
  bodyHtml: string;
  rawHeaders: Record<string, string>;
  resendEmailId: string;
  attachments: Array<{
    resendAttachmentId: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
}

function parseAddress(from: string): { email: string; name: string | null } {
  // "John Doe <john@example.com>" → {email, name}
  // "john@example.com" → {email, name: null}
  const match = from.match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  if (match) {
    return {
      email: match[2].trim().toLowerCase(),
      name: match[1]?.trim() || null,
    };
  }
  // Bare address
  const bare = from.match(/<?([\w.+-]+@[\w.-]+\.[\w]+)>?/);
  if (bare) {
    return { email: bare[1].toLowerCase(), name: null };
  }
  return { email: from.trim().toLowerCase(), name: null };
}

function parseReferences(refs: string | null | undefined): string[] {
  if (!refs) return [];
  return refs.match(/<[^>]+>/g)?.map((s) => s.slice(1, -1)) ?? [];
}

export async function processInboundEmail(
  evt: InboundEvent,
): Promise<{ ticketId: string; messageId: string; deduped: boolean }> {
  // 1. Idempotency: if we've already saved a message with this
  //    resendEmailId or messageId, skip.
  const existing = await prisma.supportMessage.findFirst({
    where: {
      OR: [{ resendId: evt.data.email_id }, { messageId: evt.data.message_id }],
    },
    select: { id: true, ticketId: true, messageId: true },
  });
  if (existing) {
    return {
      ticketId: existing.ticketId,
      messageId: existing.messageId,
      deduped: true,
    };
  }

  // 2. Fetch the full email (body + raw headers + attachment bytes)
  //    from the Resend API. The webhook payload only carries metadata.
  const parsed = await fetchAndParse(evt);

  // 3. Decide which ticket this belongs on.
  //
  //    a. If In-Reply-To matches an existing message, that's our ticket.
  //    b. Otherwise, fall back to References chain — find the earliest
  //       message we know about from any of those Message-IDs.
  //    c. Otherwise, brand-new ticket keyed off the inbound Message-ID.
  let ticketId: string | null = null;

  if (parsed.inReplyTo) {
    const replyTarget = await prisma.supportMessage.findUnique({
      where: { messageId: parsed.inReplyTo },
      select: { ticketId: true },
    });
    if (replyTarget) ticketId = replyTarget.ticketId;
  }

  if (!ticketId && parsed.references) {
    const refIds = parseReferences(parsed.references);
    if (refIds.length) {
      const refTarget = await prisma.supportMessage.findFirst({
        where: { messageId: { in: refIds } },
        select: { ticketId: true },
        orderBy: { createdAt: "asc" },
      });
      if (refTarget) ticketId = refTarget.ticketId;
    }
  }

  // 4. Create or update the ticket.
  const { fromEmail, fromName, subject } = parsed;

  if (!ticketId) {
    // Brand-new ticket. The first inbound message's Message-ID is the
    // dedupe key — if the webhook retries, we won't create a duplicate.
    const ticket = await prisma.supportTicket.create({
      data: {
        rootMessageId: parsed.messageId,
        fromEmail,
        fromName,
        subject,
        status: "OPEN",
        lastMessageAt: new Date(parsed.rawHeaders["date"] ?? evt.data.created_at),
      },
    });
    ticketId = ticket.id;
  } else {
    // Bump lastMessageAt so the inbox sorts the ticket to the top.
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        lastMessageAt: new Date(parsed.rawHeaders["date"] ?? evt.data.created_at),
      },
    });
  }

  // 5. Save the inbound message.
  const savedMessage = await prisma.supportMessage.create({
    data: {
      ticketId,
      direction: "INBOUND",
      channel: "email",
      fromEmail,
      fromName,
      resendId: parsed.resendEmailId,
      messageId: parsed.messageId,
      inReplyTo: parsed.inReplyTo,
      references: parsed.references,
      bodyText: parsed.bodyText,
      bodyHtml: parsed.bodyHtml,
      raw: JSON.stringify(evt).slice(0, 8192), // bounded debug aid
      isFirst: false, // set true below if it's the first row
    },
  });

  // Stamp isFirst on the very first message of this ticket.
  const messageCount = await prisma.supportMessage.count({
    where: { ticketId },
  });
  if (messageCount === 1) {
    await prisma.supportMessage.update({
      where: { id: savedMessage.id },
      data: { isFirst: true },
    });
  }

  // 6. Save attachment metadata. We don't pull bytes yet — admin can
  //    stream them through /api/admin/support/attachments/[id] on demand.
  if (parsed.attachments.length) {
    await prisma.supportAttachment.createMany({
      data: parsed.attachments.map((a) => ({
        ticketId,
        messageId: savedMessage.id,
        resendAttachmentId: a.resendAttachmentId,
        filename: a.filename,
        contentType: a.contentType,
        size: a.size,
      })),
    });
  }

  return { ticketId, messageId: parsed.messageId, deduped: false };
}

async function fetchAndParse(evt: InboundEvent): Promise<ParsedInbound> {
  const { from, subject, message_id, email_id } = evt.data;
  const { email, name } = parseAddress(from);

  let bodyText = "";
  let bodyHtml = "";
  let rawHeaders: Record<string, string> = {};
  let attachments: ParsedInbound["attachments"] = [];
  let inReplyTo: string | null = null;
  let references: string | null = null;

  if (resend) {
    try {
      const resp: any = await (resend as any).emails.retrieve(email_id);
      const email = resp?.data ?? resp;
      if (email) {
        bodyText = email.text ?? email.body_plain ?? "";
        bodyHtml = email.html ?? email.body_html ?? "";
        const hdrs = email.headers ?? {};
        for (const [k, v] of Object.entries(hdrs)) {
          rawHeaders[k.toLowerCase()] = String(v);
        }
        inReplyTo = stripBrackets(rawHeaders["in-reply-to"]) ?? null;
        references = rawHeaders["references"] ?? null;
        if (Array.isArray(email.attachments)) {
          attachments = email.attachments.map((a: any) => ({
            resendAttachmentId: a.id ?? a.filename,
            filename: a.filename ?? "attachment",
            contentType: a.content_type ?? a.contentType ?? "application/octet-stream",
            size: typeof a.size === "number" ? a.size : 0,
          }));
        }
      }
    } catch (err) {
      console.error("[support:inbound:fetch-failed]", { email_id, err });
    }
  }

  if (!bodyText && !bodyHtml) {
    bodyText = `From: ${from}\nSubject: ${subject}`;
  }

  return {
    fromEmail: email,
    fromName: name,
    subject,
    messageId: message_id,
    inReplyTo,
    references,
    bodyText,
    bodyHtml,
    rawHeaders,
    resendEmailId: email_id,
    attachments,
  };
}

function stripBrackets(value: string | undefined | null): string | null {
  if (!value) return null;
  const m = value.match(/<([^>]+)>/);
  return m ? m[1] : value.trim();
}