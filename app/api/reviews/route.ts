import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.customerReview.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: { id: true, imageUrl: true, customerName: true, caption: true },
    });
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ reviews: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
