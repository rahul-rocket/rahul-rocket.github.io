import type { RoutePath } from './nav'
import { site } from './site'

/**
 * H-01 — Home's copy, and the actions the hero offers.
 *
 * WHY THIS IS A FILE AND NOT STRINGS IN `hero.tsx`.
 * PROJECT_STRUCTURE §10 lists "copy strings inside a component" as an
 * anti-pattern whose correct home is `config/copy.ts` **or** content. It is
 * config rather than `content/*.ts` because `content/` is for *collections*
 * that a loader reads and a Zod schema validates — experience, journey, skills
 * (CONTENT_STRATEGY §2). This is a single page's copy with no loader, no
 * schema, and no runtime read; putting it in `content/` would mean either a
 * relative escape out of `src/` (PROJECT_STRUCTURE §9 marks that ❌) or a new
 * path alias invented for one object.
 *
 * Split by concern rather than pooled into one `copy.ts`, per the same section's
 * rule against a root `constants.ts`: the next page's copy is its own file.
 */

/**
 * The `<h1>`, in two parts, because the second is set in `--ui-text-muted`.
 *
 * It is two fields rather than one string with markup in it so that the full
 * text stays a plain, assertable value — `heroHeadingText` below is what the
 * route manifest and the E2E navigation spec compare against.
 */
export const heroHeading = {
	lead: 'Full Stack Software Engineer',
	trail: '& Software Architect',
} as const

/**
 * The rendered `<h1>` text, and deliberately the ONLY place it is composed.
 *
 * Three things have to agree on this string: the heading itself, `staticRoutes`
 * in `nav.ts` (which `e2e/navigation.spec.ts` asserts as the page's h1), and
 * `site.role` (which the `<title>` template is built from). Two of the three
 * are invisible when wrong — a heading that drifts from the manifest fails E2E
 * with a diff nobody can attribute, and one that drifts from `site.role` gives
 * the page a title and a headline that quietly disagree.
 *
 * `home.test.ts` pins all three together. This constant is what makes that
 * assertion possible rather than a comment asking people to remember.
 */
export const heroHeadingText = `${heroHeading.lead} ${heroHeading.trail}`

/**
 * The positioning statement — PERSONAL_BRAND §1, in the voice §3 requires:
 * first person, concrete, and owning the trade-off rather than selling.
 */
export const heroLede =
	'I design and deliver production systems end to end — and I can walk you ' +
	'through every decision inside them, including the ones I would make ' +
	'differently now.'

/**
 * The disciplines, as a single scannable row under the lede.
 *
 * WHY A LIST AND NOT A ROTATOR. The obvious treatment for six roles is a
 * typewriter that cycles them, and ANIMATION_GUIDELINES §10 blocks it twice
 * over: it delays LCP, and it defeats a screen reader, which will either
 * announce one arbitrary role or announce all six as a stream of live-region
 * updates. A rotator also shows exactly one at a time, which is the opposite of
 * what a positioning statement is for — the reader is meant to see the RANGE.
 * Six static words in a row communicate more, in less time, at zero cost.
 *
 * Each is a claim, so each is a link to where the site substantiates it. A
 * discipline with nowhere to point is a discipline this site cannot support,
 * and the type makes that structural rather than aspirational: `route` entries
 * are gated on the manifest's `built` flag exactly like the hero actions, so
 * this row can never link somewhere that does not exist.
 */
export const disciplines: readonly HomeAction[] = [
	{ kind: 'route', label: 'Full stack', route: '/skills/' },
	{ kind: 'route', label: 'Architecture', route: '/projects/' },
	{ kind: 'route', label: 'AI engineering', route: '/skills/' },
	{ kind: 'route', label: 'Product', route: '/services/' },
	{ kind: 'route', label: 'Open source', route: '/open-source/' },
	{ kind: 'route', label: 'Writing', route: '/blog/' },
]

/**
 * The hero panel's status line — H-01's one first-person claim about *now*.
 *
 * IT IS A STATIC STRING WITH NO DOT ANIMATION, AND THAT IS A RULE RATHER THAN A
 * TASTE CALL. The conventional treatment is a pulsing green dot, which is an
 * infinite loop: ANIMATION_GUIDELINES §10 blocks "motion that runs before the
 * reader has interacted, longer than 400ms", and a status indicator that
 * animates forever is the purest form of it — it burns a compositor frame on
 * every device for as long as the tab is open, to say something a static ring
 * says just as well. The dot ships as a glow ring instead.
 *
 * `verifiedAt` is rendered, not decorative: a status with no date is a status
 * the reader cannot age. It is a plain string rather than a `Date` so the
 * author edits one field and no timezone can shift it by a day.
 */
