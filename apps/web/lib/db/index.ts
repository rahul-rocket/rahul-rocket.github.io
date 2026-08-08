import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

export * from "./schema"

/**
 * True when a Neon connection string is configured. Callers that have a sensible
 * offline story (the blog falling back to seeded posts) check this first; callers
 * that do not (the contact endpoint) let `getDb()` throw.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined

/**
 * Neon's HTTP driver holds no long-lived socket, so there is no pool to manage
 * across serverless invocations -- the cache here just avoids re-parsing the URL.
 */
export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("DATABASE_URL is not set")
    }
    cached = drizzle(neon(url), { schema })
  }
  return cached
}
