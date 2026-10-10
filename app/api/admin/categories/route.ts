import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request) {
 if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
 let body: {slug?:unknown;nameEn?:unknown;nameAr?:unknown};
 try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
 const slug=typeof body.slug==="string"?body.slug.trim().toLowerCase():"";
 const nameEn=typeof body.nameEn==="string"?body.nameEn.trim():"";
 const nameAr=typeof body.nameAr==="string"?body.nameAr.trim():"";
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!nameEn||!nameAr) return NextResponse.json({error:"Provide a valid slug and English and Arabic names."},{status:400});
 try { const category=await prisma.category.create({data:{slug,nameEn,nameAr}}); return NextResponse.json({category},{status:201}); }
 catch { return NextResponse.json({error:"Category slug already exists or database is unavailable."},{status:409}); }
}

export async function PATCH(request: Request) {
 if (!(await isAdminSessionValid())) return NextResponse.json({error:"Unauthorized."},{status:401});
 let body:{id?:unknown;slug?:unknown;nameEn?:unknown;nameAr?:unknown};
 try { body=await request.json(); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
 const id=typeof body.id==="string"?body.id:"";
 const slug=typeof body.slug==="string"?body.slug.trim().toLowerCase():"";
 const nameEn=typeof body.nameEn==="string"?body.nameEn.trim():"";
 const nameAr=typeof body.nameAr==="string"?body.nameAr.trim():"";
 if(!id||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!nameEn||!nameAr) return NextResponse.json({error:"Provide a category, valid slug and English and Arabic names."},{status:400});
 try { const category=await prisma.category.update({where:{id},data:{slug,nameEn,nameAr}}); return NextResponse.json({category}); }
 catch { return NextResponse.json({error:"Could not update category. The slug may already be in use."},{status:409}); }
}
