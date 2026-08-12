import { ListFilter } from '@/components/filter/list-filter'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import {
	SKILL_DEPTH_LABELS,
	SKILL_DEPTHS,
	type Skill,
	type SkillDepth,
	type SkillGroup,
} from '@/lib/content/records'

/**
 * A-04 — `/skills`. docs/WEBSITE_STRUCTURE.md §4.4.
 *
 * NO PERCENTAGE BARS AND NO STAR RATINGS. §4.4's honesty rule, and the reason
 * `SkillDepth` is a union of three names rather than a number: a numeric field
 * invites a bar, and "React 92%" is unfalsifiable in a way every reader in this
 * audience discounts on sight. Three tiers with stated definitions are honest
 * and more useful, and the definitions are printed on the page rather than left
 * to the reader to guess.
 *
 * DEPTH IS CONVEYED BY TEXT, NEVER BY COLOUR ALONE (§4.4, CLAUDE.md §8). The
 * tier is a word inside the badge; the tone differences are reinforcement, not
 * information.
 *
 * `familiar` ENTRIES ARE KEPT. Knowing the boundary of one's own knowledge is
 * itself a signal, and a skills page with no boundary on it is a skills page
 * nobody believes. They are dropped from the résumé, which is a different
 * document making a different claim.
 *
 * The filter writes to `?depth=` — shareable, reload-surviving and
 * back-button-correct, which is A-04's acceptance criterion. Case-study stack
 * badges link straight into it.
 */

const LIST_ID = 'skill-groups'

const DEPTH_TONE: Record<SkillDepth, 'accent' | 'neutral'> = {
	primary: 'accent',
	working: 'neutral',
	familiar: 'neutral',
}

export function SkillGroups({
	groups,
	counts,
}: {
	groups: readonly { group: SkillGroup; items: Skill[] }[]
	counts: Record<SkillDepth, number>
}) {
	return (
		<Stack gap={12}>
			{/*
			  The definitions, above the list. A tier system whose tiers are not
			  defined is a rating system with extra steps — this block is what makes
			  the honesty rule mean something to a reader who has not read §4.4.
			*/}
			<dl className="grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 sm:grid-cols-3">
				{SKILL_DEPTHS.map((depth) => (
					<div key={depth} className="flex flex-col gap-2">
						<dt>
							<Badge tone={DEPTH_TONE[depth]}>
								{SKILL_DEPTH_LABELS[depth].label} · {counts[depth]}
							</Badge>
						</dt>
						<dd className="text-sm text-text-muted">
							{SKILL_DEPTH_LABELS[depth].definition}
						</dd>
					</div>
				))}
			</dl>

			<ListFilter
				targetId={LIST_ID}
				noun="skill"
				searchParam="q"
				searchLabel="Search skills"
				searchPlaceholder="TypeScript, Postgres, observability"
				facets={[
					{
						param: 'depth',
						legend: 'Depth',
						options: SKILL_DEPTHS.map((depth) => ({
							value: depth,
							label: SKILL_DEPTH_LABELS[depth].label,
							count: counts[depth],
						})),
					},
				]}
			/>

			{/*
			  One flat list of filter items across every group, so a depth filter
			  hides individual skills rather than whole groups. The group headings
			  stay visible — a heading over an emptied group is a rendering artefact,
			  so each group's own items are the filter targets and the group wrapper
			  is marked as an item too, matching on the union of its children's
			  tokens. That keeps "Data" visible when Postgres matches and hidden when
			  nothing in it does.
			*/}
			<div id={LIST_ID} className="flex flex-col gap-12">
				{groups.map((entry) => (
					<section
						key={entry.group}
						data-filter-item=""
						data-filter-tokens={entry.items.map((s) => s.depth).join(' ')}
						data-filter-text={entry.items
							.map((s) => `${s.name} ${s.note ?? ''}`)
							.join(' ')}
						aria-labelledby={`skills-${slug(entry.group)}`}
						className="flex flex-col gap-5"
					>
						<Heading
							id={`skills-${slug(entry.group)}`}
							level={2}
							size="h3"
							className="border-border border-b pb-3"
						>
							{entry.group}
						</Heading>

						<ul className="flex list-none flex-col gap-4 p-0">
							{entry.items.map((skill) => (
								<li
									key={skill.id}
									className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
								>
									<p className="flex shrink-0 items-center gap-3 sm:w-64">
										<span className="text-text">{skill.name}</span>
										<Badge tone={DEPTH_TONE[skill.depth]}>
											{SKILL_DEPTH_LABELS[skill.depth].label}
										</Badge>
									</p>

									<p className="min-w-0 text-sm text-text-muted">
										{skill.note}
										{skill.evidence ? (
											<>
												{skill.note ? ' ' : ''}
												<a href={skill.evidence}>Where I used it</a>
											</>
										) : null}
									</p>
								</li>
							))}
						</ul>
					</section>
				))}

				{/* X-03 — present from the start, hidden until the filter needs it. */}
				<div data-filter-empty="" hidden>
					<Text tone="muted">
						Nothing matches those filters. Clear them to see every group.
					</Text>
				</div>
			</div>
		</Stack>
	)
}

function slug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}
