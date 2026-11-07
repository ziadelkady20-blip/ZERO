import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };
const buckets = new Map<string, Bucket>();
let calls = 0;

function inMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  calls += 1;
  if (calls % 100 === 0 || buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
  const effectiveKey = buckets.size >= 10_000 && !buckets.has(key) ? "__overflow__" : key;
  const current = buckets.get(effectiveKey);
  if (!current || current.resetAt <= now) {
    buckets.set(effectiveKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  current.count += 1;
  return {
    allowed: current.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

/**
 * Uses Upstash Redis when configured so limits are shared across serverless instances.
 * The in-memory fallback keeps local development and temporary Redis outages functional;
 * configure Vercel Firewall rate limits as an additional production layer.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return inMemoryRateLimit(key, limit, windowMs);

  const script = "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]); end; local ttl=redis.call('PTTL',KEYS[1]); return {count,ttl}";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", script, "1", `zero:rate:${key}`, String(windowMs)]),
      cache: "no-store",
    });
    const payload = await response.json() as { result?: unknown; error?: string };
    if (!response.ok || payload.error || !Array.isArray(payload.result) || payload.result.length < 2) {
      throw new Error("Shared rate-limit service returned an invalid response.");
    }
    const count = Number(payload.result[0]);
    const ttl = Number(payload.result[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) throw new Error("Invalid shared rate-limit values.");
    return {
      allowed: count <= limit,
      retryAfterSeconds: Math.max(1, Math.ceil(Math.max(0, ttl) / 1000)),
    };
  } catch (error) {
    console.error("[rate-limit] Shared store unavailable; using per-instance fallback.", error);
    return inMemoryRateLimit(key, limit, windowMs);
  }
}

/** Prefer trusted hosting headers; x-forwarded-for is a last-resort fallback. */
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
