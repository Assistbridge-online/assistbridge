import { Resend } from "resend";
import { siteConfig } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Default From address.
 *
 * Resolution order:
 *  1. process.env.EMAIL_FROM — explicit override (e.g.
 *     "AssistBridge <support@assistbridge.online>"). This is the value the
 *     Resend dashboard must have a verified sender for, otherwise the API
 *     returns 403.
 *  2. `siteConfig.email` — fallback (uses `info@assistbridge.online` by
 *     default; only used for local dev where Resend isn't configured).
 *
 * If EMAIL_FROM is set but on an unverified Resend domain, sending will
 * fail with `domain is not verified` — that's the same failure we used to
 * see silently. The caller (signUp / etc.) is now responsible for
 * surfacing that failure to the user.
 */
const defaultFrom = process.env.EMAIL_FROM || `AssistBridge <${siteConfig.email}>`;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  // RFC 5322 threading headers. Set these when replying inside an
  // existing email thread so the customer's client groups the message
  // into the same conversation.
  inReplyTo?: string;
  references?: string;
  // Optional custom Resend headers (e.g. X-Entity-Ref-ID)
  headers?: Record<string, string>;
  // Tags attached to the email for filtering in the Resend dashboard.
  tags?: { name: string; value: string }[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  inReplyTo,
  references,
  headers,
  tags,
}: SendEmailParams) {
  const fromAddress = from ?? defaultFrom;
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.log("[email:dev]", {
      to: recipients,
      from: fromAddress,
      subject,
      text: text ?? html,
      inReplyTo,
      references,
    });
    return { id: "dev-mode", success: true as const };
  }

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html,
      text,
      replyTo: replyTo ?? siteConfig.email,
      headers: {
        ...(inReplyTo ? { "In-Reply-To": inReplyTo } : {}),
        ...(references ? { References: references } : {}),
        ...(headers ?? {}),
      },
      tags,
    } as any);

    if (result.error) {
      console.error("[email:error]", {
        from: fromAddress,
        to: recipients,
        subject,
        error: result.error,
      });
      return { id: null, success: false as const, error: result.error };
    }

    console.log("[email:sent]", {
      id: result.data?.id,
      from: fromAddress,
      to: recipients,
      subject,
    });
    return { id: result.data?.id ?? null, success: true as const };
  } catch (error) {
    console.error("[email:exception]", {
      from: fromAddress,
      to: recipients,
      subject,
      error,
    });
    return { id: null, success: false as const, error };
  }
}

export function contactEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;">
      <h2 style="color:#0f172a;margin:0 0 16px;font-size:20px;">New contact form submission</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Name</td><td style="padding:6px 0;">${escapeHtml(params.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(params.email)}">${escapeHtml(params.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Subject</td><td style="padding:6px 0;">${escapeHtml(params.subject)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:white;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;">${escapeHtml(params.message)}</div>
    </div>
  `;
}

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
