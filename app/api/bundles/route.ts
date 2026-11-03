import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({ where: { active: true, items: { some: { product: { active: true } } } }, orderBy: [{ position: "asc" }, { createdAt: "desc" }], include: { items: { where:{product:{active:true}}, include:{ product:{ include:{ images:{orderBy:{position:"asc"}}, variants:{select:{id:true,size:true,color:true,stock:true}} } } } } } });
    return NextResponse.json({ bundles }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ bundles: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
