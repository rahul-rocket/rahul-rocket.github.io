"use client"

import { useEffect, useState, useRef } from "react"
import { 
  Code2, 
  Lightbulb, 
  Rocket, 
  Users, 
  Award,
  GitBranch,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Target,
  Zap,
  BookOpen,
  Coffee
} from "lucide-react"
import { Card, CardContent } from "@portfolio/ui/card"
import { Badge } from "@portfolio/ui/badge"

const highlights = [
  {
    icon: Code2,
    title: "Clean Architecture",
    description: "Building maintainable, scalable codebases following SOLID principles and best practices",
  },
  {
    icon: Lightbulb,
    title: "Problem Solver",
    description: "Turning complex challenges into elegant, efficient solutions with creative thinking",
  },
  {
    icon: Rocket,
    title: "Modern Tech Stack",
    description: "Staying current with cutting-edge frameworks and tools to deliver optimal results",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Working effectively in agile teams, mentoring juniors, and leading by example",
  },
]

const achievements = [
  {
    icon: Award,
    stat: "50+",
    label: "Projects Delivered",
    description: "Successfully shipped production applications",
  },
  {
    icon: Users,
    stat: "30+",
    label: "Happy Clients",
    description: "Across startups and enterprises",
  },
  {
    icon: GitBranch,
    stat: "500+",
    label: "Git Contributions",
    description: "Open source & private repositories",
  },
  {
    icon: Coffee,
    stat: "5+",
    label: "Years Experience",
    description: "In professional software development",
  },
]

const timeline = [
  {
    year: "2024 - Present",
    title: "Senior Software Developer",
    company: "Leading Tech Projects",
    description: "Architecting scalable solutions, mentoring developers, and driving technical decisions for high-impact products.",
    type: "work",
  },
  {
    year: "2022 - 2024",
    title: "Full Stack Developer",
    company: "Tech Solutions",
    description: "Built and maintained multiple web applications using React, Next.js, and Node.js. Led migration to microservices architecture.",
    type: "work",
  },
  {
    year: "2020 - 2022",
    title: "Frontend Developer",
    company: "Digital Agency",
    description: "Developed responsive UIs and improved performance metrics by 40%. Collaborated with design teams on UX improvements.",
    type: "work",
  },
  {
    year: "2019 - 2020",
    title: "Junior Developer",
    company: "Startup",
    description: "Started professional journey building web applications. Learned agile methodologies and modern development practices.",
    type: "work",
  },
  {
    year: "2015 - 2019",
    title: "B.Tech Computer Engineering",
    company: "Gujarat Technological University",
    description: "Graduated with distinction. Focused on software engineering, algorithms, and web technologies.",
    type: "education",
  },
]

const values = [
  {
    icon: Target,
    title: "Quality First",
    description: "Never compromise on code quality. Every line should be purposeful and maintainable.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    description: "Technology evolves fast. I dedicate time daily to learn new tools and techniques.",
  },
  {
    icon: Heart,
    title: "Open Source",
    description: "Believing in giving back to the community that helped me grow as a developer.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Optimizing for speed and efficiency because user experience matters.",
  },
]

export function AboutSection() {
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
    <section id="about" className="py-20 md:py-32" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">About Me</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              Passionate Developer from{" "}
              <span className="text-gradient">Ahmedabad</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Building digital experiences with clean code and modern technologies
            </p>
          </div>

          {/* Main intro */}
          <div className={`grid lg:grid-cols-5 gap-12 mb-20 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Text content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hello! I'm <strong className="text-foreground">Rahul</strong>, a software developer based in{" "}
                  <strong className="text-foreground">Ahmedabad, India</strong>. With over{" "}
                  <strong className="text-primary">5 years of experience</strong> in web development, 
                  I specialize in building scalable, performant applications using modern technologies.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  My journey in software development began with a curiosity about how websites work, 
                  which evolved into a deep passion for crafting elegant solutions to complex problems. 
                  I believe in writing <strong className="text-foreground">clean, maintainable code</strong> that 
                  stands the test of time.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm particularly focused on <strong className="text-foreground">clean architecture</strong> and{" "}
                  <strong className="text-foreground">scalable systems</strong>. Whether it's building 
                  responsive frontends with React/Next.js or designing robust backend APIs, I approach 
                  every project with attention to detail and a commitment to excellence.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Beyond coding, I'm passionate about <strong className="text-foreground">continuous learning</strong>, 
                  staying updated with the latest frameworks and best practices. I also enjoy contributing 
                  to open-source projects and sharing knowledge with the developer community.
                </p>
              </div>

              {/* Quick info badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Based in Ahmedabad, India
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  5+ Years Experience
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  B.Tech in Computer Engineering
                </Badge>
              </div>
            </div>

            {/* Stats cards - 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {achievements.map((item, index) => (
                <Card 
                  key={index} 
                  className={`group hover:border-primary transition-all duration-300 hover:shadow-lg ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{item.stat}</div>
                    <div className="text-sm font-medium text-foreground mb-1">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Core Values / What I Believe */}
          <div className={`mb-20 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl font-bold text-center mb-8">What Drives Me</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="group hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex p-4 rounded-xl bg-linear-to-br from-primary/10 to-purple-500/10 text-primary group-hover:from-primary group-hover:to-purple-500 group-hover:text-white transition-all">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-lg">{value.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Highlights / What I Do Best */}
          <div className={`mb-20 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl font-bold text-center mb-8">What I Do Best</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {highlights.map((item, index) => (
                <Card key={index} className="group hover:border-primary transition-all duration-300">
                  <CardContent className="p-6 flex gap-4">
                    <div className="shrink-0">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <item.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Career Timeline */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl font-bold text-center mb-12">My Journey</h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />
              
              {/* Timeline items */}
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10">
                      {item.type === "work" ? (
                        <Briefcase className="h-3 w-3 text-primary" />
                      ) : (
                        <GraduationCap className="h-3 w-3 text-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`md:w-1/2 pl-16 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <Card className="hover:border-primary transition-colors inline-block w-full">
                        <CardContent className="p-6">
                          <Badge variant="outline" className="mb-2">
                            {item.year}
                          </Badge>
                          <h4 className="text-xl font-bold mt-2">{item.title}</h4>
                          <p className="text-primary font-medium">{item.company}</p>
                          <p className="text-muted-foreground mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Empty space for opposite side */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Open Source Mindset */}
          <div className={`mt-20 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Card className="bg-linear-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <div className="p-6 rounded-2xl bg-primary/10">
                      <GitBranch className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-3">Open Source Contributor</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      I believe in the power of open source. Contributing to community projects, 
                      sharing knowledge through code, and learning from talented developers worldwide. 
                      Open source has shaped my career, and I'm committed to giving back by contributing 
                      to projects that make developers' lives easier.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                      <Badge variant="secondary">React Ecosystem</Badge>
                      <Badge variant="secondary">Developer Tools</Badge>
                      <Badge variant="secondary">Documentation</Badge>
                      <Badge variant="secondary">Bug Fixes</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
