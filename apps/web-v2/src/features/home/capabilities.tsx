import { SectionIntro } from '@/components/layout/section-intro'
import { Reveal } from '@/components/motion/reveal'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Divider } from '@/components/ui/divider'
import { Eyebrow } from '@/components/ui/eyebrow'
import { gridVariants } from '@/components/ui/grid'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { capabilities, capabilitiesLede } from '@/config/home'

/**
 * H-04 — "What I do". docs/WEBSITE_STRUCTURE.md §4.1 section 4.
 *
 * Three capability blocks mapping to the brand pillars in
 * docs/PERSONAL_BRAND.md §2. A Server Component; the only JavaScript on the
 * section is the shared reveal observer, and the copy lives in `config/home.ts`
 * (PROJECT_STRUCTURE §10 — copy strings in a component are an anti-pattern).
 *
 * THE PROOF LINE IS THE SECTION. PERSONAL_BRAND §2 defines each pillar as a
 * claim *plus* how the site proves it, and §3's "numbers or nothing" rule means
 * a capability grid of three adjectives would fail review on the copy alone. So
 * each block ends with a pointer at something the reader can check now — the
 * site's own behaviour and its repository — and the pointers deliberately do
 * not forward-reference the case studies or the experience record, neither of
 * which exists yet.
 *
 * NO HOVER AFFORDANCE ON THESE CARDS, AND THAT IS DELIBERATE. `u-hairline` and
 * the 2px card lift (ANIMATION_GUIDELINES §3 items 3 and 17) both belong to
 * cards that *do* something; a hover state on a card with no link inside it
 * tells a pointer user there is an action here and then does not have one.
 * UI_GUIDELINES §4's "links navigate, buttons act" has this corollary.
 */

const HEADING_ID = 'what-i-do'

/*
 * ALTERNATING SURFACES ARE HOW THE PAGE GETS A RHYTHM, and this section carries
 * the first band. The mesh backdrop is continuous by design — one fixed
 * painting behind the whole document — so section boundaries have nothing to
 * mark them, and six sections in a row read as one uninterrupted scroll.
 * `surface="subtle"` on the second and fourth sections gives every boundary a
 * discontinuity without adding a rule, a shadow, or a wrapper element.
 *
 * `--ui-bg-subtle` is safe to put text on since DS-12: `check:contrast` asserts
 * text, muted text, subtle meta, accent and the strong border against it, in
 * both themes and all five tones. Before that it was the one surface with no
 * text pair in the contract, which is exactly why `Section` did not offer it.
 */

export function Capabilities() {
	return (
		<Section labelledBy={HEADING_ID} surface="subtle">
			<Container>
				<Stack gap={12}>
					<Reveal>
						<SectionIntro
							id={HEADING_ID}
							index={2}
							eyebrow="How I work"
							title="What I do"
							lede={capabilitiesLede}
						/>
					</Reveal>

					{/*
					  The grid IS the reveal element, because `data-stagger` applies its
					  delays to the direct children of the armed node — so wrapping the
					  grid in a `<Reveal>` would stagger one child. `gridVariants` is the
					  same cva `Grid` compiles, called from a Server Component, which is
					  why the column tokens stay in one place; the `role` and the list
					  element are restated here because `Reveal` is the element and does
					  not know it is rendering a list.

					  Safari drops list semantics from a `list-style: none` ul, which
					  Preflight applies to every one — `role="list"` is the documented
					  fix and is what `Grid` would have added.
					*/}
					<Reveal
						as="ul"
						stagger
						role="list"
						className={gridVariants({ cols: 3, gap: 6 })}
					>
						{capabilities.map((capability) => (
							// `u-edge` — a spectrum hairline across the top of each card,
							// and deliberately NOT `u-hairline` or `u-lift`. Those two are
							// hover affordances, and the note above is the reason: these
							// cards contain no link, so a card that responds to a pointer
							// would be promising an action it does not have. `u-edge` is
							// static, so it decorates without claiming anything.
							<Card as="li" key={capability.pillar} className="u-edge">
								<CardBody className="gap-4">
									<Eyebrow>{capability.pillar}</Eyebrow>

									<CardTitle level={3}>{capability.title}</CardTitle>

									<Text tone="muted">{capability.body}</Text>

									{/*
									  `mt-auto` is alignment, not spacing — it pushes the proof
									  block to the bottom so the three cards' rules line up
									  whatever their body length. UI_GUIDELINES §5's "children
									  carry no outer margins" is about a child asserting space
									  around itself in its parent's layout; this is the flex
									  idiom for "take the remaining free space", and the
									  alternative is a fixed height on a text container, which
									  §5 also bans.
									*/}
									<Divider tone="gradient" className="mt-auto" />

									{/* `muted`, not `subtle`: this renders at 14px and only the
									    muted role carries a 4.5:1 floor (DESIGN_SYSTEM §3). */}
									<Text size="sm" tone="muted">
										{capability.proof}
									</Text>
								</CardBody>
							</Card>
						))}
					</Reveal>
				</Stack>
			</Container>
		</Section>
	)
}
