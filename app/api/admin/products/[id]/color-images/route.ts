import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PhotoPair = { color: string; front: string; back: string };
type UnknownRecord = Record<string, unknown>;

function validImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { colors?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  if (!Array.isArray(body.colors) || body.colors.length === 0) {
    return NextResponse.json({ error: "Add at least one color with front and back photos." }, { status: 400 });
  }

  const colors: PhotoPair[] = [];
  for (const item of body.colors) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return NextResponse.json({ error: "Invalid color photo entry." }, { status: 400 });
    const entry = item as UnknownRecord;
    const color = typeof entry.color === "string" ? entry.color.trim() : "";
    const front = typeof entry.front === "string" ? entry.front.trim() : "";
    const back = typeof entry.back === "string" ? entry.back.trim() : "";
    if (!color || !front || !back) return NextResponse.json({ error: "Each color needs both a Front and a Back image URL." }, { status: 400 });
    if (!validImageUrl(front) || !validImageUrl(back)) return NextResponse.json({ error: "Color photos must use valid HTTPS image URLs." }, { status: 400 });
    colors.push({ color, front, back });
  }

  const duplicateColors = colors.map(item => item.color.toLocaleLowerCase());
  if (new Set(duplicateColors).size !== duplicateColors.length) {
    return NextResponse.json({ error: "A color was submitted more than once." }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(async tx => {
      const existing = await tx.product.findUnique({ where: { id }, select: { id: true } });
      if (!existing) throw new Error("PRODUCT_NOT_FOUND");

      for (const item of colors) {
        const prefix = "ZERO_COLOR_IMAGE::" + item.color + "::";
        await tx.productImage.deleteMany({ where: { productId: id, alt: { startsWith: prefix } } });
        const last = await tx.productImage.aggregate({ where: { productId: id }, _max: { position: true } });
        const position = (last._max.position ?? -1) + 1;
        await tx.productImage.createMany({
          data: [
            { productId: id, url: item.front, alt: prefix + "front", position },
            { productId: id, url: item.back, alt: prefix + "back", position: position + 1 },
          ],
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: { category: true, images: { orderBy: { position: "asc" } }, variants: true },
      });
    });
    return NextResponse.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    console.error("[admin color images] Save failed:", error);
    return NextResponse.json({ error: "Could not save color photos. Please refresh and try again." }, { status: 500 });
  }
}
