import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Building2, MapPin, Users } from "lucide-react"
import { Button } from "@portfolio/ui/button"

import { SectionHeading } from "@/components/landing/section-heading"
import { Github } from "@/components/brand-icons"
import {
  getContributionCalendar,
  getGitHubProfile,
  GITHUB_LOGIN,
  GITHUB_URL,
  type ContributionDay,
} from "@/lib/github"

/**
 * Tailwind cannot see a class assembled at runtime, so the five levels are
 * written out as whole class strings.
 */
const LEVEL_CLASSES = [
  "bg-secondary",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
] as const

function levelClass(level: number): string {
  return LEVEL_CLASSES[Math.min(Math.max(level, 0), 4)] ?? LEVEL_CLASSES[0]
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/**
 * Month labels sit above the first week in which that month starts, so the
 * ticks line up with the columns rather than being evenly spaced.
 */
function monthLabels(weeks: ContributionDay[][]): (string | null)[] {
  let previous = -1

  return weeks.map((week) => {
    const first = week[0]
    if (!first?.date) {
      return null
    }

    const month = new Date(first.date).getUTCMonth()
    if (month === previous) {
      return null
    }

    previous = month
    return MONTHS[month] ?? null
  })
}

function ContributionGraph({
  weeks,
  total,
}: {
  weeks: ContributionDay[][]
  total: number
}) {
  const labels = monthLabels(weeks)

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        {total} GitHub contributions in the last year
      </figcaption>

      {/* The grid is wider than a phone; it scrolls inside this box rather
          than widening the page. */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-[3px] pl-0">
            {labels.map((label, index) => (
              <span
                key={index}
                className="w-[11px] text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <span
                    key={day.date}
                    className={`h-[11px] w-[11px] rounded-[2px] ${levelClass(day.level)}`}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-3 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground font-semibold">
            {total.toLocaleString("en-US")}
          </strong>{" "}
          contributions in the last year
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_CLASSES.map((className, index) => (
            <span
              key={index}
              className={`h-[11px] w-[11px] rounded-[2px] ${className}`}
            />
          ))}
          More
        </span>
      </div>
    </figure>
  )
}

export async function GitHubActivity() {
  const [profile, calendar] = await Promise.all([
    getGitHubProfile(),
    getContributionCalendar(),
  ])

  // Nothing to show and nothing worth faking -- drop the section entirely.
  if (!profile && !calendar) {
    return null
  }

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Open Source"
          title={
            <>
              Building in the <span className="text-gradient">open</span>
            </>
          }
          description="Most of what I build ends up on GitHub — here's what that looks like day to day."
        />

        <div className="max-w-5xl mx-auto grid lg:grid-cols-[auto_1fr] gap-8 items-start p-6 md:p-8 rounded-2xl border border-border bg-card">
          {profile ? (
            <div className="flex lg:flex-col items-center gap-5 lg:gap-4 lg:w-56 text-center">
              {/* `images.unoptimized` is on for the export, so this emits the
                  source URL as-is; next.config already allows the host. */}
              <Image
                src={profile.avatarUrl}
                alt={`${profile.name} on GitHub`}
                width={96}
                height={96}
                className="h-20 w-20 lg:h-24 lg:w-24 rounded-full ring-2 ring-primary/40"
              />
              <div className="text-left lg:text-center">
                <p className="font-bold text-lg leading-tight">{profile.name}</p>
                <a
                  href={profile.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  @{profile.login}
                </a>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-6 min-w-0">
            {profile ? (
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <dt className="sr-only">Followers</dt>
                  <dd>
                    <strong className="font-semibold">{profile.followers}</strong>{" "}
                    <span className="text-muted-foreground">followers</span>
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <dt className="sr-only">Public repositories</dt>
                  <dd>
                    <strong className="font-semibold">{profile.publicRepos}</strong>{" "}
                    <span className="text-muted-foreground">public repos</span>
                  </dd>
                </div>
                {profile.company ? (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <dt className="sr-only">Company</dt>
                    <dd className="text-muted-foreground">{profile.company}</dd>
                  </div>
                ) : null}
                {profile.location ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <dt className="sr-only">Location</dt>
                    <dd className="text-muted-foreground">{profile.location}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {calendar ? (
              <ContributionGraph weeks={calendar.weeks} total={calendar.total} />
            ) : (
              <p className="text-sm text-muted-foreground">
                The contribution graph is built from the GitHub API at deploy
                time and needs a token, which this build did not have.{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  See it on GitHub
                </a>
                .
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full gap-2 group">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />@{GITHUB_LOGIN}
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </Button>
              <Button asChild variant="ghost" className="rounded-full gap-2">
                <Link href="/projects">Browse the case studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
