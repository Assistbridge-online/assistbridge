/**
 * GET /api/admin/social/[platform]/connect
 *
 * Kicks off the OAuth flow for a platform:
 *   - Requires admin role.
 *   - Issues a redirect to the platform's authorize URL with our state
 *     token (so the callback can verify the round-trip).
 *
 * Path params: platform in {facebook, instagram, linkedin}.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/social/dispatch";
import { getOrigin, makeState, requireAdmin } from "@/lib/social/route-helpers";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ platform: string }> },
) {
  const { platform } = await ctx.params;
  try {
    const admin = await requireAdmin();
    const adapter = getAdapter(platform as never);
    if (!adapter.isConfigured()) {
      const url = new URL("/admin/social/accounts", getOrigin(req));
      url.searchParams.set("error", `Platform ${platform} is not configured (missing env vars)`);
      return NextResponse.redirect(url);
    }
    const state = makeState(platform, admin.id);
    const redirectUri = `${getOrigin(req)}/api/admin/social/${platform}/callback`;
    const authorizeUrl = adapter.getAuthorizeUrl({ state, redirectUri });
    const res = NextResponse.redirect(authorizeUrl);
    // Persist state in a short-lived cookie so the callback can verify it
    // even if the platform strips query params.
    res.cookies.set(`social_oauth_${platform}`, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(`[social] connect failed for ${platform}:`, e);
    const url = new URL("/admin/social/accounts", getOrigin(req));
    url.searchParams.set("error", String((e as Error).message ?? e));
    return NextResponse.redirect(url);
  }
}