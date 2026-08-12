import Link from "next/link"
import { ArrowRight, Layers, Server, Gauge } from "lucide-react"
import { Button } from "@portfolio/ui/button"
import { Card, CardContent } from "@portfolio/ui/card"

import { SectionHeading } from "@/components/landing/section-heading"

const services = [
  {
    icon: Layers,
    title: "Frontend engineering",
    description:
      "Accessible, responsive interfaces in React and Next.js — typed end to end, styled with Tailwind, and built to stay maintainable as the product grows.",
    highlights: ["React & Next.js", "TypeScript", "Design systems"],
    accent: "from-blue-500 to-cyan-500",
  },
  {
    icon: Server,
    title: "Backend & APIs",
    description:
      "Node.js and NestJS services with well-modelled Postgres and MongoDB schemas, clean boundaries, and REST APIs that are pleasant to consume.",
    highlights: ["Node.js & NestJS", "PostgreSQL", "REST APIs"],
    accent: "from-green-500 to-emerald-500",
  },
  {
    icon: Gauge,
    title: "Performance & delivery",
    description:
      "Profiling slow pages and slow queries, tightening the feedback loop with CI/CD, and shipping to production without the deploy being an event.",
    highlights: ["Core Web Vitals", "Caching", "CI/CD"],
    accent: "from-orange-500 to-red-500",
  },
]

export function WhatIDo() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="What I Do"
          title={
            <>
              Three things I&apos;m <span className="text-gradient">good at</span>
            </>
          }
          description="Most of my work sits somewhere across these three — usually all of them on the same project."
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-1 bg-linear-to-r ${service.accent}`} />
              <CardContent className="p-6 space-y-4">
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-br ${service.accent} text-white shadow-lg`}
                >
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {service.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="rounded-full px-8 gap-2 group">
            <Link href="/skills">
              See the full stack
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
