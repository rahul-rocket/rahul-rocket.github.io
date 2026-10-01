"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Rocket } from "lucide-react"
import { skillCategories } from "@/lib/skills-data"

/** Hover tint for the tech grid, cycled by index. Literal strings so Tailwind can see them. */
const TECH_HOVER = [
  "hover:bg-spectrum-1/10 hover:border-spectrum-1/50",
  "hover:bg-spectrum-2/10 hover:border-spectrum-2/50",
  "hover:bg-spectrum-3/10 hover:border-spectrum-3/50",
] as const

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
          className="h-full bg-linear-to-r from-primary to-spectrum-3 rounded-full transition-all duration-1000 ease-out"
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
                { name: "React", icon: "⚛️" },
                { name: "Next.js", icon: "▲" },
                { name: "TypeScript", icon: "TS", isText: true },
                { name: "Angular", icon: "🅰️" },
                { name: "Tailwind", icon: "🎨" },
                { name: "Node.js", icon: "🟢" },
                { name: "NestJS", icon: "🐱" },
                { name: "REST APIs", icon: "🔌" },
                { name: "PostgreSQL", icon: "🐘" },
                { name: "MongoDB", icon: "🍃" },
                { name: "Supabase", icon: "⚡" },
                { name: "Git", icon: "📦" },
                { name: "GitHub", icon: "🐙" },
                { name: "Docker", icon: "🐳" },
                { name: "CI/CD", icon: "🔄" },
                { name: "Vercel", icon: "▲" },
                { name: "Firebase", icon: "🔥" },
                { name: "AWS", icon: "☁️" },
              ].map((tech, i) => (
                <Card 
                  key={tech.name}
                  className={`group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg ${TECH_HOVER[i % TECH_HOVER.length]}`}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    {tech.isText ? (
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm group-hover:scale-110 transition-transform">
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
            <Card className="bg-linear-to-br from-primary/5 via-background to-spectrum-3/5 border-primary/20 inline-block">
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
