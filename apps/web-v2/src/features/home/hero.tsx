import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Heading } from '@/components/ui/heading'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { disciplines, heroHeading, heroLede, heroStatus } from '@/config/home'
import { site } from '@/config/site'
import { currentRoles, skills } from '@/lib/content/data'
import {
	actionHref,
	actionLinkProps,
	resolveActions,
	resolveHeroActions,
} from './lib/actions'

/**
 * H-01 — the hero. docs/WEBSITE_STRUCTURE.md §4.1.
 *
 * A SERVER COMPONENT, AND THAT IS STILL THE HEADLINE FACT ABOUT IT. Home has
 * roughly 8 KB of gzipped JavaScript left against the 120 KB hard limit
 * (docs/PERFORMANCE.md §2), so the section that carries the site's argument has
 * to cost none of it. Nothing here has state and nothing reads a browser API.
 *
 * THE ENTRANCE ANIMATION IS ALSO ZERO BYTES. `u-enter`, `u-enter-backdrop`,
 * `u-drift`, `u-float` and `u-gradient-text` are CSS keyframe and scroll-timeline
 * blocks in motion.css; Motion or GSAP would be 16–35 KB gz on the one route
 * with the least headroom, for effects that are already written.
 *
 * THE <h1> IS NOT ANIMATED, NOT REVEALED, AND NOT TYPED. It is the LCP element
 * by design (WEBSITE_STRUCTURE §4.1), PERFORMANCE.md §4 does not permit
 * animating the LCP element, and it ships at full opacity in the served HTML.
 * The stagger runs around it rather than through it. Its gradient FILL is not an
 * exception: a background-clip fill is a paint property present in the first
 * frame, it moves nothing, and it cannot register a second LCP candidate.
 *
 * ------------------------------------------------------------------
 * THE SHAPE: A FULL-WIDTH HEADLINE OVER A TWO-COLUMN ROW.
 *
 * It used to be a single left-aligned column, and the previous revision's own
 * screenshots are the argument against it: at 1440px the type block occupied
 * the left 45% of an 85vh section and the remaining 55% was aurora. A hero is
 * the most expensive screen real estate on the site and half of it was carrying
 * nothing — which reads, correctly, as a template nobody finished rather than
 * as restraint.
 *
 * THE RIGHT COLUMN IS A STATUS PANEL, NOT AN ILLUSTRATION, and that distinction
 * is the whole design. A decorative graphic in that space would have been the
 * same emptiness with a picture over it. What sits there instead is the three
 * things a reader evaluating an engineer wants inside five seconds and would
 * otherwise visit three routes to assemble: whether they are available, what
 * they are doing right now, and what they build with. Two of the three are READ
 * FROM THE RECORD LAYER at build time — `currentRoles` and `skills` — so the
 * panel cannot disagree with `/experience` or `/skills`, and cannot go stale
 * without the page it duplicates going stale first.
 *
 * On mobile the panel comes SECOND in the DOM and second on screen. It is
 * supporting evidence, and the reading order is the same in both layouts —
 * CLAUDE.md §8's "DOM order matches visual order" is why the split is a `grid`
 * with no `order` anywhere in it.
 * ------------------------------------------------------------------
 */

/** The h1's id — the accessible name of the region, via `aria-labelledby`. */
const HEADING_ID = 'hero-heading'

/**
 * How many primary skills the panel names before it stops counting them out.
 *
 * Four, because the row is a sample rather than an inventory: `/skills` is the
 * inventory and the panel links to it. A hero that lists twenty-three
 * technologies is a hero nobody reads to the end of.
 */
const STACK_SAMPLE = 4

