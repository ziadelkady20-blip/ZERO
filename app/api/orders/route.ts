import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type IncomingItem = { variantId?: unknown; quantity?: unknown };
type CheckoutBody = {
  customerName?: unknown;
  phone?: unknown;
  email?: unknown;
  governorate?: unknown;
  city?: unknown;
  address?: unknown;
  notes?: unknown;
  items?: unknown;
  paymentMethod?: unknown;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const customerName = text(body.customerName);
  const phone = text(body.phone);
  const email = text(body.email) || null;
  const governorate = text(body.governorate);
  const city = text(body.city);
  const address = text(body.address);
  const notes = text(body.notes) || null;
  if (!customerName || phone.length < 8 || !governorate || !city || address.length < 5) {
    return NextResponse.json({ error: "Please complete your name, phone, shipping area, and address." }, { status: 400 });
  }
  if (body.paymentMethod && body.paymentMethod !== "COD") {
    return NextResponse.json({ error: "Only cash on delivery is available." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }

  const requested = new Map<string, number>();
  for (const raw of body.items as IncomingItem[]) {
    const variantId = text(raw?.variantId);
    const quantity = Number(raw?.quantity);
    if (!variantId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    requested.set(variantId, (requested.get(variantId) || 0) + quantity);
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const rate = await tx.shippingRate.findFirst({
        where: { governorate, city, active: true },
      });
      if (!rate) throw new Error("SHIPPING_UNAVAILABLE");

      const variants = await tx.productVariant.findMany({
        where: { id: { in: [...requested.keys()] }, product: { active: true } },
        include: { product: true },
      });
      if (variants.length !== requested.size) throw new Error("ITEM_UNAVAILABLE");

      let subtotal = 0;
      const orderItems = variants.map((variant) => {
        const quantity = requested.get(variant.id)!;
        if (variant.stock < quantity) throw new Error("INSUFFICIENT_STOCK");
        subtotal += variant.product.price * quantity;
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

      for (const item of orderItems) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }

      const code = "ZERO-" + randomBytes(4).toString("hex").toUpperCase();
      return tx.order.create({
        data: {
          code,
          customerName,
          phone,
          email,
          governorate,
          city,
          address,
          notes,
          subtotal,
          shippingCost: rate.price,
          total: subtotal + rate.price,
          paymentMethod: "COD",
          items: { create: orderItems },
        },
        select: { code: true, subtotal: true, shippingCost: true, total: true, status: true, createdAt: true },
      });
    }, { isolationLevel: "Serializable" });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "SHIPPING_UNAVAILABLE") return NextResponse.json({ error: "Shipping is not configured for this area yet." }, { status: 422 });
    if (reason === "ITEM_UNAVAILABLE") return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    if (reason === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "There is not enough stock for one or more selected variants." }, { status: 409 });
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 503 });
  }
}
