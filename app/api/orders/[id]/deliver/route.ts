import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const deliverSchema = z.object({ note: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deliverSchema.parse(await req.json().catch(() => ({})));
  const order = await prisma.order.update({
    where: { id },
    data: { status: "DELIVERED" },
  });
  return NextResponse.json({ order });
}
