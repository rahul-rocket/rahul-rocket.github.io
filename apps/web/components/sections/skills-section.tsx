"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { 
  Server, 
  Database, 
  GitBranch, 
  Cloud,
  Palette,
  Rocket,
} from "lucide-react"

// Skill categories with their technologies
const skillCategories = [
  {
    title: "Frontend",
    icon: Palette,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "hover:border-blue-500/50",
    skills: [
      { name: "React", icon: "⚛️", level: 95 },
      { name: "Next.js", icon: "▲", level: 92 },
      { name: "TypeScript", icon: "TS", level: 90 },
      { name: "Angular", icon: "🅰️", level: 75 },
      { name: "Tailwind CSS", icon: "🎨", level: 95 },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "hover:border-green-500/50",
    skills: [
      { name: "Node.js", icon: "🟢", level: 90 },
      { name: "NestJS", icon: "🐱", level: 85 },
      { name: "REST APIs", icon: "🔌", level: 92 },
    ],
  },
  {
    title: "Database",
    icon: Database,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "hover:border-purple-500/50",
    skills: [
      { name: "PostgreSQL", icon: "🐘", level: 88 },
      { name: "MongoDB", icon: "🍃", level: 85 },
      { name: "Supabase", icon: "⚡", level: 80 },
    ],
  },
  {
    title: "DevOps & Tools",
    icon: GitBranch,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    borderColor: "hover:border-orange-500/50",
    skills: [
      { name: "Git", icon: "📦", level: 95 },
      { name: "GitHub", icon: "🐙", level: 92 },
      { name: "Docker", icon: "🐳", level: 80 },
      { name: "CI/CD", icon: "🔄", level: 82 },
    ],
  },
  {
    title: "Cloud & Deployment",
    icon: Cloud,
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "hover:border-indigo-500/50",
    skills: [
      { name: "Vercel", icon: "▲", level: 90 },
      { name: "Firebase", icon: "🔥", level: 85 },
    ],
  },
]

// All technologies for the floating badges section
const allTechnologies = [
  "JavaScript", "TypeScript", "React", "Next.js", "Angular", "Vue.js",
  "Node.js", "NestJS", "Express", "REST APIs", "GraphQL",
  "PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma",
  "Git", "GitHub", "Docker", "Kubernetes", "CI/CD",
  "Vercel", "AWS", "Firebase", "Netlify",
  "Tailwind CSS", "SASS", "CSS3", "HTML5",
  "Jest", "Cypress", "Testing Library",
  "Figma", "VS Code", "Linux"
]

// Skill bar component
const SkillBar = ({
  name,
  icon,
  level,
  delay,
}: {
  name: string
  icon: string
  level: number
  delay: number
}) => {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), delay)
    return () => clearTimeout(timer)
  }, [level, delay])

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-sm">{name}</span>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
          {level}%
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function SkillsSection() {
  const [isVisible, setIsVisible] = useState(false)
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

  return (
    <section id="skills" className="py-20 md:py-32 bg-secondary/30" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">My Expertise</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              Skills & <span className="text-gradient">Technologies</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              A comprehensive toolkit for building modern, scalable web applications
            </p>
          </div>

          {/* Skills grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {skillCategories.map((category, categoryIndex) => (
              <Card 
                key={category.title}
                className={`group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${category.borderColor} ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${categoryIndex * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${category.bgColor} group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <SkillBar 
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      level={skill.level}
                      delay={isVisible ? (categoryIndex * 100) + (skillIndex * 150) + 300 : 0}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skill cards grid - Alternative visual */}
          <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl font-bold text-center mb-8">Technology Stack</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "React", icon: "⚛️", color: "hover:bg-blue-500/10 hover:border-blue-500/50" },
                { name: "Next.js", icon: "▲", color: "hover:bg-gray-500/10 hover:border-gray-500/50" },
                { name: "TypeScript", icon: "TS", color: "hover:bg-blue-600/10 hover:border-blue-600/50", isText: true },
                { name: "Angular", icon: "🅰️", color: "hover:bg-red-500/10 hover:border-red-500/50" },
                { name: "Tailwind", icon: "🎨", color: "hover:bg-cyan-500/10 hover:border-cyan-500/50" },
                { name: "Node.js", icon: "🟢", color: "hover:bg-green-500/10 hover:border-green-500/50" },
                { name: "NestJS", icon: "🐱", color: "hover:bg-red-600/10 hover:border-red-600/50" },
                { name: "REST APIs", icon: "🔌", color: "hover:bg-purple-500/10 hover:border-purple-500/50" },
                { name: "PostgreSQL", icon: "🐘", color: "hover:bg-blue-700/10 hover:border-blue-700/50" },
                { name: "MongoDB", icon: "🍃", color: "hover:bg-green-600/10 hover:border-green-600/50" },
                { name: "Supabase", icon: "⚡", color: "hover:bg-emerald-500/10 hover:border-emerald-500/50" },
                { name: "Git", icon: "📦", color: "hover:bg-orange-500/10 hover:border-orange-500/50" },
                { name: "GitHub", icon: "🐙", color: "hover:bg-gray-600/10 hover:border-gray-600/50" },
                { name: "Docker", icon: "🐳", color: "hover:bg-blue-500/10 hover:border-blue-500/50" },
                { name: "CI/CD", icon: "🔄", color: "hover:bg-yellow-500/10 hover:border-yellow-500/50" },
                { name: "Vercel", icon: "▲", color: "hover:bg-gray-500/10 hover:border-gray-500/50" },
                { name: "Firebase", icon: "🔥", color: "hover:bg-orange-500/10 hover:border-orange-500/50" },
                { name: "AWS", icon: "☁️", color: "hover:bg-orange-600/10 hover:border-orange-600/50" },
              ].map((tech) => (
                <Card 
                  key={tech.name}
                  className={`group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg ${tech.color}`}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    {tech.isText ? (
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                        {tech.icon}
                      </div>
                    ) : (
                      <span className="text-3xl group-hover:scale-110 transition-transform">{tech.icon}</span>
                    )}
                    <span className="text-sm font-medium">{tech.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All technologies cloud */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl font-bold text-center mb-8">All Technologies</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {allTechnologies.map((tech, index) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-default hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 inline-block">
              <CardContent className="p-8">
                <Rocket className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Always Learning</h3>
                <p className="text-muted-foreground max-w-md">
                  Technology evolves rapidly, and so do I. Currently exploring AI/ML integration 
                  and advanced cloud architectures to build smarter applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
