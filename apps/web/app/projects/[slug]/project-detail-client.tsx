"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  ExternalLink,
  GitCommitHorizontal,
  Layers,
  Lock,
  Server,
  Settings,
  TrendingUp,
  User,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Github } from "@/components/brand-icons"
import { Card, CardContent } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Separator } from "@portfolio/ui/separator"

import type { Project, ProjectContribution, ProjectScreenshot, ProjectTechStack } from "@/lib/types"

// Screenshot Gallery Component
function ScreenshotGallery({ screenshots }: { screenshots: ProjectScreenshot[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const current = screenshots[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={current?.url}
            alt={current?.caption ?? ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-4 py-2 rounded-full">
              Click to enlarge
            </span>
          </div>
          
          {/* Navigation arrows */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption */}
        <p className="text-sm text-muted-foreground text-center">
          {current?.caption}
        </p>

        {/* Thumbnails */}
        {screenshots.length > 1 && (
          <div className="flex gap-2 justify-center">
            {screenshots.map((screenshot, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? "border-primary" 
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={screenshot.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <img
            src={current?.url}
            alt={current?.caption ?? ""}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {screenshots.length} - {current?.caption}
          </div>
        </div>
      )}
    </>
  )
}

const TECH_GROUPS: { key: keyof ProjectTechStack; label: string; icon: LucideIcon }[] = [
  { key: "frontend", label: "Frontend", icon: Layers },
  { key: "backend", label: "Backend & data", icon: Server },
  { key: "services", label: "Services & integrations", icon: Cloud },
  { key: "devops", label: "Tooling & DevOps", icon: Settings },
]

function SectionHeading({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
      {Icon ? <Icon className="h-6 w-6 text-primary" aria-hidden /> : <span className="w-8 h-1 bg-primary rounded-full" aria-hidden />}
      {children}
    </h2>
  )
}

function ContributionSection({ contribution }: { contribution: ProjectContribution }) {
  return (
    <section aria-labelledby="contribution">
      <SectionHeading icon={GitCommitHorizontal}>
        <span id="contribution">My Contribution</span>
      </SectionHeading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {contribution.stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary tabular-nums">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {contribution.highlights.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-6">
          {contribution.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground mt-4">Measured with: {contribution.source}</p>
    </section>
  )
}

/** Sticky sidebar: everything a skimming reader wants without scrolling. */
function ProjectFacts({ project }: { project: Project }) {
  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: User, label: "Role", value: project.role },
    { icon: Briefcase, label: "Organisation", value: project.client },
    { icon: Calendar, label: "Period", value: project.period ?? project.year },
  ]

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <dl className="space-y-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3">
              <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <Separator />

        <div className="space-y-2">
          {project.github ? (
            <Button asChild className="w-full justify-start gap-2">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View source on GitHub
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" aria-hidden />
              Private repository — happy to walk through it.
            </p>
          )}
          {project.demo && (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Live app
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          )}
          {project.links?.map((link) => (
            <Button key={link.href} asChild variant="ghost" className="w-full justify-start gap-2">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4" />
                {link.label}
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Technology</h2>
          {TECH_GROUPS.filter(({ key }) => project.techStack[key].length > 0).map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground mb-2">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack[key].map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="aspect-video overflow-hidden">
          <img
            src={project.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{project.category}</Badge>
          <h3 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

interface ProjectDetailClientProps {
  project: Project
  relatedProjects: Project[]
}

export function ProjectDetailClient({ project, relatedProjects }: ProjectDetailClientProps) {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" asChild className="mb-6 -ml-4">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All projects
            </Link>
          </Button>

          {/* Hero: text and cover side by side, so the title never sits on an image */}
          <header className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{project.category}</Badge>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
              <p className="text-xl text-muted-foreground">{project.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">{project.summary}</p>
            </div>
            <div className="rounded-xl overflow-hidden border shadow-sm aspect-[1200/630]">
              <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          </header>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 mt-12">
            <aside className="lg:order-2">
              <div className="lg:sticky lg:top-24">
                <ProjectFacts project={project} />
              </div>
            </aside>

            <div className="space-y-14 lg:order-1 min-w-0">
              <section>
                <SectionHeading>Overview</SectionHeading>
                <p className="text-lg text-muted-foreground leading-relaxed">{project.overview}</p>
              </section>

              {project.contribution && <ContributionSection contribution={project.contribution} />}

              <section>
                <SectionHeading>The Problem</SectionHeading>
                <p className="text-muted-foreground leading-relaxed border-l-4 border-warning/50 pl-4">
                  {project.problemStatement}
                </p>
              </section>

              {project.solutionApproach.length > 0 && (
                <section>
                  <SectionHeading>Approach</SectionHeading>
                  <ol className="space-y-3">
                    {project.solutionApproach.map((approach, index) => (
                      <li key={approach} className="flex gap-3">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <p className="text-muted-foreground pt-1">{approach}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {project.features.length > 0 && (
                <section>
                  <SectionHeading icon={CheckCircle2}>Key Features</SectionHeading>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.challenges.length > 0 && (
                <section>
                  <SectionHeading>Challenges & Solutions</SectionHeading>
                  <div className="space-y-4">
                    {project.challenges.map((item) => (
                      <Card key={item.challenge}>
                        <CardContent className="p-6 space-y-3">
                          <div>
                            <span className="text-xs font-medium text-warning uppercase tracking-wide">Challenge</span>
                            <p className="font-medium mt-1">{item.challenge}</p>
                          </div>
                          <Separator />
                          <div>
                            <span className="text-xs font-medium text-success uppercase tracking-wide">Solution</span>
                            <p className="text-muted-foreground mt-1">{item.solution}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {project.learnings.length > 0 && (
                <section>
                  <SectionHeading>Key Learnings</SectionHeading>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    {project.learnings.map((learning) => (
                      <li key={learning}>{learning}</li>
                    ))}
                  </ul>
                </section>
              )}

              {project.results.length > 0 && (
                <section>
                  <SectionHeading icon={TrendingUp}>Results & Impact</SectionHeading>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.results.map((result) => (
                      <Card key={result.metric} className="text-center">
                        <CardContent className="p-6">
                          <div className="text-3xl font-bold text-primary mb-1">{result.value}</div>
                          <div className="font-medium text-sm">{result.metric}</div>
                          <div className="text-xs text-muted-foreground mt-1">{result.improvement}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {project.screenshots.length > 0 && (
                <section>
                  <SectionHeading>Screenshots</SectionHeading>
                  <ScreenshotGallery screenshots={project.screenshots} />
                </section>
              )}
            </div>
          </div>

          {relatedProjects.length > 0 && (
            <section className="mt-20">
              <SectionHeading>Related Projects</SectionHeading>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject) => (
                  <RelatedProjectCard key={relatedProject.id} project={relatedProject} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Questions about this project?</p>
            <Button asChild>
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
