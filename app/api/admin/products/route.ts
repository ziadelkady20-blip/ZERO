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
  const nameAr ¶»§q«^