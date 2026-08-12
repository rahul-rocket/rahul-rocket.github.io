"use client"

import { useEffect, useState, useRef } from "react"
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Trophy,
  Building2,
  Rocket
} from "lucide-react"
import { Card, CardContent } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Separator } from "@portfolio/ui/separator"

import { experiences, type Experience } from "@/lib/experience-data"

const ExperienceCard = ({
  experience,
  index,
  isVisible,
}: {
  experience: Experience
  index: number
  isVisible: boolean
}) => {
  const isEven = index % 2 === 0

  return (
    <div
      className={`relative flex flex-col lg:flex-row gap-8 ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      {/* Timeline dot and line */}
      <div className="absolute left-6 lg:left-1/2 transform lg:-translate-x-1/2 flex flex-col items-center">
        <div 
          className={`w-12 h-12 rounded-full bg-linear-to-br ${experience.color} flex items-center justify-center shadow-lg z-10 transition-all duration-500 ${
            isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          style={{ transitionDelay: `${index * 200}ms` }}
        >
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        {index < experiences.length - 1 && (
          <div className="w-0.5 h-full bg-border absolute top-12 left-1/2 -translate-x-1/2" />
        )}
      </div>

      {/* Content card */}
      <div 
        className={`lg:w-1/2 pl-20 lg:pl-0 ${isEven ? "lg:pr-16" : "lg:pl-16"} transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{ transitionDelay: `${index * 200 + 100}ms` }}
      >
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          {/* Gradient top border */}
          <div className={`h-1 bg-linear-to-r ${experience.color}`} />
          
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {experience.type}
                </Badge>
                <h3 className="text-xl font-bold text-foreground">{experience.role}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">{experience.company}</span>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-end">
                  <Calendar className="h-4 w-4" />
                  <span>{experience.duration}</span>
                </div>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{experience.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {experience.description}
            </p>

            <Separator className="my-4" />

            {/* Responsibilities */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Key Responsibilities
              </h4>
              <ul className="space-y-2">
                {experience.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-4" />

            {/* Achievements */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Key Achievements
              </h4>
              <ul className="space-y-2">
                {experience.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Rocket className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-4" />

            {/* Technologies */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Technologies Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty space for timeline alignment */}
      <div className="hidden lg:block lg:w-1/2" />
    </div>
  )
}

export function ExperienceSection() {
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

  // Calculate total years of experience
  const totalYears = new Date().getFullYear() - 2019

  return (
    <section id="experience" className="py-20 md:py-32 bg-secondary/30" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">Career Journey</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              Work <span className="text-gradient">Experience</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              {totalYears}+ years of building web applications and growing as a developer
            </p>
          </div>

          {/* Experience stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {[
              { label: "Years Experience", value: `${totalYears}+` },
              { label: "Companies", value: "4" },
              { label: "Projects Delivered", value: "50+" },
              { label: "Technologies", value: "20+" },
            ].map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line - hidden on mobile, visible on lg */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border" />
            
            {/* Mobile timeline line */}
            <div className="lg:hidden absolute left-6 top-0 w-0.5 h-full bg-border" />

            {/* Experience cards */}
            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <ExperienceCard 
                  key={experience.id}
                  experience={experience}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Card className="bg-linear-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 inline-block max-w-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Want to Work Together?</h3>
                <p className="text-muted-foreground mb-6">
                  I'm always open to discussing new opportunities, interesting projects, 
                  or potential collaborations. Let's connect and create something amazing!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild>
                    <a href="/contact">Get In Touch</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/resume.pdf" download>
                      Download Resume
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
