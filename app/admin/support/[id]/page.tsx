import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard-widgets";
import { SupportTicketClient } from "@/components/admin/support-ticket-client";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Support ticket" };

export default async function SupportTicketPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
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
    fromEmail: ticket.fromEmail,
    fromName: ticket.fromName,
    createdAt: ticket.createdAt.toISOString(),
    lastMessageAt: ticket.lastMessageAt.toISOString(),
    assignee: ticket.assignee
      ? { id: ticket.assignee.id, name: ticket.assignee.name ?? "", email: ticket.assignee.email ?? "" }
      : null,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      direction: m.direction,
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