import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const emailExpected = process.env.ADMIN_EMAIL;
  const passwordExpected = process.env.ADMIN_PASSWORD;
  if (!emailExpected || !passwordExpected || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 503 });
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!equalSecret(email, emailExpected.trim().toLowerCase()) || !equalSecret(password, passwordExpected)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
