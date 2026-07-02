/**
 * Platform icons + status helpers + shared UI primitives used by the
 * social plugin admin pages. Client-only because of lucide icons.
 */
"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Send,
  Ban,
  type LucideIcon,
} from "lucide-react";
import type { SocialPlatform, SocialPostStatus, SocialAttemptStatus } from "@prisma/client";

export function platformIcon(p: SocialPlatform): LucideIcon {
  if (p === "FACEBOOK") return Facebook;
  if (p === "INSTAGRAM") return Instagram;
  return Linkedin;
}

export function platformLabel(p: SocialPlatform): string {
  if (p === "FACEBOOK") return "Facebook";
  if (p === "INSTAGRAM") return "Instagram";
  return "LinkedIn";
}

const postStatusStyle: Record<SocialPostStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  QUEUED: "bg-blue-100 text-blue-800",
  PUBLISHING: "bg-violet-100 text-violet-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-slate-100 text-slate-500 line-through",
};

export function PostStatusPill({ status }: { status: SocialPostStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${postStatusStyle[status]}`}
    >
      {status}
    </span>
  );
}

const attemptStatusStyle: Record<SocialAttemptStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  SENDING: "bg-violet-100 text-violet-800",
  SUCCESS: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function AttemptStatusPill({ status }: { status: SocialAttemptStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${attemptStatusStyle[status]}`}
    >
      {status === "SUCCESS" && <CheckCircle2 className="h-3 w-3" />}
      {status === "FAILED" && <AlertCircle className="h-3 w-3" />}
      {status === "SENDING" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "PENDING" && <Clock className="h-3 w-3" />}
      {status}
    </span>
  );
}

export function PlatformIconBadge({
  platform,
  size = 32,
}: {
  platform: SocialPlatform;
  size?: number;
}) {
  const Icon = platformIcon(platform);
  return (
    <span
      className="inline-flex items-center justify-center rounded-md bg-slate-100 text-slate-700"
      style={{ width: size, height: size }}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export { Send, Ban, Loader2, CheckCircle2, AlertCircle };