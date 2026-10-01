import { LandingSection, SectionHeading } from "@/components/landing/section-heading"
import { experiences } from "@/lib/experience-data"

// `experiences` is newest-first; the landing page shows the three most recent
// roles and /experience carries the full history.
const recentRoles = experiences.slice(0, 3)

export function ExperiencePreview() {
  return (
    <LandingSection>
      <SectionHeading
        index="03"
        eyebrow="Experience"
        title="From a first junior role to leading a team."
        link={{ href: "/experience", label: "Full history" }}
      />

      <ol className="divide-y divide-border border-y border-border">
        {recentRoles.map((role) => (
          <li key={role.id} className="grid gap-2 py-8 md:grid-cols-[14rem_1fr] md:gap-10">
            <p className="text-sm text-muted-foreground">{role.duration}</p>
            <div>
              <h3 className="text-xl font-semibold">
                {role.role} <span className="text-muted-foreground font-normal">at</span>{" "}
                {role.company}
              </h3>
              <p className="text-muted-foreground leading-relaxed mt-3 max-w-2xl">
                {role.description}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {role.technologies.slice(0, 5).join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </LandingSection>
  )
}
