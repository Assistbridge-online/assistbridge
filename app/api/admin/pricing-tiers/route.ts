import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { upsertPricingTier, deletePricingTier } from "@/lib/actions/content";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const fd = await req.formData();
    await upsertPricingTier(fd);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    await deletePricingTier(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
