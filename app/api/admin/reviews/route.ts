import { NextResponse } from "next/server";
import { hasSameOrigin } from "@/lib/security";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const reviews = await prisma.customerReview.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ reviews }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!/^https:\/\/\S+$/i.test(imageUrl)) return NextResponse.json({ error: "Enter a direct HTTPS image URL." }, { status: 400 });
  const customerName = typeof body.customerName === "string" ? body.customerName.trim().slice(0, 100) : "";
  const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 500) : "";
  const position = Number.isInteger(Number(body.position)) ? Number(body.position) : 0;
  const review = await prisma.customerReview.create({ data: { imageUrl, customerName, caption, position } });
  return NextResponse.json({ review });
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  const data: any = {};
  if (typeof body.imageUrl === "string") {
    const url = body.imageUrl.trim();
    if (!/^https:\/\/\S+$/i.test(url)) return NextResponse.json({ error: "Enter a direct HTTPS image URL." }, { status: 400 });
    data.imageUrl = url;
  }
  if (typeof body.customerName === "string") data.customerName = body.customerName.trim().slice(0, 100);
  if (typeof body.caption === "string") data.caption = body.caption.trim().slice(0, 500);
  if (typeof body.active === "boolean") data.active = body.active;
  if (Number.isInteger(Number(body.position))) data.position = Number(body.position);
  const review = await prisma.customerReview.update({ where: { id: body.id }, data });
  return NextResponse.json({ review });
}

export async function DELETE(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdminSessionValid())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  await prisma.customerReview.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
