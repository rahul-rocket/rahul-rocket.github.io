import { Reveal } from '@/components/motion/reveal'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/cn'
import type { Milestone } from '@/lib/content/records'
import { TimelineSpine } from './timeline-spine'

/**
 * A-05 — `/journey`. docs/WEBSITE_STRUCTURE.md §4.3.
 *
 * AN `<ol>`, AND THE ALTERNATION IS PRESENTATION ONLY. §4.3 is explicit: the
 * timeline is an ordered list semantically, and the left/right alternation on
 * ≥1024px is visual. DOM order is chronological at every width, so the reading
 * sequence and the visual sequence never disagree — the rule CLAUDE.md §8 makes
 * a blocker, and one the obvious two-column implementation (a left column and a
 * right column each holding half the milestones) violates immediately.
 *
 * THE SIDE IS COMPUTED FROM THE INDEX, NOT FROM AN `odd:`/`even:` VARIANT.
 * Those variants match an element's own position among *its* siblings, so
 * `lg:odd:text-right` on a list item does not reach the item's children — the
 * alternation would apply to the row and not to the content inside it, which
 * looks correct in a screenshot of the first two rows and wrong everywhere
 * else. Passing the side down explicitly is longer and is the version that is
 * true at every row.
 */
export function Timeline({ milestones }: { milestones: readonly Milestone[] }) {
	return (
		<div className="relative">
			<TimelineSpine />

			<ol className="relative flex list-none flex-col gap-16 p-0">
				{milestones.map((milestone, index) => {
					const onRight = index % 2 === 1

					return (
						<li
							key={milestone.id}
							className={cn(
								'relative pl-10',
								onRight
									? 'lg:ml-auto lg:w-1/2 lg:pl-16'
									: 'lg:w-1/2 lg:pr-16 lg:pl-0',
							)}
						>
							{/*
							  The node on the spine. Decoration — the `<ol>` already carries
							  position and count — so it is `aria-hidden` and adds nothing
							  to what is announced.
							*/}
							<span
								aria-hidden="true"
								className={cn(
									'absolute top-2 left-0 size-3 rounded-full border-2 border-accent bg-bg',
									onRight
										? 'lg:-left-1.5'
										: 'lg:right-[-0.375rem] lg:left-auto',
								)}
							/>

							{/*
							  Reveal per milestone, not on the list. One reveal on the
							  container would fade in the whole page; per item it is the
							  16px rise a reader meets as they arrive. Under reduced motion
							  `useReveal` marks the element revealed immediately and the
							  global backstop has already neutralised the transition, so
							  what shows is the FINISHED state — never a shortened
							  animation (ANIMATION_GUIDELINES law 1).
							*/}
							<Reveal className="flex flex-col gap-3" distance={16}>
								<Text size="xs" tone="accent" className="font-mono">
									<time dateTime={String(milestone.year)}>
										{milestone.year}
									</time>
								</Text>

								<Heading level={3} size="h3">
									{milestone.title}
								</Heading>

								<Text tone="muted">{milestone.story}</Text>

								{/*
								  The rule stays on the LEFT on both sides, and so does the
								  text alignment. The alternation is which half of the spine a
								  milestone occupies — that is the visual rhythm §4.3 asks for
								  — and mirroring the typography with it would set a
								  400-character paragraph ragged-left, where every line starts
								  at a different x. Right-aligned body copy is measurably
								  harder to read, and a timeline is not worth that.
								*/}
								<Text
									size="sm"
									className="border-accent-muted border-l-2 pl-4 text-text"
								>
									<span className="text-text-muted">What changed: </span>
									{milestone.changed}
								</Text>
							</Reveal>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
