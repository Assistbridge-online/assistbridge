"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return {
    id: session.user.id,
    name: session.user.name ?? "AssistBridge Support",
    email: session.user.email ?? siteConfig.email,
  };
}

/**
 * Send a reply on a ticket.
 *
 * The reply goes out through Resend with `In-Reply-To` set to the most
 * recent inbound message's Message-ID and `References` set to the
 * accumulated thread (RFC 5322 §3.6.4). This is what makes the reply
 * thread into the same conversation in the customer's email client
 * (Gmail, Outlook, Apple Mail all key off these headers).
 *
 * We also rewrite `replyTo` on the outbound message to the customer's
 * address so when the customer hits Reply in their email client it
 * goes back through support@assistbridge.online and Resend fires a
 * fresh email.received webhook we can correlate via In-Reply-To.
 */
export async function replyToTicket({
  ticketId,
  body,
}: {
  ticketId: string;
  body: string;
}) {
  const admin = await requireAdmin();
  if (!body.trim()) throw new Error("Reply cannot be empty.");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) throw new Error("Ticket not found.");

  const lastInbound = [...ticket.messages]
    .reverse()
    .find((m) => m.direction === "INBOUND" && m.messageId);
  if (!lastInbound) {
    throw new Error(
      "No inbound message on this ticket — cannot compute threading headers.",
    );
  }

  // Build a References chain: every Message-ID we've seen on this
  // ticket, in chronological order, with the most recent inbound last.
  // RFC 5322 says References should be a space-separated list of
  // Message-IDs in the order they appeared in the conversation.
  const referencesChain = ticket.messages
    .map((m) => m.messageId)
    .filter(Boolean)
    .join(" ");

  // Re: subject — preserve customer's original if we already prefixed,
  // otherwise add Re:. Gmail-style clients strip the prefix and add
  // their own anyway; we just keep it stable for the row's history.
  const subject =
    ticket.subject.toLowerCase().startsWith("re:")
      ? ticket.subject
      : `Re: ${ticket.subject}`;

  const html = renderReplyHtml({ body });
  const text = body.trim();

  // Generate a Message-ID for the outbound message ourselves so we can
  // store it on the row before Resend's API call returns. Resend will
  // preserve whatever we set in the `headers` map under Message-ID.
  const outboundMessageId = `<${crypto.randomUUID()}@${new URL(siteConfig.url).host}>`;

  const send = await sendEmail({
    from: `AssistBridge Support <${siteConfig.supportEmail}>`,
    to: ticket.fromEmail,
    subject,
    html,
    text,
    replyTo: siteConfig.supportEmail,
    inReplyTo: lastInbound.messageId,
    references: `${referencesChain} ${outboundMessageId}`.trim(),
    headers: { "Message-ID": outboundMessageId },
    tags: [
      { name: "ticket_id", value: ticket.id },
      { name: "direction", value: "outbound" },
    ],
  });

  if (!send.success) {
    throw new Error(
      `Failed to send reply: ${(send as any).error?.message ?? "unknown error"}`,
    );
  }

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      direction: "OUTBOUND",
      fromEmail: admin.email,
      fromName: admin.name,
      resendId: send.id ?? null,
      messageId: outboundMessageId,
      inReplyTo: lastInbound.messageId,
      references: referencesChain,
      bodyText: text,
      bodyHtml: html,
      isFirst: false,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      lastMessageAt: new Date(),
      status: ticket.status === "CLOSED" ? "OPEN" : ticket.status,
    },
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticket.id}`);
}

export async function setTicketStatus({
  ticketId,
  status,
}: {
  ticketId: string;
  status: "OPEN" | "PENDING" | "CLOSED";
}) {
  await requireAdmin();
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
}

export async function assignTicket({
  ticketId,
  assigneeId,
}: {
  ticketId: string;
  // "me" → claim for the current admin
  // null  → unassign
  // any other string → only allowed if it matches the current admin's id
  assigneeId: "me" | string | null;
}) {
  const admin = await requireAdmin();
  let resolved: string | null;
  if (assigneeId === "me") {
    resolved = admin.id;
  } else if (assigneeId === null) {
    resolved = null;
  } else {
    if (assigneeId !== admin.id) {
      throw new Error("You can only claim a ticket for yourself.");
    }
    resolved = assigneeId;
  }
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assigneeId: resolved },
  });
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
}

function renderReplyHtml({ body }: { body: string }) {
  const escaped = escapeHtml(body.trim()).replace(/\n/g, "<br />");
  return `<div style="font-family:Inter,system-ui,sans-serif;color:#0f172a;line-height:1.55;">${escaped}</div>`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}