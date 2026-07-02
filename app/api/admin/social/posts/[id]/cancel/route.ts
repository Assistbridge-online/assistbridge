/**
 * POST /api/admin/social/posts/[id]/cancel
 *
 * Cancels a queued post. Only allowed if status is QUEUED or DRAFT.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
  if (!post) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (post.status !== "QUEUED" && post.status !== "DRAFT") {
    return NextResponse.json(
      { ok: false, error: `Cannot cancel a post with status ${post.status}` },
      { status: 409 },
    );
  }
  await prisma.socialPost.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ ok: true });
}