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
  if (!nameEn || !nameAr || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !categoryId || !Number.isInteger(price) || price < 0) {
    return NextResponse.json({ error: "Name, Arabic name, valid slug, category and non-negative integer price are required." }, { status: 400 });
  }
  try {
    const product = await prisma.product.create({
      data: {
        nameEn, nameAr, slug, categoryId, price,
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
