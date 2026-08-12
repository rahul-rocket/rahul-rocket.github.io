import Link from "next/link"
import { ArrowRight, CalendarDays, Clock } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Card, CardContent } from "@portfolio/ui/card"

import { SectionHeading } from "@/components/landing/section-heading"
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
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Writing"
          title={
            <>
              From the <span className="text-gradient">blog</span>
            </>
          }
          description="Notes on the things I run into while building — architecture, tooling, and the occasional debugging story."
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.map((post) => (
            <Card
              key={post.slug}
              className="group h-full hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {post.publishedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTimeMinutes} min read
                  </span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="rounded-full px-8 gap-2 group">
            <Link href="/blog">
              Read the blog
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
