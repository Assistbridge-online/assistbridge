import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const metadataSchema = z.object({
  orderId: z.string().optional().nullable(),
  messageId: z.string().optional().nullable(),
});

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/json",
]);

const MAX_SIZE = 200 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "Empty file" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large (max 200 MB)" },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    const meta = metadataSchema.safeParse({
      orderId: form.get("orderId") ?? null,
      messageId: form.get("messageId") ?? null,
    });
    if (!meta.success) {
      return NextResponse.json({ success: false, error: "Invalid metadata" }, { status: 400 });
    }

    const fakeId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const url = `https://uploads.assistbridge.online/stub/${fakeId}-${safeName}`;

    const attachment = await prisma.attachment.create({
      data: {
        ownerId: session.user.id,
        url,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        orderId: meta.data.orderId || null,
        messageId: meta.data.messageId || null,
      },
    });

    return NextResponse.json({
      success: true,
      attachment: {
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
      },
    });
  } catch (error) {
    console.error("[api/upload]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
