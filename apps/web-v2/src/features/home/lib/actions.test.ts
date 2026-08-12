import { describe, expect, it } from 'vitest'
import type { HomeAction } from '@/config/home'
import { builtRoutes } from '@/config/nav'
import {
	actionHref,
	actionLinkProps,
	CTA_ACTION_LIMIT,
	HERO_ACTION_LIMIT,
	isActionAvailable,
	resolveActions,
	resolveHeroActions,
} from './actions'

/**
 * The gate, tested against manifests this repository has not reached yet.
 *
 * That is the whole reason `resolveHeroActions` takes its inputs as parameters.
 * The behaviour worth proving is what happens when `/projects/` lands — and by
 * the time it has landed, the test that would have caught the gate being wrong
 * is no longer able to fail.
 */

const candidates: readonly HomeAction[] = [
	{ kind: 'route', label: 'View projects', route: '/projects/' },
	{ kind: 'route', label: 'Get in touch', route: '/contact/' },
	{ kind: 'route', label: 'Read the writing', route: '/blog/' },
	{ kind: 'link', label: 'Code on GitHub', href: 'https://example.test/gh' },
]

describe('resolveHeroActions', () => {
	it('drops routes that are not built', () => {
		const resolved = resolveHeroActions(candidates, new Set(['/', '/blog/']))
		expect(resolved.map((action) => action.label)).toEqual([
			'Read the writing',
			'Code on GitHub',
		])
	})

	it('promotes a route the moment it is built, with no edit here', () => {
		// The property the `built` flag exists for: building /projects/ changes the
		// hero, the nav, the footer, the sitemap and the E2E suite in one edit.
		const resolved = resolveHeroActions(
			candidates,
			new Set(['/', '/blog/', '/projects/']),
		)
		expect(resolved.map((action) => action.label)).toEqual([
			'View projects',
			'Read the writing',
		])
	})

	it('reaches the documented pair once both routes exist', () => {
		const resolved = resolveHeroActions(
			candidates,
			new Set(['/', '/blog/', '/projects/', '/contact/']),
		)
		expect(resolved.map((action) => action.label)).toEqual([
			'View projects',
			'Get in touch',
		])
	})

	it('never returns more than the documented cap', () => {
		const everything = new Set([
			'/',
			'/blog/',
			'/projects/',
			'/contact/',
			'/uses/',
		])
		expect(resolveHeroActions(candidates, everything)).toHaveLength(
			HERO_ACTION_LIMIT,
		)
	})

	it('still offers an action when nothing internal is built', () => {
		// The dead-end guard. An external candidate is ungated by construction, so
		// this can only fail if one is removed from the list — which is the edit
		// that would silently produce a hero with no next action.
		const resolved = resolveHeroActions(candidates, new Set())
		expect(resolved).toHaveLength(1)
		expect(resolved[0]?.kind).toBe('link')
	})

	it('preserves candidate order, because order is the recommendation', () => {
		const resolved = resolveHeroActions(
			candidates,
			new Set(['/contact/', '/projects/']),
		)
		expect(resolved.map((action) => action.label)).toEqual([
			'View projects',
			'Get in touch',
		])
	})

	it('resolves against the real manifest without throwing', () => {
		// The defaults are the production path, and a test that only ever calls the
		// injected form would not notice them breaking.
		const resolved = resolveHeroActions()
		expect(resolved.length).toBeGreaterThan(0)
		expect(resolved.length).toBeLessThanOrEqual(HERO_ACTION_LIMIT)

		const built = new Set(builtRoutes.map((route) => route.path))
		for (const action of resolved) {
			if (action.kind === 'route') expect(built).toContain(action.route)
		}
	})
})

describe('actionHref', () => {
	it('uses the route path for an internal action', () => {
		expect(actionHref({ kind: 'route', label: 'Blog', route: '/blog/' })).toBe(
			'/blog/',
		)
	})

	it('uses the absolute url for an external one', () => {
		expect(
			actionHref({
				kind: 'link',
				label: 'GitHub',
				href: 'https://example.test/gh',
			}),
		).toBe('https://example.test/gh')
	})
})

describe('actionLinkProps', () => {
	it('marks an external destination with rel=me', () => {
		// The verification handshake — a profile can only claim this site back if
		// the link out carries it. Invisible when it is missing, which is why it is
		// derived from the action kind rather than typed at each call site.
		expect(
			actionLinkProps({
				kind: 'link',
				label: 'GitHub',
				href: 'https://x.test',
			}),
		).toEqual({ rel: 'me' })
	})

	it('adds nothing to an internal one', () => {
		// `rel="me"` on a same-origin link is meaningless, and a meaningless
		// attribute in the markup is one a later reader has to research.
		expect(
			actionLinkProps({ kind: 'route', label: 'Blog', route: '/blog/' }),
		).toEqual({})
	})
})

describe('isActionAvailable', () => {
	it('gates a route on the manifest', () => {
		const action: HomeAction = {
			kind: 'route',
			label: 'Contact',
			route: '/contact/',
		}
		expect(isActionAvailable(action, new Set(['/blog/']))).toBe(false)
		expect(isActionAvailable(action, new Set(['/contact/']))).toBe(true)
	})

	it('never gates an external link', () => {
		// Deliberate: nothing in the manifest describes an external destination,
		// and this is the property that guarantees a section can always offer at
		// least one next action.
		expect(
			isActionAvailable(
				{ kind: 'link', label: 'GitHub', href: 'https://x.test' },
				new Set(),
			),
		).toBe(true)
	})
})

describe('resolveActions', () => {
	// H-07's contact CTA. The interesting case is that it resolves to ONE action
	// today and two after Phase 9, and both are correct — so the assertion is
	// against the manifest rather than against a count.
	const ctaCandidates: readonly HomeAction[] = [
		{ kind: 'route', label: 'Get in touch', route: '/contact/' },
		{ kind: 'link', label: 'Find me on GitHub', href: 'https://example.test' },
	]

	it('offers one action while /contact/ is unbuilt', () => {
		const resolved = resolveActions(
			ctaCandidates,
			CTA_ACTION_LIMIT,
			new Set(['/', '/blog/']),
		)
		expect(resolved.map((action) => action.label)).toEqual([
			'Find me on GitHub',
		])
	})

	it('promotes /contact/ to the primary slot when C-01 lands', () => {
		const resolved = resolveActions(
			ctaCandidates,
			CTA_ACTION_LIMIT,
			new Set(['/', '/blog/', '/contact/']),
		)
		expect(resolved.map((action) => action.label)).toEqual([
			'Get in touch',
			'Find me on GitHub',
		])
	})

	it('honours a limit smaller than the number available', () => {
		expect(resolveActions(candidates, 1, new Set(['/blog/']))).toHaveLength(1)
	})
})
