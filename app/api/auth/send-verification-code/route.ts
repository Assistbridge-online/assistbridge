import { NextRequest, NextResponse } from "next/server";
import { registerAfterPayment, resendVerificationCode } from "@/lib/actions/checkout";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, email, password } = body;

    if (!sessionId || !email || !name || !password) {
      return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }

    if (body.resend) {
      const result = await resendVerificationCode(email);
      return NextResponse.json(result);
    }

    const result = await registerAfterPayment(sessionId, name, email, password);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api:send-verification-code]", err);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
