import { NextResponse, type NextRequest } from "next/server"

import { getPublishedPosts } from "@/lib/posts"
import { checkRateLimit, clientFingerprint, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const rate = await checkRateLimit("posts", clientFingerprint(request), RATE_LIMITS.posts)
  const headers = rateLimitHeaders(rate)

  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests.", retryAfterSeconds: rate.retryAfterSeconds },
      { status: 429, headers }
    )
  }

  try {
    const posts = await getPublishedPosts()
    return NextResponse.json({ posts }, { headers })
  } catch (error) {
    console.error("GET /api/posts failed:", error)
    return NextResponse.json({ error: "Could not load posts" }, { status: 500, headers })
  }
}
