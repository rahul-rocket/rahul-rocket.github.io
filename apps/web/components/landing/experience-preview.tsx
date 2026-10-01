import Link from "next/link"
import { ArrowRight, Building2, Calendar, MapPin } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"
import { Button } from "@portfolio/ui/button"
import { Card, CardContent } from "@portfolio/ui/card"

import { SectionHeading } from "@/components/landing/section-heading"
import { experiences } from "@/lib/experience-data"

// `experiences` is newest-first; the landing page shows the three most recent
// roles and /experience carries the full history.
const recentRoles = experiences.slice(0, 3)

export function ExperiencePreview() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Experience"
          title={
            <>
              Where I&apos;ve <span className="text-gradient">worked</span>
            </>
          }
          description="From a first junior role in 2019 to leading a team today — the short version."
        />

        <ol className="max-w-3xl mx-auto space-y-6">
          {recentRoles.map((role) => (
            <li key={role.id}>
              <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className={`h-1 bg-linear-to-r ${role.color}`} />
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {role.type}
                      </Badge>
                      <h3 className="text-lg font-bold">{role.role}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{role.company}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                      <div className="flex items-center gap-1 sm:justify-end">
                        <Calendar className="h-4 w-4" />
                        <span>{role.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:justify-end mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{role.location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mt-4">
                    {role.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {role.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="rounded-full px-8 gap-2 group">
            <Link href="/experience">
              Full work history
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
