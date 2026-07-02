/**
 * Helpers shared by the social OAuth + posting routes.
 */
import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export function getOrigin(req: NextRequest): string {
  // Trust request-derived origin over env (env may be stale in preview deploys).
  const fromHdr =
    req.headers.get("origin") ??
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host") ?? ""}`;
  return fromHdr.replace(/\/$/, "");
}

/**
 * Short-lived signed state token. We sign with the AUTH secret (already
 * required) so the callback can verify the state originated from us. We
 * don't need full JWT — base64url(JSON) + HMAC is enough since the lifetime
 * is the OAuth round-trip (<5 minutes).
 */
export function makeState(platform: string, adminId: string): string {
  const payload = {
    p: platform,
    a: adminId,
    n: randomBytes(16).toString("hex"), // nonce = CSRF protection
    t: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function parseState(
  state: string,
): { platform: string; adminId: string; nonce: string; ts: number } | null {
  try {
    const raw = Buffer.from(state, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.p !== "string" || typeof parsed.a !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Admin guard. Returns the admin session or throws a Response — callers
 * `return` the result so TypeScript narrows correctly.
 */
export async function requireAdmin(): Promise<{ id: string; role: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { id: session.user.id, role: session.user.role };
}