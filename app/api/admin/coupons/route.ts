import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const normalizeCode = (value: unknown) => typeof value === "string" ? value.trim().toUpperCase() : "";
const validCode = (value: string) => /^[A-Z0-9_-]{2,32}$/.test(value);

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load promo codes. Check database setup." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: { code?: unknown; discountType?: unknown; discountValue?: unknown; active?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const code = normalizeCode(body.code);
  const discountType = body.discountType === "FIXED" ? "FIXED" : body.discountType === "PERCENT" ? "PERCENT" : "";
  const discountValue = Number(body.discountValue);
  if (!validCode(code) || !discountType || !Number.isInteger(discountValue) || discountValue < 1 || (discountType === "PERCENT" && discountValue > 100)) {
    return NextResponse.json({ error: "Enter a code (2–32 letters/numbers) and a valid discount. Percentage must be 1–100; fixed discount must be a positive whole EGP amount." }, { status: 400 });
  }
  try {
    const coupon = await prisma.coupon.create({ data: { code, discountType, discountValue, active: body.active !== false } });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That promo code already exists, or could not be saved." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: { id?: unknown; code?: unknown; discountType?: unknown; discountValue?: unknown; active?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "Promo code id is required." }, { status: 400 });
  const data: { code?: string; discountType?: string; discountValue?: number; active?: boolean } = {};
  if (body.code !== undefined) {
    const code = normalizeCode(body.code);
    if (!validCode(code)) return NextResponse.json({ error: "Code must contain 2–32 letters, numbers, hyphens or underscores." }, { status: 400 });
    data.code = code;
  }
  if (body.discountType !== undefined) {
    if (body.discountType !== "PERCENT" && body.discountType !== "FIXED") return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
    data.discountType = body.discountType;
  }
  if (body.discountValue !== undefined) {
    const value = Number(body.discountValue);
    const type = body.discountType === "FIXED" || body.discountType === "PERCENT" ? body.discountType : undefined;
    if (!Number.isInteger(value) || value < 1 || (type === "PERCENT" && value > 100)) return NextResponse.json({ error: "Invalid discount value." }, { status: 400 });
    data.discountValue = value;
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (!Object.keys(data).length) return NextResponse.json({ error: "No changes supplied." }, { status: 400 });
  try {
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Could not update promo code. The code may already exist." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: { id?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "Promo code id is required." }, { status: 400 });
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete this promo code." }, { status: 404 });
  }
}
