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

const experiences = [
  {
    id: 1,
    role: "Senior Software Developer",
    company: "TechVision Solutions",
    companyUrl: "https://techvision.example.com",
    location: "Ahmedabad, India",
    duration: "Jan 2024 - Present",
    type: "Full-time",
    description: "Leading development of enterprise-grade web applications and mentoring a team of developers. Driving architectural decisions and implementing best practices across projects.",
    responsibilities: [
      "Architecting and developing scalable microservices using Node.js and NestJS",
      "Leading a team of 5 developers, conducting code reviews and mentoring sessions",
      "Implementing CI/CD pipelines and DevOps practices for streamlined deployments",
      "Collaborating with product managers to define technical requirements and timelines",
      "Optimizing application performance and database queries for high-traffic systems",
    ],
    achievements: [
      "Reduced API response time by 60% through query optimization and caching strategies",
      "Successfully delivered 3 major product launches within tight deadlines",
      "Implemented automated testing that increased code coverage from 45% to 85%",
      "Mentored 2 junior developers who were promoted to mid-level positions",
    ],
    technologies: ["React", "Next.js", "Node.js", "NestJS", "PostgreSQL", "Redis", "Docker", "AWS"],
    color: "from-violet-500 to-purple-500",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Digital Dynamics",
    companyUrl: "https://digitaldynamics.example.com",
    location: "Ahmedabad, India",
    duration: "Jun 2022 - Dec 2023",
    type: "Full-time",
    description: "Developed and maintained multiple client-facing web applications using modern JavaScript frameworks. Worked in an agile environment with cross-functional teams.",
    responsibilities: [
      "Building responsive and performant frontend applications using React and Next.js",
      "Designing and implementing RESTful APIs with Node.js and Express",
      "Managing MongoDB and PostgreSQL databases with efficient schema designs",
      "Integrating third-party services and payment gateways (Stripe, Razorpay)",
      "Writing comprehensive unit and integration tests using Jest and Cypress",
    ],
    achievements: [
      "Built an e-commerce platform serving 50,000+ monthly active users",
      "Migrated legacy jQuery codebase to React, improving performance by 40%",
      "Implemented real-time features using WebSockets for live collaboration tools",
      "Received 'Developer of the Quarter' award for exceptional contributions",
    ],
    technologies: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "Tailwind CSS", "Vercel"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    role: "Frontend Developer",
    company: "WebCraft Studios",
    companyUrl: "https://webcraft.example.com",
    location: "Gandhinagar, India",
    duration: "Aug 2020 - May 2022",
    type: "Full-time",
    description: "Focused on creating pixel-perfect, responsive user interfaces and improving frontend performance. Collaborated closely with designers to implement modern UI/UX patterns.",
    responsibilities: [
      "Developing responsive web applications using React and modern CSS frameworks",
      "Implementing complex UI components and animations for enhanced user experience",
      "Collaborating with UI/UX designers to translate Figma designs into code",
      "Optimizing frontend performance through lazy loading and code splitting",
      "Maintaining and updating existing codebases with new features and bug fixes",
    ],
    achievements: [
      "Improved Lighthouse performance score from 65 to 95 across all projects",
      "Created a reusable component library used across 10+ client projects",
      "Reduced page load time by 50% through optimization techniques",
      "Successfully delivered 15+ client projects with 100% client satisfaction",
    ],
    technologies: ["React", "JavaScript", "SASS", "Tailwind CSS", "Redux", "Webpack", "Figma", "Git"],
    color: "from-emerald-500 to-green-500",
  },
  {
    id: 4,
    role: "Junior Web Developer",
    company: "StartUp Hub",
    companyUrl: "https://startuphub.example.com",
    location: "Ahmedabad, India",
    duration: "Jul 2019 - Jul 2020",
    type: "Full-time",
    description: "Started my professional journey as a junior developer, learning industry best practices and contributing to various web development projects in a fast-paced startup environment.",
    responsibilities: [
      "Assisting in frontend development using HTML, CSS, JavaScript, and React",
      "Learning and implementing responsive design principles",
      "Participating in daily standups and sprint planning meetings",
      "Debugging and fixing issues reported by QA team",
      "Documenting code and maintaining technical documentation",
    ],
    achievements: [
      "Quickly learned React and contributed to production code within 2 months",
      "Built an internal dashboard tool that saved 10 hours/week for the ops team",
      "Received positive feedback from senior developers for code quality",
      "Completed AWS Cloud Practitioner certification during tenure",
    ],
    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Bootstrap", "Git", "Firebase", "Jira"],
    color: "from-orange-500 to-amber-500",
  },
]

type Experience = (typeof experiences)[number]

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
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${experience.color} flex items-center justify-center shadow-lg z-10 transition-all duration-500 ${
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
          <div className={`h-1 bg-gradient-to-r ${experience.color}`} />
          
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
            <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 inline-block max-w-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Want to Work Together?</h3>
                <p className="text-muted-foreground mb-6">
                  I'm always open to discussing new opportunities, interesting projects, 
                  or potential collaborations. Let's connect and create something amazing!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild>
                    <a href="#contact">Get In Touch</a>
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
