import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { sendEmail, escapeHtml } from "@/lib/email";

export const runtime = "nodejs";

const quoteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  projectType: z.string().trim().min(2).max(120),
  scope: z.string().trim().min(20).max(5000),
  budget: z.string().trim().min(1).max(80),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const request = await prisma.quoteRequest.create({
      data: {
        name: data.name,
        email: data.email,
        projectType: data.projectType,
        scope: data.scope,
        budget: data.budget,
      },
    });

    const html = `
      <h2 style="margin:0 0 16px;color:#0f172a;">New custom quote request</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Name</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Email</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Project type</td><td>${escapeHtml(data.projectType)}</td></tr>
        <tr><td style="padding:6px 0;color:#475569;font-weight:600;">Budget</td><td>${escapeHtml(data.budget)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;">${escapeHtml(data.scope)}</div>
      <p style="margin-top:24px;color:#64748b;font-size:13px;">Request ID: ${request.id}</p>
    `;

    await sendEmail({
      to: siteConfig.email,
      subject: `[Quote Request] ${data.projectType} - ${data.name}`,
      html,
      text: `Quote request from ${data.name} (${data.email})\nType: ${data.projectType}\nBudget: ${data.budget}\n\n${data.scope}`,
      replyTo: data.email,
    });

    await sendEmail({
      to: data.email,
      subject: "We received your custom quote request",
      html: `<p>Hi ${escapeHtml(data.name)},</p><p>Your custom project request has been received. An AssistBridge specialist will review the scope and follow up with a tailored quote within 1 business day.</p><p>The AssistBridge Team</p>`,
    });

    return NextResponse.json({ success: true, id: request.id });
  } catch (error) {
    console.error("[api/quote-request]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