export const heroStatus = {
	label: 'Open to staff and architect roles',
	detail: 'Remote, or hybrid from Ahmedabad.',
	verifiedAt: 'August 2026',
} as const

/**
 * An action a Home section can offer. Two kinds, because they fail differently.
 *
 * A `route` action is gated on the route manifest's `built` flag. A `link` is
 * not, because nothing in the manifest describes an external destination.
 *
 * Named `HomeAction` rather than `HeroAction` since H-07: the contact CTA and
 * the current-focus items resolve destinations by the identical rule, and a
 * type called `HeroAction` living in three sections is the kind of name that
 * makes a reader look for a hero that is not there.
 */
export type HomeAction =
	| { kind: 'route'; label: string; route: RoutePath }
	| { kind: 'link'; label: string; href: string }

/**
 * CANDIDATES, IN PRIORITY ORDER — not the list that renders.
 *
 * WEBSITE_STRUCTURE §4.1 specifies two hero actions, "View Projects" and "Get
 * in touch". Neither route exists yet: `/projects/` is Phase 7 and `/contact/`
 * is Phase 9, and both are `built: false`. Linking them today would fail
 * `check:links`, which walks `out/` and rejects any internal href with no file
 * behind it — on GitHub Pages a 404 is terminal, there is no redirect to catch
 * it (ARCHITECTURE §7).
 *
 * So the hero resolves its actions the same way the header and the footer
 * already resolve their links: the manifest is the plan, `built` is the state,
 * and only the state renders (`nav.ts`, "WHAT THE SHELL IS ALLOWED TO LINK
 * TO"). `resolveHeroActions` takes the first two that exist.
 *
 * The consequence is the intended one. Today that yields Writing and GitHub,
 * because those are the two destinations this site actually has. The day
 * `/projects/` flips to `built: true` it takes the primary slot with no edit
 * here — which is the same single-edit property the nav, the footer, the
 * sitemap and the E2E suite already get from that flag.
 *
 * The last entry is external and therefore ungated, which is what guarantees
 * the hero can never render zero actions. A page that ends without a next
 * action is a dead end (WEBSITE_STRUCTURE §3), and the failure mode of a
 * fully-gated list is exactly that.
 */
export const heroActionCandidates: readonly HomeAction[] = [
	{ kind: 'route', label: 'View projects', route: '/projects/' },
	{ kind: 'route', label: 'Get in touch', route: '/contact/' },
	{ kind: 'route', label: 'Read the writing', route: '/blog/' },
	{ kind: 'link', label: 'Code on GitHub', href: site.social.github },
]

/* ==============================================================
 * H-04 — "What I do". WEBSITE_STRUCTURE §4.1 section 4.
 * ============================================================== */

/**
 * A capability block: one brand pillar, what it means in practice, and where
 * the reader can check it **today**.
 *
 * `proof` is the field that makes this section worth having. PERSONAL_BRAND §2
 * defines the three pillars as claims plus "how the site proves it", and §3
 * rule 2 is "numbers or nothing — a claim without a number is either removed or
 * rewritten as an observation". A capability grid with three adjectives in it
 * is the exact shape of portfolio copy that rule exists to prevent, so every
 * block here carries a pointer at something a reader can verify without taking
 * anyone's word for it.
 *
 * The pointers are deliberately all to things that exist NOW — the site itself
 * and its repository. Nothing here forward-references the case studies (Phase
 * 7) or the experience record (Phase 6): a proof line that describes content
 * the site does not have is worse than no proof line, because it reads as
 * evidence right up until someone follows it.
 */
export interface Capability {
	/** The brand pillar — PERSONAL_BRAND §2. Rendered as the block's eyebrow. */
	pillar: string
	title: string
	body: string
	proof: string
}

export const capabilitiesLede =
	'Three things I am accountable for, and where you can check each one ' +
	'without taking my word for it.'

