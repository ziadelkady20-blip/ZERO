import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({
      where: { active: true },
      select: { governorate: true, city: true, price: true },
      orderBy: [{ governorate: "asc" }, { city: "asc" }],
    });
    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json({ error: "Shipping rates are not configured yet." }, { status: 503 });
  }
}
