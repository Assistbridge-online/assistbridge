/**
 * In-process pub/sub for the support SSE stream.
 *
 * SSE works on Vercel because the route handler returns a `Response` with
 * a streaming body, and Vercel keeps the connection open until the
 * handler returns or the client disconnects. To fan events out from
 * one sender to many connected browsers, we keep a Map of `ticketId →
 * Set<Subscriber>` in module scope.
 *
 * Caveat: this map is per-server-instance. On Vercel's serverless
 * runtime, a single Vercel function instance can hold many concurrent
 * SSE connections. If a ticket happens to be open across two instances
 * at once, only the connections on the same instance as the sender
 * get the event. This is fine for admin UX because the admin typically
 * has one tab open; if they have two, they get a deduplicated view via
 * `lastMessageAt` on the next render. For visitor realtime, the
 * window of inconsistency is <1 s and the visitor's own message is the
 * one we are echoing back so it's not even noticed.
 *
 * If we ever need cross-instance fan-out, swap this for Redis pub/sub
 * — the API surface (publish / subscribe) doesn't change.
 */
type Subscriber = {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  encoder: TextEncoder;
};

type EventPayload =
  | { type: "new_message"; messageId: string; ticketId: string; at: string }
  | { type: "typing"; ticketId: string; actorKind: "admin" | "visitor"; isTyping: boolean }
  | { type: "read"; ticketId: string; actorKind: "admin" | "visitor"; lastReadMessageId: string | null }
  | { type: "presence"; ticketId: string; actorKind: "admin" | "visitor"; online: boolean }
  | { type: "status"; ticketId: string; status: string };

const channels = new Map<string, Set<Subscriber>>();

function encode(payload: EventPayload, encoder: TextEncoder): Uint8Array {
  const frame = `event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`;
  return encoder.encode(frame);
}

export function subscribe(
  ticketId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
): { close: () => void } {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sub: Subscriber = { id, controller, encoder };
  let set = channels.get(ticketId);
  if (!set) {
    set = new Set();
    channels.set(ticketId, set);
  }
  set.add(sub);

  // Hello frame — clients use this to confirm the connection is live
  // before they start rendering.
  try {
    controller.enqueue(
      encode({ type: "presence", ticketId, actorKind: "admin", online: true }, encoder),
    );
  } catch {
    /* controller already closed */
  }

  return {
    close() {
      const existing = channels.get(ticketId);
      if (!existing) return;
      existing.delete(sub);
      if (existing.size === 0) channels.delete(ticketId);
    },
  };
}

export function publish(payload: EventPayload): void {
  const subs = channels.get(payload.ticketId);
  if (!subs || subs.size === 0) return;
  const frame = encode(payload, new TextEncoder());
  for (const sub of [...subs]) {
    try {
      sub.controller.enqueue(frame);
    } catch {
      // Subscriber closed mid-publish; drop them silently.
      subs.delete(sub);
    }
  }
  if (subs.size === 0) channels.delete(payload.ticketId);
}

export function stats() {
  let conns = 0;
  for (const set of channels.values()) conns += set.size;
  return { tickets: channels.size, connections: conns };
}
