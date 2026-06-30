import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updatePricingConfig } from "@/lib/actions/content";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); const fd = await req.formData(); await updatePricingConfig(fd); return NextResponse.json({ ok: true }); }
  catch (e) { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }); }
}
