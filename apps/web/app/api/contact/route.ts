import { NextResponse, type NextRequest } from "next/server"

import { contactSubmissions, getDb } from "@/lib/db"
import { checkRateLimit, clientFingerprint, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactPayload {
  name: string
  email: string
  message: string
}

/**
 * Mirrors the client-side rules in `components/sections/contact-section.tsx`.
 * The client copy is for feedback; this one is the actual gate.
 */
function validate(body: unknown): { data: ContactPayload } | { errors: Record<string, string> } {
  if (typeof body !== "object" || body === null) {
    return { errors: { form: "Expected a JSON object" } }
  }

  const record = body as Record<string, unknown>
  const name = typeof record.name === "string" ? record.name.trim() : ""
  const email = typeof record.email === "string" ? record.email.trim() : ""
  const message = typeof record.message === "string" ? record.message.trim() : ""
  const errors: Record<string, string> = {}

  if (name.length < 2) {
    errors.name = "Name must be at least 2 characters"
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer"
  }

  if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address"
  } else if (email.length > 254) {
    errors.email = "Email must be 254 characters or fewer"
  }

  if (message.length < 10) {
    errors.message = "Message must be at least 10 characters"
  } else if (message.length > 1000) {
    errors.message = "Message must be 1000 characters or fewer"
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }
  return { data: { name, email, message } }
}

export async function POST(request: NextRequest) {
  // Rate limit before parsing the body, so a flood costs as little as possible.
  const fingerprint = clientFingerprint(request)
  const rate = await checkRateLimit("contact", fingerprint, RATE_LIMITS.contact)
  const headers = rateLimitHeaders(rate)

  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Too many messages sent. Please try again later.",
        retryAfterSeconds: rate.retryAfterSeconds,
      },
      { status: 429, headers }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = validate(body)
  if ("errors" in result) {
    return NextResponse.json({ errors: result.errors }, { status: 400, headers })
  }

  try {
    const db = getDb()
    const [row] = await db
      .insert(contactSubmissions)
      .values({
        ...result.data,
        // Same salted hash the limiter keys on, so submissions and rate-limit
        // buckets line up when triaging spam.
        ipHash: fingerprint,
        userAgent: request.headers.get("user-agent"),
      })
      .returning({ id: contactSubmissions.id, createdAt: contactSubmissions.createdAt })

    return NextResponse.json({ id: row?.id, createdAt: row?.createdAt }, { status: 201, headers })
  } catch (error) {
    console.error("POST /api/contact failed:", error)
    return NextResponse.json({ error: "Could not save your message" }, { status: 500, headers })
  }
}
