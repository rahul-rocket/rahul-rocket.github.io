import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Card, CardContent } from "@portfolio/ui/card"

import { SectionHeading } from "@/components/landing/section-heading"
import { ImageWithSkeleton } from "@/components/optimized-image"
import { projectsData } from "@/lib/projects-data"

// The three most recent projects; /projects has the rest.
const featured = Object.entries(projectsData)
  .sort(([, a], [, b]) => Number(b.year) - Number(a.year))
  .slice(0, 3)

export function FeaturedProjects() {
  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Featured Work"
          title={
            <>
              Recent <span className="text-gradient">projects</span>
            </>
          }
          description="A few things I've built recently — each one has a full write-up covering the problem, the approach, and what came out of it."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featured.map(([slug, project]) => (
            <Card
              key={slug}
              className="group h-full overflow-hidden pt-0 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Link href={`/projects/${slug}`} className="block">
                <ImageWithSkeleton
                  src={project.thumbnail}
                  alt={project.title}
                  aspectRatio="16/10"
                  className="w-full"
                />
              </Link>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{project.category}</Badge>
                  <Badge variant="outline">{project.year}</Badge>
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  <Link href={`/projects/${slug}`}>{project.title}</Link>
                </h3>
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {project.subtitle}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.techStack.frontend.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/projects/${slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary pt-2"
                >
                  Read the case study
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild className="rounded-full px-8 gap-2 group">
            <Link href="/projects">
              View all projects
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
