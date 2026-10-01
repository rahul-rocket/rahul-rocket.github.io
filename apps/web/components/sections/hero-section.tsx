import type { CSSProperties } from "react"
import { ArrowRight, Mail, ChevronDown, Bot, Sparkles, Workflow } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { Button } from "@portfolio/ui/button"
import { Badge } from "@portfolio/ui/badge"
import Link from "next/link"
import { LINKEDIN_URL } from "@/lib/contact-channels"
import { GITHUB_URL } from "@/lib/github"
import { AiCoreIllustration } from "./ai-core-illustration"

const techStack = [
  { name: "React", color: "bg-spectrum-1/10 text-foreground border-spectrum-1/20" },
  { name: "Next.js", color: "bg-muted text-foreground border-border" },
  { name: "TypeScript", color: "bg-spectrum-2/10 text-foreground border-spectrum-2/20" },
  { name: "Backend", color: "bg-spectrum-3/10 text-foreground border-spectrum-3/20" },
  { name: "APIs", color: "bg-spectrum-1/10 text-foreground border-spectrum-1/20" },
]

/** Stagger slot for the CSS `hero-rise` entrance. */
const rise = (i: number) => ({ "--i": i }) as CSSProperties

/** Chips orbiting the illustration — AI capabilities, not emoji. */
const floatingChips = [
  { label: "LLM apps", Icon: Sparkles, className: "-top-2 -right-6", delay: "0s" },
  { label: "AI agents", Icon: Bot, className: "top-1/2 -left-20", delay: "1.2s" },
  { label: "Automation", Icon: Workflow, className: "-bottom-2 right-4", delay: "2.4s" },
] as const

// A server component: the entrance is pure CSS (`hero-rise` in globals.css),
// so nothing here waits on hydration to become visible.
export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-spectrum-3/5" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-spectrum-3/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-spectrum-2/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Content */}
          <div
            className="space-y-8 text-center lg:text-left"
          >
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border hero-rise"
            style={rise(1)}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-sm text-muted-foreground">Available for opportunities</span>
            </div>

            {/* Main heading with animation */}
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                <span className="block text-foreground">Hi, I'm</span>
                <span className="block text-shine">
                  Rahul
                </span>
                <span className="block text-foreground text-3xl sm:text-4xl lg:text-5xl mt-2">
                  Software Developer
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed hero-rise"
            style={rise(3)}
            >
              Building scalable web applications and AI-powered products with modern technologies.
              Passionate about clean code, great user experiences, and solving complex problems.
            </p>

            {/* Tech stack badges */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-2 hero-rise"
            style={rise(4)}
            >
              {techStack.map((tech, index) => (
                <Badge
                  key={tech.name}
                  variant="outline"
                  className={`${tech.color} px-3 py-1 text-sm font-medium transition-all duration-300 hover:scale-105`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tech.name}
                </Badge>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 hero-rise"
            style={rise(5)}
            >
              <Button size="lg" asChild className="rounded-full px-8 gap-2 group">
                <Link href="/projects">
                  View Projects
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                <Link href="/contact">
                  Contact Me
                </Link>
              </Button>
            </div>

            {/* Social Links */}
            <div
              className="flex justify-center lg:justify-start gap-4 pt-4 hero-rise"
            style={rise(6)}
            >
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="GitHub Profile"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:rahulrathore576@gmail.com"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="Email Me"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right Content - AI core illustration */}
          <div
            className="relative hidden lg:flex items-center justify-center hero-rise"
            style={rise(7)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 to-spectrum-3/25 rounded-full blur-3xl scale-75" />

              <AiCoreIllustration className="relative w-80 h-80 xl:w-104 xl:h-104 drop-shadow-xl" />

              {floatingChips.map(({ label, Icon, className, delay }) => (
                <div
                  key={label}
                  className={`absolute ${className} flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md px-3 py-1.5 text-xs font-medium shadow-lg animate-float`}
                  style={{ animationDelay: delay }}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-rise"
          style={rise(8)}
        >
          {/* The landing page continues below the fold, so this scrolls
              rather than navigating. */}
          <a
            href="#highlights"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}
