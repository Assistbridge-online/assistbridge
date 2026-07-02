/**
 * POST /api/admin/social/posts
 *
 * Creates a SocialPost. Body:
 *   - sourceType, sourceId (optional — for "BLOG_POST" etc.)
 *   - title, body, link?, imageUrl?, hashtags?
 *   - accountIds: string[] — which connected accounts to target
 *   - scheduledAt: ISO string | null — when to publish (null = "send now"
 *     but actually we always set status=QUEUED and let the dispatcher
 *     pick it up; immediate publish goes through /publish endpoint)
 *
 * GET /api/admin/social/posts
 *   - List posts with their accounts + attempt summaries. Supports ?status= filter.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/social/route-helpers";

export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const accountIds = Array.isArray(body.accountIds) ? (body.accountIds as string[]) : [];
  if (accountIds.length === 0) {
    return NextResponse.json({ ok: false, error: "Pick at least one account" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const postBody = String(body.body ?? "").trim();
  if (!title || !postBody) {
    return NextResponse.json(
      { ok: false, error: "Title and body are required" },
      { status: 400 },
    );
  }

  const scheduledAt = body.scheduledAt
    ? new Date(String(body.scheduledAt))
    : null;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid scheduledAt" }, { status: 400 });
  }

  // Verify the accounts exist + are usable.
  const accounts = await prisma.socialAccount.findMany({
    where: { id: { in: accountIds } },
    select: { id: true },
  });
  if (accounts.length !== accountIds.length) {
    return NextResponse.json(
      { ok: false, error: "One or more accountIds are invalid" },
      { status: 400 },
    );
  }

  const post = await prisma.socialPost.create({
    data: {
      sourceType: String(body.sourceType ?? "CUSTOM"),
      sourceId: body.sourceId ? String(body.sourceId) : null,
      title,
      body: postBody,
      link: body.link ? String(body.link) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      hashtags: body.hashtags ? String(body.hashtags) : null,
      scheduledAt,
      status: scheduledAt ? "QUEUED" : "QUEUED", // always QUEUED — /publish endpoint publishes it
      createdById: admin.id,
      accounts: { connect: accountIds.map((id) => ({ id })) },
    },
  });

  return NextResponse.json({ ok: true, postId: post.id });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  const status = req.nextUrl.searchParams.get("status");
  const where = status ? { status: status as never } : {};
  const posts = await prisma.socialPost.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 50,
    include: {
      accounts: { select: { id: true, platform: true, externalName: true, accountLabel: true } },
      attempts: { select: { status: true } },
    },
  });
  return NextResponse.json({ ok: true, posts });
}