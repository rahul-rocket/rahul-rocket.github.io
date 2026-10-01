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
  /** Shown in the large "featured" layout on /projects. */
  featured: boolean

  /** Public source only — private repositories would 404 for visitors. */
  github?: string
  demo?: string

  thumbnail: string
  screenshots: ProjectScreenshot[]

  /** Short card blurb for listings. */
  summary: string
  overview: string
  problemStatement: string
  solutionApproach: string[]

  techStack: ProjectTechStack

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
