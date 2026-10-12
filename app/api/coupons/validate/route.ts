import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fingerprint, hasSameOrigin, rateLimit, rateLimitedResponse, requestIp } from "@/lib/security";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const limit = rateLimit(`coupon-check:ip:${fingerprint(requestIp(request))}`, 30, 60 * 60 * 1000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSeconds);
  let body: { code?: unknown; subtotal?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const subtotal = Number(body.subtotal);
  if (!/^[A-Z0-9_-]{2,32}$/.test(code) || !Number.isInteger(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Enter a valid promo code." }, { status: 400 });
  }
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.active) return NextResponse.json({ error: "This promo code is invalid or inactive." }, { status: 404 });
    const discountAmount = coupon.discountType === "PERCENT"
      ? Math.min(subtotal, Math.round(subtotal * coupon.discountValue / 100))
      : Math.min(subtotal, coupon.discountValue);
    if (subtotal <= 0) return NextResponse.json({ error: "Add products to your bag before applying a promo code." }, { status: 400 });
    return NextResponse.json({
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discountAmount,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not validate the promo code right now." }, { status: 503 });
  }
}
