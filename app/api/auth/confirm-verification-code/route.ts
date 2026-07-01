import { NextRequest, NextResponse } from "next/server";
import { confirmVerificationCode } from "@/lib/actions/checkout";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, name, password, sessionId } = body;

    if (!email || !code || !name || !password || !sessionId) {
      return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }

    const result = await confirmVerificationCode(email, code, name, password, sessionId);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  } catch (err) {
    console.error("[auth:confirm-verification-code]", err);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
