import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Avatar, EmptyState } from "@/components/dashboard-widgets";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const orders = await prisma.order.findMany({
    where: {
      clientId: userId,
      messages: { some: {} },
    },
    include: {
      expert: { select: { name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { fromUser: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const conversations = await Promise.all(
    orders.map(async (o) => {
      const unread = await prisma.message.count({
        where: { orderId: o.id, fromUserId: { not: userId } },
      });
      const last = o.messages[0];
      return {
        id: o.id,
        name: o.expert?.name ?? "Unassigned",
        img: o.expert?.image ?? null,
        order: o.title,
        preview: last?.body ?? "No messages yet",
        time: last?.createdAt ?? o.updatedAt,
        unread,
        fromName: last?.fromUser.name ?? null,
      };
    })
  );

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Messages</h1>
      <p className="mt-1 text-slate-600">All your conversations with experts, organized by order.</p>

      {conversations.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No conversations yet"
            description="Once you submit a request and are matched with an expert, your conversations will appear here."
            action={
              <Link href="/dashboard/new" className="inline-flex h-11 px-5 rounded-lg bg-primary-700 text-white text-sm font-semibold items-center gap-2 hover:bg-primary-800">
                Submit a request
              </Link>
            }
          />
        </div>
      ) : (
        <Card className="mt-8 divide-y divide-slate-200 overflow-hidden">
          {conversations.map((c) => (
            <Link key={c.id} href={`/dashboard/orders/${c.id}`} className="block p-5 hover:bg-slate-50 transition">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} src={c.img ?? `https://i.pravatar.cc/100?u=${c.id}`} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 truncate">{c.name}</h3>
                    <span className="text-xs text-slate-500 shrink-0">{formatDate(c.time)}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Re: {c.order}</div>
                  <p className="mt-2 text-sm text-slate-700 truncate">
                    {c.fromName ? <span className="font-medium">{c.fromName}: </span> : null}
                    {c.preview}
                  </p>
                </div>
                {c.unread > 0 && (
                  <div className="h-6 w-6 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {c.unread}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
