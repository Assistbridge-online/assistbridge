"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformIconBadge, platformLabel } from "@/components/social/social-ui";
import { ArrowLeft, Send, Clock, Image as ImageIcon, X } from "lucide-react";
import type { SocialPlatform } from "@prisma/client";

interface AccountOption {
  id: string;
  platform: SocialPlatform;
  label: string;
}

interface Prefill {
  sourceType: string;
  sourceId?: string;
  title: string;
  body: string;
  link: string;
  imageUrl: string;
}

export function Composer({
  accounts,
  prefill,
}: {
  accounts: AccountOption[];
  prefill: Prefill;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(prefill.title);
  const [body, setBody] = useState(prefill.body);
  const [link, setLink] = useState(prefill.link);
  const [imageUrl, setImageUrl] = useState(prefill.imageUrl);
  const [hashtags, setHashtags] = useState("");
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const igSelected = accountIds.some((id) => {
    const a = accounts.find((x) => x.id === id);
    return a?.platform === "INSTAGRAM";
  });

  function toggleAccount(id: string) {
    setAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError("Title and post copy are required.");
      return;
    }
    if (accountIds.length === 0) {
      setError("Pick at least one platform to post to.");
      return;
    }
    if (igSelected && !imageUrl.trim()) {
      setError("Instagram requires an image. Add one or uncheck the Instagram account.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/admin/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: prefill.sourceType,
          sourceId: prefill.sourceId,
          title,
          body: hashtagify(body, hashtags),
          link: link || null,
          imageUrl: imageUrl || null,
          hashtags: hashtags || null,
          accountIds,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to create post");
        return;
      }
      // Send immediately if not scheduled.
      if (!scheduledAt) {
        await fetch(`/api/admin/social/posts/${json.postId}/publish`, { method: "POST" });
      }
      router.push(`/admin/social/posts/${json.postId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/admin/social/posts" className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
          New social post
        </h1>
        {prefill.sourceType !== "CUSTOM" && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            from {prefill.sourceType.toLowerCase().replace("_", " ")}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5 space-y-4">
        <Field label="Post title (internal — for your records)">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Announcing free essay review for Kenyan students"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </Field>

        <Field label="Post copy" hint="This is what appears on the social platforms. Keep it short.">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="What do you want to say?"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
          <div className="text-[11px] text-slate-500 mt-1 tabular-nums">{body.length} chars</div>
        </Field>

        <Field label="Hashtags (optional, space-separated)">
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#AcademicHelp #Kenya #EssayTips"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
          <div className="text-[11px] text-slate-500 mt-1">
            Hashtags will be appended to the post body on publish.
          </div>
        </Field>

        <Field label="Link (optional, appended to the post)">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://yourdomain.com/blog/article"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Image URL (optional, required for Instagram)
            </span>
          }
        >
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://yourdomain.com/image.jpg"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </Field>

        <Field label="Schedule (leave blank to publish immediately)">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </Field>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Post to ({accountIds.length} selected)
          </h3>
          <button
            type="button"
            onClick={() => setAccountIds(accounts.map((a) => a.id))}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Select all
          </button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No connected accounts yet.{" "}
            <Link href="/admin/social/accounts" className="text-emerald-700 font-medium">
              Connect one →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 -mx-2">
            {accounts.map((a) => {
              const checked = accountIds.includes(a.id);
              return (
                <li key={a.id}>
                  <label
                    className={`flex items-center gap-3 px-2 py-2.5 rounded cursor-pointer hover:bg-slate-50 ${
                      checked ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAccount(a.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <PlatformIconBadge platform={a.platform} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{a.label}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                        {platformLabel(a.platform)}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 sticky bottom-0 bg-white/80 backdrop-blur py-3 -mx-4 px-4 border-t border-slate-200">
        <Link
          href="/admin/social/posts"
          className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          Cancel
        </Link>
        <div className="flex-1" />
        <button
          type="submit"
          disabled={pending || accounts.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scheduledAt ? (
            <>
              <Clock className="h-4 w-4" />
              {pending ? "Scheduling…" : "Schedule post"}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {pending ? "Publishing…" : "Publish now"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

/**
 * Append hashtags to the post copy if the body doesn't already include them.
 * Most social platforms work fine with hashtags inline; we keep it simple.
 */
function hashtagify(text: string, hashtags: string): string {
  if (!hashtags.trim()) return text;
  const tags = hashtags.trim();
  if (text.includes(tags)) return text;
  const sep = text.endsWith("\n") ? "" : "\n\n";
  return `${text}${sep}${tags}`;
}