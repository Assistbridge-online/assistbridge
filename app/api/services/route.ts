import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      include: { discipline: { select: { name: true, slug: true } } },
    });
    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ services: [], error: String(error) }, { status: 500 });
  }
}
