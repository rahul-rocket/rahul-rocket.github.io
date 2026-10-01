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
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              {/* Reversed so the term still precedes its definition in the
                  DOM while the number reads first on screen. */}
              <div className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground mt-1">{stat.label}</dt>
                <dd className="text-3xl md:text-4xl font-bold text-gradient">
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
