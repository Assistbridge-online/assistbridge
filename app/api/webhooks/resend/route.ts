import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { processInboundEmail, type InboundEvent } from "@/lib/support/inbox";

export const runtime = "nodejs";

/**
 * Resend webhook receiver.
 *
 * Two paths:
 *   - Production: Resend POSTs JSON. We verify the signature using
 *     `svix` (Resend's signature scheme) when RESEND_WEBHOOK_SECRET
 *     is set, then forward to processInboundEmail.
 *
 *   - Dev: if NODE_ENV !== "production" and the secret isn't set,
 *     skip verification so you can curl-test from localhost. The
 *     endpoint still parses and stores the event.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let payload: any;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 },
      );
    }
    try {
      const wh = new Webhook(secret);
      wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.warn("[resend:webhook] signature verify failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Production but no secret configured — refuse to silently accept
    // unsigned events.
    return NextResponse.json(
      { error: "RESEND_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  console.log("[resend:webhook]", payload.type, payload.data?.email_id ?? "");

  if (payload.type === "email.received") {
    try {
      const result = await processInboundEmail(payload as InboundEvent);
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      console.error("[resend:webhook] inbound processing failed", err);
      return NextResponse.json(
        { ok: false, error: (err as Error).message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true, handled: false });
}