export function Hero() {
	const actions = resolveHeroActions()

	/**
	 * The disciplines row, gated on the same manifest flag as the actions. A
	 * discipline whose destination is not built simply does not render — the row
	 * shortens rather than linking into a 404, which on GitHub Pages is terminal
	 * (ARCHITECTURE §7). The limit is the list length: this is not a
	 * recommendation like the action pair, so there is nothing to cap.
	 */
	const shown = resolveActions(disciplines, disciplines.length)

	const [role] = currentRoles()
	const primary = skills.filter((skill) => skill.depth === 'primary')
	const stack = primary.slice(0, STACK_SAMPLE)

	return (
		<Section
			labelledBy={HEADING_ID}
			spacing="none"
			// `min-h-hero` is 85svh, never 100 — a visible content edge is what tells
			// the reader there is more (WEBSITE_STRUCTURE §4.1). The padding is
			// asymmetric because a sticky header already occupies 4.5rem above this.
			className="relative isolate flex min-h-hero items-center overflow-hidden pt-24 pb-20"
		>
			{/*
			  Aurora, grid and grain. `aria-hidden` because it carries no
			  information, and a sibling rather than a background on the section so
			  the grid's radial mask can be its own layer.

			  `u-drift` is scroll-linked parallax and `u-enter-backdrop` is a one-shot
			  bloom on load. NEITHER IS A LOOP, which is the condition on which the
			  brief's "animated background" could be built at all: ANIMATION_GUIDELINES
			  §10 blocks looping background animation because it is the one thing on a
			  static site that burns CPU forever, on every device, whether or not
			  anyone is looking.
			*/}
			<div className="u-backdrop u-drift u-enter-backdrop" aria-hidden="true">
				<div className="u-grid" />
			</div>

			<Container className="relative">
				{/*
				  `data-magnetic-field` scopes the pointer subscriber's per-frame query
				  to this subtree — see `PointerEffects`. Without a scope the handler
				  would measure every decorated control in the document on every
				  frame; with it the work is bounded by one section's worth of buttons
				  and is only done at all while the pointer is inside the hero.
				*/}
				<div data-magnetic-field className="flex flex-col gap-12">
					<Stack gap={6} align="start">
						{/*
							  The name, as an eyebrow rather than as the h1. The h1 belongs to
							  the page's subject, which on Home is what this person does; the
							  name is already the wordmark in the header, the <title>, and
							  the footer.

							  `--enter-index` is the stagger position. The whole entrance
							  system lives inside a `prefers-reduced-motion: no-preference`
							  query, so the base state — what ships in the HTML — is the
							  finished one: reduced motion, a parse failure and a print
							  stylesheet all land on visible content, and no code path can
							  strand this at opacity 0.
							*/}
						<Eyebrow
							style={{ '--enter-index': 0 } as CSSProperties}
							className="u-enter"
						>
							{site.name}
						</Eyebrow>

						{/*
							  THE <h1> IS NOT IN THE ENTRANCE — see the note at the top.

							  IT SPANS THE FULL CONTAINER, AND THE COLUMNS START BELOW IT.
							  The first attempt at this section put the headline in the left
							  cell of a two-column grid, which is the obvious arrangement and
							  is measurably wrong: a 607px column at the `mega` step wraps
							  this heading to SIX lines — 707px of headline, a tall narrow
							  block with an empty panel beside it. The type scale tops out at
							  8rem precisely so the hero can use it, and a column that
							  narrow takes that back.

							  So the split moved down one level. The headline gets the whole
							  1200px measure (three lines), and the lede, the disciplines,
							  the actions and the panel share the row underneath — which is
							  also the better reading order, because the panel is evidence
							  for the claim above it rather than a peer of it.

							  `max-w-headline` (16ch) still applies below `lg`, where the
							  container is narrower than the cap anyway and the cap costs
							  nothing; above it the container is the measure.
							*/}
						<Heading
							id={HEADING_ID}
							level={1}
							size="mega"
							className="max-w-headline lg:max-w-[19ch]"
						>
							{heroHeading.lead}{' '}
							{/*
								  THE GRADIENT IS ON THE TRAIL, NOT ON THE WHOLE HEADING. The
								  lead is the claim and stays at full `--ui-text` contrast; the
								  trail is the qualifier, and it was already the quieter half.
								  Running the spectrum through it says the same thing with
								  light instead of with grey.

								  Contrast: `--ui-gradient-text` opens at `--ui-text` and only
								  reaches the spectrum near the end of its run, and this is
								  `mega` — 52px at the smallest viewport — so WCAG's 3:1
								  large-text bar applies rather than 4.5:1. It also degrades to
								  solid text with no `background-clip` support, under forced
								  colors, and in print.

								  It stays INSIDE the h1 rather than becoming a second line:
								  the two halves are read as one phrase, and splitting them
								  would have a screen reader announce the qualifier on its own.
								*/}
							<span className="u-gradient-text">{heroHeading.trail}</span>
						</Heading>
					</Stack>

					{/*
					  THE LOWER ROW. Everything that supports the headline, in two
					  columns: the argument on the left, the evidence on the right.

					  `items-start` rather than `items-center` — the panel and the text
					  block are different heights and centring them puts the lede's first
					  line below the panel's first line, which reads as two unrelated
					  blocks that happen to be adjacent. Aligning their tops makes them
					  one row.
					*/}
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
						<Stack gap={8} align="start">
							<Text
								size="lede"
								tone="muted"
								className="u-enter max-w-lede"
								style={{ '--enter-index': 1 } as CSSProperties}
							>
								{heroLede}
							</Text>

							{/*
						  The disciplines. A `<ul>` because it is a list of six peers, and
						  `role="list"` through a spread because Safari drops list semantics
						  from a `list-style: none` ul — which Preflight applies to every
						  one — while Biome's `noRedundantRoles` rejects the role written
						  literally on a `<ul>` in JSX.

						  `u-sweep` rather than a permanent underline: six underlined links
						  in a row under a lede is a second paragraph of rules competing
						  with the sentence above it. The affordance is carried by the
						  hover and focus states plus the `text-text` colour against the
						  muted lede, and — the part that matters — by the fact that these
						  are real `<a>` elements in a list, which is what a screen reader
						  and a keyboard both navigate by.
						*/}
							{shown.length > 0 ? (
								<ul
									{...{ role: 'list' }}
									className="u-enter -mx-1 flex flex-wrap items-center gap-x-1 gap-y-2"
									style={{ '--enter-index': 2 } as CSSProperties}
								>
									{shown.map((discipline, index) => (
										<li key={discipline.label} className="flex items-center">
											<a
												href={actionHref(discipline)}
												{...actionLinkProps(discipline)}
												className="u-sweep rounded-sm px-1 py-0.5 font-medium text-sm text-text no-underline transition-colors duration-fast hover:text-accent"
											>
												{discipline.label}
											</a>
											{/*
											  THE SEPARATOR FOLLOWS ITS ITEM RATHER THAN PRECEDING THE
											  NEXT ONE, which is the difference between a row that
											  wraps correctly and one that does not. Drawn before each
											  item except the first — the obvious version — it becomes
											  the first thing on every wrapped line, and at 390px this
											  row wraps: the second line opened with a floating dot.
											  Trailing the item, a wrapped line starts with a word and
											  the dangling dot ends the line above it, where it reads
											  as punctuation.

											  Decoration the accessibility tree never sees. The list
											  structure already says these are separate items, so a
											  literal bullet character would be announced six times
											  for no gain.
											*/}
											{index < shown.length - 1 ? (
												<span
													aria-hidden="true"
													className="mx-1 h-1 w-1 shrink-0 rounded-full bg-border-strong"
												/>
											) : null}
										</li>
									))}
								</ul>
							) : null}

							{/*
						  Real links, styled as buttons — UI_GUIDELINES §4: anything that
						  navigates is an `<a href>`, always. `asChild` is what keeps that
						  true without a second set of styles, and it is why these work
						  with JavaScript disabled and offer the browser's own
						  open-in-new-tab.
						*/}
							<Stack
								direction="row"
								gap={3}
								wrap
								className="u-enter"
								style={{ '--enter-index': 3 } as CSSProperties}
							>
								{actions.map((action, index) => (
									<Button
										key={action.label}
										asChild
										size="lg"
										// The order IS the recommendation — one primary, one
										// secondary. Two filled buttons side by side recommend
										// nothing.
										variant={index === 0 ? 'primary' : 'secondary'}
										// The lean. Inert without JavaScript, on a touch device, and
										// under reduced motion — `--mag-x/--mag-y` are simply never
										// written and the CSS falls back to `0`.
										data-magnetic
									>
										<a href={actionHref(action)} {...actionLinkProps(action)}>
											{action.label}
										</a>
									</Button>
								))}
							</Stack>
						</Stack>

						<HeroPanel
							role={role}
							stack={stack}
							primaryCount={primary.length}
						/>
					</div>
				</div>
			</Container>
		</Section>
	)
}

