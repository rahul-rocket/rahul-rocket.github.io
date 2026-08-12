import { describe, expect, it } from 'vitest'
import {
	builtRoutes,
	footerGroups,
	footerNavGroups,
	homeRoute,
	primaryNav,
	primaryNavRoutes,
	routeByPath,
	staticRoutes,
} from './nav'

/**
 * The invariants that belong to the manifest itself, and to the selectors the
 * shell reads it through.
 *
 * Structural rules that span the manifest *and* the content pipeline — trailing
 * slashes, duplicate paths, footer exhaustiveness, the five-item nav cap, and
 * every nav link resolving to a real route — live in
 * `lib/content/content.validate.test.ts`, which is the suite `pnpm
 * content:validate` runs on its own in CI. They are asserted there and
 * deliberately not repeated here: two copies of a rule drift, and the copy that
 * drifts is the one nobody is reading.
 *
 * What is left is what only this file can say — the shape of an individual
 * route, which routes are real today, and what the header and footer are
 * therefore allowed to render.
 */

describe('route manifest', () => {
	it('assigns every route a sitemap priority in range', () => {
		for (const route of staticRoutes) {
			expect(route.priority, route.path).toBeGreaterThanOrEqual(0)
			expect(route.priority, route.path).toBeLessThanOrEqual(1)
		}
	})

	it('gives the root the highest priority', () => {
		expect(routeByPath('/')?.priority).toBe(1.0)
	})

	describe('the built flag', () => {
		it('gives every built route a non-empty expected heading', () => {
			// e2e/routes.ts derives the navigation and a11y specs from `builtRoutes`
			// and asserts `heading` as the page's <h1>. An empty one would assert
			// nothing while still looking covered, which is the exact failure this
			// manifest exists to make impossible.
			for (const route of builtRoutes) {
				expect(
					route.heading.length,
					`${route.path} is built but has no heading`,
				).toBeGreaterThan(0)
			}
		})

		it('currently exposes only the routes that exist', () => {
			// Deliberately pinned. When a page lands, this list changes in the same
			// commit as the page — and that is the moment the route enters the
			// sitemap and the a11y and no-JS coverage. A route flipped to
			// `built: true` before it exists fails here rather than as a 404 in the
			// E2E run.
			//
			// Updated when Phases 5–9 landed: this list went from two entries to
			// thirteen in one change, which is the largest single edit it will ever
			// take. Every entry below has a `page.tsx` behind it and is asserted by
			// `e2e/navigation.spec.ts`, which derives its coverage from this same
			// array — so a route added here without a page fails the E2E run, and a
			// page added without an entry here is invisible to the suite.
			expect(builtRoutes.map((route) => route.path)).toEqual([
				'/',
				'/blog/',
				'/about/',
				'/projects/',
				'/experience/',
				'/journey/',
				'/skills/',
				'/open-source/',
				'/uses/',
				'/resume/',
				'/contact/',
				'/services/',
				'/now/',
			])
		})
	})
})

/**
 * L-04/L-06 — the `built` narrowing the header and footer render through.
 *
 * The block above asserts which routes are real. This one asserts that the shell
 * cannot show any other kind, because that failure is the expensive one: a
 * selector that lets an unbuilt route through puts a 404 in the site-wide nav,
 * on every page at once, and GitHub Pages has no redirect to soften it.
 *
 * The complementary property — that a route appears the moment it is built —
 * has no test that can prove it in advance, so it is asserted structurally: the
 * only difference between the manifest and the rendered lists is the flag.
 */
describe('shell navigation selectors', () => {
	it('never surfaces a route that is not in the export', () => {
		const unbuilt = [
			...primaryNavRoutes,
			...footerNavGroups.flatMap((group) => group.items),
		].filter((route) => !route.built)

		expect(unbuilt.map((route) => route.path)).toEqual([])
	})

	it('surfaces every built route the manifest points at, and no other', () => {
		const expectedNav = primaryNav.filter(
			(path) => staticRoutes.find((route) => route.path === path)?.built,
		)
		expect(primaryNavRoutes.map((route) => route.path)).toEqual(expectedNav)

		const expectedFooter = footerGroups
			.flatMap((group) => group.items)
			.filter(
				(path) => staticRoutes.find((route) => route.path === path)?.built,
			)
		expect(footerNavGroups.flatMap((g) => g.items.map((r) => r.path))).toEqual(
			expectedFooter,
		)
	})

	it('drops a footer group with nothing built in it', () => {
		// A heading over an empty list reads as a rendering bug. Dropping the group
		// is the difference between "young site" and "broken footer".
		for (const group of footerNavGroups) {
			expect(
				group.items.length,
				`${group.title} rendered empty`,
			).toBeGreaterThan(0)
		}
	})

	it('preserves the manifest ordering', () => {
		// The nav order is an editorial decision (WEBSITE_STRUCTURE.md §2), so the
		// filter must not reorder it. `filter` after `map` preserves order; this
		// asserts the property rather than the implementation.
		const order = footerGroups.map((group) => group.title)
		const rendered = footerNavGroups.map((group) => group.title)
		expect(rendered).toEqual(order.filter((title) => rendered.includes(title)))
	})

	it('resolves Home, which the wordmark links to and the nav must not repeat', () => {
		expect(homeRoute?.path).toBe('/')
		expect(homeRoute?.built).toBe(true)
		expect(primaryNavRoutes.map((route) => route.path)).not.toContain('/')
		expect(
			footerNavGroups.flatMap((g) => g.items.map((r) => r.path)),
		).not.toContain('/')
	})
})
