"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Calendar,
  User,
  Clock,
  Briefcase,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Server,
  Cloud,
  Settings
} from "lucide-react"
import { Card, CardContent } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Separator } from "@portfolio/ui/separator"

import type { Project, ProjectScreenshot, ProjectTechStack } from "@/lib/types"

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

// Tech Stack Section Component
function TechStackSection({ techStack }: { techStack: ProjectTechStack }) {
  const categories: {
    key: keyof ProjectTechStack
    label: string
    icon: typeof Layers
    color: string
  }[] = [
    { key: "frontend", label: "Frontend", icon: Layers, color: "text-blue-500" },
    { key: "backend", label: "Backend", icon: Server, color: "text-green-500" },
    { key: "services", label: "Services & APIs", icon: Cloud, color: "text-purple-500" },
    { key: "devops", label: "DevOps", icon: Settings, color: "text-orange-500" },
  ]

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {categories.map(({ key, label, icon: Icon, color }) => (
        techStack[key] && techStack[key].length > 0 && (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <h4 className="font-semibold">{label}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack[key].map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  )
}

// Related Project Card
function RelatedProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{project.category}</Badge>
          <h4 className="font-semibold group-hover:text-primary transition-colors">
            {project.title}
          </h4>
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
    <div className="min-h-screen pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative">
        {/* Background image with overlay */}
        <div className="absolute inset-0 h-[400px]">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto pt-12">
            {/* Back button */}
            <Button variant="ghost" asChild className="mb-8 -ml-4">
              <Link href="/#projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>

            {/* Project header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{project.category}</Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {project.status}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                {project.title}
              </h1>
              
              <p className="text-xl text-muted-foreground">
                {project.subtitle}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {project.role}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {project.client}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {project.year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {project.duration}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {project.demo && (
                  <Button size="lg" asChild>
                    <a href={project.demo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    View Source
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Screenshots Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Screenshots
            </h2>
            <ScreenshotGallery screenshots={project.screenshots} />
          </div>

          {/* Project Overview */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Project Overview
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project.overview}
            </p>
          </div>

          {/* Problem Statement */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              Problem Statement
            </h2>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {project.problemStatement}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Solution Approach */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Solution Approach
            </h2>
            <div className="space-y-3">
              {project.solutionApproach.map((approach, index) => (
                <div key={index} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground pt-1">{approach}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Tech Stack
            </h2>
            <TechStackSection techStack={project.techStack} />
          </div>

          {/* Key Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Key Features
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {project.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges & Solutions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Challenges & Solutions
            </h2>
            <div className="space-y-4">
              {project.challenges.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-orange-500 uppercase tracking-wide">
                          Challenge
                        </span>
                        <p className="font-medium mt-1">{item.challenge}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-green-500 uppercase tracking-wide">
                          Solution
                        </span>
                        <p className="text-muted-foreground mt-1">{item.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Learnings */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-purple-500" />
              Key Learnings
            </h2>
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {project.learnings.map((learning, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-purple-500">•</span>
                      <span className="text-muted-foreground">{learning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results/Impact */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Results & Impact
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.results.map((result, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {result.value}
                    </div>
                    <div className="font-medium text-sm">{result.metric}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.improvement}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-8">
            <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Interested in this project?</h3>
                <p className="text-muted-foreground mb-6">
                  Feel free to check out the live demo or explore the source code.
                  If you have questions, don't hesitate to reach out!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {project.demo && (
                    <Button asChild>
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Live Demo
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/#contact">
                      Contact Me
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-primary rounded-full" />
                Related Projects
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedProjects.map((relatedProject) => (
                  <RelatedProjectCard key={relatedProject.id} project={relatedProject} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
