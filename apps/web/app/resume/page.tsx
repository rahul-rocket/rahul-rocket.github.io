import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@portfolio/ui/button"
import { PrintButton } from "@/components/print-button"
import { experiences } from "@/lib/experience-data"
import { skillCategories } from "@/lib/skills-data"
import { site } from "@/lib/site"
import { GITHUB_URL } from "@/lib/github"
import { LINKEDIN_URL } from "@/lib/contact-channels"

const DESCRIPTION =
  "Rahul's résumé — the same record as the experience page, laid out for a quick scan and for printing."

export const metadata: Metadata = {
  title: "Résumé",
  description: DESCRIPTION,
  alternates: { canonical: "/resume" },
}

const stripScheme = (url: string) => url.replace(/^https?:\/\//, "")

/**
 * `/resume` — rendered from the same data as `/experience` and `/skills`, so
 * the three cannot disagree. There is no committed PDF: the reader prints this
 * page, and the `@media print` rules in globals.css hide the site chrome.
 */
export default function ResumePage() {
  const { locality, country } = site.location

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-28 pb-20 print:p-0">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Résumé</p>
        <h1 className="text-4xl font-bold tracking-tight">{site.name}</h1>
        <p className="text-lg text-muted-foreground">{site.role}</p>
        <p className="text-sm text-muted-foreground">
          {locality}, {country} · Open to remote work
        </p>
      </header>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <PrintButton />
        <Button asChild size="lg" variant="ghost">
          <Link href="/experience">Full experience page</Link>
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <section aria-labelledby="resume-contact" className="flex flex-col gap-2">
          <h2 id="resume-contact" className="sr-only">
            Contact details
          </h2>
          <p className="text-sm text-muted-foreground">
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
            {" · "}
            <a href={GITHUB_URL} rel="me" className="hover:text-foreground">
              {stripScheme(GITHUB_URL)}
            </a>
            {" · "}
            <a href={LINKEDIN_URL} rel="me" className="hover:text-foreground">
              {stripScheme(LINKEDIN_URL)}
            </a>
            {" · "}
            <a href={site.url} className="hover:text-foreground">
              {stripScheme(site.url)}
            </a>
          </p>
          <p className="max-w-prose text-muted-foreground">{site.description}</p>
        </section>

        <section aria-labelledby="resume-experience" className="flex flex-col gap-6">
          <h2 id="resume-experience" className="border-b pb-2 text-2xl font-semibold">
            Experience
          </h2>
          <ol className="flex flex-col gap-8">
            {experiences.map((role) => (
              <li key={role.id} className="flex flex-col gap-2 break-inside-avoid">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="font-semibold">
                    {role.role}
                    <span className="text-muted-foreground"> · {role.company}</span>
                  </h3>
                  <p className="shrink-0 font-mono text-sm text-muted-foreground">{role.duration}</p>
                </div>
                <p className="text-sm italic text-muted-foreground">
                  {role.location} · {role.type}
                </p>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {role.achievements.map((achievement) => (
                    <li key={achievement} className="text-sm text-muted-foreground">
                      {achievement}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{role.technologies.join(" · ")}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="resume-skills" className="flex flex-col gap-4">
          <h2 id="resume-skills" className="border-b pb-2 text-2xl font-semibold">
            Skills
          </h2>
          <dl className="flex flex-col gap-3">
            {skillCategories.map((category) => (
              <div key={category.title} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-sm font-medium sm:w-52">{category.title}</dt>
                <dd className="text-sm text-muted-foreground">
                  {category.skills.map((skill) => skill.name).join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
          <p className="no-print text-sm text-muted-foreground">
            Full list with proficiency levels:{" "}
            <Link href="/skills" className="text-primary hover:underline">
              the skills page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
