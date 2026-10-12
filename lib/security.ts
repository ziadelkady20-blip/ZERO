import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let calls = 0;

/**
 * Best-effort per-process limiter. On serverless deployments this is defense-in-depth,
 * not a substitute for a shared store or Vercel Firewall rate limiting.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  calls += 1;
  if (calls % 100 === 0 || buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: current.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function requestIp(request: Request) {
  const value =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown";
  return value.trim().slice(0, 100) || "unknown";
}

export function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Reject browser requests from another origin to protect cookie-authenticated mutations. */
export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function rateLimitedResponse(retryAfterSeconds: number) {
  return Response.json(
    { error: "Too many requests. Please wait and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds), "Cache-Control": "no-store" } },
  );
}
