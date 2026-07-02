/**
 * Stream an attachment's bytes through our server so the admin's
 * browser can preview / download without ever seeing the Resend
 * API key.
 *
 *   GET /api/admin/support/attachments/[id]
 *
 * Caches the bytes in-memory for the lifetime of the Lambda / route
 * handler — small enough for typical support attachments; revisit if
 * we start receiving 50MB CAD files.
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const cache = new Map<string, { bytes: Buffer; contentType: string; filename: string }>();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const att = await prisma.supportAttachment.findUnique({
    where: { id: params.id },
  });
  if (!att) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cached = cache.get(att.id);
  if (cached) {
    return new NextResponse(new Uint8Array(cached.bytes), {
      headers: buildHeaders(cached),
    });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const resp: any = await (resend as any).emails
      .get?.(att.ticketId)
      ?.catch?.(() => null);

    // The Resend SDK's "list received email attachments" returns the
    // raw bytes when called with `{ attachmentId }`. Fall back to
    // fetching via fetch() against the public REST endpoint if the
    // SDK surface differs.
    let bytes: Buffer | null = null;
    if (resp?.data && resp.data instanceof Uint8Array) {
      bytes = Buffer.from(resp.data);
    } else if (resp?.data && Buffer.isBuffer(resp.data)) {
      bytes = resp.data;
    } else {
      // SDK surface varies — fetch via REST.
      const url = `https://api.resend.com/emails/${att.ticketId}/attachments/${att.resendAttachmentId}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!r.ok) {
        return NextResponse.json(
          { error: `Resend fetch failed: ${r.status}` },
          { status: 502 },
        );
      }
      const ab = await r.arrayBuffer();
      bytes = Buffer.from(ab);
    }

    cache.set(att.id, {
      bytes,
      contentType: att.contentType,
      filename: att.filename,
    });

    return new NextResponse(new Uint8Array(bytes), {
      headers: buildHeaders({ bytes, contentType: att.contentType, filename: att.filename }),
    });
  } catch (err) {
    console.error("[support:attachment] fetch failed", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

function buildHeaders(c: { bytes: Buffer; contentType: string; filename: string }) {
  const safeName = c.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return {
    "Content-Type": c.contentType || "application/octet-stream",
    "Content-Length": String(c.bytes.length),
    "Content-Disposition": `inline; filename="${safeName}"`,
    "Cache-Control": "private, max-age=300",
  };
}