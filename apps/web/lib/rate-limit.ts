import { createHash } from "node:crypto"
import { lt, sql } from "drizzle-orm"
import type { NextRequest } from "next/server"

import { getDb, isDatabaseConfigured, rateLimits } from "@/lib/db"

export interface RateLimitRule {
  /** Max requests allowed per window. */
  limit: number
  /** Window length in seconds. */
  windowSeconds: number
}

export interface RateLimitResult {
  ok: boolean
  limit: number
  remaining: number
  /** When the current window closes and the caller may retry. */
  reset: Date
  /** Seconds until `reset`, floored at 1 so a `Retry-After: 0` never goes out. */
  retryAfterSeconds: number
}

export const RATE_LIMITS = {
  /** A real person sends one message, not five. */
  contact: { limit: 5, windowSeconds: 60 * 60 },
  /** Loose -- this is a public read endpoint, the cap only stops flooding. */
  posts: { limit: 60, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitRule>

/**
 * Stable per-client identifier. Salted because unsalted IP hashes are trivially
 * reversible -- the whole IPv4 space rainbow-tables in minutes. Set
 * `IP_HASH_SALT` in production; without it the hash is still not a plaintext IP,
 * but it is not private either.
 */
export function clientFingerprint(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}:${ip}`)
    .digest("hex")
}

/** Start of the fixed window containing `now`, aligned to the window size. */
function windowStartFor(now: Date, windowSeconds: number): Date {
  const windowMs = windowSeconds * 1000
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs)
}

/**
 * Best-effort cleanup of closed windows. Rows are only readable inside their own
 * window, so leaving them costs storage and nothing else -- hence a small
 * probability per call rather than a cron job.
 */
async function pruneRateLimits(now: Date): Promise<void> {
  if (Math.random() > 0.01) {
    return
  }
  try {
    await getDb().delete(rateLimits).where(lt(rateLimits.expiresAt, now))
  } catch (error) {
    console.error("rate-limit prune failed:", error)
  }
}

/**
 * Fixed-window counter, incremented atomically by a single INSERT ... ON CONFLICT.
 * Two concurrent requests cannot both read the same count and write count+1,
 * because the increment happens inside the statement rather than in JS.
 *
 * Fixed windows allow a burst of up to 2x the limit across a window boundary.
 * That is an accepted trade for a portfolio contact form -- a sliding window
 * would need either a sorted set or a row per request.
 *
 * **Fails open.** If the database is unreachable, requests are allowed rather
 * than rejected: a broken counter should not take down the contact form. The
 * write the caller goes on to attempt will surface the same outage anyway.
 */
export async function checkRateLimit(
  key: string,
  identifier: string,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = windowStartFor(now, rule.windowSeconds)
  const reset = new Date(windowStart.getTime() + rule.windowSeconds * 1000)
  const retryAfterSeconds = Math.max(1, Math.ceil((reset.getTime() - now.getTime()) / 1000))

  const allow = (remaining: number): RateLimitResult => ({
    ok: true,
    limit: rule.limit,
    remaining,
    reset,
    retryAfterSeconds,
  })

  // No database configured (local dev) -- nothing to count against.
  if (!isDatabaseConfigured()) {
    return allow(rule.limit)
  }

  try {
    const rows = await getDb()
      .insert(rateLimits)
      .values({ bucket: `${key}:${identifier}`, windowStart, count: 1, expiresAt: reset })
      .onConflictDoUpdate({
        target: [rateLimits.bucket, rateLimits.windowStart],
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count })

    const count = rows[0]?.count ?? 1
    void pruneRateLimits(now)

    return {
      ok: count <= rule.limit,
      limit: rule.limit,
      remaining: Math.max(0, rule.limit - count),
      reset,
      retryAfterSeconds,
    }
  } catch (error) {
    console.error("rate-limit check failed, allowing request:", error)
    return allow(rule.limit)
  }
}

/** Draft `RateLimit-*` headers, plus `Retry-After` once the caller is over. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.retryAfterSeconds),
  }
  if (!result.ok) {
    headers["Retry-After"] = String(result.retryAfterSeconds)
  }
  return headers
}
