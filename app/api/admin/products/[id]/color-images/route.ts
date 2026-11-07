import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PhotoPair = { color: string; front: string; back: string };
type VariantInput = { id?: string; size: string; color: string; sku: string; stock: number };
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

  let body: { colors?: unknown; variants?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  if (!Array.isArray(body.colors) || body.colors.length === 0 || body.colors.length > 20) {
    return NextResponse.json({ error: "Add between 1 and 20 colors with front and back photos." }, { status: 400 });
  }
  if (!Array.isArray(body.variants) || body.variants.length === 0 || body.variants.length > 100) {
    return NextResponse.json({ error: "Submit the size and stock values for this color." }, { status: 400 });
  }

  const colors: PhotoPair[] = [];
  for (const item of body.colors) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return NextResponse.json({ error: "Invalid color photo entry." }, { status: 400 });
    const entry = item as UnknownRecord;
    const color = typeof entry.color === "string" ? entry.color.trim() : "";
    const front = typeof entry.front === "string" ? entry.front.trim() : "";
    const back = typeof entry.back === "string" ? entry.back.trim() : "";
    if (!color || color.length > 80 || !front || !back) return NextResponse.json({ error: "Each color needs a name and both Front and Back image URLs." }, { status: 400 });
    if (!validImageUrl(front) || !validImageUrl(back)) return NextResponse.json({ error: "Color photos must use valid HTTPS image URLs." }, { status: 400 });
    colors.push({ color, front, back });
  }

  const normalizedColors = colors.map(item => item.color.toLocaleLowerCase());
  if (new Set(normalizedColors).size !== normalizedColors.length) {
    return NextResponse.json({ error: "A color was submitted more than once." }, { status: 400 });
  }

  const submittedVariants: VariantInput[] = [];
  for (const value of body.variants) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return NextResponse.json({ error: "Invalid color variant." }, { status: 400 });
    const entry = value as UnknownRecord;
    const idValue = typeof entry.id === "string" ? entry.id.trim() : "";
    const size = typeof entry.size === "string" ? entry.size.trim() : "";
    const color = typeof entry.color === "string" ? entry.color.trim() : "";
    const sku = typeof entry.sku === "string" ? entry.sku.trim() : "";
    const stock = Number(entry.stock);
    if (!size || size.length > 40 || !color || !sku || sku.length > 100 || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Each color size needs a SKU and a valid non-negative stock value." }, { status: 400 });
    }
    submittedVariants.push({ ...(idValue ? { id: idValue } : {}), size, color, sku, stock });
  }

  const skuValues = submittedVariants.map(item => item.sku.toLocaleLowerCase());
  const variantKeys = submittedVariants.map(item => item.size.toLocaleLowerCase() + "::" + item.color.toLocaleLowerCase());
  if (new Set(skuValues).size !== skuValues.length || new Set(variantKeys).size !== variantKeys.length) {
    return NextResponse.json({ error: "Duplicate SKU or size/color combinations were submitted." }, { status: 400 });
  }
  if (submittedVariants.some(variant => !normalizedColors.includes(variant.color.toLocaleLowerCase()))) {
    return NextResponse.json({ error: "Variant colors must match the submitted color photos." }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(async tx => {
      const existing = await tx.product.findUnique({
        where: { id },
        select: { id: true, variants: { select: { id: true, size: true, color: true } } },
      });
      if (!existing) throw new Error("PRODUCT_NOT_FOUND");

      const sizes = Array.from(new Set(existing.variants.map(variant => variant.size.trim()).filter(Boolean)));
      if (!sizes.length) throw new Error("PRODUCT_HAS_NO_SIZES");

      for (const item of colors) {
        const colorVariants = submittedVariants.filter(variant => variant.color.toLocaleLowerCase() === item.color.toLocaleLowerCase());
        if (colorVariants.length !== sizes.length || sizes.some(size => !colorVariants.some(variant => variant.size.toLocaleLowerCase() === size.toLocaleLowerCase()))) {
          throw new Error("COLOR_VARIANTS_MISMATCH");
        }

        for (const variant of colorVariants) {
          if (!sizes.some(size => size.toLocaleLowerCase() === variant.size.toLocaleLowerCase())) throw new Error("COLOR_VARIANTS_MISMATCH");
          const current = variant.id
            ? existing.variants.find(entry => entry.id === variant.id)
            : existing.variants.find(entry => entry.size.toLocaleLowerCase() === variant.size.toLocaleLowerCase() && entry.color.toLocaleLowerCase() === item.color.toLocaleLowerCase());
          if (variant.id && !current) throw new Error("VARIANT_NOT_FOUND");
          if (current && current.color.toLocaleLowerCase() !== item.color.toLocaleLowerCase()) throw new Error("VARIANT_COLOR_MISMATCH");

          if (current) {
            if (current.size !== variant.size || current.color !== item.color) {
              const bundleReferences = await tx.bundleProduct.count({ where: { variantId: current.id } });
              if (bundleReferences > 0) throw new Error("VARIANT_IN_BUNDLE");
            }
            await tx.productVariant.update({
              where: { id: current.id },
              data: { size: variant.size, color: item.color, sku: variant.sku, stock: variant.stock },
            });
          } else {
            await tx.productVariant.create({
              data: { productId: id, size: variant.size, color: item.color, sku: variant.sku, stock: variant.stock },
            });
          }
        }

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
    const reason = error instanceof Error ? error.message : "";
    if (reason === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (reason === "PRODUCT_HAS_NO_SIZES") return NextResponse.json({ error: "Add at least one size variant before saving a new color." }, { status: 400 });
    if (reason === "COLOR_VARIANTS_MISMATCH") return NextResponse.json({ error: "Every color must include exactly one stock entry for each product size." }, { status: 400 });
    if (reason === "VARIANT_NOT_FOUND") return NextResponse.json({ error: "A submitted size variant does not belong to this product. Refresh and try again." }, { status: 400 });
    if (reason === "VARIANT_COLOR_MISMATCH") return NextResponse.json({ error: "A submitted variant does not match the selected color." }, { status: 400 });
    if (reason === "VARIANT_IN_BUNDLE") return NextResponse.json({ error: "This variant is fixed in an existing bundle. Remove or update the bundle configuration before changing its size or color." }, { status: 409 });
    if (typeof error === "object" && error !== null && "code" in error && String((error as { code: unknown }).code) === "P2002") {
      return NextResponse.json({ error: "This SKU or size/color combination already exists. Check the product inventory." }, { status: 409 });
    }
    console.error("[admin color images] Save failed:", error);
    return NextResponse.json({ error: "Could not save color photos and inventory. Please refresh and try again." }, { status: 500 });
  }
}
