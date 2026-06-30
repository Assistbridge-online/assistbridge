import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const messageSchema = z.object({ body: z.string().min(1) });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const messages = await prisma.message.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
    include: { fromUser: { select: { id: true, name: true, image: true } } },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const json = await req.json();
  const { body } = messageSchema.parse(json);
  const message = await prisma.message.create({
    data: { orderId: id, fromUserId: session.user.id, body },
  });
  return NextResponse.json({ message });
}
