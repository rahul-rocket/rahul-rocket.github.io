import { projectsData } from "@/lib/projects-data"

/**
 * What the command palette can jump to. Built from the same content modules the
 * pages render, so an entry can never point at something that isn't there.
 *
 * `keywords` is extra matching text -- cmdk searches it alongside the label but
 * never displays it.
 */
export interface SearchItem {
  href: string
  label: string
  description: string
  keywords: string[]
}

export const pageItems: SearchItem[] = [
  {
    href: "/",
    label: "Home",
    description: "Overview and highlights",
    keywords: ["landing", "start", "intro", "hero"],
  },
  {
    href: "/about",
    label: "About",
    description: "Background, approach and what I care about",
    keywords: ["bio", "who", "rahul", "ahmedabad"],
  },
  {
    href: "/skills",
    label: "Skills",
    description: "Languages, frameworks and tools",
    keywords: ["stack", "tech", "react", "next", "typescript", "node"],
  },
  {
    href: "/experience",
    label: "Experience",
    description: "Work history and roles",
    keywords: ["work", "jobs", "career", "resume", "cv", "timeline"],
  },
  {
    href: "/projects",
    label: "Projects",
    description: "Case studies of things I've built",
    keywords: ["work", "portfolio", "case study"],
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Articles and notes",
    keywords: ["writing", "posts", "articles"],
  },
  {
    href: "/contact",
    label: "Contact",
    description: "Get in touch",
    keywords: ["email", "hire", "message", "reach out"],
  },
]

/**
 * The footer's legal row, the /sitemap page and sitemap.xml all read this list,
 * so a page cannot appear in one and be missing from another.
 */
export const legalItems: SearchItem[] = [
  {
    href: "/privacy",
    label: "Privacy Policy",
    description: "What is collected, and what is not",
    keywords: ["data", "gdpr", "personal", "legal"],
  },
  {
    href: "/terms",
    label: "Terms of Service",
    description: "The terms that apply to using this site",
    keywords: ["legal", "conditions", "liability", "licence"],
  },
  {
    href: "/cookies",
    label: "Cookie Policy",
    description: "No cookies — one stored theme preference",
    keywords: ["cookies", "storage", "tracking", "consent"],
  },
  {
    href: "/sitemap",
    label: "Sitemap",
    description: "Every page on this site, in one list",
    keywords: ["index", "all pages", "navigation"],
  },
]

export const projectItems: SearchItem[] = Object.entries(projectsData).map(
  ([slug, project]) => ({
    href: `/projects/${slug}`,
    label: project.title,
    description: project.subtitle,
    keywords: [
      project.category,
      project.year,
      ...project.techStack.frontend,
      ...project.techStack.backend,
    ],
  })
)
