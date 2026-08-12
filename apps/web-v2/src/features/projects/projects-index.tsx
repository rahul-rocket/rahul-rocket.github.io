import { ListFilter } from '@/components/filter/list-filter'
import { Heading } from '@/components/ui/heading'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import type { Skill } from '@/lib/content/records'
import type { CaseStudy } from '@/lib/content/schemas'
import { ProjectCard } from './project-card'

/**
 * P-04/P-05 — the `/projects` index. docs/WEBSITE_STRUCTURE.md §4.6.
 *
 * DELIBERATELY NOT A UNIFORM GRID. §4.6: the top project gets a wide feature
 * row and the rest use a 2-up layout from 1024px. The asymmetry is the point —
 * a uniform card grid says the entries are interchangeable, and they are not;
 * the first one is the one to read.
 *
 * THE LIST IS A `<ul>` AND EVERY ENTRY IS IN THE HTML. Filtering hides items
 * rather than rendering them, so a reader without JavaScript sees all of them
 * and a screen reader gets a real count. `data-filter-tokens` carries the stack
 * ids the filter matches against, and `data-filter-text` carries the searchable
 * prose — both are attributes on the `<li>`, so the component doing the
 * filtering needs to know nothing about projects.
 */

const HEADING_ID = 'projects-heading'
const LIST_ID = 'project-list'

export function ProjectsIndex({
	studies,
	skills,
}: {
	studies: readonly CaseStudy[]
	/** Resolved skills, so the filter shows "TypeScript" rather than an id. */
	skills: readonly Skill[]
}) {
	const [feature, ...rest] = studies

	const skillName = new Map(skills.map((skill) => [skill.id, skill.name]))
	const counts = new Map<string, number>()
	for (const study of studies) {
		for (const id of study.frontmatter.stack) {
			counts.set(id, (counts.get(id) ?? 0) + 1)
		}
	}

	/**
	 * ONLY TECHNOLOGIES THAT APPEAR IN MORE THAN ONE STUDY BECOME CHECKBOXES.
	 *
	 * The naive version offers every id in the corpus, which is twenty
	 * checkboxes over three projects — most of them count 1, so ticking one is a
	 * slower way of clicking the card it corresponds to. A facet earns its place
	 * by discriminating between entries, and a facet matching exactly one entry
	 * discriminates nothing a reader could not do by looking.
	 *
	 * Nothing is lost: the search box matches against the full stack list, so a
	 * single-use technology is still findable by typing it. As the corpus grows
	 * this threshold admits more facets on its own, which is the property that
	 * makes it a rule rather than a hardcoded cap.
	 *
	 * Sorted most-used first, then alphabetically — a purely alphabetical filter
	 * buries the technology most of the work actually used.
	 */
	const options = [...counts.entries()]
		.filter(([, count]) => count > 1)
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([id, count]) => ({
			value: id,
			label: skillName.get(id) ?? id,
			count,
		}))

	return (
		<Section labelledBy={HEADING_ID} spacing="none">
			<Heading id={HEADING_ID} level={2} className="sr-only">
				All case studies
			</Heading>

			<Stack gap={12}>
				{studies.length > 1 ? (
					<ListFilter
						targetId={LIST_ID}
						noun="project"
						searchParam="q"
						searchLabel="Search projects"
						searchPlaceholder="Problem, technology, outcome"
						facets={[{ param: 'stack', legend: 'Technology', options }]}
					/>
				) : null}

				<ul id={LIST_ID} className="flex list-none flex-col gap-8 p-0">
					{feature ? (
						<li
							data-filter-item=""
							data-filter-tokens={feature.frontmatter.stack.join(' ')}
							data-filter-text={filterText(feature)}
						>
							<ProjectCard study={feature} level={3} featured />
						</li>
					) : null}

					{rest.length > 0 ? (
						<li className="contents">
							{/*
							  `contents` on the wrapper keeps the grid's children as the
							  real grid items while the outer element stays an `<li>` — so
							  the list semantics survive the layout. A `<div>` here would
							  be a non-`<li>` child of a `<ul>`, which is invalid and which
							  axe flags.
							*/}
							<ul className="grid list-none grid-cols-1 gap-8 p-0 lg:grid-cols-2">
								{rest.map((study) => (
									<li
										key={study.slug}
										data-filter-item=""
										data-filter-tokens={study.frontmatter.stack.join(' ')}
										data-filter-text={filterText(study)}
										className="flex"
									>
										<ProjectCard study={study} level={3} className="flex-1" />
									</li>
								))}
							</ul>
						</li>
					) : null}

					{/*
					  X-03 — the empty state, in the HTML from the start and hidden
					  until the filter needs it. Rendering it on demand would mean the
					  one state nobody sees in review is also the one that has never
					  been rendered.
					*/}
					<li data-filter-empty="" hidden className="list-none">
						<Text tone="muted">
							No projects match those filters. Clear them to see all{' '}
							{studies.length}.
						</Text>
					</li>
				</ul>
			</Stack>
		</Section>
	)
}

/** What the search box matches against. Problem first — it is what a reader scans. */
function filterText(study: CaseStudy): string {
	return [
		study.frontmatter.problem,
		study.frontmatter.title,
		study.frontmatter.summary,
		study.frontmatter.role,
		...study.frontmatter.stack,
	].join(' ')
}
