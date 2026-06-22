// Best-effort per-IP rate limit for the AI endpoint (cost/abuse protection).
//
// This is an in-memory fixed window: it resets when the server restarts and is
// per-instance, so it is NOT a hard security boundary — the durable controls
// live in Supabase elsewhere. It exists to blunt trivial abuse of an endpoint
// that spends real money per call, and to demonstrate a defense-in-depth layer.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, { count: number; resetAt: number }>();

export type RateLimitResult = { allowed: boolean; retryAfter: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/** Derive a best-effort client key from proxy headers. */
export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "unknown";
}
