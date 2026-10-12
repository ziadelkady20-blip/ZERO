import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: { code?: unknown; status?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const allowed = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const status = typeof body.status === "string" ? body.status : "";
  if (!code || !allowed.includes(status)) return NextResponse.json({ error: "Valid order code and status are required." }, { status: 400 });
  try {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { code }, include: { items: true } });
      if (!current) throw new Error("NOT_FOUND");
      if (current.status === "CANCELLED" && status !== "CANCELLED") throw new Error("CANCELLED_ORDER_LOCKED");
      if (status === "CANCELLED" && current.status !== "CANCELLED" && current.status !== "DELIVERED") {
        for (const item of current.items) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
      return tx.order.update({ where: { code }, data: { status: status as "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } });
    });
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (error instanceof Error && error.message === "CANCELLED_ORDER_LOCKED") return NextResponse.json({ error: "A cancelled order cannot be reopened; create a new order instead." }, { status: 409 });
    return NextResponse.json({ error: "Could not update order status." }, { status: 503 });
  }
}
