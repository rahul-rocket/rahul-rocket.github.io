"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import {
  ExternalLink,
  Folder,
  Filter,
  X,
  Search,
  ArrowUpRight,
} from "lucide-react"
import { Github } from "@/components/brand-icons"
import { Card, CardContent, CardHeader } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Input } from "@portfolio/ui/input"
import { projectsData } from "@/lib/projects-data"
import type { Project } from "@/lib/types"
import { ProjectCover } from "./project-cover"

/** Card shape for this section, derived from the single source in projects-data. */
interface ProjectListing {
  id: string
  title: string
  description: string
  technologies: string[]
  category: string
  github?: string
  demo?: string
}

const toListing = (project: Project): ProjectListing => ({
  id: project.id,
  title: project.title,
  description: project.summary,
  technologies: [...project.techStack.frontend, ...project.techStack.backend],
  category: project.category,
  github: project.github,
  demo: project.demo,
})

const allProjects = Object.values(projectsData)
const featuredProjects = allProjects.filter((p) => p.featured).map(toListing)
const otherProjects = allProjects.filter((p) => !p.featured).map(toListing)

// All unique technologies for filtering
const allTechnologies = [...new Set(allProjects.flatMap((p) => toListing(p).technologies))].sort()

// Categories for filtering — only those that actually have projects
const categories = ["All", ...new Set(allProjects.map((p) => p.category))]

const FeaturedProjectCard = ({
  project,
  index,
  isVisible,
}: {
  project: ProjectListing
  index: number
  isVisible: boolean
}) => {
  const isEven = index % 2 === 0

  return (
    <div 
      className={`grid lg:grid-cols-2 gap-0 group transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isEven ? "" : "lg:order-2"}`}>
        <div className="aspect-video lg:aspect-auto lg:h-full relative">
          <ProjectCover
            title={project.title}
            category={project.category}
            technologies={project.technologies}
            variant={index}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-background/90" />
          
          {/* Overlay buttons on hover */}
          <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            {project.demo && (
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild className="gap-2 bg-background/10 border-white text-white hover:bg-white hover:text-primary">
              <Link href={`/projects/${project.id}`}>
                Case Study
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 lg:p-8 flex flex-col justify-center ${isEven ? "" : "lg:order-1"}`}>
        <Badge variant="outline" className="w-fit mb-3">
          {project.category}
        </Badge>
        
        <h3 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {project.demo && (
            <Button variant="outline" asChild className="gap-2">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                Live Demo
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button asChild className="gap-2">
            <Link href={`/projects/${project.id}`}>
              Read Case Study
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          {project.github && (
            <Button variant="outline" asChild className="gap-2">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                Source Code
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Other Project Card Component
const ProjectCard = ({
  project,
  isVisible,
  delay,
}: {
  project: ProjectListing
  isVisible: boolean
  delay: number
}) => {
  return (
    <Card 
      className={`group relative h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Folder className="h-6 w-6" />
          </div>
          <div className="flex gap-2">
            {project.github && (
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative z-10 p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {project.demo && (
              <a 
                href={project.demo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative z-10 p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Live Demo"
              >
                <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Badge variant="outline" className="mb-2 text-xs">
          {project.category}
        </Badge>
        <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h4>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Filter projects based on category, technology, and search
  const filterProjects = (projects: ProjectListing[]): ProjectListing[] => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
      const matchesTech = !selectedTech || project.technologies.includes(selectedTech)
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesCategory && matchesTech && matchesSearch
    })
  }

  const filteredFeatured = filterProjects(featuredProjects)
  const filteredOther = filterProjects(otherProjects)

  const clearFilters = () => {
    setSelectedCategory("All")
    setSelectedTech(null)
    setSearchQuery("")
  }

  const hasActiveFilters = selectedCategory !== "All" || selectedTech || searchQuery

  return (
    <section id="projects" className="py-20 md:py-32" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">My Work</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              A collection of projects that showcase my skills and passion for building great software
            </p>
          </div>

          {/* Filters */}
          <div className={`mb-12 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Search and filter toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {[selectedCategory !== "All", selectedTech, searchQuery].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filter options */}
            {showFilters && (
              <Card className="p-4 space-y-4">
                {/* Category filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Technology filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Technology</label>
                  <div className="flex flex-wrap gap-2">
                    {allTechnologies.slice(0, 15).map((tech) => (
                      <Badge
                        key={tech}
                        variant={selectedTech === tech ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Featured Projects */}
          {filteredFeatured.length > 0 && (
            <div className="space-y-8 mb-20">
              {filteredFeatured.map((project, index) => (
                <Card key={project.id} className="overflow-hidden">
                  <FeaturedProjectCard 
                    project={project} 
                    index={index}
                    isVisible={isVisible}
                  />
                </Card>
              ))}
            </div>
          )}

          {/* Other Projects */}
          {filteredOther.length > 0 && (
            <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <h3 className="text-2xl font-bold text-center mb-8">Other Noteworthy Projects</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOther.map((project, index) => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    isVisible={isVisible}
                    delay={400 + index * 100}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredFeatured.length === 0 && filteredOther.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}

          {/* GitHub CTA */}
          <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Card className="bg-linear-to-br from-primary/5 via-background to-spectrum-3/5 border-primary/20 inline-block max-w-2xl">
              <CardContent className="p-8">
                <Github className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Want to See More?</h3>
                <p className="text-muted-foreground mb-6">
                  Check out my GitHub profile for more projects, contributions, 
                  and open-source work. I'm always building something new!
                </p>
                <Button asChild size="lg" className="gap-2">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                    View GitHub Profile
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
