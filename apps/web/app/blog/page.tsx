import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card"
import { Button } from "@portfolio/ui/button"
import { Badge } from "@portfolio/ui/badge"
import { CalendarDays, Clock, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

import { getPublishedPosts } from "@/lib/posts"

// Posts come from Postgres, so this page cannot be baked at build time.
export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const blogPosts = await getPublishedPosts()

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Articles</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Thoughts, tutorials, and insights about software development,
              web technologies, and building great products.
            </p>
          </div>

          {/* Blog Posts */}
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="group hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {post.publishedAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTimeMinutes} min read
                    </span>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="group/btn" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 text-center p-8 rounded-lg bg-secondary/50 border border-border">
            <p className="text-muted-foreground">
              More articles coming soon! Stay tuned for updates on web development,
              software engineering, and technology trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}