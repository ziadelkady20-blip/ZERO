import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fingerprint, hasSameOrigin, rateLimit, rateLimitedResponse, requestIp } from "@/lib/security";

type IncomingItem = { variantId?: unknown; quantity?: unknown };
type CheckoutBody = { customerName?: unknown; phone?: unknown; email?: unknown; governorate?: unknown; city?: unknown; address?: unknown; notes?: unknown; items?: unknown; paymentMethod?: unknown; couponCode?: unknown };
const text = (v: unknown) => typeof v === "string" ? v.trim() : "";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const ipLimit = rateLimit(`checkout:ip:${fingerprint(requestIp(request))}`, 8, 60 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitedResponse(ipLimit.retryAfterSeconds);

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 32_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  let body: CheckoutBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const customerName = text(body.customerName).slice(0, 120);
  const phone = text(body.phone).slice(0, 32);
  const email = text(body.email).slice(0, 254) || null;
  const governorate = text(body.governorate).slice(0, 100);
  const city = text(body.city).slice(0, 100);
  const address = text(body.address).slice(0, 500);
  const notes = text(body.notes).slice(0, 1000) || null;
  const couponCode = text(body.couponCode).toUpperCase().slice(0, 32) || null;
  if (couponCode && !/^[A-Z0-9_-]{2,32}$/.test(couponCode)) return NextResponse.json({ error: "Promo code format is invalid." }, { status: 400 });
  if (!customerName || phone.length < 8 || !governorate || !city || address.length < 5) {
    return NextResponse.json({ error: "Please complete your name, phone, governorate, city / area, and address." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (body.paymentMethod && body.paymentMethod !== "COD") return NextResponse.json({ error: "Only cash on delivery is available." }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }

  const requested = new Map<string, number>();
  for (const raw of body.items as IncomingItem[]) {
    const variantId = text(raw?.variantId);
    const quantity = Number(raw?.quantity);
    if (!variantId || variantId.length > 100 || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    const totalQuantity = (requested.get(variantId) || 0) + quantity;
    if (totalQuantity > 20) return NextResponse.json({ error: "Maximum quantity per variant is 20." }, { status: 400 });
    requested.set(variantId, totalQuantity);
  }

  try {
    const order = await prisma.$transaction(async tx => {
      const rate = await tx.shippingRate.findFirst({ where: { governorate, city: "*", active: true } })
        ?? await tx.shippingRate.findFirst({ where: { governorate, active: true }, orderBy: { city: "asc" } });
      if (!rate) throw new Error("SHIPPING_UNAVAILABLE");

      const variants = await tx.productVariant.findMany({
        where: { id: { in: [...requested.keys()] }, product: { active: true } },
        include: { product: { include: { category: true } } },
      });
      if (variants.length !== requested.size) throw new Error("ITEM_UNAVAILABLE");

      let subtotal = 0;
      const teePrices: number[] = [];
      const orderItems = variants.map(variant => {
        const quantity = requested.get(variant.id)!;
        if (variant.stock < quantity) throw new Error("INSUFFICIENT_STOCK");
        subtotal += variant.product.price * quantity;
        const category = variant.product.category;
        const isTshirt = category.slug === "training-tees"
          || /t-?shirts?|tees|تيشيرت/i.test(category.nameEn + " " + category.nameAr + " " + variant.product.nameEn + " " + variant.product.nameAr);
        if (isTshirt) for (let i = 0; i < quantity; i++) teePrices.push(variant.product.price);
        return {
          productId: variant.productId,
          variantId: variant.id,
          productNameEn: variant.product.nameEn,
          productNameAr: variant.product.nameAr,
          size: variant.size,
          color: variant.color,
          unitPrice: variant.product.price,
          quantity,
          lineTotal: variant.product.price * quantity,
        };
      });

      teePrices.sort((a, b) => a - b);
      const freeTeeCount = Math.floor(teePrices.length / 3);
      const freeTeeDiscount = teePrices.slice(0, freeTeeCount).reduce((sum, price) => sum + price, 0);
      if (couponCode && freeTeeCount > 0) throw new Error("FREE_TEE_PROMO_CONFLICT");

      let discountAmount = freeTeeDiscount;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (!coupon || !coupon.active) throw new Error("COUPON_INVALID");
        discountAmount += coupon.discountType === "PERCENT"
          ? Math.min(subtotal - discountAmount, Math.round(subtotal * coupon.discountValue / 100))
          : Math.min(subtotal - discountAmount, coupon.discountValue);
      }

      for (const item of orderItems) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }

      const code = "ZERO-" + randomBytes(16).toString("hex").toUpperCase();
      return tx.order.create({
        data: {
          code, customerName, phone, email, governorate, city, address, notes,
          subtotal, discountAmount, couponCode, shippingCost: rate.price, total: subtotal - discountAmount + rate.price, paymentMethod: "COD",
          items: { create: orderItems },
        },
        select: { code: true, subtotal: true, discountAmount: true, couponCode: true, shippingCost: true, total: true, status: true, createdAt: true },
      });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ order }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "FREE_TEE_PROMO_CONFLICT") return NextResponse.json({ error: "The free third T-shirt offer cannot be combined with a promo code. Remove the promo code to continue." }, { status: 422 });
    if (reason === "COUPON_INVALID") return NextResponse.json({ error: "This promo code is invalid or inactive. Remove it and try again." }, { status: 422 });
    if (reason === "SHIPPING_UNAVAILABLE") return NextResponse.json({ error: "Shipping is not configured for this governorate yet." }, { status: 422 });
    if (reason === "ITEM_UNAVAILABLE") return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    if (reason === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "There is not enough stock for one or more selected variants." }, { status: 409 });
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 503 });
  }
}
