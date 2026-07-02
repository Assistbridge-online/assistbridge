import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  PostStatusPill,
  AttemptStatusPill,
  PlatformIconBadge,
  platformLabel,
} from "@/components/social/social-ui";
import { PostActions } from "@/components/social/post-actions";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Social · Post" };

export default async function SocialPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/social");
  const { id } = await params;

  const post = await prisma.socialPost.findUnique({
    where: { id },
    include: {
      accounts: true,
      attempts: { orderBy: { attemptedAt: "desc" }, include: { account: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });
  if (!post) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/admin/social/posts" className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
          {post.title}
        </h1>
        <PostStatusPill status={post.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Body */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Post copy
              </h3>
            </div>
            <div className="p-4 text-sm text-slate-800 whitespace-pre-wrap">{post.body}</div>
            {(post.link || post.imageUrl || post.hashtags) && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs space-y-1">
                {post.link && (
                  <div>
                    <span className="font-semibold text-slate-500">Link: </span>
                    <a href={post.link} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1">
                      {post.link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {post.imageUrl && (
                  <div>
                    <span className="font-semibold text-slate-500">Image: </span>
                    <a href={post.imageUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1">
                      {post.imageUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {post.hashtags && (
                  <div>
                    <span className="font-semibold text-slate-500">Hashtags: </span>
                    <span className="text-slate-700">{post.hashtags}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attempts */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Platform attempts ({post.attempts.length})
              </h3>
            </div>
            {post.attempts.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No attempts yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {post.attempts.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <PlatformIconBadge platform={a.account.platform} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900">
                            {platformLabel(a.account.platform)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {a.account.externalName}
                          </span>
                          <AttemptStatusPill status={a.status} />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Attempted {formatDate(a.attemptedAt)}
                          {a.finishedAt && <> · finished {formatDate(a.finishedAt)}</>}
                        </div>
                        {a.externalUrl && (
                          <a
                            href={a.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-mono break-all"
                          >
                            {a.externalUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {a.status === "FAILED" && (
                          <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 flex items-start gap-2">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-mono font-bold">{a.errorCode ?? "ERROR"}</div>
                              <div className="mt-0.5">{a.errorMessage ?? "Unknown error"}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Actions
              </h3>
            </div>
            <div className="p-4">
              <PostActions
                postId={post.id}
                status={post.status}
                scheduledAt={post.scheduledAt?.toISOString() ?? null}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Target accounts
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {post.accounts.map((a) => (
                <li key={a.id} className="px-4 py-2.5 flex items-center gap-2">
                  <PlatformIconBadge platform={a.platform} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {a.externalName}
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                      {platformLabel(a.platform)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Metadata
              </h3>
            </div>
            <dl className="p-4 text-xs space-y-1.5">
              <Row k="ID" v={<code className="text-[10px]">{post.id}</code>} />
              <Row k="Source" v={`${post.sourceType}${post.sourceId ? ` · ${post.sourceId}` : ""}`} />
              <Row k="Created" v={formatDate(post.createdAt)} />
              <Row k="Updated" v={formatDate(post.updatedAt)} />
              {post.scheduledAt && <Row k="Scheduled" v={formatDate(post.scheduledAt)} />}
              {post.createdBy && (
                <Row k="Created by" v={post.createdBy.name ?? post.createdBy.email ?? "—"} />
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="font-bold uppercase tracking-wider text-slate-500 w-20 shrink-0">{k}</dt>
      <dd className="text-slate-700 flex-1">{v}</dd>
    </div>
  );
}