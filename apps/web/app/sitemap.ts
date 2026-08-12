import { getAllProjectSlugs } from "@/lib/projects-data"
import { getPublishedPosts } from "@/lib/posts"
import { legalItems } from "@/lib/search-index"

/**
 * `output: export` requires every metadata route to declare that it is
 * static. These read `process.env` at module scope, which is enough for Next to
 * treat the route as dynamic and fail the export rather than guess.
 */
export const dynamic = "force-static"

export default async function sitemap() {
  // The apex of the Pages site. `apps/web-v2` publishes its own sitemap at
  // /v2/sitemap.xml and its routes are deliberately absent from this one.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul-rocket.github.io"
  
  // Get all project slugs
  const projectSlugs = getAllProjectSlugs()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
  
  // Project pages
  const projectPages = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  // Post pages, from the same build-time read that generates them
  const posts = await getPublishedPosts()
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }))

  // Legal + the human-readable index, from the same list the footer renders
  const legalPages = legalItems.map((item) => ({
    url: `${baseUrl}${item.href}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  }))

  return [...staticPages, ...projectPages, ...postPages, ...legalPages]
}
