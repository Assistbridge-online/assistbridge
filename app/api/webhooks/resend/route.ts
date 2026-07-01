import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[resend:webhook]", body.type, body.data?.email_id ?? body.data?.email ?? "");
  return NextResponse.json({ received: true });
}
