import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const sessionCookie = "zero_admin_session";

function signingKey() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(signingKey());
  const jar = await cookies();
  jar.set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(sessionCookie, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function isAdminSessionValid() {
  try {
    const jar = await cookies();
    const token = jar.get(sessionCookie)?.value;
    if (!token) return false;
    const result = await jwtVerify(token, signingKey());
    return result.payload.role === "admin";
  } catch {
    return false;
  }
}
