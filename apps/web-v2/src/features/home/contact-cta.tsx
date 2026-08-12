import { SectionIntro } from '@/components/layout/section-intro'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Heading } from '@/components/ui/heading'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { contactActionCandidates, contactCta } from '@/config/home'
import {
	actionHref,
	actionLinkProps,
	CTA_ACTION_LIMIT,
	resolveActions,
} from './lib/actions'

/**
 * H-07 — the contact CTA. docs/WEBSITE_STRUCTURE.md §4.1 section 7, and the
 * page's answer to §3's rule that no page ends without a next action.
 *
 * THE AURORA SITS ON THE PAGE BACKGROUND, NOT ON A RAISED PANEL, AND THAT IS A
 * CONTRAST DECISION RATHER THAN A VISUAL ONE. redesign/DESIGN_SYSTEM §2.2 lists
 * the contact CTA as one of the four places aurora may appear, and
 * `check-contrast.mjs` verifies text against the aurora composited over
 * `--ui-bg` and `--ui-bg-subtle` (its `bind` list) — there is no context in
 * which it is composited over `--ui-surface`. Painting this backdrop inside a
 * `Surface level="raised"` would therefore produce exactly the shape of hole
 * DS-12 is open against: a real background that the contrast gate cannot see,
 * which stays green while the page is wrong. So the section is a full-bleed
 * band over the page background, like the hero, and every pair on it is one the
 * script already checks.
 *
 * The band bookends the page: aurora at the top behind the hero, aurora at the
 * bottom behind the closing action, flat page background for everything in
 * between. That is also why the aurora is not on any of the three sections
 * between them — a wash behind body prose is ruled out by DESIGN_SYSTEM §3.
 *
 * ONE ACTION TODAY, TWO AFTER PHASE 9, AND NEITHER IS A PLACEHOLDER. The
 * candidates resolve through the route manifest's `built` flag, so `/contact/`
 * takes the primary slot the day C-01 lands with no edit here. Until then the
 * CTA offers the one channel `config/site.ts` actually knows about. See
 * `lib/actions.ts`.
 */

const HEADING_ID = 'contact-cta'

export function ContactCta() {
	const actions = resolveActions(contactActionCandidates, CTA_ACTION_LIMIT)

	return (
		<Section
			labelledBy={HEADING_ID}
			// `relative isolate` gives the backdrop a stacking context of its own,
			// and `border-t` is what separates the band from the section above it —
			// the aurora alone is too soft an edge to read as a boundary. No
			// z-index: both children are positioned and paint in tree order, so the
			// stacking contract in globals.css stays three entries long.
			className="relative isolate overflow-hidden border-border border-t"
		>
			<div className="u-backdrop u-drift" aria-hidden="true">
				<div className="u-grid" />
			</div>

			<Container className="relative">
				<Reveal>
					{/*
					  CENTRED, AND IT IS THE ONLY CENTRED SECTION ON THE PAGE. That is
					  what makes it read as an ending rather than as a seventh block:
					  every section above it has the same left reading edge, so breaking
					  that edge once, at the bottom, is a signal rather than a
					  decoration. A page that centres several sections has no such
					  signal left to spend.
					*/}
					<Stack
						gap={8}
						align="center"
						className="mx-auto max-w-2xl text-center"
					>
						<SectionIntro
							id={HEADING_ID}
							index={5}
							align="center"
							eyebrow={contactCta.eyebrow}
							title={contactCta.heading}
							lede={contactCta.body}
						/>

						{/* Real links styled as buttons — UI_GUIDELINES §4. The first is
						    the page's one primary button, which is what makes it the
						    recommendation rather than one option among several.

						    `data-magnetic-field` scopes the pointer subscriber to this
						    subtree, exactly as in the hero. */}
						<Stack
							direction="row"
							gap={3}
							wrap
							justify="center"
							data-magnetic-field
						>
							{actions.map((action, index) => (
								<Button
									key={action.label}
									asChild
									size="lg"
									variant={index === 0 ? 'primary' : 'secondary'}
									data-magnetic
								>
									<a href={actionHref(action)} {...actionLinkProps(action)}>
										{action.label}
									</a>
								</Button>
							))}
						</Stack>
					</Stack>
				</Reveal>
			</Container>
		</Section>
	)
}
