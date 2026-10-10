import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
 if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
 try { return NextResponse.json({rates:await prisma.shippingRate.findMany({orderBy:[{governorate:"asc"},{city:"asc"}]})}); }
 catch { return NextResponse.json({error:"Database is not configured."},{status:503}); }
}
export async function POST(request:Request) {
 if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
 let body:{governorate?:unknown;city?:unknown;price?:unknown;active?:unknown};
 try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
 const governorate=typeof body.governorate==="string"?body.governorate.trim():"";
 const city=typeof body.city==="string"&&body.city.trim()?body.city.trim():"*";
 const price=Number(body.price);
 if(!governorate||!Number.isInteger(price)||price<0) return NextResponse.json({error:"Governorate and a valid delivery price are required."},{status:400});
 try {
  const rate=await prisma.shippingRate.upsert({where:{governorate_city:{governorate,city}},create:{governorate,city,price,active:body.active!==false},update:{price,active:body.active!==false}});
  return NextResponse.json({rate});
 } catch { return NextResponse.json({error:"Could not save delivery price."},{status:503}); }
}
