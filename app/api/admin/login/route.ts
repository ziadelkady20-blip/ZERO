import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";
import { fingerprint, hasSameOrigin, rateLimit, rateLimitedResponse, requestIp } from "@/lib/security";

export const runtime = "nodejs";

function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: { "Cache-Control": "no-store" } });

  const ipLimit = rateLimit(`admin-login:ip:${fingerprint(requestIp(request))}`, 10, 15 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitedResponse(ipLimit.retryAfterSeconds);

  const emailExpected = process.env.ADMIN_EMAIL;
  const passwordExpected = process.env.ADMIN_PASSWORD;
  if (!emailExpected || !passwordExpected || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const emailLimit = rateLimit(`admin-login:email:${fingerprint(email || "missing")}`, 8, 15 * 60 * 1000);
  if (!emailLimit.allowed) return rateLimitedResponse(emailLimit.retryAfterSeconds);

  if (password.length > 1024 || !equalSecret(email, emailExpected.trim().toLowerCase()) || !equalSecret(password, passwordExpected)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
