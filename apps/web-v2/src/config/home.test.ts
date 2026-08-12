import { describe, expect, it } from 'vitest'
import {
	capabilities,
	contactActionCandidates,
	currentFocus,
	currentFocusUpdatedAt,
	heroActionCandidates,
	heroHeading,
	heroHeadingText,
	heroLede,
	SELECTED_WRITING_LIMIT,
} from './home'
import { routeByPath, staticRoutes } from './nav'
import { site } from './site'

/**
 * The agreements Home's copy has to keep with things outside it.
 *
 * Nothing here tests that a string is spelled a particular way — copy changes
 * and a test that pins wording is a test that gets deleted the first time it is
 * right to change it. What is pinned is the set of places that must agree, each
 * of which is invisible when it drifts.
 */

describe('hero heading', () => {
	it('is the string the route manifest expects as the page h1', () => {
		// e2e/navigation.spec.ts asserts `toHaveText(route.heading)` against the
		// single <h1> on every built route. A drift here fails that spec with a
		// text diff and no indication of which of the two sides moved.
		expect(routeByPath('/')?.heading).toBe(heroHeadingText)
	})

	it('is the role the <title> template is built from', () => {
		// layout.tsx builds `${site.name} — ${site.role}` as the default title. A
		// headline that disagrees with the title gives the page two answers to the
		// same question, and only one of them is in search results.
		expect(heroHeadingText).toBe(site.role)
	})

	it('composes from exactly two parts, so the muted half is not markup', () => {
		expect(`${heroHeading.lead} ${heroHeading.trail}`).toBe(heroHeadingText)
	})
})

describe('hero lede', () => {
	it('fits the one-sentence positioning slot', () => {
		// WEBSITE_STRUCTURE §4.1 specifies "one-sentence positioning". Not a style
		// preference: `--width-lede` is 56ch and the hero reserves no more space
		// than that, so a lede that grows into a paragraph pushes the actions
		// below the fold on a phone — the one thing the hero exists to avoid.
		expect(heroLede.length).toBeLessThanOrEqual(200)
	})
})

describe('hero action candidates', () => {
	it('points every route action at a path that exists in the manifest', () => {
		// A typo'd path here would not fail the build: it would silently never
		// match a built route, and the action would simply never appear. That is
		// the failure mode this manifest exists to make impossible, so it is
		// asserted rather than trusted.
		const known = new Set(staticRoutes.map((route) => route.path))
		for (const action of heroActionCandidates) {
			if (action.kind === 'route') {
				expect(known, `${action.route} is not a route`).toContain(action.route)
			}
		}
	})

	it('ends with an ungated action, so the hero can never render none', () => {
		// Every `route` candidate can be filtered out by `built`. Without at least
		// one external candidate the hero has a legal state in which it offers no
		// next action at all — a dead end (WEBSITE_STRUCTURE §3).
		expect(heroActionCandidates.at(-1)?.kind).toBe('link')
	})

	it('gives every action a distinct label', () => {
		// The rendered list is keyed by label, and two identical labels would also
		// be two indistinguishable destinations for anyone listing the page's links.
		const labels = heroActionCandidates.map((action) => action.label)
		expect(new Set(labels).size).toBe(labels.length)
	})
})

describe('contact action candidates', () => {
	it('points every route action at a path that exists in the manifest', () => {
		const known = new Set(staticRoutes.map((route) => route.path))
		for (const action of contactActionCandidates) {
			if (action.kind === 'route') {
				expect(known, `${action.route} is not a route`).toContain(action.route)
			}
		}
	})

	it('ends with an ungated action, so the page can never end dead', () => {
		// The CTA is the LAST thing on Home. WEBSITE_STRUCTURE §3 — a page that
		// ends without a next action is a dead end — has nowhere left to be
		// satisfied if this list resolves empty.
		expect(contactActionCandidates.at(-1)?.kind).toBe('link')
	})

	it('gives every action a distinct label', () => {
		const labels = contactActionCandidates.map((action) => action.label)
		expect(new Set(labels).size).toBe(labels.length)
	})
})

describe('capabilities', () => {
	it('is exactly three blocks', () => {
		// WEBSITE_STRUCTURE §4.1 section 4: "three capability blocks mapping to the
		// brand pillars". Three is the count PERSONAL_BRAND §2 defines, and a
		// fourth would be a pillar nobody agreed to.
		expect(capabilities).toHaveLength(3)
	})

	it('names each of the three brand pillars once', () => {
		// PERSONAL_BRAND §2's table, by name. A renamed pillar here that is not
		// renamed there leaves the site arguing for something the brand document
		// does not claim, and nothing else would notice.
		expect(capabilities.map((c) => c.pillar)).toEqual([
			'Craft',
			'Judgment',
			'Clarity',
		])
	})

	it('gives every block a proof line', () => {
		// The field that stops this being three adjectives — PERSONAL_BRAND §3
		// rule 2. A block whose proof is empty is a claim with nothing behind it,
		// and it would render as a stray divider rather than as anything visibly
		// wrong.
		for (const capability of capabilities) {
			expect(capability.proof.length, capability.pillar).toBeGreaterThan(20)
		}
	})

	it('uses none of the banned self-descriptions', () => {
		// PERSONAL_BRAND §3 rule 3. Cheap to check, and this is the section of the
		// site most likely to attract them.
		const banned =
			/\b(passionate|ninja|rockstar|guru|10x|cutting[- ]edge|synerg)/i
		for (const capability of capabilities) {
			const copy = `${capability.title} ${capability.body} ${capability.proof}`
			expect(copy, capability.pillar).not.toMatch(banned)
		}
	})
})

describe('selected writing', () => {
	it('caps at the three §4.1 specifies', () => {
		expect(SELECTED_WRITING_LIMIT).toBe(3)
	})
})

describe('current focus', () => {
	it('is dated by hand, not by the build', () => {
		// The whole signal. A date computed at build time re-dates the section on
		// every deploy and claims maintenance nobody did — C-12's acceptance
		// criterion for `/now`, which this section becomes. Asserting it is in the
		// past is what catches `new Date()` being reintroduced: a build-time date
		// is always the moment the test runs, never before it.
		expect(currentFocusUpdatedAt.getTime()).toBeLessThan(Date.now())
	})

	it('points every route action at a path that exists in the manifest', () => {
		const known = new Set(staticRoutes.map((route) => route.path))
		for (const item of currentFocus) {
			if (item.action?.kind === 'route') {
				expect(known, `${item.action.route} is not a route`).toContain(
					item.action.route,
				)
			}
		}
	})

	it('gives every item a distinct title', () => {
		// The rendered list is keyed by title.
		const titles = currentFocus.map((item) => item.title)
		expect(new Set(titles).size).toBe(titles.length)
	})
})
