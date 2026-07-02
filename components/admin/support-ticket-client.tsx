"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard-widgets";
import {
  replyToTicket,
  setTicketStatus,
  assignTicket,
} from "@/lib/actions/support";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronDown,
  Paperclip,
  Send,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  direction: string;
  fromEmail: string;
  fromName: string | null;
  bodyText: string;
  bodyHtml: string;
  messageId: string;
  createdAt: string;
  attachmentIds: string[];
}

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  messageId: string | null;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  fromEmail: string;
  fromName: string | null;
  createdAt: string;
  lastMessageAt: string;
  assignee: { id: string; name: string; email: string } | null;
  messages: Message[];
  attachments: Attachment[];
}

const STATUSES = [
  { id: "OPEN", label: "Open" },
  { id: "PENDING", label: "Pending" },
  { id: "CLOSED", label: "Closed" },
];

export function SupportTicketClient({ ticket: initial }: { ticket: Ticket }) {
  const [ticket, setTicket] = useState(initial);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [showStatus, setShowStatus] = useState(false);
  const [showClaim, setShowClaim] = useState(false);

  function send() {
    if (!draft.trim()) return;
    startTransition(async () => {
      try {
        await replyToTicket({ ticketId: ticket.id, body: draft });
        // Optimistic append — the server action revalidates the page so
        // we'll re-render with the persisted state.
        setDraft("");
        toast.success("Reply sent");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function changeStatus(status: string) {
    startStatusTransition(async () => {
      try {
        await setTicketStatus({ ticketId: ticket.id, status: status as any });
        setTicket((t) => ({ ...t, status }));
        toast.success(`Status set to ${status}`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function claim() {
    startStatusTransition(async () => {
      try {
        await assignTicket({ ticketId: ticket.id, assigneeId: "me" });
        setTicket((t) => ({ ...t, assignee: { id: "me", name: "You", email: "" } }));
        toast.success("Claimed");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function unassign() {
    startStatusTransition(async () => {
      try {
        await assignTicket({ ticketId: ticket.id, assigneeId: null });
        setTicket((t) => ({ ...t, assignee: null }));
        toast.success("Unassigned");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-3 flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatus((v) => !v)}
            rightIcon={
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition",
                  showStatus && "rotate-180",
                )}
              />
            }
          >
            <StatusBadge status={ticket.status} />
          </Button>
          {showStatus && (
            <div className="absolute z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    changeStatus(s.id);
                    setShowStatus(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2",
                    ticket.status === s.id && "bg-slate-50 font-medium",
                  )}
                >
                  <StatusBadge status={s.id} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          {ticket.assignee ? (
            <>
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Assigned to {ticket.assignee.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={unassign}
                loading={statusPending}
                className="!h-7 !px-2 !text-xs"
              >
                <UserMinus className="h-3 w-3" /> Unassign
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={claim}
              loading={statusPending}
            >
              <UserCheck className="h-3.5 w-3.5" /> Claim
            </Button>
          )}
        </div>
      </Card>

      {/* Thread */}
      <div className="space-y-3">
        {ticket.messages.map((m) => (
          <MessageBubble key={m.id} message={m} ticket={ticket} />
        ))}
      </div>

      {/* Composer */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Reply
          </span>
          <span className="text-xs text-slate-400">
            Reply will thread into {ticket.fromEmail}'s inbox
          </span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="Type your reply…"
          className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={pending}
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            onClick={send}
            disabled={!draft.trim()}
            loading={pending}
            size="md"
          >
            <Send className="h-3.5 w-3.5" />
            Send reply
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({
  message: m,
  ticket,
}: {
  message: Message;
  ticket: Ticket;
}) {
  const inbound = m.direction === "INBOUND";
  const atts = ticket.attachments.filter((a) => a.messageId === m.id);

  return (
    <div
      className={cn(
        "flex",
        inbound ? "justify-start" : "justify-end",
      )}
    >
      <Card
        className={cn(
          "p-4 max-w-[80%]",
          inbound ? "bg-white" : "bg-emerald-50 border-emerald-200",
        )}
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
          <span
            className={cn(
              "font-semibold",
              inbound ? "text-primary-700" : "text-emerald-700",
            )}
          >
            {inbound ? (m.fromName ?? m.fromEmail) : (m.fromName ?? "You")}
          </span>
          {inbound && m.fromName && (
            <span className="text-slate-400">&lt;{m.fromEmail}&gt;</span>
          )}
          <span className="ml-auto">{formatDate(m.createdAt)}</span>
        </div>
        <div
          className="text-sm text-slate-800 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: m.bodyHtml || escapeText(m.bodyText) }}
        />
        {atts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
            {atts.map((a) => (
              <a
                key={a.id}
                href={`/api/admin/support/attachments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-slate-700 hover:text-primary-700"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span className="truncate">{a.filename}</span>
                <span className="text-slate-400">{formatSize(a.size)}</span>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function escapeText(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function formatSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}