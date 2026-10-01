/** Domain types for the portfolio content model. */

export interface ProjectScreenshot {
  url: string
  caption: string
}

export interface ProjectTechStack {
  frontend: string[]
  backend: string[]
  services: string[]
  devops: string[]
}

export interface ProjectChallenge {
  challenge: string
  solution: string
}

export interface ProjectResult {
  metric: string
  value: string
  improvement: string
}

export interface ProjectStat {
  label: string
  value: string
}

/**
 * What the author personally did, separate from what the project is. Every
 * stat must be reproducible from `source` (usually a git query).
 */
export interface ProjectContribution {
  stats: ProjectStat[]
  highlights: string[]
  /** How the stats were measured, shown under them. */
  source: string
}

export interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  status: string
  /** Omitted when the timeline isn't known precisely; never guessed. */
  duration?: string
  role: string
  client: string
  year: string
  /** Human-readable span, e.g. "2020 – 2026". Falls back to `year`. */
  period?: string
  /** Shown in the large "featured" layout on /projects. */
  featured: boolean

  /** Public source only — private repositories would 404 for visitors. */
  github?: string
  demo?: string
  /** Docs, website, etc. — anything beyond source and live app. */
  links?: { label: string; href: string }[]

  thumbnail: string
  screenshots: ProjectScreenshot[]

  /** Short card blurb for listings. */
  summary: string
  overview: string
  problemStatement: string
  solutionApproach: string[]

  techStack: ProjectTechStack

  contribution?: ProjectContribution

  /** Every list below may be empty; the detail page hides empty sections. */
  features: string[]
  challenges: ProjectChallenge[]
  learnings: string[]
  /** Measured outcomes only — leave empty rather than estimate. */
  results: ProjectResult[]

  relatedProjects: string[]
}

/** Slug-keyed map of every project. */
export type ProjectsData = Record<string, Project>