/**
 * The right column: a status panel assembled from the record layer.
 *
 * `data-spotlight` is what makes it respond to the pointer — `PointerEffects`
 * writes `--mx/--my` and `.u-spotlight` paints a glow at that position. Note it
 * does NOT also carry `u-lift`: motion.css's pseudo-element budget note is
 * explicit that the two share `::after` and applying both silently drops one.
 * A lift would be wrong here anyway; the panel is not a single link.
 *
 * `u-float` is the scroll-linked drift, on the panel rather than on its text.
 * "Parallax on text" is a §10 blocker and this is parallax — it is applied to
 * the container, which is at rest for the whole time the reader is reading it
 * and only moves once they have started scrolling past.
 */
function HeroPanel({
	role,
	stack,
	primaryCount,
}: {
	role: ReturnType<typeof currentRoles>[number] | undefined
	stack: ReturnType<typeof skills.filter>
	primaryCount: number
}) {
	return (
		<div
			data-spotlight
			style={{ '--enter-index': 4 } as CSSProperties}
			className="u-enter u-float u-spotlight u-edge u-glass-panel relative rounded-2xl border border-glass-border bg-glass-panel p-6 shadow-lg sm:p-8"
		>
			{/*
			  `divide-y` RATHER THAN `<hr>` BETWEEN THE GROUPS, AND THAT IS A
			  CORRECTNESS FIX RATHER THAN A STYLING PREFERENCE. The first version put
			  three `<hr className="u-hairline-fade">` elements directly inside this
			  `<dl>`, which axe failed as `definition-list` (serious): a description
			  list may contain only `<dt>`, `<dd>`, `<div>`, `<script>` and
			  `<template>`, and anything else breaks the term/description pairing
			  assistive technology reads the list by. The rule caught it on Home in
			  both themes.

			  A border between the group `<div>`s draws the same line with no element
			  at all, so there is nothing invalid to place. `u-hairline-fade`'s
			  gradient is lost, which is the honest trade: a `<div>` wrapper added
			  purely to carry a decorative gradient would be markup that exists for a
			  paint.
			*/}
			<dl className="flex flex-col divide-y divide-border">
				{/*
				  Availability. `<dt>`/`<dd>` because it is a labelled value, and the
				  label is visible rather than `sr-only` — a status whose meaning is
				  carried only by a green dot is the "never colour alone" failure
				  (DESIGN_SYSTEM §3) in its most common form.
				*/}
				<div className="flex flex-col gap-2 pb-6">
					<dt className="font-mono text-text-subtle text-xs uppercase tracking-caps">
						Status
					</dt>
					<dd className="flex items-start gap-3">
						{/*
						  A glow ring, not a pulse. The pulse is an infinite animation and
						  §10 blocks motion that runs before the reader has interacted for
						  longer than 400ms — see `heroStatus` in config/home.ts. The ring
						  is a static box-shadow, so it reads as "live" and costs nothing.

						  `--ui-success`, and it is accompanied by the words beside it, so
						  a reader who cannot distinguish the hue loses no information.
						*/}
						<span
							aria-hidden="true"
							className="mt-2 h-2 w-2 shrink-0 rounded-full bg-success shadow-glow-status"
						/>
						<span className="flex flex-col gap-1">
							<span className="font-medium text-text">{heroStatus.label}</span>
							<span className="text-sm text-text-muted">
								{heroStatus.detail}
							</span>
							{/* The date is the point. A status with nothing to age it by is a
							    status a reader has to assume is current, and this one is
							    hand-maintained rather than derived — so it says when. */}
							<span className="font-mono text-text-subtle text-xs">
								Checked {heroStatus.verifiedAt}
							</span>
						</span>
					</dd>
				</div>

				{/*
				  The current role, read from `content/experience.ts` rather than typed.
				  A hero that names a job title is a hero that is wrong the month after
				  the author changes jobs unless it derives it, and nothing would
				  notice.
				*/}
				{role ? (
					<div className="flex flex-col gap-2 py-6">
						<dt className="font-mono text-text-subtle text-xs uppercase tracking-caps">
							Currently
						</dt>
						<dd className="flex flex-col gap-1">
							<a
								href="/experience/"
								className="u-sweep font-medium text-text no-underline transition-colors duration-fast hover:text-accent"
							>
								{role.title}
							</a>
							<span className="text-sm text-text-muted">{role.company}</span>
						</dd>
					</div>
				) : null}

				{/*
				  The stack sample. Each entry is a real skill id resolved through the
				  same array `/skills` renders, and the trailing count is derived —
				  "+19 more" cannot drift from the page it points at.
				*/}
				{stack.length > 0 ? (
					<div className="flex flex-col gap-3 pt-6">
						<dt className="font-mono text-text-subtle text-xs uppercase tracking-caps">
							Primary stack
						</dt>
						<dd className="flex flex-wrap gap-2">
							{stack.map((skill) => (
								<span
									key={skill.id}
									className="rounded-full border border-border bg-bg-subtle px-3 py-1 font-mono text-text-muted text-xs"
								>
									{skill.name}
								</span>
							))}
							{primaryCount > stack.length ? (
								<a
									href="/skills/"
									className="rounded-full px-3 py-1 font-mono text-accent text-xs underline underline-offset-2 hover:text-accent-hover"
								>
									+{primaryCount - stack.length} more
								</a>
							) : null}
						</dd>
					</div>
				) : null}
			</dl>
		</div>
	)
}
