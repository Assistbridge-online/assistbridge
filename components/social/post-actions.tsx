"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Ban, Loader2, CheckCircle2 } from "lucide-react";
import type { SocialPostStatus } from "@prisma/client";

export function PostActions({
  postId,
  status,
  scheduledAt,
}: {
  postId: string;
  status: SocialPostStatus;
  scheduledAt: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const isTerminal =
    status === "PUBLISHED" ||
    status === "CANCELLED" ||
    status === "PUBLISHING";

  function publishNow() {
    setResult(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/social/posts/${postId}/publish`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setResult(`Failed: ${json.error ?? "unknown"}`);
        return;
      }
      setResult(
        `Dispatched: ${json.succeeded} succeeded, ${json.failed} failed (status: ${json.status}).`,
      );
      router.refresh();
    });
  }

  function cancel() {
    setResult(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/social/posts/${postId}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setResult(`Failed: ${json.error ?? "unknown"}`);
        return;
      }
      setResult("Cancelled.");
      router.refresh();
    });
  }

  if (isTerminal) {
    return (
      <div className="text-sm text-slate-600">
        {status === "PUBLISHING" && (
          <div className="flex items-center gap-2 text-violet-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing…
          </div>
        )}
        {status === "PUBLISHED" && (
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Published. Check attempts below for links.
          </div>
        )}
        {status === "CANCELLED" && (
          <div className="text-slate-500">Cancelled.</div>
        )}
        {/* Terminal-but-not-cancelled: PUBLISHED / PARTIAL / FAILED. Re-publish retries. */}
        {status !== "CANCELLED" && (
          <button
            type="button"
            onClick={publishNow}
            disabled={pending}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Re-publishing…" : "Re-publish (retry)"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={publishNow}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {pending ? "Publishing…" : scheduledAt ? "Publish now (skip schedule)" : "Publish now"}
      </button>
      <button
        type="button"
        onClick={cancel}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
      >
        <Ban className="h-3.5 w-3.5" />
        Cancel
      </button>
      {result && (
        <div className="text-[11px] text-slate-600 mt-2">{result}</div>
      )}
    </div>
  );
}