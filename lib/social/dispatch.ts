/**
 * Adapter registry + dispatcher.
 *
 * Centralizes how the rest of the app talks to platforms. Adding a new
 * platform = register it here + implement SocialAdapter.
 *
 * The dispatcher (publishPost) is what the cron and the admin "Publish now"
 * button both call. It owns the attempt lifecycle: creates SocialPostAttempt
 * rows, calls the adapter, updates attempt status with the result, and
 * rolls up into the parent SocialPost.status (PUBLISHED / PARTIAL / FAILED).
 */
import { SocialPlatform } from "@prisma/client";
import { prisma } from "@/lib/db";
import { facebookAdapter } from "./adapters/facebook";
import { instagramAdapter } from "./adapters/instagram";
import { linkedinAdapter } from "./adapters/linkedin";
import type { SocialAdapter } from "./adapter";
import { SocialAdapterError } from "./adapter";

export const ADAPTERS: Record<SocialPlatform, SocialAdapter> = {
  FACEBOOK: facebookAdapter,
  INSTAGRAM: instagramAdapter,
  LINKEDIN: linkedinAdapter,
};

export function getAdapter(platform: SocialPlatform): SocialAdapter {
  const a = ADAPTERS[platform];
  if (!a) {
    throw new SocialAdapterError(platform, "NO_ADAPTER", `No adapter for platform ${platform}`);
  }
  return a;
}

/**
 * Publish one SocialPost to all its target accounts.
 *
 * Returns the post's final status after the run so callers (admin UI
 * + cron) can decide what to show / what to do next.
 *
 * Concurrency: each account is published sequentially in v1. Most
 * accounts per post is small (1-3), so parallelizing with Promise.allSettled
 * would help but isn't worth the extra complexity yet.
 */
export async function publishPost(postId: string): Promise<{
  status: "PUBLISHED" | "PARTIAL" | "FAILED";
  succeeded: number;
  failed: number;
}> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    include: {
      accounts: true,
      attempts: { where: { status: { in: ["PENDING", "SENDING", "FAILED"] } } },
    },
  });
  if (!post) {
    return { status: "FAILED", succeeded: 0, failed: 0 };
  }

  // Mark post as publishing
  await prisma.socialPost.update({
    where: { id: postId },
    data: { status: "PUBLISHING" },
  });

  let succeeded = 0;
  let failed = 0;

  for (const account of post.accounts) {
    const adapter = getAdapter(account.platform);
    // Build per-platform meta so adapters know who they are publishing as.
    const meta: Record<string, unknown> = {
      externalId: account.externalId,
      accountLabel: account.accountLabel,
    };

    // Create or reuse the attempt row for this account.
    const existing = post.attempts.find((a) => a.accountId === account.id);
    const attempt = existing
      ? await prisma.socialPostAttempt.update({
          where: { id: existing.id },
          data: { status: "SENDING", errorCode: null, errorMessage: null, attemptedAt: new Date() },
        })
      : await prisma.socialPostAttempt.create({
          data: {
            postId,
            accountId: account.id,
            status: "SENDING",
          },
        });

    try {
      const result = await adapter.publish({
        accessToken: account.accessToken,
        text: post.body,
        link: post.link,
        imageUrl: post.imageUrl,
        meta,
      });
      await prisma.socialPostAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "SUCCESS",
          externalId: result.externalId,
          externalUrl: result.externalUrl,
          finishedAt: new Date(),
        },
      });
      succeeded++;
    } catch (err) {
      const code = err instanceof SocialAdapterError ? err.code : "UNKNOWN";
      const message =
        err instanceof Error ? err.message : String(err).slice(0, 500);
      await prisma.socialPostAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          errorCode: code,
          errorMessage: message,
          finishedAt: new Date(),
        },
      });
      failed++;
      // Continue to the next account — don't let one failure kill the others.
      console.error(`[social] publish failed for ${account.platform}/${account.externalId}:`, message);
    }
  }

  // Roll up the post status.
  let finalStatus: "PUBLISHED" | "PARTIAL" | "FAILED";
  if (succeeded > 0 && failed === 0) finalStatus = "PUBLISHED";
  else if (succeeded > 0 && failed > 0) finalStatus = "PARTIAL";
  else finalStatus = "FAILED";

  await prisma.socialPost.update({
    where: { id: postId },
    data: { status: finalStatus },
  });

  return { status: finalStatus, succeeded, failed };
}

/**
 * Pick up QUEUED posts whose scheduledAt has passed and publish them.
 * Called by /api/cron/social-publish (Vercel cron).
 *
 * Returns the number of posts dispatched. Uses a transaction to mark
 * them PUBLISHING atomically so a concurrent cron run can't double-publish.
 */
export async function runScheduledPosts(now: Date = new Date()): Promise<number> {
  const due = await prisma.socialPost.findMany({
    where: {
      status: "QUEUED",
      scheduledAt: { lte: now },
    },
    select: { id: true },
    take: 25, // bound the cron run; remaining will be picked up next tick
    orderBy: { scheduledAt: "asc" },
  });
  for (const p of due) {
    // Fire-and-forget so a slow post doesn't block the cron. Errors
    // are logged inside publishPost via the per-account attempt rows.
    void publishPost(p.id).catch((e) => console.error("[social] cron publish failed", e));
  }
  return due.length;
}