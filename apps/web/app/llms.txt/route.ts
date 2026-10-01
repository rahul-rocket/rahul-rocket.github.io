import { getPublishedPosts } from "@/lib/posts"
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects-data"
import { pageItems } from "@/lib/search-index"
import { absoluteUrl, site } from "@/lib/site"

/**
 * `/llms.txt` -- https://llmstxt.org. A Markdown index that tells LLM-based
 * tools who this site is about and where the substance is, so an assistant
 * asked about this person reads the pages rather than guessing.
 *
 * It lives in THIS app because the convention is a file at the origin root, and
 * `apps/web` owns the root. `scripts/assemble-pages.mjs` would refuse to let
 * `apps/web-v2` write one here anyway.
 *
 * GENERATED, NOT HAND-WRITTEN. Pages come from the command palette's list,
 * projects from `projects-data`, posts from the same build-time read as
 * `/blog`. A static file in `public/` would be wrong the first time a post was
 * published.
 *
 * `force-static` because `output: 'export'` only accepts route handlers it can
 * run once at build time -- the same reason robots.ts declares it.
 */
export const dynamic = "force-static"

/**
 * `/v2/` is a separate app, so its routes cannot be read from here. These are
 * its stable top-level sections only; a deep link would be the first thing to
 * rot.
 */
const V2_LINKS = [
  { path: "/v2/", label: "Portfolio (v2)", note: "the current, fuller version of this site" },
  { path: "/v2/projects/", label: "Case studies", note: "problem, approach and measured outcome per project" },
  { path: "/v2/resume/", label: "Résumé", note: "" },
  { path: "/v2/blog/", label: "Writing (v2)", note: "" },
] as const

/** One Markdown list item; a note is appended only when there is one. */
function link(label: string, url: string, note: string): string {
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`
}

export async function GET(): Promise<Response> {
  const posts = await getPublishedPosts()
  const projects = getAllProjectSlugs().flatMap((slug) => {
    const project = getProjectBySlug(slug)
    return project ? [{ slug, project }] : []
  })

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.role}, based in ${site.location.locality}, ${site.location.country}. ${site.description}`,
    "",
    `Contact: ${site.email}. Profiles: ${site.sameAs.join(", ")}.`,
    "",
    "## Pages",
    ...pageItems.map((item) => link(item.label, absoluteUrl(item.href), item.description)),
    "",
    "## Projects",
    ...projects.map(({ slug, project }) =>
      link(project.title, absoluteUrl(`/projects/${slug}`), project.subtitle),
    ),
    "",
    "## Writing",
    ...posts.map((post) => link(post.title, absoluteUrl(`/blog/${post.slug}`), post.excerpt)),
    "",
    "## Optional",
    ...V2_LINKS.map((item) => link(item.label, absoluteUrl(item.path), item.note)),
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
