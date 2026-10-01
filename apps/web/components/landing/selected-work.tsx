import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { LandingSection, SectionHeading } from "@/components/landing/section-heading"
import { ImageWithSkeleton } from "@/components/optimized-image"
import { projectsData } from "@/lib/projects-data"

// The three most recent projects; /projects has the rest.
const featured = Object.entries(projectsData)
  .sort(([, a], [, b]) => Number(b.year) - Number(a.year))
  .slice(0, 3)

export function SelectedWork() {
  return (
    <LandingSection id="work">
      <SectionHeading
        index="01"
        eyebrow="Selected work"
        title="Recent projects, with the reasoning behind them."
        link={{ href: "/projects", label: "All projects" }}
      />

      <ol className="divide-y divide-border border-y border-border">
        {featured.map(([slug, project], i) => (
          <li key={slug}>
            <Link
              href={`/projects/${slug}`}
              className="group grid gap-6 py-8 md:grid-cols-[4rem_1fr_18rem] md:items-center md:gap-10"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {project.category} · {project.year}
                </p>
                <h3 className="font-display text-3xl md:text-4xl mt-2 flex items-start gap-2">
                  <span className="group-hover:text-primary transition-colors">{project.title}</span>
                  <ArrowUpRight className="h-6 w-6 shrink-0 mt-1 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </h3>
                <p className="text-muted-foreground leading-relaxed mt-3 max-w-xl line-clamp-2">
                  {project.subtitle}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {project.techStack.frontend.slice(0, 3).join(" · ")}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <ImageWithSkeleton
                  src={project.thumbnail}
                  alt=""
                  aspectRatio="16/10"
                  className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </LandingSection>
  )
}
