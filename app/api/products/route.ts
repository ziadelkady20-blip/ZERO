import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Product service is not configured yet." }, { status: 503 });
  }
}
