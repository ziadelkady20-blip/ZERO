import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fingerprint, hasSameOrigin, rateLimit, rateLimitedResponse, requestIp } from "@/lib/security";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 8_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const ipLimit = rateLimit(`order-track:ip:${fingerprint(requestIp(request))}`, 12, 10 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitedResponse(ipLimit.retryAfterSeconds);
  let body: { code?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!/^ZERO-[A-F0-9]{8}(?:[A-F0-9]{24})?$/.test(code) || phone.length < 8 || phone.length > 32) {
    return NextResponse.json({ error: "Enter a valid order code and phone number." }, { status: 400 });
  }
  try {
    const detailLimit = rateLimit(`order-track:details:${fingerprint(`${code}:${phone}`)}`, 6, 10 * 60 * 1000);
    if (!detailLimit.allowed) return rateLimitedResponse(detailLimit.retryAfterSeconds);
    const order = await prisma.order.findFirst({
      where: { code, phone },
      select: { code: true, status: true, createdAt: true, subtotal: true, discountAmount: true, couponCode: true, shippingCost: true, total: true, items: { select: { productNameEn: true, productNameAr: true, size: true, color: true, quantity: true } } },
    });
    if (!order) return NextResponse.json({ error: "No order found for those details." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Order tracking is temporarily unavailable." }, { status: 503 });
  }
}
