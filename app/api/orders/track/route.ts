import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: { code?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!/^ZERO-[A-F0-9]{8}$/.test(code) || phone.length < 8) {
    return NextResponse.json({ error: "Enter a valid order code and phone number." }, { status: 400 });
  }
  try {
    const order = await prisma.order.findFirst({
      where: { code, phone },
      select: { code: true, status: true, createdAt: true, total: true, items: { select: { productNameEn: true, productNameAr: true, size: true, color: true, quantity: true } } },
    });
    if (!order) return NextResponse.json({ error: "No order found for those details." }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Order tracking is temporarily unavailable." }, { status: 503 });
  }
}
