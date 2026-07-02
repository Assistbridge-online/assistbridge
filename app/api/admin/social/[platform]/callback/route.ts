/**
 * GET /api/admin/social/[platform]/callback
 *
 * Completes the OAuth flow. The platform redirects here with ?code=&state=
 * We exchange the code, create a SocialAccount, and redirect back to
 * /admin/social/accounts.
 */
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/social/dispatch";
import { getOrigin, parseState, requireAdmin } from "@/lib/social/route-helpers";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ platform: string }> },
) {
  const { platform } = await ctx.params;
  const admin = await requireAdmin();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(`social_oauth_${platform}`)?.value;

  const fail = (msg: string) => {
    const url = new URL("/admin/social/accounts", getOrigin(req));
    url.searchParams.set("error", msg);
    return NextResponse.redirect(url);
  };

  if (!code || !state) return fail("Missing code or state");
  if (!expectedState || expectedState !== state) return fail("State mismatch — possible CSRF");
  const parsed = parseState(state);
  if (!parsed || parsed.platform !== platform || parsed.adminId !== admin.id) {
    return fail("Invalid state payload");
  }

  try {
    const adapter = getAdapter(platform as never);
    const redirectUri = `${getOrigin(req)}/api/admin/social/${platform}/callback`;
    const token = await adapter.exchangeCode(code, redirectUri);
    const expiresAt =
      token.expiresInSeconds && token.expiresInSeconds > 0
        ? new Date(Date.now() + token.expiresInSeconds * 1000)
        : null;

    await prisma.socialAccount.upsert({
      where: {
        platform_externalId: { platform: platform as never, externalId: token.externalId },
      },
      update: {
        accountLabel: token.externalName,
        externalName: token.externalName,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? null,
        tokenExpiresAt: expiresAt,
        scopes: token.scopes.join(" "),
        connectedById: admin.id,
      },
      create: {
        platform: platform as never,
        accountLabel: token.externalName,
        externalId: token.externalId,
        externalName: token.externalName,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? null,
        tokenExpiresAt: expiresAt,
        scopes: token.scopes.join(" "),
        connectedById: admin.id,
      },
    });

    const url = new URL("/admin/social/accounts", getOrigin(req));
    url.searchParams.set("connected", platform);
    const res = NextResponse.redirect(url);
    res.cookies.delete(`social_oauth_${platform}`);
    return res;
  } catch (e) {
    console.error(`[social] callback failed for ${platform}:`, e);
    return fail(
      `Failed to connect ${platform}: ${(e as Error).message ?? String(e)}`,
    );
  }
}