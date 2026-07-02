import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/dev/test-email
 *
 * Dev / staging-only endpoint to fire a test email end-to-end through
 * Resend so you can confirm the sender domain is verified and the API
 * key is working from this exact environment.
 *
 * Body: { "to": "you@example.com", "subject"?: "...", "text"?: "..." }
 *
 * Guarded by `ENABLE_DEV_ENDPOINTS=1` env var. Returns 404 in production
 * otherwise — never expose this on the public internet.
 *
 * Example:
 *   curl -X POST https://assistbridge.online/api/dev/test-email \
 *     -H "Content-Type: application/json" \
 *     -d '{"to":"patywafula2019@gmail.com"}'
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_DEV_ENDPOINTS !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const to = String(body?.to ?? "").trim();
  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Provide { to: '<email>' } in the JSON body" },
      { status: 400 }
    );
  }

  const subject = String(
    body?.subject ?? "AssistBridge email test"
  );
  const text = String(
    body?.text ??
      "If you're reading this, Resend is wired up correctly for " +
        "support@assistbridge.online. Timestamp: " +
        new Date().toISOString()
  );
  const html = `<p>${text.replace(/\n/g, "<br>")}</p>`;

  const result = await sendEmail({ to, subject, text, html });

  return NextResponse.json(
    {
      success: result.success,
      id: result.id,
      from: process.env.EMAIL_FROM ?? null,
      to,
      subject,
      error: result.success ? undefined : (result.error as unknown),
    },
    { status: result.success ? 200 : 500 }
  );
}
