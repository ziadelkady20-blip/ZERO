import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const orders = await prisma.order.findMany({ include: { items: { include: { components: { include: { product: true, variant: true } } } } }, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
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
      const current = await tx.order.findUnique({ where: { code }, include: { items: { include: { components: true } } } });
      if (!current) throw new Error("NOT_FOUND");
      if (current.status === status) return current;
      if (current.status === "CANCELLED") throw new Error("CANCELLED_ORDER_LOCKED");
      if (status === "CANCELLED" && current.status === "DELIVERED") throw new Error("DELIVERED_ORDER_CANNOT_CANCEL");

      // Compare-and-set the status before restoring stock. Only one concurrent cancellation
      // can change the previous status, so stock is restored exactly once.
      const changed = await tx.order.updateMany({
        where: { code, status: current.status },
        data: { status: status as "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
      });
      if (changed.count !== 1) throw new Error("ORDER_STATUS_CHANGED");

      if (status === "CANCELLED") {
        for (const item of current.items) {
          if (item.bundleId) {
            for (const component of item.components) {
              await tx.productVariant.update({ where: { id: component.variantId }, data: { stock: { increment: component.quantity } } });
            }
          } else if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          }
        }
      }
      return tx.order.findUniqueOrThrow({ where: { code } });
    });
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (error instanceof Error && error.message === "CANCELLED_ORDER_LOCKED") return NextResponse.json({ error: "A cancelled order cannot be reopened; create a new order instead." }, { status: 409 });\n    if (error instanceof Error && error.message === "DELIVERED_ORDER_CANNOT_CANCEL") return NextResponse.json({ error: "A delivered order cannot be cancelled. Use a return workflow instead." }, { status: 409 });\n    if (error instanceof Error && error.message === "ORDER_STATUS_CHANGED") return NextResponse.json({ error: "The order was updated by another request. Refresh and try again." }, { status: 409 });\n    if (typeof error === "object" && error !== null && "code" in error && String((error as { code: unknown }).code) === "P2034") return NextResponse.json({ error: "The order changed concurrently. Refresh and try again." }, { status: 409 });
    return NextResponse.json({ error: "Could not update order status." }, { status: 503 });
  }
}
