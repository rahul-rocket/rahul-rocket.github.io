import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { MapPinIcon } from '@/components/ui/icons'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { formatPeriod, periodDuration } from '@/features/projects'
import type { Experience, Skill } from '@/lib/content/records'
import type { CaseStudy } from '@/lib/content/schemas'

/**
 * A-03 — `/experience`. docs/WEBSITE_STRUCTURE.md §4.5.
 *
 * ROLES ARE HEADINGS, which is the whole accessibility design of this page:
 * §4.5 asks for it explicitly so a screen-reader user can jump between roles
 * with a heading shortcut instead of arrowing through forty outcome bullets.
 * The company is inside the heading rather than beside it for the same reason —
 * "Principal Engineer" repeated four times is not a navigable outline.
 *
 * DATES ARE `<time datetime>` with a machine-readable `YYYY-MM`. A date
 * rendered only as "Jun 2023" is invisible to anything parsing the page,
 * including the structured data validators A-07 depends on.
 *
 * THE YEAR MARKER IS STICKY ON DESKTOP AND INLINE ON MOBILE, and it is the same
 * element in both — §4.5 describes it as moving, which a second copy would
 * implement as two elements that can disagree. It is `aria-hidden`: the date is
 * already in the role's own `<time>`, and announcing the year twice per role is
 * noise.
 *
 * It imports `formatPeriod` from the projects feature's barrel, which is legal
 * (ARCHITECTURE §5 allows cross-feature imports *through the barrel*) and is
 * the point: a second implementation of "Jun 2023 — Present" is exactly the
 * drift a shared export prevents.
 */
export function ExperienceList({
	roles,
	skillsById,
	caseStudiesBySlug,
}: {
	roles: readonly Experience[]
	/** Resolved names, so a badge reads "PostgreSQL" and not "postgres". */
	skillsById: ReadonlyMap<string, Skill>
	caseStudiesBySlug: ReadonlyMap<string, CaseStudy>
}) {
	return (
		<ol className="flex list-none flex-col gap-16 p-0">
			{roles.map((role) => (
				<li
					key={role.id}
					className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12"
				>
					<p
						aria-hidden="true"
						className="shrink-0 font-mono text-sm text-text-muted lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:w-32"
					>
						{role.startedAt.slice(0, 4)}
						{role.endedAt &&
						role.endedAt.slice(0, 4) !== role.startedAt.slice(0, 4)
							? `–${role.endedAt.slice(2, 4)}`
							: ''}
					</p>

					<article className="flex min-w-0 flex-1 flex-col gap-5 border-border border-t pt-6">
						<Stack gap={2} align="start">
							<Heading level={3} size="h3">
								{role.title}
								<span className="text-text-muted"> · {role.company}</span>
							</Heading>

							<Text size="sm" tone="muted" className="flex flex-wrap gap-x-3">
								<time dateTime={role.startedAt}>
									{formatPeriod({ from: role.startedAt, to: role.endedAt })}
								</time>
								<span aria-hidden="true">·</span>
								<span>
									{periodDuration({ from: role.startedAt, to: role.endedAt })}
								</span>
								<span aria-hidden="true">·</span>
								<span className="inline-flex items-center gap-1">
									<MapPinIcon size="sm" />
									{role.location} ({role.mode})
								</span>
							</Text>
						</Stack>

						<Text tone="muted" className="max-w-reading italic">
							{role.mandate}
						</Text>

						{/*
						  OUTCOMES, NOT DUTIES — §4.5's bullet rule. The schema enforces
						  three to five and a length floor; whether each carries a number
						  is a review rule, because a schema that demanded a digit would
						  reject a legitimate qualitative outcome.
						*/}
						<ul className="flex max-w-reading list-disc flex-col gap-2 pl-5">
							{role.outcomes.map((outcome) => (
								<li key={outcome.slice(0, 40)} className="text-text-muted">
									{outcome}
								</li>
							))}
						</ul>

						<Stack
							direction="row"
							gap={2}
							wrap
							as="ul"
							className="list-none p-0"
						>
							{role.stack.map((id) => (
								<li key={id}>
									<Badge>{skillsById.get(id)?.name ?? id}</Badge>
								</li>
							))}
						</Stack>

						{role.caseStudies.length > 0 ? (
							<Stack gap={2} align="start">
								<Text size="xs" tone="muted" caps className="font-mono">
									Case studies from this role
								</Text>
								<ul className="flex flex-col gap-1">
									{role.caseStudies.map((slug) => {
										const study = caseStudiesBySlug.get(slug)
										if (!study) return null
										return (
											<li key={slug}>
												<a href={study.href}>{study.frontmatter.title}</a>
											</li>
										)
									})}
								</ul>
							</Stack>
						) : null}
					</article>
				</li>
			))}
		</ol>
	)
}
