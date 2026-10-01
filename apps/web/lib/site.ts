import { LINKEDIN_URL, X_URL } from "@/lib/contact-channels"
import { GITHUB_URL } from "@/lib/github"

/**
 * Who this site is about, stated once.
 *
 * Every identity string that leaves a page -- `<title>`, Open Graph, the
 * JSON-LD `Person`, `/llms.txt` -- reads from here. Before this module the same
 * facts were typed into the layout, the home page and `seo-utils.ts`, and they
 * had drifted: two unlinked `Person` nodes, two different skill lists, and a
 * fallback URL on a domain this site does not own.
 *
 * The values match `apps/web-v2/src/config/site.ts`. The two apps share no
 * code, so this is a copy, but it is ONE copy per app: a crawler or an LLM that
 * reads both `/` and `/v2/` must not be told two different names.
 */
export const site = {
  name: "Rahul Rocket",
  role: "Full Stack Software Engineer & Software Architect",
  description:
    "I design and deliver production systems end to end, and I can walk you through every decision inside them.",
  location: { locality: "Ahmedabad", region: "Gujarat", country: "India" },
  email: "rahulrathore576@gmail.com",
  /**
   * Absolute, no trailing slash. CI sets NEXT_PUBLIC_BASE_URL to the same
   * value; the fallback exists so a local build emits correct URLs too.
   */
  url: (process.env.NEXT_PUBLIC_BASE_URL || "https://rahul-rocket.github.io").replace(/\/$/, ""),
  sameAs: [GITHUB_URL, LINKEDIN_URL, X_URL],
  /** The handle in X_URL, for `twitter:creator`. */
  xHandle: `@${new URL(X_URL).pathname.replace(/^\//, "")}`,
  knowsAbout: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "MongoDB",
    "Software Architecture",
  ],
} as const

/** `site.url` + a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`
}
