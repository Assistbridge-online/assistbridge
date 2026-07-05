import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard-widgets";
import { SupportTicketClient } from "@/components/admin/support-ticket-client";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Globe } from "lucide-react";

function ChannelChip({ channel }: { channel: string }) {
  if (channel === "web") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[11px] font-semibold uppercase tracking-wide">
        <Globe className="h-3 w-3" />
        Web chat
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wide">
      <Mail className="h-3 w-3" />
      Email
    </span>
  );
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Support ticket" };

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      attachments: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!ticket) notFound();

  const data = {
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
  };

  return (
    <>
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              {ticket.subject}
            </h1>
            <StatusBadge status={ticket.status} />
            <ChannelChip channel={ticket.channel} />
          </div>
          <p className="mt-1 text-slate-600">
            <span className="font-medium text-slate-700">
              {ticket.fromName ?? ticket.fromEmail}
            </span>
            {ticket.fromName && (
              <span className="text-slate-500"> &lt;{ticket.fromEmail}&gt;</span>
            )}
            {" · opened "}
            {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SupportTicketClient ticket={data} />
      </div>
    </>
  );
}