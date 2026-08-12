import { Heading } from '@/components/ui/heading'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import type { Fact, Principle } from '@/lib/content/records'

/**
 * A-02/A-08 — `/about`. docs/WEBSITE_STRUCTURE.md §4.2.
 *
 * THE RAIL IS A SIBLING OF THE PROSE AND COMES AFTER IT IN THE DOM. §4.2 puts
 * quick facts in a sticky rail on ≥1280px and collapses it *above* the prose
 * below that width — which would mean the visual order and the DOM order
 * disagree at one of the two sizes. CLAUDE.md §8 is unambiguous that CSS
 * reordering which changes reading sequence is a blocker, so the rail follows
 * the narrative in the DOM at every width and is placed to the side by
 * `flex-row-reverse` at xl. A reader on a phone gets the story first, which is
 * also the better reading order.
 *
 * MINIMAL ANIMATION, DELIBERATELY. §4.2: "paragraph-level fade-in only. This
 * page is for reading." There is no reveal on the narrative — the page's first
 * paragraph is above the fold and revealing content the reader is already
 * looking at is a fade-in of nothing.
 */

const NARRATIVE_ID = 'about-narrative'
const PRINCIPLES_ID = 'about-principles'
const LEARNING_ID = 'about-learning'
const FACTS_ID = 'about-facts'

export function AboutContent({
	narrative,
	principles,
	facts,
	learning,
}: {
	narrative: readonly string[]
	principles: readonly Principle[]
	facts: readonly Fact[]
	learning: readonly string[]
}) {
	return (
		<div className="flex flex-col gap-12 xl:flex-row-reverse xl:items-start xl:gap-16">
			{/* The rail. `xl:sticky` only — a sticky element inside a short column
			    on a small screen does nothing but confuse the scroll. */}
			<aside
				aria-labelledby={FACTS_ID}
				className="shrink-0 xl:sticky xl:top-[calc(var(--header-height)+2rem)] xl:w-64"
			>
				<Stack gap={6}>
					<Heading id={FACTS_ID} level={2} size="h3">
						Quick facts
					</Heading>

					<dl className="flex flex-col gap-4 border-border border-t pt-6">
						{facts.map((fact) => (
							<div key={fact.label} className="flex flex-col gap-1">
								<dt className="text-text-muted text-xs uppercase tracking-caps">
									{fact.label}
								</dt>
								<dd className="text-sm text-text">{fact.value}</dd>
							</div>
						))}
					</dl>
				</Stack>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col gap-16">
				<Section as="div" labelledBy={NARRATIVE_ID} spacing="none">
					<Heading id={NARRATIVE_ID} level={2} className="sr-only">
						Introduction
					</Heading>
					<Stack gap={6} className="max-w-reading">
						{narrative.map((paragraph) => (
							// The first sentence is the key; a paragraph array keyed by
							// index would reorder badly under an edit, and the text itself
							// is stable and unique.
							<Text key={paragraph.slice(0, 40)} tone="muted">
								{paragraph}
							</Text>
						))}
					</Stack>
				</Section>

				<Section as="div" labelledBy={PRINCIPLES_ID} spacing="none">
					<Stack gap={8}>
						<Heading id={PRINCIPLES_ID} level={2}>
							How I work
						</Heading>

						{/*
						  A `<dl>`: each principle is a term and its concrete example is
						  the description. That is exactly the relationship, and it means
						  a screen-reader user can move between principles without
						  reading every example.
						*/}
						<dl className="flex flex-col gap-10">
							{principles.map((principle) => (
								<div key={principle.title} className="flex flex-col gap-3">
									<dt className="font-heading text-h3 text-text leading-heading tracking-heading">
										{principle.title}
									</dt>
									<dd className="max-w-reading text-body text-text-muted leading-body">
										{principle.body}
									</dd>
								</div>
							))}
						</dl>
					</Stack>
				</Section>

				<Section as="div" labelledBy={LEARNING_ID} spacing="none">
					<Stack gap={6}>
						<Heading id={LEARNING_ID} level={2}>
							What I'm learning
						</Heading>
						<ul className="flex max-w-reading flex-col gap-3">
							{learning.map((item) => (
								<li key={item} className="text-text-muted">
									{item}
								</li>
							))}
						</ul>
					</Stack>
				</Section>
			</div>
		</div>
	)
}
