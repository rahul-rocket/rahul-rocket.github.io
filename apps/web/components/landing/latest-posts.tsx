import Link from "next/link"

import { LandingSection, SectionHeading } from "@/components/landing/section-heading"
import { getPublishedPosts } from "@/lib/posts"

/**
 * Like /blog, this reads Postgres at build time only -- see the note in
 * app/blog/page.tsx.
 */
export async function LatestPosts() {
  const posts = (await getPublishedPosts()).slice(0, 3)

  if (posts.length === 0) {
    return null
  }

  return (
    <LandingSection>
      <SectionHeading
        index="04"
        eyebrow="Writing"
        title="Notes from building things."
        link={{ href: "/blog", label: "All posts" }}
      />

      <ul className="divide-y divide-border border-y border-border">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group grid gap-2 py-6 md:grid-cols-[14rem_1fr_auto] md:items-baseline md:gap-10"
            >
              <time
                dateTime={post.publishedAt.toISOString()}
                className="text-sm text-muted-foreground"
              >
                {post.publishedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <h3 className="font-bold text-2xl group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {post.readTimeMinutes} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </LandingSection>
  )
}
