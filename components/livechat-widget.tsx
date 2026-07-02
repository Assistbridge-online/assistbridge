"use client";

/**
 * Floating livechat widget. Mounted globally from app/layout.tsx.
 *
 * Lifecycle:
 *   - Mount → /api/support/widget/ticket: do we already have a cookie
 *     and an open ticket? If yes, hydrate the thread; if no, show
 *     the intake form (name + email + first message).
 *   - Intake submit → /api/support/widget/start: creates a ticket +
 *     first message, returns ticketId.
 *   - With ticketId → open EventSource against
 *     /api/support/stream/<ticketId>?vid=<chat_vid_pub>.
 *
 * State machine:
 *   INTAKE → CONVERSATION (intake submit)
 *   CONVERSATION ↻ (open thread, SSE updates)
 *
 * Hidden when the user is on /admin/* (the admin is busy doing
 * something else and shouldn't see it) and on /login (don't bug people
 * mid-auth).
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Paperclip, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  channel: string;
  fromName: string | null;
  fromEmail: string;
  body: string;
  bodyHtml: string;
  createdAt: string;
};

type Snapshot = {
  found: boolean;
  reason?: string;
  ticket?: {
    id: string;
    subject: string;
    status: string;
    visitorName: string | null;
    visitorEmail: string | null;
    messages: Message[];
  };
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "=([^;]*)"),
  );
  return m ? decodeURIComponent(m[1]) : null;
}

export function LivechatWidget() {
  const path = usePathname();
  // Hide on admin surfaces and during login/signup.
  if (
    path?.startsWith("/admin") ||
    path?.startsWith("/dashboard") ||
    path === "/login" ||
    path?.startsWith("/login")
  ) {
    return null;
  }
  return <LivechatWidgetInner />;
}

function LivechatWidgetInner() {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Boot: hydrate from /api/support/widget/ticket
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/support/widget/ticket", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSnapshot(data);
      })
      .catch(() => {
        if (cancelled) return;
        setSnapshot({ found: false, reason: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Subscribe to SSE when we have an open ticket.
  useEffect(() => {
    if (!open) return;
    if (!snapshot?.found || !snapshot.ticket) return;
    const tid = snapshot.ticket.id;
    const vid = readCookie("chat_vid_pub");
    if (!vid) return;

    const url = `/api/support/stream/${tid}?vid=${encodeURIComponent(vid)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("new_message", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as {
          ticketId: string;
          messageId: string;
        };
        if (data.ticketId !== tid) return;
        // Lazy re-hydrate. SSE doesn't carry the body, so we refetch
        // ticket snapshot. Cheap because the ticket only has a small
        // number of messages. If the ticket gets into the hundreds we
        // can switch to passing the message payload through the event.
        fetch("/api/support/widget/ticket", { credentials: "include" })
          .then((r) => r.json())
          .then((data) => setSnapshot(data));
      } catch {
        /* malformed event */
      }
    });
    es.addEventListener("typing", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as {
          actorKind: "admin" | "visitor";
          isTyping: boolean;
        };
        if (data.actorKind === "admin") setAdminTyping(data.isTyping);
      } catch {
        /* */
      }
    });
    es.addEventListener("presence", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as {
          actorKind: "admin" | "visitor";
          online: boolean;
        };
        if (data.actorKind === "admin") setAdminOnline(data.online);
      } catch {
        /* */
      }
    });
    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do.
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [open, snapshot?.found, snapshot?.ticket?.id]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [snapshot?.ticket?.messages.length]);

  // Visitor-side typing indicator: debounce by 1.5 s, fire on
  // non-empty draft, clear on empty / pause.
  useEffect(() => {
    if (!snapshot?.found || !snapshot.ticket) return;
    if (!draft.trim()) {
      sendTyping(false);
      return;
    }
    const now = Date.now();
    if (now - lastTypingSentRef.current > 1500) {
      sendTyping(true);
      lastTypingSentRef.current = now;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2500);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, snapshot?.found]);

  function sendTyping(isTyping: boolean) {
    if (!snapshot?.ticket) return;
    fetch(`/api/support/conversations/${snapshot.ticket.id}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isTyping }),
    }).catch(() => {});
  }

  async function submitIntake(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !first.trim()) {
      toast.error("Please fill in your name, email, and first message.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/support/widget/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, message: first }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        throw new Error(data.error || "Could not start conversation.");
      }
      // Refetch snapshot now that we have a ticket.
      const t = await fetch("/api/support/widget/ticket", { credentials: "include" });
      setSnapshot(await t.json());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshot?.ticket) return;
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const r = await fetch(`/api/support/conversations/${snapshot.ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        throw new Error(data.error || "Could not send.");
      }
      setDraft("");
      sendTyping(false);
      // Refresh thread (the SSE `new_message` will also trigger it,
      // but doing it here too gives instant feedback even if SSE
      // is slow to reconnect).
      const t = await fetch("/api/support/widget/ticket", { credentials: "include" });
      setSnapshot(await t.json());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function uploadAttachment(file: File) {
    if (!snapshot?.ticket) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("ticketId", snapshot.ticket.id);
    const r = await fetch("/api/support/attachments/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = await r.json();
    if (!r.ok || !data.success) {
      toast.error(data.error || "Upload failed.");
      return;
    }
    const att = data.attachment as { filename: string; storedUrl: string; size: number };
    setDraft((d) =>
      `${d}${d ? "\n" : ""}📎 ${att.filename} (${formatBytes(att.size)})\n${att.storedUrl}`,
    );
  }

  function requestTranscript() {
    if (!snapshot?.ticket) return;
    fetch(`/api/support/conversations/${snapshot.ticket.id}/email-transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email || snapshot.ticket.visitorEmail }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) toast.success("Transcript emailed.");
        else toast.error(data.error || "Could not email transcript.");
      });
  }

  return (
    <>
      {/* Bubble */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary-700 text-white shadow-xl hover:bg-primary-800 transition flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-2rem))] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-700 text-white">
            <div>
              <div className="font-semibold text-sm">AssistBridge Support</div>
              <div className="text-xs text-primary-100 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    adminOnline ? "bg-emerald-300" : "bg-slate-300",
                  )}
                />
                {adminOnline ? "Support online" : "We'll reply by email"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-primary-800"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!snapshot ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Loading…
            </div>
          ) : !snapshot.found ? (
            // INTAKE FORM
            <form onSubmit={submitIntake} className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <p className="text-sm text-slate-700 leading-relaxed">
                Hi there. Leave your name and email and we'll get you a real
                human reply — usually in a few minutes during business hours.
              </p>
              <label className="text-xs font-medium text-slate-600">
                Your name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Jane Doe"
                  required
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                How can we help?
                <textarea
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                  placeholder="What's going on?"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-10 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition disabled:opacity-50"
              >
                {submitting ? "Starting chat…" : "Start chat"}
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We'll email you a copy of this conversation. By starting a
                chat you agree to our terms.
              </p>
            </form>
          ) : (
            // CONVERSATION VIEW
            <>
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                {(snapshot.ticket!.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.direction === "INBOUND" ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        m.direction === "INBOUND"
                          ? "bg-white border border-slate-200"
                          : "bg-primary-700 text-white",
                      )}
                    >
                      <div
                        className="whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: m.bodyHtml || escape(m.body) }}
                      />
                      <div
                        className={cn(
                          "mt-1 text-[10px]",
                          m.direction === "INBOUND" ? "text-slate-400" : "text-primary-100",
                        )}
                      >
                        {m.direction === "INBOUND" ? (m.fromName ?? "You") : "AssistBridge"}
                      </div>
                    </div>
                  </div>
                ))}
                {adminTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-500 italic">
                      Support is typing…
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={sendMessage} className="border-t border-slate-200 p-3 bg-white">
                <div className="flex items-end gap-2">
                  <label className="cursor-pointer rounded-lg p-2 hover:bg-slate-100">
                    <Paperclip className="h-4 w-4 text-slate-500" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAttachment(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={1}
                    placeholder="Type a message…"
                    className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-lg bg-primary-700 text-white p-2 hover:bg-primary-800 transition disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Press Enter to send, Shift+Enter for newline</span>
                  <button
                    type="button"
                    onClick={requestTranscript}
                    className="inline-flex items-center gap-1 hover:text-primary-700"
                  >
                    <Mail className="h-3 w-3" /> Email me a copy
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}

function formatBytes(b: number): string {
  if (!b) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
