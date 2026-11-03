import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fingerprint, hasSameOrigin, rateLimit, rateLimitedResponse, requestIp } from "@/lib/security";

type IncomingItem = { variantId?: unknown; quantity?: unknown; bundleId?: unknown; components?: unknown };
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

  const incomingItems = body.items as IncomingItem[];
  const requested = new Map<string, number>();
  const bundleRequests: { bundleId: string; quantity: number; components: { variantId: string; quantity: number }[] }[] = [];
  const normalItems: { variantId: string; quantity: number }[] = [];
  for (const raw of incomingItems) {
    const bundleId = text(raw?.bundleId);
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    if (bundleId) {
      if (!Array.isArray(raw.components) || raw.components.length === 0 || raw.components.length > 20) return NextResponse.json({ error: "Bundle contents are invalid." }, { status: 400 });
      const components = raw.components.map((entry: unknown) => {
        const value = entry as { variantId?: unknown; quantity?: unknown };
        return { variantId: text(value?.variantId), quantity: Number(value?.quantity) };
      });
      if (components.some(item => !item.variantId || item.variantId.length > 100 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) return NextResponse.json({ error: "Bundle contents are invalid." }, { status: 400 });
      bundleRequests.push({ bundleId, quantity, components });
      for (const component of components) requested.set(component.variantId, (requested.get(component.variantId) || 0) + component.quantity * quantity);
    } else {
      const variantId = text(raw?.variantId);
      if (!variantId || variantId.length > 100) return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
      normalItems.push({ variantId, quantity });
      requested.set(variantId, (requested.get(variantId) || 0) + quantity);
    }
  }
  if ([...requested.values()].some(quantity => quantity > 20)) return NextResponse.json({ error: "Maximum quantity per variant is 20." }, { status: 400 });

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

      const variantById = new Map(variants.map(variant => [variant.id, variant]));
      const bundleIds = [...new Set(bundleRequests.map(item => item.bundleId))];
      const bundles = bundleIds.length ? await tx.bundle.findMany({ where: { id: { in: bundleIds }, active: true }, include: { items: true } }) : [];
      if (bundles.length !== bundleIds.length) throw new Error("BUNDLE_UNAVAILABLE");
      const bundleById = new Map(bundles.map(bundle => [bundle.id, bundle]));
      let subtotal = 0;
      let percentageDiscount = 0;
      const buy2Get1Prices: number[] = [];
      const orderItems: { productId: string | null; variantId: string | null; bundleId: string | null; productNameEn: string; productNameAr: string; size: string; color: string; unitPrice: number; quantity: number; lineTotal: number; components?: { productId: string; variantId: string; quantity: number }[] }[] = [];
      for (const item of normalItems) {
        const variant = variantById.get(item.variantId)!;
        const lineTotal = variant.product.price * item.quantity;
        subtotal += lineTotal;
        if (variant.product.promotionType === "PERCENT" && variant.product.promotionValue > 0) percentageDiscount += Math.round(variant.product.price * variant.product.promotionValue / 100) * item.quantity;
        if (variant.product.promotionType === "BUY2GET1") for (let i = 0; i < item.quantity; i++) buy2Get1Prices.push(variant.product.price);
        orderItems.push({ productId: variant.productId, variantId: variant.id, bundleId: null, productNameEn: variant.product.nameEn, productNameAr: variant.product.nameAr, size: variant.size, color: variant.color, unitPrice: variant.product.price, quantity: item.quantity, lineTotal });
      }
      for (const item of bundleRequests) {
        const bundle = bundleById.get(item.bundleId)!;
        const expected = new Map(bundle.items.map(entry => [entry.productId, entry.quantity]));
        const actual = new Map<string, number>();
        const components: { productId: string; variantId: string; quantity: number }[] = [];
        for (const component of item.components) {
          const variant = variantById.get(component.variantId);
          if (!variant) throw new Error("ITEM_UNAVAILABLE");
          actual.set(variant.productId, (actual.get(variant.productId) || 0) + component.quantity);
          components.push({ productId: variant.productId, variantId: variant.id, quantity: component.quantity * item.quantity });
        }
        if (actual.size !== expected.size || [...expected].some(([productId, quantity]) => actual.get(productId) !== quantity)) throw new Error("BUNDLE_ITEMS_MISMATCH");
        const lineTotal = bundle.totalPrice * item.quantity;
        subtotal += lineTotal;
        orderItems.push({ productId: null, variantId: null, bundleId: bundle.id, productNameEn: bundle.titleEn, productNameAr: bundle.titleAr || bundle.titleEn, size: "", color: "", unitPrice: bundle.totalPrice, quantity: item.quantity, lineTotal, components });
      }
      for(const [variantId,quantity] of requested){
        const variant=variantById.get(variantId)!;
        if(variant.stock<quantity)throw new Error("INSUFFICIENT_STOCK");
      }

      buy2Get1Prices.sort((a, b) => a - b);
      const freeItemCount = Math.floor(buy2Get1Prices.length / 3);
      const buy2Get1Discount = buy2Get1Prices.slice(0, freeItemCount).reduce((sum, price) => sum + price, 0);
      const automaticDiscount = percentageDiscount + buy2Get1Discount;
      if (couponCode && automaticDiscount + bundleDiscount > 0) throw new Error("AUTO_PROMO_CONFLICT");

      let discountAmount = automaticDiscount + bundleDiscount;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (!coupon || !coupon.active) throw new Error("COUPON_INVALID");
        discountAmount += coupon.discountType === "PERCENT"
          ? Math.min(subtotal - discountAmount, Math.round((subtotal - discountAmount) * coupon.discountValue / 100))
          : Math.min(subtotal - discountAmount, coupon.discountValue);
      }

      for (const [variantId, quantity] of requested) {
        const updated = await tx.productVariant.updateMany({ where: { id: variantId, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }

      const code = "ZERO-" + randomBytes(16).toString("hex").toUpperCase();
      return tx.order.create({
        data: {
          code, customerName, phone, email, governorate, city, address, notes,
          subtotal, discountAmount, couponCode, shippingCost: rate.price, total: subtotal - discountAmount + rate.price, paymentMethod: "COD",
          items: { create: orderItems.map(({ components, ...item }) => ({ ...item, ...(components ? { components: { create: components } } : {}) })) },
        },
        select: { code: true, subtotal: true, discountAmount: true, couponCode: true, shippingCost: true, total: true, status: true, createdAt: true },
      });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ order }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "BUNDLE_UNAVAILABLE") return NextResponse.json({ error: "One of the selected bundles is no longer available." }, { status: 409 });
    if (reason === "BUNDLE_ITEMS_MISMATCH") return NextResponse.json({ error: "The selected products do not match this bundle." }, { status: 422 });
    if (reason === "BUNDLE_PRICE_INVALID") return NextResponse.json({ error: "The bundle price is higher than its included products. Please contact the store." }, { status: 422 });
    if (reason === "AUTO_PROMO_CONFLICT") return NextResponse.json({ error: "Automatic product offers cannot be combined with a promo code. Remove the promo code to continue." }, { status: 422 });
    if (reason === "COUPON_INVALID") return NextResponse.json({ error: "This promo code is invalid or inactive. Remove it and try again." }, { status: 422 });
    if (reason === "SHIPPING_UNAVAILABLE") return NextResponse.json({ error: "Shipping is not configured for this governorate yet." }, { status: 422 });
    if (reason === "ITEM_UNAVAILABLE") return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    if (reason === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "There is not enough stock for one or more selected variants." }, { status: 409 });
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 503 });
  }
}
