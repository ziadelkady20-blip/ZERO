/* eslint-disable @typescript-eslint/no-explicit-any -- Payloads are validated before writes. */
import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
const validImage = (value: unknown) => typeof value === "string" && /^https:\/\/\S+$/i.test(value.trim());
export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error:"Unauthorized." }, { status:401 });
  const bundles = await prisma.bundle.findMany({ include:{items:{include:{product:{select:{id:true,nameEn:true,nameAr:true,price:true,active:true}}}}}, orderBy:[{position:"asc"},{createdAt:"desc"}] });
  return NextResponse.json({ bundles }, { headers:{"Cache-Control":"no-store"} });
}
export async function POST(request:Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
  let body:any; try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
  if (!validImage(body.imageUrl)) return NextResponse.json({error:"Enter a direct HTTPS image URL."},{status:400});
  const titleEn=typeof body.titleEn==="string"?body.titleEn.trim().slice(0,120):"";
  const totalPrice=Number(body.totalPrice);
  const productIds=Array.isArray(body.productIds)?[...new Set(body.productIds.filter((id:unknown)=>typeof id==="string"&&id.trim()).map((id:string)=>id.trim()))]:[];
  if (!titleEn || !Number.isInteger(totalPrice) || totalPrice<0 || productIds.length===0 || productIds.length>20) return NextResponse.json({error:"Enter a title, valid total price, and select at least one fixed product."},{status:400});
  const products=await prisma.product.findMany({where:{id:{in:productIds},active:true},select:{id:true}});
  if(products.length!==productIds.length)return NextResponse.json({error:"One or more selected products are unavailable."},{status:400});
  const bundle=await prisma.bundle.create({data:{titleEn,titleAr:typeof body.titleAr==="string"?body.titleAr.trim().slice(0,120):"",descriptionEn:typeof body.descriptionEn==="string"?body.descriptionEn.trim().slice(0,500):"",descriptionAr:typeof body.descriptionAr==="string"?body.descriptionAr.trim().slice(0,500):"",imageUrl:body.imageUrl.trim(),totalPrice,position:Number.isInteger(Number(body.position))?Number(body.position):0,items:{create:productIds.map(productId=>({productId,quantity:1}))}},include:{items:{include:{product:{select:{id:true,nameEn:true,nameAr:true,price:true,active:true}}}}}});
  return NextResponse.json({bundle});
}
export async function PATCH(request:Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
  let body:any; try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
  if (typeof body.id!=="string"||!body.id) return NextResponse.json({error:"Bundle ID is required."},{status:400});
  const data:any={};
  for (const field of ["titleEn","titleAr","descriptionEn","descriptionAr"] as const) if(typeof body[field]==="string") data[field]=body[field].trim().slice(0,field.startsWith("description")?500:120);
  if(body.imageUrl!==undefined){if(!validImage(body.imageUrl))return NextResponse.json({error:"Enter a direct HTTPS image URL."},{status:400});data.imageUrl=body.imageUrl.trim();}
  if(body.totalPrice!==undefined){const price=Number(body.totalPrice);if(!Number.isInteger(price)||price<0)return NextResponse.json({error:"Enter a valid total price."},{status:400});data.totalPrice=price;}
  if(typeof body.active==="boolean")data.active=body.active;
  if(Number.isInteger(Number(body.position)))data.position=Number(body.position);
  const bundle=await prisma.$transaction(async tx=>{
    if(productIds){await tx.bundleProduct.deleteMany({where:{bundleId:body.id}});await tx.bundleProduct.createMany({data:productIds.map(productId=>({bundleId:body.id,productId,quantity:1}))});}
    return tx.bundle.update({where:{id:body.id},data,include:{items:{include:{product:{select:{id:true,nameEn:true,nameAr:true,price:true,active:true}}}}}});
  });
  return NextResponse.json({bundle});
}
export async function DELETE(request:Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
  let body:any;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid JSON."},{status:400});}
  if(typeof body.id!=="string"||!body.id)return NextResponse.json({error:"Bundle ID is required."},{status:400});
  await prisma.bundle.delete({where:{id:body.id}});
  return NextResponse.json({success:true});
}
