import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PostStatusPill, PlatformIconBadge } from "@/components/social/social-ui";
import { Plus, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Social · Posts" };

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "QUEUED", label: "Queued" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" },
  { value: "PARTIAL", label: "Partial" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function SocialPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/social/posts");
  const { status } = await searchParams;

  const where = status && status !== "ALL" ? { status: status as never } : {};
  const posts = await prisma.socialPost.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    include: {
      accounts: {
        select: { platform: true, externalName: true },
      },
      attempts: { select: { status: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
            Social posts
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cross-posts sent (or queued) via the Social Plugin.
          </p>
        </div>
        <Link
          href="/admin/social/posts/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
        >
          <Plus className="h-3.5 w-3.5" />
          New post
        </Link>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? "ALL") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/admin/social/posts" : `/admin/social/posts?status=${f.value}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            <Share2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            No posts in this view yet.
            <div className="mt-3">
              <Link
                href="/admin/social/posts/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Create the first one
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Targets</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => {
                const attemptSummary = summarizeAttempts(p.attempts.map((a) => a.status));
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 max-w-[20rem]">
                      <Link href={`/admin/social/posts/${p.id}`} className="block">
                        <div className="font-medium text-slate-900 truncate hover:text-emerald-700">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{p.body}</div>
                        {attemptSummary && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            {attemptSummary}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {Array.from(new Set(p.accounts.map((a) => a.platform))).map((platform) => (
                          <PlatformIconBadge key={platform} platform={platform} size={22} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <PostStatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {p.scheduledAt
                        ? `Scheduled · ${formatDate(p.scheduledAt)}`
                        : formatDate(p.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function summarizeAttempts(statuses: string[]): string {
  if (statuses.length === 0) return "";
  const counts = statuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([s, n]) => `${n} ${s.toLowerCase()}`)
    .join(" · ");
}