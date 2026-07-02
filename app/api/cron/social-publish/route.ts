/**
 * GET /api/cron/social-publish
 *
 * Vercel cron entry — runs every minute, finds SocialPosts whose
 * scheduledAt has passed and status=QUEUED, and dispatches them.
 *
 * Auth: requires the `Authorization: Bearer ${CRON_SECRET}` header. Vercel
 * Cron is configured to send this automatically when CRON_SECRET is set
 * in the project's environment.
 */
import { NextRequest, NextResponse } from "next/server";
import { runScheduledPosts } from "@/lib/social/dispatch";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }
  const dispatched = await runScheduledPosts();
  return NextResponse.json({ ok: true, dispatched });
}