/* eslint-disable @typescript-eslint/no-explicit-any -- JSON payloads are validated before Prisma writes. */
import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { deletedAt: null }, include: { category: true, images: { orderBy: { position: "asc" } }, variants: true }, orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    ]);
    return NextResponse.json({ products, categories }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
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
  const rawImages = Array.isArray(body.images) ? body.images.map((entry: any) => typeof entry === "string" ? { url: entry.trim(), alt: "" } : { url: typeof entry?.url === "string" ? entry.url.trim() : "", alt: typeof entry?.alt === "string" ? entry.alt : "" }) : [];
  if (rawImages.some((entry: {url:string}) => entry.url && !/^https:\/\/\S+$/i.test(entry.url))) return NextResponse.json({ error: "Product images must be direct HTTPS image URLs." }, { status: 400 });
  const imageUrls = rawImages.filter((entry: {url:string}) => Boolean(entry.url)).slice(0, 32);
  if (Array.isArray(body.variants)) {
    if (body.variants.length < 1 || body.variants.length > 100) {
      return NextResponse.json(
        { error: "A product must have between 1 and 100 size/color combinations." },
        { status: 400 },
      );
    }
    const combinations = new Set<string>();
    const skus = new Set<string>();
    const variantIds = new Set<string>();
    for (const variant of body.variants) {
      if (!variant || typeof variant !== "object") {
        return NextResponse.json(
          { error: "One of the size/color options is invalid." },
          { status: 400 },
        );
      }
      const sku = typeof variant.sku === "string" ? variant.sku.trim() : "";
      const size = typeof variant.size === "string" ? variant.size.trim() : "";
      const color = typeof variant.color === "string" ? variant.color.trim() : "";
      const stock = Number(variant.stock);
      if (!sku || !size || !color || !Number.isInteger(stock) || stock < 0 ||
          (variant.id !== undefined && typeof variant.id !== "string")) {
        return NextResponse.json(
          { error: "Every option needs a SKU, size, color and valid stock quantity." },
          { status: 400 },
        );
      }
      const normalizedSku = sku.toLocaleLowerCase("en-US");
      const combination = `${size.normalize("NFKC").toLocaleLowerCase("en-US")}::${color.normalize("NFKC").toLocaleLowerCase("en-US")}`;
      if (skus.has(normalizedSku)) {
        return NextResponse.json(
          { error: `The SKU "${sku}" is repeated. Each size/color option needs a unique SKU.` },
          { status: 409 },
        );
      }
      if (combinations.has(combination)) {
        return NextResponse.json(
          { error: `The size/color combination "${size} / ${color}" is repeated.` },
          { status: 409 },
        );
      }
      if (variant.id) {
        if (variantIds.has(variant.id)) {
          return NextResponse.json(
            { error: "A size/color option was submitted more than once. Refresh and try again." },
            { status: 400 },
          );
        }
        variantIds.add(variant.id);
      }
      skus.add(normalizedSku);
      combinations.add(combination);
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        nameEn, nameAr, slug, categoryId, price, compareAtPrice,
        descriptionEn: typeof body.descriptionEn === "string" ? body.descriptionEn : "",
        descriptionAr: typeof body.descriptionAr === "string" ? body.descriptionAr : "",
        active: body.active !== false,
        featured: body.featured === true,
        promotionType: ["NONE","PERCENT","BUY2GET1"].includes(body.promotionType) ? body.promotionType : "NONE",
        promotionValue: body.promotionType === "PERCENT" && Number.isInteger(Number(body.promotionValue)) ? Math.min(90,Math.max(1,Number(body.promotionValue))) : 0,
        images: { create: imageUrls.map((entry: {url:string;alt:string}, position: number) => ({ url: entry.url, alt: entry.alt, position })) },
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
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
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
  if (typeof body.bestSeller === "boolean") data.bestSeller = body.bestSeller;
  if (typeof body.newArrival === "boolean") data.newArrival = body.newArrival;
  if (body.promotionType !== undefined) {
    if (!["NONE","PERCENT","BUY2GET1"].includes(body.promotionType)) return NextResponse.json({ error: "Invalid promotion type." }, { status: 400 });
    const value = Number(body.promotionValue ?? 0);
    if (body.promotionType === "PERCENT" && (!Number.isInteger(value) || value < 1 || value > 90)) return NextResponse.json({ error: "Discount must be between 1% and 90%." }, { status: 400 });
    data.promotionType = body.promotionType;
    data.promotionValue = body.promotionType === "PERCENT" ? value : 0;
  }
  if (body.sizeChartUrl !== undefined) {
    const url = typeof body.sizeChartUrl === "string" ? body.sizeChartUrl.trim() : "";
    if (url && !/^https:\/\/\S+$/i.test(url)) return NextResponse.json({ error: "Size chart must be a direct HTTPS image URL." }, { status: 400 });
    data.sizeChartUrl = url || null;
  }
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
  const rawImages = Array.isArray(body.images) ? body.images.map((entry: any) => typeof entry === "string" ? { url: entry.trim(), alt: "" } : { url: typeof entry?.url === "string" ? entry.url.trim() : "", alt: typeof entry?.alt === "string" ? entry.alt : "" }) : null;
  if (rawImages && rawImages.some((entry: {url:string}) => entry.url && !/^https:\/\/\S+$/i.test(entry.url))) return NextResponse.json({ error: "Product images must be direct HTTPS image URLs." }, { status: 400 });
  const imageUrls = rawImages?.filter((entry: {url:string}) => Boolean(entry.url)).slice(0, 32);
  try {
    const product = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing || existing.deletedAt) throw new Error("PRODUCT_NOT_FOUND");
      await tx.product.update({ where: { id }, data: data as any });
      if (Array.isArray(body.images)) {
        const urls = imageUrls || [];
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({ data: urls.map((entry: {url:string;alt:string}, position: number) => ({ productId: id, url: entry.url, alt: entry.alt, position })) });
      }
      if (Array.isArray(body.variants)) {
        const submittedIds = body.variants.map((variant: any) => typeof variant?.id === "string" ? variant.id : "").filter(Boolean);
        const existingVariants = await tx.productVariant.findMany({ where: { productId: id }, select: { id: true, size: true, color: true } });
        const removedIds = existingVariants.map((variant) => variant.id).filter((variantId) => !submittedIds.includes(variantId));
        if (removedIds.length) {
          const [orderReferences, bundleReferences, configuredBundleReferences] = await Promise.all([
            tx.orderItem.count({ where: { variantId: { in: removedIds } } }),
            tx.bundleOrderItem.count({ where: { variantId: { in: removedIds } } }),
            tx.bundleProduct.count({ where: { variantId: { in: removedIds } } }),
          ]);
          if (orderReferences > 0 || bundleReferences > 0) throw new Error("VARIANT_HAS_ORDER_HISTORY");
          if (configuredBundleReferences > 0) throw new Error("VARIANT_IN_BUNDLE");
          await tx.productVariant.deleteMany({ where: { id: { in: removedIds }, productId: id } });
        }
        for (const variant of body.variants) {
          if (!variant || typeof variant !== "object") continue;
          if (typeof variant.id === "string" && variant.id) {
            const original = existingVariants.find(entry => entry.id === variant.id);
            if (!original) throw new Error("VARIANT_NOT_FOUND");
            const nextSize = typeof variant.size === "string" && variant.size.trim() ? variant.size.trim() : original.size;
            const nextColor = typeof variant.color === "string" && variant.color.trim() ? variant.color.trim() : original.color;
            if (nextSize !== original.size || nextColor !== original.color) {
              const configuredBundleReferences = await tx.bundleProduct.count({ where: { variantId: variant.id } });
              if (configuredBundleReferences > 0) throw new Error("VARIANT_IN_BUNDLE");
            }
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
    console.error("[admin/products PATCH] Update failed:", error);
    if (reason === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (reason === "INVALID_STOCK") return NextResponse.json({ error: "Stock must be a non-negative whole number." }, { status: 400 });
    if (reason === "VARIANT_HAS_ORDER_HISTORY") return NextResponse.json({ error: "This size/color variant is part of an existing order. Keep it and set its stock to 0 instead of removing it." }, { status: 409 });
    if (reason === "VARIANT_IN_BUNDLE") return NextResponse.json({ error: "This variant is fixed in an existing bundle. Remove or update the bundle configuration before deleting or changing its size/color." }, { status: 409 });
    if (reason === "VARIANT_NOT_FOUND") return NextResponse.json({ error: "A submitted variant does not belong to this product. Refresh and try again." }, { status: 400 });
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = String((error as {code:unknown}).code);
      if (code === "P2002") return NextResponse.json({ error: "A SKU or product slug is already in use. Check the SKU values in Size / color inventory." }, { status: 409 });
      if (code === "P2003") return NextResponse.json({ error: "This variant is linked to an existing order or bundle and cannot be removed." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not save this product. Please refresh and try again; if it continues, contact support with the time of the error." }, { status: 409 });
  }
}


export async function DELETE(request: Request) {
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!(await isAdminSessionValid()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id)
    return NextResponse.json(
      { error: "Product id is required." },
      { status: 400 },
    );

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: {
          id: true,
          nameEn: true,
          deletedAt: true,
          variants: { select: { id: true } },
          _count: {
            select: {
              orderItems: true,
              bundleItems: true,
              bundleOrderItems: true,
            },
          },
        },
      });

      if (!product || product.deletedAt)
        throw new Error("PRODUCT_NOT_FOUND");

      const variantIds = product.variants.map((variant) => variant.id);
      const [variantOrderReferences, variantBundleOrderReferences] =
        variantIds.length > 0
          ? await Promise.all([
              tx.orderItem.count({ where: { variantId: { in: variantIds } } }),
              tx.bundleOrderItem.count({ where: { variantId: { in: variantIds } } }),
            ])
          : [0, 0];

      const hasHistoryOrBundleReferences =
        product._count.orderItems > 0 ||
        product._count.bundleOrderItems > 0 ||
        variantOrderReferences > 0 ||
        variantBundleOrderReferences > 0 ||
        product._count.bundleItems > 0;

      if (hasHistoryOrBundleReferences) {
        if (product._count.bundleItems > 0) {
          await tx.bundle.updateMany({
            where: { items: { some: { productId: id } } },
            data: { active: false },
          });
        }

        await tx.product.update({
          where: { id },
          data: {
            active: false,
            deletedAt: new Date(),
            slug: `archived-${id}`,
          },
        });

        return { id: product.id, nameEn: product.nameEn, archived: true };
      }

      await tx.product.delete({ where: { id } });
      return { id: product.id, nameEn: product.nameEn, archived: false };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "PRODUCT_NOT_FOUND")
      return NextResponse.json(
        { error: "Product not found. It may already have been removed." },
        { status: 404 },
      );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      String((error as { code: unknown }).code) === "P2003"
    ) {
      return NextResponse.json(
        { error: "This product is still linked to an order or bundle. Refresh and try again." },
        { status: 409 },
      );
    }

    console.error("[admin/products DELETE] Delete failed:", error);
    return NextResponse.json(
      { error: "Could not remove this product. Please refresh and try again." },
      { status: 500 },
    );
  }
}
