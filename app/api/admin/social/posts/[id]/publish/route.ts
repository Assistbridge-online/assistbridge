/**
 * POST /api/admin/social/posts/[id]/publish
 *
 * Triggers an immediate publish of a queued post. Returns the dispatch
 * summary (succeeded/failed counts).
 *
 * Also used by the admin "Publish now" button after creating a post.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publishPost } from "@/lib/social/dispatch";
import { requireAdmin } from "@/lib/social/route-helpers";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  const { id } = await ctx.params;

  const post = await prisma.socialPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (post.status === "PUBLISHING") {
    return NextResponse.json({ ok: false, error: "Already publishing" }, { status: 409 });
  }

  const result = await publishPost(id);
  return NextResponse.json({ ok: true, ...result });
}