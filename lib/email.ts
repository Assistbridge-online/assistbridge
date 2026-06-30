import { Resend } from "resend";
import { siteConfig } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailParams) {
  const fromAddress = from ?? `AssistBridge <${siteConfig.email}>`;
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.log("[email:dev]", { to: recipients, subject, text: text ?? html });
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
    });

    if (result.error) {
      console.error("[email:error]", result.error);
      return { id: null, success: false as const, error: result.error };
    }

    return { id: result.data?.id ?? null, success: true as const };
  } catch (error) {
    console.error("[email:exception]", error);
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
