import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(180),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalized = email.toLowerCase();

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized, source: "footer" },
      update: { unsubscribedAt: null },
    });

    return NextResponse.json({ success: true, email: subscriber.email });
  } catch (error) {
    console.error("[api/newsletter]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
