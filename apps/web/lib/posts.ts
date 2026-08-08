import { desc, eq } from "drizzle-orm"

import { getDb, isDatabaseConfigured, posts, type Post } from "@/lib/db"

/**
 * Shape the blog UI renders. Deliberately narrower than the `posts` row so the
 * seeded fallback below can satisfy it without inventing ids and timestamps.
 */
export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  body: string | null
  tags: string[]
  readTimeMinutes: number
  publishedAt: Date
}

function toBlogPost(row: Post): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    tags: row.tags,
    readTimeMinutes: row.readTimeMinutes,
    publishedAt: row.publishedAt,
  }
}

/**
 * Seed content, also used verbatim when `DATABASE_URL` is unset so `pnpm dev`
 * and `pnpm build` work with no Neon project attached. Query failures are *not*
 * caught -- a configured-but-broken database should surface, not silently
 * render stale placeholder posts.
 */
export const seedPosts: BlogPost[] = [
  {
    slug: "building-scalable-react-apps-nextjs-14",
    title: "Building Scalable React Applications with Next.js 14",
    excerpt:
      "Learn how to build performant and scalable web applications using the latest features in Next.js 14, including server components and the app router.",
    body: null,
    tags: ["Next.js", "React", "Web Development"],
    readTimeMinutes: 8,
    publishedAt: new Date("2025-01-15T00:00:00Z"),
  },
  {
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices for Modern Web Development",
    excerpt:
      "Discover essential TypeScript patterns and best practices that will help you write cleaner, more maintainable code in your projects.",
    body: null,
    tags: ["TypeScript", "JavaScript", "Best Practices"],
    readTimeMinutes: 6,
    publishedAt: new Date("2025-01-10T00:00:00Z"),
  },
  {
    slug: "mastering-tailwind-css",
    title: "Mastering Tailwind CSS: Tips and Tricks",
    excerpt:
      "Take your Tailwind CSS skills to the next level with these advanced tips, custom configurations, and design patterns.",
    body: null,
    tags: ["CSS", "Tailwind", "Design"],
    readTimeMinutes: 5,
    publishedAt: new Date("2025-01-05T00:00:00Z"),
  },
]

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isDatabaseConfigured()) {
    return seedPosts
  }

  const rows = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt))
    .limit(100)

  return rows.map(toBlogPost)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) {
    return seedPosts.find((post) => post.slug === slug) ?? null
  }

  const rows = await getDb().select().from(posts).where(eq(posts.slug, slug)).limit(1)
  const row = rows[0]
  return row && row.published ? toBlogPost(row) : null
}
