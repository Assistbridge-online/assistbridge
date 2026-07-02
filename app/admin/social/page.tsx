import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PostStatusPill } from "@/components/social/social-ui";
import {
  Share2,
  Link as LinkIcon,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Social" };

export default async function SocialOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/social");

  const [accounts, queuedCount, publishedCount, failedCount, recent] = await Promise.all([
    prisma.socialAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        platform: true,
        accountLabel: true,
        externalName: true,
        createdAt: true,
        tokenExpiresAt: true,
      },
    }),
    prisma.socialPost.count({ where: { status: "QUEUED" } }),
    prisma.socialPost.count({ where: { status: "PUBLISHED" } }),
    prisma.socialPost.count({ where: { status: { in: ["FAILED", "PARTIAL"] } } }),
    prisma.socialPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        accounts: { select: { platform: true, externalName: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-5">
      {/* Welcome / quick actions */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-md shadow-sm border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Social Plugin</h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Cross-post to Facebook, Instagram, and LinkedIn from one composer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/social/posts/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New post
            </Link>
            <Link
              href="/admin/social/accounts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Manage accounts
            </Link>
          </div>
        </div>
      </div>

      {/* At-a-glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Glance label="Connected" value={accounts.length.toString()} sub="Across all platforms" tone="blue" />
        <Glance label="Queued" value={queuedCount.toString()} sub="Scheduled + ready" tone="violet" />
        <Glance label="Published" value={publishedCount.toString()} sub="All-time successful" tone="emerald" />
        <Glance label="Failed" value={failedCount.toString()} sub="Needs attention" tone="amber" />
      </div>

      {/* Two-column row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Recent posts
            </h3>
            <Link
              href="/admin/social/posts"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
            >
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-2">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No posts yet. <Link href="/admin/social/posts/new" className="text-emerald-700 font-medium">Create the first one →</Link>
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/social/posts/${p.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded transition"
                    >
                      <Share2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">{p.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.accounts.map((a) => a.externalName).join(" · ") || "No accounts"} · {formatDate(p.updatedAt)}
                        </div>
                      </div>
                      <PostStatusPill status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Accounts
            </h3>
            <Link
              href="/admin/social/accounts"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900"
            >
              Manage
            </Link>
          </div>
          <div className="p-2">
            {accounts.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No accounts connected yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {accounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-slate-50"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                      {a.externalName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{a.externalName}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                        {a.platform}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Glance({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "blue" | "violet" | "emerald" | "amber";
}) {
  const toneCls = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  }[tone];
  const icons = {
    blue: <LinkIcon className="h-5 w-5" />,
    violet: <Clock className="h-5 w-5" />,
    emerald: <CheckCircle2 className="h-5 w-5" />,
    amber: <AlertCircle className="h-5 w-5" />,
  }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 flex items-start gap-3">
      <div className={`shrink-0 h-10 w-10 rounded-md ring-1 flex items-center justify-center ${toneCls}`}>
        {icons}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}