import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { ArrowRightIcon } from '@/components/ui/icons'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/cn'
import type { CaseStudy } from '@/lib/content/schemas'
import { formatPeriod } from './lib/format-period'

/**
 * P-04 — a case-study entry on `/projects` and on Home.
 * docs/WEBSITE_STRUCTURE.md §4.6.
 *
 * THE WHOLE CARD IS NOT A LINK, AND THAT IS THE ACCESSIBILITY DECISION THIS
 * COMPONENT EXISTS TO GET RIGHT. §4.6 is explicit: the *title* is the link,
 * with a `::after` overlay providing the large click target. Wrapping the card
 * in an `<a>` instead does two things wrong — it gives the link an accessible
 * name that is the entire card's text content (title, problem, four badges,
 * a metric), which a screen reader reads out in full; and it makes any link
 * inside the card an invalid nested interactive element.
 *
 * The overlay is `after:absolute after:inset-0` on the title's anchor, over a
 * `relative` card. Everything inside stays selectable, and a second link inside
 * the card would simply need `relative z-10` to sit above it.
 *
 * LEADS WITH THE PROBLEM, NOT THE DESCRIPTION. §4.6 again: "one-line *problem*
 * (not description)". A reader scanning six entries is deciding which problem
 * resembles theirs, and "a React and Node platform" does not help them do that.
 */
export function ProjectCard({
	study,
	/** The document depth this card sits at. The page knows; the card does not. */
	level = 3,
	/** The wide feature row on `/projects` and the first Home slot. */
	featured = false,
	className,
}: {
	study: CaseStudy
	level?: 2 | 3 | 4
	featured?: boolean
	className?: string
}) {
	const { frontmatter } = study
	const headline = frontmatter.metrics[0]

	return (
		<article
			className={cn(
				'group relative flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm',
				/*
				 * `u-lift` and `u-hairline` are the same pair `Card interactive` sets,
				 * spelled out here because this is an `<article>` with its own layout
				 * rather than a composed `Card` — duplication is cheaper than the
				 * wrong abstraction (ARCHITECTURE §4), and a card whose whole shape is
				 * "wide feature row or narrow grid cell" is not a `Card`.
				 *
				 * The pairing is legitimate here for the reason `Capabilities`
				 * deliberately does not have it: this card contains a link. The
				 * `::after` overlay on the title spans the whole surface, so the lift
				 * is telling the truth about there being an action. `u-lift` responds
				 * to `:focus-within` as well as `:hover`, so tabbing to that link
				 * produces the same affordance a pointer gets.
				 *
				 * NO `overflow-hidden`: the lift's glow is a `::after` whose visible
				 * part is the spread outside the element's box, and clipping is
				 * exactly what removes it. See the note in motion.css.
				 */
				'u-lift u-hairline transition-colors duration-base ease-out-quint',
				'hover:border-border-strong hover:bg-surface-hover',
				featured && 'md:flex-row md:items-start md:gap-10 md:p-8',
				className,
			)}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<Stack direction="row" gap={3} align="baseline" wrap>
					<Text size="xs" tone="muted" className="font-mono">
						{formatPeriod(frontmatter.period)}
					</Text>
					{frontmatter.needsReview ? (
						// Marked on the card, not only on the page. A reader who never
						// opens the study should still not take it as a verified record.
						<Badge tone="warning">Draft — pending review</Badge>
					) : null}
				</Stack>

				<Heading level={level} size={featured ? 'h2' : 'h3'}>
					<a
						href={study.href}
						className="text-text no-underline after:absolute after:inset-0 after:content-[''] hover:text-accent"
					>
						{frontmatter.title}
					</a>
				</Heading>

				<Text tone="muted">{frontmatter.problem}</Text>

				<Stack direction="row" gap={2} wrap as="ul" className="list-none p-0">
					{/* Four, not all twelve. A badge row long enough to wrap twice stops
					    being scannable, and the case study lists the full stack. */}
					{frontmatter.stack.slice(0, 4).map((id) => (
						<li key={id}>
							<Badge>{id}</Badge>
						</li>
					))}
					{frontmatter.stack.length > 4 ? (
						<li>
							<Badge tone="neutral">+{frontmatter.stack.length - 4}</Badge>
						</li>
					) : null}
				</Stack>
			</div>

			{headline ? (
				<div
					className={cn(
						'flex flex-col gap-1 border-border border-t pt-4',
						featured &&
							'md:w-64 md:shrink-0 md:border-t-0 md:border-l md:pt-0 md:pl-8',
					)}
				>
					<Text size="xs" tone="muted" caps className="font-mono">
						Outcome
					</Text>
					{/*
					  The outcome figure is the card's payload — the one number a reader
					  scanning six studies is looking for — so it moves up a step, from
					  h3 to h2.

					  IT IS SOLID `--ui-accent`, NOT GRADIENT-FILLED, and that is the
					  restraint the rest of the redesign is measured against. `text-h2`
					  clamps from 24px, which is exactly WCAG's large-text threshold and
					  therefore has no margin: a gradient whose tail sits below 4.5:1
					  would be relying on the boundary case being kind. The accent on a
					  card is a pair `check:contrast` asserts at 4.5:1 outright. The
					  gradient is used where the type is unambiguously large — the
					  proof strip's figures are at the `display` step — and not here.
					*/}
					<Text
						as="p"
						className="font-heading text-accent text-h2 leading-heading tracking-heading text-balance"
					>
						{headline.after}
					</Text>
					<Text size="sm" tone="muted">
						{headline.label}
					</Text>
				</div>
			) : null}

			{/* Decoration. `aria-hidden` because the title link already says where
			    this goes, and a second announced "read the case study" on every card
			    is noise in a list of six. */}
			<ArrowRightIcon
				size="sm"
				// Revealed on hover by CSS with no JavaScript involved, so it is
				// already in its finished state. The no-JS spec reads this attribute
				// rather than carrying a selector list, so the justification lives
				// next to the element that claims it — same opt-out the heading
				// anchors use.
				data-hover-reveal="true"
				className="absolute right-6 bottom-6 text-text-subtle opacity-0 transition-opacity duration-fast group-hover:opacity-100 motion-reduce:transition-none"
			/>
		</article>
	)
}
