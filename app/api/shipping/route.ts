import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
 try {
  const rows=await prisma.shippingRate.findMany({where:{active:true},select:{governorate:true,city:true,price:true},orderBy:[{governorate:"asc"},{city:"asc"}]});
  const rates=new Map<string,{governorate:string;price:number}>();
  for(const row of rows){const old=rates.get(row.governorate);if(!old||row.city==="*")rates.set(row.governorate,{governorate:row.governorate,price:row.price});}
  return NextResponse.json({rates:[...rates.values()]});
 } catch { return NextResponse.json({error:"Shipping rates are not configured yet."},{status:503}); }
}
