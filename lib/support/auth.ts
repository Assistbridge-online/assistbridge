/**
 * Shared helpers for the support SSE auth model.
 *
 * Two callers, two auth shapes:
 *
 *   - Admin (browser tab at /admin/support/[id]): authenticated via
 *     NextAuth JWT cookie. Role must be ADMIN.
 *   - Visitor (livechat widget): NOT authenticated. Identified by the
 *     `chat_vid` first-party cookie set by the widget on first load.
 *     They may only stream the ticket that has their visitorId.
 *
 * Returns the "actor" object the stream route uses both to authorize
 * the connection and to stamp `SupportPresence` so the other side
 * knows who's online.
 */
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type Actor =
  | { kind: "admin"; userId: string; name: string }
  | { kind: "visitor"; visitorId: string }
  | null;

export async function resolveActor(): Promise<Actor> {
  const session = await auth();
  if (session?.user?.id && session.user.role === "ADMIN") {
    return { kind: "admin", userId: session.user.id, name: session.user.name ?? "Admin" };
  }
  const jar = await cookies();
  const visitorId = jar.get("chat_vid")?.value;
  if (visitorId) return { kind: "visitor", visitorId };
  return null;
}

/**
 * Read the actor that initiated this request. Admin requests go
 * through NextAuth as above. For visitor requests on the server side
 * we can't always see the cookie (it might be on a different path),
 * so we also accept a `vid` query param on the stream route — that
 * keeps the SSE reconnection logic simple in the widget.
 */
export async function readActorOrQueryVid(queryVid: string | null): Promise<Actor> {
  const primary = await resolveActor();
  if (primary) return primary;
  if (queryVid) return { kind: "visitor", visitorId: queryVid };
  return null;
}

export async function authorizeTicketAccess(
  ticketId: string,
  actor: Actor,
): Promise<{ allowed: boolean; ticket: { id: string; visitorId: string | null } | null }> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, visitorId: true },
  });
  if (!ticket) return { allowed: false, ticket: null };
  if (actor.kind === "admin") return { allowed: true, ticket };
  if (actor.kind === "visitor") {
    return {
      allowed: Boolean(ticket.visitorId && ticket.visitorId === actor.visitorId),
      ticket,
    };
  }
  return { allowed: false, ticket: null };
}

/**
 * Heartbeat-aware presence upsert. Called from the SSE route every 25 s
 * while the connection is open, and on every read/typing/send.
 *
 * The "stale" cleanup (delete rows older than 60 s) is run on each
 * open as a cheap O(subscribers)-per-ticket sweep; for v1 scale this
 * is fine and avoids a separate cron / pg_cron job.
 */
export async function touchPresence(opts: {
  ticketId: string;
  actorKind: "admin" | "visitor";
  actorId: string;
  isTyping?: boolean;
}) {
  await prisma.supportPresence.upsert({
    where: {
      ticketId_actorKind_actorId: {
        ticketId: opts.ticketId,
        actorKind: opts.actorKind,
        actorId: opts.actorId,
      },
    },
    create: {
      ticketId: opts.ticketId,
      actorKind: opts.actorKind,
      actorId: opts.actorId,
      isTyping: Boolean(opts.isTyping),
      lastSeenAt: new Date(),
    },
    update: {
      isTyping: Boolean(opts.isTyping),
      lastSeenAt: new Date(),
    },
  });
}

export async function pruneStalePresence() {
  await prisma.supportPresence.deleteMany({
    where: { lastSeenAt: { lt: new Date(Date.now() - 60_000) } },
  });
}

/**
 * Mint a stable Message-ID for a web-channel message so that:
 *   - We have a unique value for `SupportMessage.messageId` (the column
 *     has a `@unique` constraint; can't store null).
 *   - If the visitor later emails support@ and the message has been
 *     threaded into In-Reply-To chain, the lookup still works.
 */
export function mintWebMessageId(host: string): string {
  // Same shape as RFC 5322 addr-spec: <local@domain>. Synthetic but unique.
  return `<${crypto.randomUUID()}@${host}>`;
}

export async function getRequestHost(): Promise<string> {
  try {
    const h = await headers();
    const xfHost = h.get("x-forwarded-host");
    const realHost = h.get("host");
    const host = (xfHost ?? realHost ?? "assistbridge.online").split(",")[0].trim();
    return host || "assistbridge.online";
  } catch {
    return "assistbridge.online";
  }
}
