import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"
import { Button } from "@portfolio/ui/button"

import { experiences } from "@/lib/experience-data"
import { projectsData } from "@/lib/projects-data"

/**
 * Counts are derived from the content rather than typed in, so they cannot
 * drift away from the /experience and /projects pages.
 */
const CAREER_START_YEAR = 2019
const stats = [
  { value: `${new Date().getFullYear() - CAREER_START_YEAR}+`, label: "years shipping" },
  { value: `${Object.keys(projectsData).length}`, label: "projects delivered" },
  { value: `${experiences.length}`, label: "teams" },
]

/**
 * Server-rendered on purpose: the previous hero was a client component only
 * to drive an entrance fade, which cost hydration on the most important
 * paint of the site. The CSS `animate-in` utilities do the same without JS.
 */
export function Hero() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 max-w-6xl pt-28 pb-20 md:pt-40 md:pb-28">
        <p className="flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in duration-700">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Open to full-time roles and freelance projects
        </p>

        <h1 className="font-display mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
          Rahul builds web products{" "}
          <em className="text-primary">end to end</em>
          <span className="text-muted-foreground"> — interface, API, and the pipeline that ships them.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in duration-1000">
          Senior software developer in Ahmedabad, India. React, Next.js, TypeScript and
          Node — written to be read by the next engineer, and measured by what it does
          for the people using it.
        </p>

        {/* Two audiences, two doors: hiring teams and clients. */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-in fade-in duration-1000">
          <Button size="lg" asChild className="rounded-full px-7 gap-2 group">
            <Link href="/contact">
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-full px-7">
            <Link href="/experience">Hiring? See my experience</Link>
          </Button>
        </div>

        <dl className="mt-20 grid grid-cols-3 max-w-xl border-t border-border pt-6">
          {stats.map((stat) => (
            // Reversed so the term precedes its definition in the DOM while
            // the number reads first on screen.
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {stat.label}
              </dt>
              <dd className="font-display text-4xl md:text-5xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <a
          href="#work"
          className="mt-16 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowDown className="h-4 w-4" />
          Selected work
        </a>
      </div>
    </section>
  )
}
