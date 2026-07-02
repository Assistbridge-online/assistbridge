"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard-widgets";
import { cn, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

interface TicketSummary {
  id: string;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  status: string;
  lastMessageAt: string;
  messageCount: number;
  lastDirection: string;
  lastSnippet: string;
}

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "PENDING", label: "Pending" },
  { id: "CLOSED", label: "Closed" },
];

export function SupportInboxClient({ tickets }: { tickets: TicketSummary[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let arr = tickets;
    if (filter !== "ALL") arr = arr.filter((t) => t.status === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      arr = arr.filter(
        (t) =>
          t.subject.toLowerCase().includes(needle) ||
          t.fromEmail.toLowerCase().includes(needle) ||
          (t.fromName ?? "").toLowerCase().includes(needle) ||
          t.lastSnippet.toLowerCase().includes(needle),
      );
    }
    return arr;
  }, [tickets, filter, q]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition",
                filter === f.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email, name, subject…"
            className="w-full pl-8 pr-3 h-9 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-600">
          No tickets match this filter.
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <Link key={t.id} href={`/admin/support/${t.id}`} className="block">
              <Card className="p-4 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">
                        {t.subject}
                      </span>
                      <StatusBadge status={t.status} />
                      {t.messageCount > 1 && (
                        <span className="text-xs text-slate-500">
                          {t.messageCount} msgs
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      <span className="font-medium text-slate-700">
                        {t.fromName ?? t.fromEmail}
                      </span>
                      {t.fromName && (
                        <span className="text-slate-500"> &lt;{t.fromEmail}&gt;</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                      <span
                        className={cn(
                          "text-xs font-semibold mr-1.5",
                          t.lastDirection === "INBOUND"
                            ? "text-primary-700"
                            : "text-emerald-700",
                        )}
                      >
                        {t.lastDirection === "INBOUND" ? "←" : "→"}
                      </span>
                      {t.lastSnippet}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 text-right">
                    {formatDate(t.lastMessageAt)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}