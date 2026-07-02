/**
 * DELETE /api/admin/social/accounts/[id]
 *
 * Disconnects a SocialAccount. We delete it outright rather than
 * "disabling" — re-connecting is one click away, and dangling rows
 * with possibly-stale tokens are a security risk.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/social/route-helpers";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.socialAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}