import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"

import { getPostBySlug, getPublishedPosts } from "@/lib/posts"

/**
 * Post pages are generated from whatever `getPublishedPosts()` returns during
 * `next build` -- the same build-time-only read as /blog. A row added to
 * Postgres after the build has no page until the next deploy.
 */
export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: "Post not found" }
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const published = post.publishedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <article className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-8 -ml-4 gap-2 group">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              All articles
            </Link>
          </Button>

          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={post.publishedAt.toISOString()}>{published}</time>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTimeMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          {/*
            `body` is nullable: the seeded posts in lib/posts.ts carry an excerpt
            only. Rather than render an empty article, say so plainly.
          */}
          {post.body ? (
            <div className="prose-portfolio space-y-4 leading-relaxed">
              {post.body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="p-6 rounded-lg bg-secondary/50 border border-border text-muted-foreground">
              The full text of this article hasn&apos;t been published yet — the
              summary above is all there is for now.
            </p>
          )}
        </article>
      </div>
    </div>
  )
}
