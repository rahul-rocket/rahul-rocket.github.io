import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectBySlug, getAllProjectSlugs, getRelatedProjects } from "@/lib/projects-data"
import { ProjectDetailClient } from "./project-detail-client"

interface ProjectPageProps {
  // Next 15 made route params async; they are awaited before use.
  params: Promise<{ slug: string }>
}

// Generate static params for all projects
export async function generateStaticParams() {
  const slugs = getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }
  
  return {
    title: `${project.title} | Rahul - Software Developer`,
    description: project.overview,
    keywords: [...project.techStack.frontend, ...project.techStack.backend, project.category],
    openGraph: {
      title: project.title,
      description: project.overview,
      images: [project.thumbnail],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.overview,
      images: [project.thumbnail],
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }
  
  const relatedProjects = project.relatedProjects 
    ? getRelatedProjects(project.relatedProjects)
    : []
  
  return <ProjectDetailClient project={project} relatedProjects={relatedProjects} />
}
