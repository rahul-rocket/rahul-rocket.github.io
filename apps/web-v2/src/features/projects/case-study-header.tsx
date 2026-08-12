import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from '@/components/ui/icons'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import type { Skill } from '@/lib/content/records'
import type { CaseStudy } from '@/lib/content/schemas'
import { formatPeriod, periodDuration } from './lib/format-period'
import { MetricList } from './metric-list'

/**
 * P-03/P-10 — the case-study header. docs/PROJECT_CASE_STUDIES.md §3, section 1.
 *
 * THE METRICS ARE RENDERED FROM THE SAME FRONTMATTER THE OUTCOME SECTION USES.
 * §4 is explicit that metrics are structured data rather than prose precisely
 * so the index card, the header and the Outcome section cannot disagree — this
 * component and the `<Metrics>` block inside the MDX are two renderings of one
 * array, not two copies of three numbers.
 *
 * The stack renders as skill *names* rather than ids, resolved by the page. An
 * id is a key, not a label, and `event-driven` in a badge reads like a bug.
 */
export function CaseStudyHeader({
	study,
	stack,
}: {
	study: CaseStudy
	stack: readonly Skill[]
}) {
	const { frontmatter } = study

	return (
		<Stack gap={8}>
			<PageHeader
				eyebrow="Case study"
				title={frontmatter.title}
				lede={frontmatter.summary}
			/>

			<dl className="grid grid-cols-1 gap-6 border-border border-y py-6 sm:grid-cols-3">
				{/*
				  A description list, because these are label/value pairs and that is
				  what a `<dl>` is for. A screen-reader user can navigate them as
				  pairs; a grid of `<div>`s with small text above large text cannot be
				  navigated at all.
				*/}
				<div className="flex flex-col gap-1">
					<dt className="text-text-muted text-xs uppercase tracking-caps">
						Role
					</dt>
					<dd className="text-sm text-text">{frontmatter.role}</dd>
				</div>
				<div className="flex flex-col gap-1">
					<dt className="text-text-muted text-xs uppercase tracking-caps">
						Period
					</dt>
					<dd className="text-sm text-text">
						<time dateTime={frontmatter.period.from}>
							{formatPeriod(frontmatter.period)}
						</time>{' '}
						<span className="text-text-muted">
							({periodDuration(frontmatter.period)})
						</span>
					</dd>
				</div>
				<div className="flex flex-col gap-1">
					<dt className="text-text-muted text-xs uppercase tracking-caps">
						Reading time
					</dt>
					<dd className="text-sm text-text">{study.readingTimeMinutes} min</dd>
				</div>
			</dl>

			<Stack gap={3} align="start">
				<Text size="xs" tone="muted" caps className="font-mono">
					Stack
				</Text>
				<Stack direction="row" gap={2} wrap as="ul" className="list-none p-0">
					{stack.map((skill) => (
						<li key={skill.id}>
							{/*
							  Links to the skills page, where the depth rating and the other
							  work using it live — a badge that goes somewhere is worth more
							  than a badge that decorates.

							  The anchor wraps the badge rather than the badge becoming an
							  anchor: `Badge` is a presentational span by design, and giving
							  it an `asChild` escape hatch would make "is this badge a link"
							  a per-call-site question in a component whose whole value is
							  that it is not.
							*/}
							<a
								href={`/skills/?depth=${skill.depth}`}
								className="rounded-full no-underline"
							>
								<Badge>{skill.name}</Badge>
							</a>
						</li>
					))}
				</Stack>
			</Stack>

			<MetricList metrics={frontmatter.metrics} compact />

			{frontmatter.links.length > 0 ? (
				<Stack direction="row" gap={3} wrap>
					{frontmatter.links.map((link) => (
						<Button key={link.href} asChild variant="secondary" size="sm">
							<a href={link.href} rel="noopener noreferrer" target="_blank">
								{link.label}
								<ExternalLinkIcon size="sm" />
								<span className="sr-only"> (opens in a new tab)</span>
							</a>
						</Button>
					))}
				</Stack>
			) : null}
		</Stack>
	)
}
