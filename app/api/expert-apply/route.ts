import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { sendEmail, escapeHtml } from "@/lib/email";

export const runtime = "nodejs";

const expertApplySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  expertise: z.string().trim().min(2).max(200),
  bio: z.string().trim().min(40).max(4000),
  hourlyRate: z.coerce.number().min(1).max(2000).optional(),
  currency: z.string().trim().min(3).max(3).default("USD"),
  cvUrl: z.string().url().optional().or(z.literal("")),
  sampleWorkUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = expertApplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const application = await prisma.expertApplication.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        expertise: data.expertise,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        currency: data.currency.toUpperCase(),
        cvUrl: data.cvUrl || null,
        sampleWorkUrl: data.sampleWorkUrl || null,
        status: "PENDING",
      },
    });

    const html = `
      <h2 style="margin:0 0 16px;color:#0f172a;">New expert application</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Name</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Email</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:6px 0;color:#475569;font-weight:600;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Expertise</td><td>${escapeHtml(data.expertise)}</td></tr>
        ${data.hourlyRate ? `<tr><td style="padding:6px 0;color:#475569;font-weight:600;">Rate</td><td>${escapeHtml(String(data.hourlyRate))} ${escapeHtml(data.currency)} / hr</td></tr>` : ""}
        ${data.cvUrl ? `<tr><td style="padding:6px 0;color:#475569;font-weight:600;">CV</td><td><a href="${escapeHtml(data.cvUrl)}">${escapeHtml(data.cvUrl)}</a></td></tr>` : ""}
        ${data.sampleWorkUrl ? `<tr><td style="padding:6px 0;color:#475569;font-weight:600;">Sample</td><td><a href="${escapeHtml(data.sampleWorkUrl)}">${escapeHtml(data.sampleWorkUrl)}</a></td></tr>` : ""}
      </table>
      <div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;">${escapeHtml(data.bio)}</div>
      <p style="margin-top:24px;color:#64748b;font-size:13px;">Application ID: ${application.id}</p>
    `;

    await sendEmail({
      to: siteConfig.email,
      subject: `[Expert Application] ${data.name} - ${data.expertise}`,
      html,
      text: `New expert application from ${data.name} (${data.email}) - ${data.expertise}\n\n${data.bio}`,
      replyTo: data.email,
    });

    await sendEmail({
      to: data.email,
      subject: "We received your AssistBridge expert application",
      html: `<p>Hi ${escapeHtml(data.name)},</p><p>Thanks for applying to join the AssistBridge expert network. Our team will review your profile and get back to you within 3–5 business days.</p><p>The AssistBridge Team</p>`,
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error("[api/expert-apply]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
