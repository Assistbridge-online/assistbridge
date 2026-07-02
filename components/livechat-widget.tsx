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
 *
 * Audio:
 *   - Soft "ping" on new admin messages and admin typing indicators
 *     (gated by user-controlled mute).
 *   - Audio is synthesised via the Web Audio API on demand — no asset
 *     files needed, no autoplay friction (lazily created on first
 *     user interaction with the widget).
 *
 * Visual:
 *   - Bubble uses a calm primary→accent gradient with a soft glow,
 *     chosen to blend with the marketing site (no jarring saturated
 *     blue) rather than shout at the user.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  MessagesSquare,
  X,
  Send,
  Paperclip,
  Mail,
  Bell,
  BellOff,
  Volume2,
} from "lucide-react";
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

const SOUND_PREF_KEY = "livechat_sound_muted";

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
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SOUND_PREF_KEY) === "1";
  });
  const [unseen, setUnseen] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Track last-seen message id so we can detect *new* incoming messages
  // (not the first hydration).
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const hydratedOnceRef = useRef(false);
  // Mirror of `open` for use inside async callbacks (SSE handler) where
  // we need the freshest value without re-subscribing on every toggle.
  const openRef = useRef(open);
  openRef.current = open;

  // Lazily construct the AudioContext on first user interaction —
  // browsers refuse to start audio playback until then.
  function ensureAudio(): AudioContext | null {
    if (muted) return null;
    if (typeof window === "undefined") return null;
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }

  function playPing(opts?: { soft?: boolean }) {
    const ctx = ensureAudio();
    if (!ctx) return;
    // Browsers suspend a freshly-created AudioContext until the next
    // user gesture. resume() is idempotent and safe to call here.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Two-tone ping — the second note is what makes it feel like a
    // chat notification rather than an error beep.
    osc.frequency.setValueAtTime(opts?.soft ? 660 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(
      opts?.soft ? 520 : 660,
      now + 0.18,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  function persistMute(next: boolean) {
    setMuted(next);
    try {
      window.localStorage.setItem(SOUND_PREF_KEY, next ? "1" : "0");
    } catch {
      /* private mode etc. */
    }
  }

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
          .then((data) => {
            setSnapshot(data);
            // Detect new inbound (admin) messages and notify.
            const msgs = data?.ticket?.messages ?? [];
            if (msgs.length === 0) return;
            const newest = msgs[msgs.length - 1];
            if (newest.id === lastSeenMessageIdRef.current) return;
            lastSeenMessageIdRef.current = newest.id;
            if (newest.direction === "INBOUND") {
              playPing();
              // Bump unread badge if the panel is closed at the moment
              // the message arrives.
              if (!openRef.current) {
                setUnseen((n) => n + 1);
              }
            }
          });
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
        if (data.actorKind === "admin") {
          setAdminTyping(data.isTyping);
          // Subtle tick when admin starts typing — only fires once
          // per typing session because we already debounce on the
          // server side. Cheap and pleasant.
          if (data.isTyping) playPing({ soft: true });
        }
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
  // playPing is intentionally read inside the SSE handler via closure
  // (it's stable — created once per render). We don't want this effect
  // to re-subscribe every time something causes playPing to be a new
  // reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, snapshot?.found, snapshot?.ticket?.id]);

  // First-time snapshot hydration — record the newest message id so
  // the SSE handler doesn't fire notifications for messages that
  // already existed when the visitor opened the widget.
  useEffect(() => {
    if (!snapshot?.ticket) return;
    const msgs = snapshot.ticket.messages ?? [];
    if (msgs.length === 0) {
      lastSeenMessageIdRef.current = null;
      hydratedOnceRef.current = true;
      return;
    }
    const newest = msgs[msgs.length - 1];
    lastSeenMessageIdRef.current = newest.id;
    hydratedOnceRef.current = true;
  }, [snapshot?.ticket]);

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
      // First user interaction is the unlock for Web Audio.
      ensureAudio();
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
      ensureAudio();
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
      {/* Bubble — calm gradient + soft ring, blends with the marketing site. */}
      {!open && (
        <button
          type="button"
          onClick={() => {
            ensureAudio();
            setOpen(true);
            setUnseen(0);
          }}
          aria-label="Open chat"
          className={cn(
            "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full text-white shadow-xl transition",
            "flex items-center justify-center",
            // Soft white→indigo→teal gradient that picks up the brand
            // palette without screaming at visitors.
            "bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600",
            "ring-1 ring-white/30 ring-offset-2 ring-offset-white/0",
            "hover:from-primary-500 hover:via-primary-600 hover:to-accent-500",
            "hover:shadow-2xl",
            // Gentle breathing animation when there are unread messages.
            unseen > 0 && "animate-[pulse_2.4s_ease-in-out_infinite]",
          )}
          style={{
            boxShadow:
              "0 12px 28px -8px rgba(29, 78, 216, 0.45), 0 4px 12px -4px rgba(8, 145, 178, 0.35)",
          }}
        >
          <MessagesSquare className="h-6 w-6" strokeWidth={2.2} />
          {unseen > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unseen > 9 ? "9+" : unseen}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 flex flex-col overflow-hidden",
            "w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-2rem))]",
            "rounded-2xl border border-slate-200/80 bg-white shadow-2xl",
          )}
        >
          {/* Header — gradient matches the bubble so the panel feels
              like an extension of the same affordance. */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-primary-700 via-primary-700 to-accent-700 text-white">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 opacity-90" strokeWidth={2.2} />
                AssistBridge Support
              </div>
              <div className="text-xs text-primary-100/90 flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    adminOnline ? "bg-emerald-300" : "bg-slate-300",
                  )}
                />
                {adminOnline ? "Support online" : "We\u2019ll reply by email"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => persistMute(!muted)}
                title={muted ? "Unmute sounds" : "Mute sounds"}
                aria-label={muted ? "Unmute sounds" : "Mute sounds"}
                className="rounded-md p-1 hover:bg-white/10"
              >
                {muted ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!snapshot ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Loading…
            </div>
          ) : !snapshot.found ? (
            // INTAKE FORM
            <form onSubmit={submitIntake} className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <p className="text-sm text-slate-700 leading-relaxed">
                Hi there. Leave your name and email and we&apos;ll get you a real
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
                className="mt-2 h-10 rounded-lg bg-gradient-to-r from-primary-700 to-accent-700 text-white text-sm font-semibold hover:from-primary-800 hover:to-accent-800 transition disabled:opacity-50"
              >
                {submitting ? "Starting chat…" : "Start chat"}
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We\u2019ll email you a copy of this conversation. By starting a
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
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        m.direction === "INBOUND"
                          ? "bg-white border border-slate-200"
                          : "bg-gradient-to-br from-primary-600 to-primary-700 text-white",
                      )}
                    >
                      <div
                        className="whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: m.bodyHtml || escape(m.body) }}
                      />
                      <div
                        className={cn(
                          "mt-1 text-[10px] flex items-center gap-1",
                          m.direction === "INBOUND" ? "text-slate-400" : "text-primary-100/90",
                        )}
                      >
                        <span>{m.direction === "INBOUND" ? (m.fromName ?? "You") : "AssistBridge"}</span>
                        {m.direction === "OUTBOUND" && !muted && (
                          <Volume2 className="h-3 w-3 opacity-60" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {adminTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-500 italic inline-flex items-center gap-1.5">
                      <span className="inline-flex gap-0.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </span>
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
                    className="rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 text-white p-2 hover:from-primary-700 hover:to-accent-700 transition disabled:opacity-40"
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
