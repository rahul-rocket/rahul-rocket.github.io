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
  duration: string
  role: string
  client: string
  year: string

  github: string
  demo: string

  thumbnail: string
  screenshots: ProjectScreenshot[]

  overview: string
  problemStatement: string
  solutionApproach: string[]

  techStack: ProjectTechStack

  features: string[]
  challenges: ProjectChallenge[]
  learnings: string[]
  results: ProjectResult[]

  relatedProjects: string[]
}

/** Slug-keyed map of every project. */
export type ProjectsData = Record<string, Project>
