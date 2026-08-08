"use client"

import { useEffect, useState, useRef } from "react"
import { 
  ExternalLink, 
  Github, 
  Folder,
  Star,
  GitFork,
  Filter,
  X,
  Search,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Input } from "@portfolio/ui/input"

// Featured projects with detailed info
const featuredProjects = [
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce platform with real-time inventory management, secure payment processing via Stripe, and an intuitive admin dashboard. Features include product search, filters, cart management, and order tracking.",
    longDescription: "Built a scalable e-commerce solution serving 50,000+ monthly active users with features like real-time inventory sync, multi-payment gateway support, and comprehensive analytics dashboard.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.example.com",
    featured: true,
    stats: { stars: 128, forks: 34 },
  },
  {
    id: "task-management-app",
    title: "TaskFlow - Project Management",
    description: "A collaborative project management tool with real-time updates, drag-and-drop kanban boards, team collaboration features, and automated workflow management.",
    longDescription: "Developed a Trello-like project management application with real-time collaboration, custom workflows, and integrations with Slack and GitHub.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=500&fit=crop",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Redux", "Material-UI"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.example.com",
    featured: true,
    stats: { stars: 89, forks: 21 },
  },
  {
    id: "ai-content-generator",
    title: "AI Content Studio",
    description: "An AI-powered content generation platform that helps create blog posts, social media content, marketing copy, and product descriptions using advanced language models.",
    longDescription: "Built an AI content platform leveraging OpenAI GPT models for generating high-quality marketing content with tone customization and brand voice settings.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    technologies: ["Next.js", "TypeScript", "OpenAI", "Supabase", "Tailwind CSS", "Vercel"],
    category: "AI/ML",
    github: "https://github.com",
    demo: "https://demo.example.com",
    featured: true,
    stats: { stars: 256, forks: 67 },
  },
  {
    id: "real-estate-portal",
    title: "PropertyHub - Real Estate",
    description: "A modern real estate listing platform with advanced search filters, map integration, virtual tours, and mortgage calculator. Features agent dashboards and lead management.",
    longDescription: "Developed a comprehensive real estate platform with Google Maps integration, 3D virtual tours, and AI-powered property recommendations.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Google Maps", "AWS"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.example.com",
    featured: true,
    stats: { stars: 67, forks: 18 },
  },
]

// Other notable projects
const otherProjects = [
  {
    id: "weather-dashboard",
    title: "Weather Dashboard",
    description: "Real-time weather application with 7-day forecasts, interactive maps, and location-based alerts.",
    technologies: ["React", "TypeScript", "Weather API", "Chart.js"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Frontend",
  },
  {
    id: "blog-cms",
    title: "Headless Blog CMS",
    description: "A headless CMS for managing blog content with markdown support, image optimization, and SEO tools.",
    technologies: ["Next.js", "Sanity", "GraphQL", "Vercel"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Full Stack",
  },
  {
    id: "fitness-tracker",
    title: "FitTrack Pro",
    description: "Mobile-first fitness tracking app with workout plans, progress charts, and social challenges.",
    technologies: ["React Native", "Firebase", "Redux", "Node.js"],
    github: "https://github.com",
    category: "Mobile",
  },
  {
    id: "chat-application",
    title: "ChatConnect",
    description: "Real-time messaging application with video calls, file sharing, and end-to-end encryption.",
    technologies: ["React", "Socket.io", "WebRTC", "Node.js", "MongoDB"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Full Stack",
  },
  {
    id: "expense-tracker",
    title: "ExpenseWise",
    description: "Personal finance management app with budget tracking, expense categorization, and visual reports.",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Chart.js"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Full Stack",
  },
  {
    id: "portfolio-template",
    title: "DevFolio Template",
    description: "Open-source developer portfolio template with dark mode, animations, and easy customization.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Frontend",
  },
  {
    id: "api-gateway",
    title: "API Gateway Service",
    description: "Microservices API gateway with rate limiting, authentication, and request routing.",
    technologies: ["Node.js", "NestJS", "Redis", "Docker", "Kubernetes"],
    github: "https://github.com",
    category: "Backend",
  },
  {
    id: "code-snippet-manager",
    title: "SnippetVault",
    description: "Developer tool for organizing, searching, and sharing code snippets with syntax highlighting.",
    technologies: ["React", "Node.js", "MongoDB", "Prism.js"],
    github: "https://github.com",
    demo: "https://demo.example.com",
    category: "Developer Tools",
  },
]

// All unique technologies for filtering
const allTechnologies = [...new Set([
  ...featuredProjects.flatMap(p => p.technologies),
  ...otherProjects.flatMap(p => p.technologies)
])].sort()

// Categories for filtering
const categories = ["All", "Full Stack", "Frontend", "Backend", "Mobile", "AI/ML", "Developer Tools"]

// Featured Project Card Component
type FeaturedProject = (typeof featuredProjects)[number]
type OtherProject = (typeof otherProjects)[number]

const FeaturedProjectCard = ({
  project,
  index,
  isVisible,
}: {
  project: FeaturedProject
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
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background/90" />
          
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
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                Code
              </a>
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

        {/* Stats */}
        {project.stats && (
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {project.stats.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {project.stats.forks}
            </span>
          </div>
        )}

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
            <Button asChild className="gap-2">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                View Project
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="outline" asChild className="gap-2">
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              Source Code
            </a>
          </Button>
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
  project: OtherProject
  isVisible: boolean
  delay: number
}) => {
  return (
    <Card 
      className={`group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 overflow-hidden ${
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
                className="p-2 rounded-full hover:bg-secondary transition-colors"
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
                className="p-2 rounded-full hover:bg-secondary transition-colors"
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
          {project.title}
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
  const filterProjects = <T extends FeaturedProject | OtherProject>(projects: T[]): T[] => {
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
            <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 inline-block max-w-2xl">
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
