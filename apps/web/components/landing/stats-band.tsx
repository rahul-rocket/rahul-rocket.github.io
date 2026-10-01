import { Briefcase, Code2, Rocket, Users } from "lucide-react"

import { experiences } from "@/lib/experience-data"
import { projectsData } from "@/lib/projects-data"

/**
 * Counts are derived from the content rather than typed in, so they cannot
 * drift away from the /experience and /projects pages.
 */
const projectCount = Object.keys(projectsData).length
const technologyCount = new Set(
  experiences.flatMap((experience) => experience.technologies)
).size
const yearsOfExperience = new Date().getFullYear() - 2019

const stats = [
  {
    icon: Briefcase,
    value: `${yearsOfExperience}+`,
    label: "Years building for the web",
  },
  {
    icon: Rocket,
    value: `${projectCount}`,
    label: "Projects shipped end to end",
  },
  {
    icon: Code2,
    value: `${technologyCount}+`,
    label: "Technologies worked with",
  },
  {
    icon: Users,
    value: `${experiences.length}`,
    label: "Teams contributed to",
  },
]

export function StatsBand() {
  return (
    <section id="highlights" className="scroll-mt-20 border-y border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            /* One wrapping <div> per group is all a <dl> allows, so the icon
               lives in the <dd> (decorative, hidden) and the reversed column
               puts the number above its term on screen. */
            <div key={stat.label} className="flex flex-col-reverse items-center text-center">
              <dt className="text-sm text-muted-foreground mt-1">{stat.label}</dt>
              <dd className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-3xl md:text-4xl font-bold text-gradient">
                  {stat.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
