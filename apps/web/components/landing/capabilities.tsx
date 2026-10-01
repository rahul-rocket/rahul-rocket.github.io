import { LandingSection, SectionHeading } from "@/components/landing/section-heading"

const capabilities = [
  {
    title: "Frontend engineering",
    description:
      "Accessible, responsive interfaces in React and Next.js — typed end to end and built to stay maintainable as the product grows.",
    highlights: ["React & Next.js", "TypeScript", "Design systems"],
  },
  {
    title: "Backend & APIs",
    description:
      "Node.js and NestJS services with well-modelled Postgres and MongoDB schemas, clean boundaries, and APIs that are pleasant to consume.",
    highlights: ["Node.js & NestJS", "PostgreSQL", "REST APIs"],
  },
  {
    title: "Performance & delivery",
    description:
      "Profiling slow pages and slow queries, tightening feedback loops with CI/CD, and shipping without the deploy being an event.",
    highlights: ["Core Web Vitals", "Caching", "CI/CD"],
  },
]

export function Capabilities() {
  return (
    <LandingSection>
      <SectionHeading
        index="02"
        eyebrow="Capabilities"
        title="What I bring to a team or a project."
        link={{ href: "/skills", label: "Full stack" }}
      />

      <ul className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {capabilities.map((item) => (
          <li key={item.title} className="bg-background p-8 flex flex-col">
            <h3 className="font-bold text-2xl">{item.title}</h3>
            <p className="text-muted-foreground leading-relaxed mt-4 flex-1">{item.description}</p>
            <p className="mt-6 text-sm text-muted-foreground">{item.highlights.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </LandingSection>
  )
}
