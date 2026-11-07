import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug || slug.length > 160) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  try {
    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Product service is not available right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
