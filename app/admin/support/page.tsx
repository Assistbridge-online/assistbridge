import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/dashboard-widgets";
import { SupportInboxClient } from "@/components/admin/support-inbox-client";
import { Inbox } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Support inbox" };

export default async function SupportInboxPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          direction: true,
          fromEmail: true,
          fromName: true,
          bodyText: true,
          createdAt: true,
        },
      },
      _count: { select: { messages: true } },
    },
  });

  const items = tickets.map((t) => {
    const last = t.messages[0];
    return {
      id: t.id,
      fromEmail: t.fromEmail,
      fromName: t.fromName,
      subject: t.subject,
      status: t.status,
      lastMessageAt: t.lastMessageAt.toISOString(),
      messageCount: t._count.messages,
      lastDirection: last?.direction ?? "INBOUND",
      lastSnippet: (last?.bodyText ?? "").slice(0, 200),
    };
  });

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Support inbox</h1>
      <p className="mt-1 text-slate-600">
        All support@assistbridge.online emails in one place — routed by sender.
      </p>

      <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          Pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          Closed
        </span>
        <span className="ml-auto">
          {items.length} {items.length === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">No tickets yet</h3>
            <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
              When a customer emails <span className="font-mono">support@assistbridge.online</span>{" "}
              the message will land here.
            </p>
          </Card>
        ) : (
          <SupportInboxClient tickets={items} />
        )}
      </div>
    </>
  );
}