import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ADAPTERS } from "@/lib/social/dispatch";
import { PlatformIconBadge, platformLabel } from "@/components/social/social-ui";
import { DisconnectButton } from "@/components/social/disconnect-button";
import { Plus, ExternalLink, AlertTriangle } from "lucide-react";
import type { SocialPlatform } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Social · Accounts" };

const PLATFORMS: SocialPlatform[] = ["FACEBOOK", "INSTAGRAM", "LINKEDIN"];

export default async function SocialAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/social/accounts");

  const params = await searchParams;
  const justConnected = typeof params.connected === "string" ? params.connected : null;
  const errorMsg = typeof params.error === "string" ? params.error : null;

  const accounts = await prisma.socialAccount.findMany({
    orderBy: [{ platform: "asc" }, { createdAt: "desc" }],
  });
  const byPlatform = new Map<SocialPlatform, typeof accounts>();
  for (const a of accounts) {
    const list = byPlatform.get(a.platform) ?? [];
    list.push(a);
    byPlatform.set(a.platform, list);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
          Connected accounts
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Connect your Facebook Page, Instagram Business account, and LinkedIn profile so the
          composer can publish to them.
        </p>
      </div>

      {(justConnected || errorMsg) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            errorMsg
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {errorMsg ?? `Successfully connected ${platformLabel(justConnected as SocialPlatform)}.`}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const adapter = ADAPTERS[p];
          const list = byPlatform.get(p) ?? [];
          const configured = adapter.isConfigured();
          return (
            <div
              key={p}
              className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                <PlatformIconBadge platform={p} size={36} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{adapter.displayName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {list.length} connected
                  </p>
                </div>
              </div>

              {!configured && (
                <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div>
                    Not configured. Set the env vars for this platform on Vercel
                    (Project → Settings → Environment Variables) to enable
                    connection.
                  </div>
                </div>
              )}

              <div className="p-3">
                {list.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 text-center">
                    No accounts connected.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {list.map((a) => (
                      <li key={a.id} className="py-2.5 flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {a.externalName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Connected {formatDate(a.createdAt)}
                            {a.tokenExpiresAt && (
                              <> · token expires {formatDate(a.tokenExpiresAt)}</>
                            )}
                          </div>
                        </div>
                        <DisconnectButton accountId={a.id} label={a.externalName} />
                      </li>
                    ))}
                  </ul>
                )}

                {configured && (
                  <Link
                    href={`/api/admin/social/${p.toLowerCase()}/connect`}
                    className="mt-3 inline-flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Connect {platformLabel(p)}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5 text-sm text-slate-600 space-y-2">
        <p className="font-semibold text-slate-900">Setup notes</p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>
            <strong>Facebook</strong> — create a Meta App at{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 inline-flex items-center gap-1"
            >
              developers.facebook.com <ExternalLink className="h-3 w-3" />
            </a>
            . Add the "Facebook Login for Business" product. Set the redirect URI to{" "}
            <code className="bg-slate-100 px-1 rounded">
              https://your-domain/api/admin/social/facebook/callback
            </code>
            . Copy the App ID + App Secret into Vercel env vars{" "}
            <code className="bg-slate-100 px-1 rounded">FACEBOOK_APP_ID</code> and{" "}
            <code className="bg-slate-100 px-1 rounded">FACEBOOK_APP_SECRET</code>.
          </li>
          <li>
            <strong>Instagram</strong> — uses the same Meta App, but the linked Instagram account
            must be a <em>Business</em> or <em>Creator</em> account connected to one of your
            Facebook Pages (do this in the Instagram app → Settings → Account → Linked Accounts).
          </li>
          <li>
            <strong>LinkedIn</strong> — create an app at{" "}
            <a
              href="https://www.linkedin.com/developers/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 inline-flex items-center gap-1"
            >
              linkedin.com/developers <ExternalLink className="h-3 w-3" />
            </a>
            . Request <code className="bg-slate-100 px-1 rounded">w_member_social</code> scope
            (instant) — company page posting needs{" "}
            <code className="bg-slate-100 px-1 rounded">w_organization_social</code> which
            requires LinkedIn approval (1-2 weeks).
          </li>
        </ul>
      </div>
    </div>
  );
}