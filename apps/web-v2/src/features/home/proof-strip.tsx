import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Surface } from '@/components/ui/surface'
import { Text } from '@/components/ui/text'

/**
 * H-02 — the proof strip. docs/WEBSITE_STRUCTURE.md §4.1.
 *
 * EVERY NUMBER LINKS TO WHERE IT IS VERIFIED, AND THAT IS THE ENTIRE DESIGN.
 * §4.1 requires each metric to be "verifiable elsewhere on the site", which is
 * why this section was deliberately absent at H-01: there were no case studies
 * and no experience record, so "11 years / 14 systems" would have been a claim
 * with nothing behind it — the one category of placeholder the implementation
 * plan refuses outright.
 *
 * It is here now because A-01 and P-14…16 landed. Each figure is a link, so a
 * reader who doubts one is one click from the page that carries it, and each is
 * COMPUTED from the content rather than typed: the year count comes from the
 * earliest role, the study count from the corpus. A hand-written number here
 * would be wrong for eleven months of every twelve and nothing would notice.
 *
 * `<dl>` rather than a row of divs — these are label/value pairs, which is what
 * a description list is, and it means a screen reader announces "Years
 * building production systems, eleven" rather than two unrelated fragments.
 */

const HEADING_ID = 'proof-heading'

export interface ProofPoint {
	value: string
	label: string
	/** Where the claim is checkable. Required — a figure with no source is a boast. */
	href: string
}

export function ProofStrip({ points }: { points: readonly ProofPoint[] }) {
	if (points.length === 0) return null

	return (
		<Section labelledBy={HEADING_ID} spacing="compact">
			<Container>
				<h2 id={HEADING_ID} className="sr-only">
					By the numbers
				</h2>

				{/*
				  A GLASS PANEL, NOT A ROW BETWEEN TWO RULES.

				  This was `border-y py-10` — four numbers in a band of empty page,
				  which is the layout of a table of contents rather than of the site's
				  evidence. It is the first thing under the hero and the first claim
				  the reader can check, so it gets to be an object.

				  `level="panel"` is the section-sized glass: half the header's blur,
				  because blur cost scales with area, and verified by `check:contrast`
				  as its own composited context in both themes and all five tones.
				*/}
				<Surface
					level="panel"
					radius="2xl"
					data-spotlight
					className="u-edge u-spotlight overflow-hidden p-2"
				>
					{/* TWO FIXES TO THE RULES, BOTH VISIBLE ON A REAL SCREEN.
					    1. No radius on the cells: a rule is the cell's own border, so
					       a rounded cell bent it around its corners and the four rules
					       read as four nested boxes.
					    2. `divide-x` only when four-up. In Tailwind v4 it is a RIGHT
					       border on every cell but the last (v3 used a left border on
					       every cell but the first), so in the two-column layout the
					       end of row one drew a rule against the panel's own edge. The
					       two-up layout rules only its left-hand cells instead. */}
					<dl className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
						{points.map((point) => (
							// The label is above the value in the DOM *and* on the screen.
							// Putting the big number first visually would need `order`,
							// which is the CSS reordering CLAUDE.md §8 makes a blocker — and
							// a `<dl>` cannot carry `<dd>` before `<dt>` anyway.
							// Label-then-figure reads correctly in both orders, so there is
							// nothing to trade.
							<div
								key={point.label}
								className="group flex flex-col gap-3 border-border px-5 py-7 transition-colors duration-base hover:bg-surface-hover sm:px-6 sm:max-lg:odd:border-r"
							>
								{/*
								  `min-h` on the label, not on the figure. The four labels are
								  one, two and three lines long, so without a floor the four
								  figures sit at four different heights and the row reads as
								  ragged. A floor on the label is not the "fixed height on a
								  text container" UI_GUIDELINES §5 bans — that rule is about
								  clipping text, and this only ever adds space below a short
								  label.
								*/}
								<dt className="min-h-10">
									<a
										href={point.href}
										className="text-sm text-text-muted no-underline transition-colors duration-fast hover:text-text hover:underline"
									>
										{point.label}
									</a>
								</dt>

								{/*
								  `mega`, GRADIENT-FILLED, AND THIS IS THE SIZE THE SECTION IS
								  ABOUT. It was at the `display` step, which put the site's
								  four pieces of evidence at roughly the size of a section
								  heading — legible, and completely unemphatic. The figure is
								  the only thing in the cell a reader is meant to see from
								  across the room.

								  `u-gradient-text` is applied directly rather than through
								  `Heading` because a `<dd>` is not a heading. The gradient
								  rule is "display sizes and above", and this clears it.

								  `tabular-nums` so the four figures share a baseline grid and
								  a two-digit number does not sit visibly wider than a
								  one-digit one.

								  `u-rise` on the wrapper, not on the `<dd>`: the class clips,
								  and its child is what translates. See motion.css for why
								  this is a wipe rather than a count-up — in one line, a
								  count-up has to make the rendered text differ from the
								  accessible text and this does not.
								*/}
								<dd className="u-rise -mb-2 pb-2">
									<span className="block u-gradient-text font-heading text-mega leading-mega tracking-mega tabular-nums">
										{point.value}
									</span>
								</dd>
							</div>
						))}
					</dl>
				</Surface>

				<Text size="xs" tone="muted" className="mt-5">
					Each figure links to the page that carries it. A number on this site
					that cannot be checked somewhere else on it should not be here.
				</Text>
			</Container>
		</Section>
	)
}
