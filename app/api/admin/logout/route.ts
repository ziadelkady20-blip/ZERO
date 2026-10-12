import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";
import { hasSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  await clearAdminSession();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
