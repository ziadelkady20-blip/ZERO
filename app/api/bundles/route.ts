import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "desc" }], select: { id:true,titleEn:true,titleAr:true,descriptionEn:true,descriptionAr:true,imageUrl:true,totalPrice:true } });
    return NextResponse.json({ bundles }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ bundles: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
