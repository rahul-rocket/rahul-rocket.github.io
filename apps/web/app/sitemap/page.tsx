import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"

import { getPublishedPosts } from "@/lib/posts"
import { projectsData } from "@/lib/projects-data"
import { legalItems, pageItems } from "@/lib/search-index"

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on this site, in one list.",
  alternates: { canonical: "/sitemap" },
}

/**
 * The human-readable index. app/sitemap.ts is the machine-readable one and
 * emits /sitemap.xml -- the two coexist because this route builds to
 * out/sitemap/index.html.
 */
export const dynamic = "force-static"

function LinkList({
  items,
}: {
  items: { href: string; label: string; description?: string }[]
}) {
  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors h-full"
          >
            <span className="font-semibold">{item.label}</span>
            {item.description ? (
              <span className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function SitemapPage() {
  const posts = await getPublishedPosts()

  const projectLinks = Object.entries(projectsData).map(([slug, project]) => ({
    href: `/projects/${slug}`,
    label: project.title,
    description: project.subtitle,
  }))

  const postLinks = posts.map((post) => ({
    href: `/blog/${post.slug}`,
    label: post.title,
    description: `${post.readTimeMinutes} min read`,
  }))

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Sitemap</span>
          </nav>

          <header className="mb-10">
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">Index</span>
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Sitemap</h1>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Every page on the site. The machine-readable version lives at{" "}
              <a
                href="/sitemap.xml"
                className="text-primary underline underline-offset-2"
              >
                /sitemap.xml
              </a>
              .
            </p>
          </header>

          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold mb-4">Pages</h2>
              <LinkList items={pageItems} />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Projects</h2>
              <LinkList items={projectLinks} />
            </section>

            {postLinks.length > 0 ? (
              <section>
                <h2 className="text-xl font-bold mb-4">Articles</h2>
                <LinkList items={postLinks} />
              </section>
            ) : null}

            <section>
              <h2 className="text-xl font-bold mb-4">Legal</h2>
              <LinkList items={legalItems} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
