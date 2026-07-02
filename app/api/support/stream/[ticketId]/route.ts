/**
 * GET /api/support/stream/[ticketId]
 *
 * Server-Sent Events stream for one ticket. The client opens this
 * with `new EventSource(...)` and listens for `new_message`, `typing`,
 * `presence`, `read`, and `status` events.
 *
 * Auth:
 *   - Admins are authenticated by their NextAuth session cookie.
 *   - Visitors authenticate by passing `vid` as a query param (the
 *     EventSource API doesn't allow request headers, so we can't use
 *     the httpOnly chat_vid cookie directly here — that's why the
 *     widget cookie ALSO sets a parallel `chat_vid_pub` cookie that's
 *     readable from JavaScript and that the widget forwards as a
 *     query param when opening the stream).
 *
 * Idle handling: we send a `:heartbeat` SSE comment every 20 s so
 * Vercel's edge / browser proxies don't kill idle connections, and we
 * bubble up `presence` events on connect/disconnect so the other side
 * can update its UI.
 */
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  authorizeTicketAccess,
  pruneStalePresence,
  readActorOrQueryVid,
  touchPresence,
} from "@/lib/support/auth";
import { subscribe } from "@/lib/support/stream";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  const url = new URL(req.url);
  const queryVid = url.searchParams.get("vid");

  // Try the cookie first; fall back to ?vid= for EventSource browsers.
  // We accept the httpOnly chat_vid from `cookies()` AND the explicit
  // ?vid= which the client reads from chat_vid_pub.
  const jar = await cookies();
  const cookieVid = jar.get("chat_vid")?.value ?? null;
  const actorInput = cookieVid ? { kind: "visitor" as const, visitorId: cookieVid } : await readActorOrQueryVid(queryVid);
  if (!actorInput) {
    return new Response("unauthorized", { status: 401 });
  }

  const auth = await authorizeTicketAccess(ticketId, actorInput);
  if (!auth.allowed || !auth.ticket) {
    return new Response("forbidden", { status: 403 });
  }

  // Garbage-collect stale presence rows opportunistically. Cheap now;
  // if the table grows, run as a scheduled job instead.
  pruneStalePresence().catch(() => {});

  const encoder = new TextEncoder();
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let presenceTicker: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sub = subscribe(ticketId, controller, encoder);

      // Initial presence row, then refresh every 20 s.
      await touchPresence({
        ticketId,
        actorKind: actorInput.kind,
        actorId:
          actorInput.kind === "admin"
            ? actorInput.userId
            : actorInput.visitorId,
      });

      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          /* closed */
        }
      }, 20_000);

      presenceTicker = setInterval(async () => {
        if (closed) return;
        try {
          await touchPresence({
            ticketId,
            actorKind: actorInput.kind,
            actorId:
              actorInput.kind === "admin"
                ? actorInput.userId
                : actorInput.visitorId,
          });
          // Broadcast this side's presence.
          controller.enqueue(
            encoder.encode(
              `event: presence\ndata: ${JSON.stringify({
                type: "presence",
                ticketId,
                actorKind: actorInput.kind,
                online: true,
              })}\n\n`,
            ),
          );
        } catch {
          /* closed */
        }
      }, 25_000);

      // Clean up on close.
      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (presenceTicker) clearInterval(presenceTicker);
        sub.close();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Bind to the underlying request abort signal — the cleanest
      // signal a Node ReadableStream will give us.
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (presenceTicker) clearInterval(presenceTicker);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disable Vercel edge buffering (already off by default for SSE).
      "X-Accel-Buffering": "no",
    },
  });
}
