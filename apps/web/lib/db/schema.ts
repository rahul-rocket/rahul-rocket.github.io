import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

/**
 * Messages sent through the contact form. Write-once from the public site;
 * nothing in the app updates a row after it lands.
 */
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    message: text("message").notNull(),
    // Kept for spam triage, not shown anywhere in the UI.
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("contact_submissions_created_at_idx").on(table.createdAt),
  })
)

/**
 * Blog / long-form posts rendered by `/blog`. `tags` is a text[] rather than a
 * join table -- tags are display-only here and never queried on their own.
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    readTimeMinutes: integer("read_time_minutes").notNull().default(5),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    publishedAtIdx: index("posts_published_at_idx").on(table.publishedAt),
  })
)

/**
 * Fixed-window request counters. One row per (route, client, window start);
 * the primary key is what makes the increment atomic via ON CONFLICT.
 *
 * Rows are garbage: they stop being read the moment their window closes.
 * `expiresAt` exists so a periodic sweep can drop them -- see `pruneRateLimits`
 * in `lib/rate-limit.ts`, which the limiter calls opportunistically.
 */
export const rateLimits = pgTable(
  "rate_limits",
  {
    // "<route>:<client>" -- e.g. "contact:a3f9...".
    bucket: varchar("bucket", { length: 200 }).notNull(),
    // Start of the fixed window, truncated to the window size.
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bucket, table.windowStart] }),
    expiresAtIdx: index("rate_limits_expires_at_idx").on(table.expiresAt),
  })
)

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type NewContactSubmission = typeof contactSubmissions.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