export const capabilities: readonly Capability[] = [
	{
		pillar: 'Craft',
		title: 'Ship the whole thing',
		body:
			'I take a feature from data model to deploy — schema, API, interface, ' +
			'migrations, auth, CI. The unglamorous half is where the risk actually ' +
			"lives, so it is not somebody else's half.",
		proof:
			'Check it here: this site is keyboard-complete, renders its content ' +
			'with JavaScript disabled, and fails its own build when a page goes ' +
			'over budget.',
	},
	{
		pillar: 'Judgment',
		title: 'Choose the boundaries',
		body:
			'Architecture is deciding which things are expensive to reverse, and ' +
			'then being accountable for having decided. I name the options, pick ' +
			'one, and write down what it cost.',
		proof:
			'Check it here: the decisions behind this rebuild are public, ' +
			'including the two that were built, measured, and reverted.',
	},
	{
		pillar: 'Clarity',
		title: 'Explain the system',
		body:
			'A design I cannot explain in plain language is a design I have not ' +
			'finished. I draw the diagram, name the parts, and then write the ' +
			'paragraph that makes the diagram optional.',
		proof:
			'Check it here: the writing walks through one decision end to end ' +
			'rather than summarising a tool.',
	},
]

/* ==============================================================
 * H-05 — Selected writing. WEBSITE_STRUCTURE §4.1 section 5.
 * ============================================================== */

/** "three most recent posts" (§4.1), as a number the section can be read by. */
export const SELECTED_WRITING_LIMIT = 3

/* ==============================================================
 * H-06 — Current focus. WEBSITE_STRUCTURE §4.1 section 6.
 * ============================================================== */

/**
 * WHEN THIS SECTION WAS LAST TRUE — hand-authored, and that is the feature.
 *
 * §4.1 calls current focus "the strongest signal that the site is maintained",
 * which only holds if the date is the author's claim rather than the build's.
 * `new Date()` here would re-date the section on every deploy and turn a real
 * signal into a decorative one — the same failure C-12's acceptance criterion
 * names for `/now`'s `dateModified`, written down here because `/now` is
 * literally this section with a URL and will inherit the value.
 *
 * A stale date is the correct failure mode. A focus block that has not been
 * touched in a year says something true; one that claims to have been updated
 * this morning, every morning, says nothing at all.
 */
export const currentFocusUpdatedAt = new Date('2026-08-05T00:00:00Z')

export interface FocusItem {
	title: string
	body: string
	/** Optional destination, gated exactly like a hero action. */
	action?: HomeAction
}

export const currentFocus: readonly FocusItem[] = [
	{
		title: 'Rebuilding this site in the open',
		body:
			'A Next.js static export on GitHub Pages, with performance budgets, ' +
			'contrast checks and an accessibility suite wired in as merge gates ' +
			'rather than as intentions. Every commit is public.',
		action: { kind: 'link', label: 'Read the source', href: site.repository },
	},
	{
		title: 'Writing the decisions down',
		body:
			'Each part of the rebuild that turned out harder than expected becomes ' +
			'a post. The first is on running a content pipeline with no server ' +
			'behind it.',
		action: { kind: 'route', label: 'Read the writing', route: '/blog/' },
	},
	{
		title: 'Case studies next',
		body:
			'Long-form write-ups of production systems, structured as problem, ' +
			'options, the trade-off I took, and what I would do differently now. ' +
			'They are being written, not templated.',
	},
]

/* ==============================================================
 * H-07 — Contact CTA. WEBSITE_STRUCTURE §4.1 section 7.
 * ============================================================== */

export const contactCta = {
	eyebrow: 'Next',
	heading: 'Get in touch',
	body:
		'If something here is useful, or you want the reasoning behind a ' +
		'decision I have not written up yet, ask. I answer a specific question ' +
		'far better than a general one.',
} as const

/**
 * The CTA's candidates, same priority-order rule as the hero's.
 *
 * Shorter than the hero's list on purpose. The hero opens the page and can
 * afford to offer a reader two directions; the CTA closes it and exists to
 * offer exactly one obvious next step, so the list is the contact route and
 * the one channel `site.ts` actually knows about. Until `/contact/` is built
 * (C-01) this resolves to a single action, which is the honest state rather
 * than a padded row.
 */
export const contactActionCandidates: readonly HomeAction[] = [
	{ kind: 'route', label: 'Get in touch', route: '/contact/' },
	{ kind: 'link', label: 'Find me on GitHub', href: site.social.github },
]
