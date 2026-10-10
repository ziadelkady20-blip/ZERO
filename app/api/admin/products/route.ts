/* eslint-disable @typescript-eslint/no-explicit-any -- JSON payloads are validated before Prisma writes. */
import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ include: { category: true, images: { orderBy: { position: "asc" } }, variants: true }, orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    ]);
    return NextResponse.json({ products, categories });
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const nameEn = typeof body.nameEn === "string" ? body.nameEn.trim() : "";
  const nameAr = typeof body.nameAr === "string" ? body.nameAr.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const price = Number(body.price);
  const compareAtPrice = body.compareAtPrice === undefined || body.compareAtPrice === null || body.compareAtPrice === "" ? null : Number(body.compareAtPrice);
  if (!nameEn || !nameAr || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !categoryId || !Number.isInteger(price) || price < 0 || (compareAtPrice !== null && (!Number.isInteger(compareAtPrice) || compareAtPrice < price))) {
    return NextResponse.json({ error: "Name, Arabic name, valid slug, category and non-negative integer price are required." }, { status: 400 });
  }
  const rawImages = Array.isArray(body.images) ? body.images.map((url: unknown) => typeof url === "string" ? url.trim() : "") : [];
  if (rawImages.some((url: string) => url && !/^https:\/\/\S+$/i.test(url))) {
    return NextResponse.json({ error: "Product images must be direct HTTPS image URLs. Use one URL per line and check that it opens the image itself." }, { status: 400 });
  }
  const imageUrls = rawImages.filter(Boolean).slice(0, 8);
  try {
    const product = await prisma.product.create({
      data: {
        nameEn, nameAr, slug, categoryId, price, compareAtPrice,
        descriptionEn: typeof body.descriptionEn === "string" ? body.descriptionEn : "",
        descriptionAr: typeof body.descriptionAr === "string" ? body.descriptionAr : "",
        active: body.active !== false,
        featured: body.featured === true,
        images: { create: Array.isArray(body.images) ? body.images.filter((url: unknown) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, 8).map((url: string, position: number) => ({ url, position })) : [] },
        variants: { create: Array.isArray(body.variants) ? body.variants.filter((v: any) => v && typeof v.size === "string" && typeof v.color === "string" && typeof v.sku === "string" && Number.isInteger(Number(v.stock)) && Number(v.stock) >= 0).map((v: any) => ({ size: v.size, color: v.color, sku: v.sku, stock: Number(v.stock) })) : [] },
      },
      include: { category: true, images: true, variants: true },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product. Check that its slug, SKU, and category are unique and valid." }, { status: 409 });
  }
}


export async function PATCH(request: Request) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const field of ["nameEn", "nameAr", "slug", "descriptionEn", "descriptionAr"] as const) {
    if (typeof body[field] === "string") data[field] = body[field].trim();
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.categoryId === "string" && body.categoryId) data.categoryId = body.categoryId;
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isInteger(price) || price < 0) return NextResponse.json({ error: "Price must be a non-negative whole number." }, { status: 400 });
    data.price = price;
  }
  if (body.compareAtPrice !== undefined) {
    const compareAtPrice = body.compareAtPrice === null || body.compareAtPrice === "" ? null : Number(body.compareAtPrice);
    if (compareAtPrice !== null && (!Number.isInteger(compareAtPrice) || compareAtPrice < 0)) return NextResponse.json({ error: "Compare-at price is invalid." }, { status: 400 });
    data.compareAtPrice = compareAtPrice;
  }
  const rawImages = Array.isArray(body.images) ? body.images.map((url: unknown) => typeof url === "string" ? url.trim() : "") : null;
  if (rawImages && rawImages.some((url: string) => url && !/^https:\/\/\S+$/i.test(url))) {
    return NextResponse.json({ error: "Product images must be direct HTTPS image URLs. Use one URL per line and check that it opens the image itself." }, { status: 400 });
  }
  const imageUrls = rawImages?.filter(Boolean).slice(0, 8);
  try {
    const product = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing) throw new Error("PRODUCT_NOT_FOUND");
      await tx.product.update({ where: { id }, data: data as any });
      if (Array.isArray(body.images)) {
        const urls = body.images.filter((url: unknown) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, 8);
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({ data: urls.map((url: string, position: number) => ({ productId: id, url, position })) });
      }
      if (Array.isArray(body.variants)) {
        for (const variant of body.variants) {
          if (!variant || typeof variant !== "object") continue;
          if (typeof variant.id === "string" && variant.id) {
            const variantData: Record<string, unknown> = {};
            if (typeof variant.sku === "string" && variant.sku.trim()) variantData.sku = variant.sku.trim();
            if (typeof variant.size === "string" && variant.size.trim()) variantData.size = variant.size.trim();
            if (typeof variant.color === "string" && variant.color.trim()) variantData.color = variant.color.trim();
            if (variant.stock !== undefined) {
              const stock = Number(variant.stock);
              if (!Number.isInteger(stock) || stock < 0) throw new Error("INVALID_STOCK");
              variantData.stock = stock;
            }
            if (Object.keys(variantData).length) await tx.productVariant.update({ where: { id: variant.id, productId: id }, data: variantData as any });
          } else {
            const sku = typeof variant.sku === "string" ? variant.sku.trim() : "";
            const size = typeof variant.size === "string" ? variant.size.trim() : "";
            const color = typeof variant.color === "string" ? variant.color.trim() : "";
            const stock = Number(variant.stock);
            if (!sku || !size || !color || !Number.isInteger(stock) || stock < 0) throw new Error("INVALID_STOCK");
            await tx.productVariant.create({ data: { productId: id, sku, size, color, stock } });
          }
        }
      }
      return tx.product.findUniqueOrThrow({ where: { id }, include: { category: true, images: { orderBy: { position: "asc" } }, variants: true } });
    });
    return NextResponse.json({ product });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (reason === "INVALID_STOCK") return NextResponse.json({ error: "Stock must be a non-negative whole number." }, { status: 400 });
    return NextResponse.json({ error: "Could not update product. Check unique slug/SKU and related records." }, { status: 409 });
  }
}
