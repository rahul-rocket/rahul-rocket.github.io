import { describe, expect, it } from 'vitest'
import {
	buildCommands,
	type Command,
	filterCommands,
	groupCommands,
} from './commands'

/**
 * L-13 — the ranker, which is the only part of the palette that can be wrong
 * without looking wrong (docs/TESTING.md §1).
 *
 * The dialog behaviours — focus trap, Escape, focus restore — are NOT tested
 * here. They belong to the browser's `showModal()`, and jsdom models the top
 * layer badly enough that a green unit test would be evidence of nothing. They
 * are asserted in `e2e/command-palette.spec.ts`, in three real engines.
 */

const commands: Command[] = [
	{
		kind: 'link',
		id: 'a',
		label: 'About',
		group: 'Navigation',
		href: '/about/',
	},
	{ kind: 'link', id: 'b', label: 'Blog', group: 'Navigation', href: '/blog/' },
	{
		kind: 'link',
		id: 'p',
		label: 'Validating content at the build boundary',
		group: 'Writing',
		hint: 'Zod at the static export boundary',
		href: '/blog/x/',
	},
	{
		kind: 'action',
		id: 't',
		label: 'Toggle theme',
		group: 'Actions',
		action: 'toggle-theme',
	},
]

describe('filterCommands', () => {
	it('returns every command, in authored order, for an empty query', () => {
		expect(filterCommands(commands, '').map((c) => c.id)).toEqual([
			'a',
			'b',
			'p',
			't',
		])
		// Whitespace is not a query. Without the trim, a stray space would empty
		// the list — the palette would look broken after a fat-fingered space bar.
		expect(filterCommands(commands, '   ')).toHaveLength(4)
	})

	it('ranks a label prefix above a label substring above a hint match', () => {
		// "bo" prefixes nothing; it is inside "Blog"… no — inside "boundary" (hint
		// tier) and inside the post's label. Use a query that hits all three tiers.
		const ranked = filterCommands(commands, 'b')
		// 'Blog' starts with it (tier 0) and must come first, ahead of the post
		// whose label merely contains "b" (tier 1).
		expect(ranked[0]?.id).toBe('b')
	})

	it('puts a literal label hit above a merely fuzzy one', () => {
		// "abo" is a substring of "About" and a subsequence of "…at the build
		// boundary". The literal hit must win regardless of authored order.
		const ranked = filterCommands(commands, 'abo')
		expect(ranked[0]?.id).toBe('a')
		expect(ranked.map((c) => c.id)).toContain('p')
	})

	it('matches on the hint, so a post is findable by its description', () => {
		expect(filterCommands(commands, 'zod').map((c) => c.id)).toEqual(['p'])
	})

	it('matches a subsequence that no substring search would find', () => {
		// v-a-l-b: scattered through "Validating … build", adjacent nowhere.
		expect(filterCommands(commands, 'valb').map((c) => c.id)).toContain('p')
	})

	it('is case insensitive in both directions', () => {
		// Asserted as "the same result as the lowercase query", not as a fixed list.
		// "about" is also a scattered subsequence of the post's text, so it matches
		// there too — at the bottom tier, which is correct and is exactly the
		// behaviour a hardcoded expectation would have hidden.
		expect(filterCommands(commands, 'ABOUT').map((c) => c.id)).toEqual(
			filterCommands(commands, 'about').map((c) => c.id),
		)
		expect(filterCommands(commands, 'ABOUT')[0]?.id).toBe('a')
	})

	it('returns nothing when nothing matches, rather than falling back to everything', () => {
		// The empty result is a feature: a palette that shows the full list for a
		// no-match query reads as "your query was ignored".
		expect(filterCommands(commands, 'qqqq')).toEqual([])
	})

	it('does not mutate the input', () => {
		const before = [...commands]
		filterCommands(commands, 'b')
		expect(commands).toEqual(before)
	})
})

describe('groupCommands', () => {
	it('emits groups in COMMAND_GROUPS order regardless of command order', () => {
		const grouped = groupCommands([
			commands[3] as Command, // Actions
			commands[0] as Command, // Navigation
		])
		expect(grouped.map((g) => g.group)).toEqual(['Navigation', 'Actions'])
	})

	it('drops empty groups rather than rendering a heading over nothing', () => {
		const grouped = groupCommands(filterCommands(commands, 'zod'))
		expect(grouped.map((g) => g.group)).toEqual(['Writing'])
	})
})

describe('buildCommands', () => {
	it('offers only routes that exist in the export', () => {
		// The palette is bound by the same rule as the header and footer: linking a
		// route with no file behind it fails `check:links`, and on GitHub Pages a
		// 404 is terminal. See the note on `builtRoutes` in config/nav.ts.
		const navigation = buildCommands([]).filter((c) => c.group === 'Navigation')
		expect(navigation.length).toBeGreaterThan(0)
		for (const command of navigation) {
			expect(command.kind).toBe('link')
			expect((command as { href: string }).href).toMatch(/\/$/)
		}
	})

	it('renders a post as a link and the theme toggle as an action', () => {
		const built = buildCommands([
			{ href: '/blog/x/', title: 'A post', description: 'About things' },
		])
		expect(built.find((c) => c.label === 'A post')?.kind).toBe('link')
		expect(built.find((c) => c.label === 'Toggle theme')?.kind).toBe('action')
	})

	it('gives every command a unique id — they become DOM ids', () => {
		const ids = buildCommands([{ href: '/blog/x/', title: 'A post' }]).map(
			(c) => c.id,
		)
		expect(new Set(ids).size).toBe(ids.length)
	})
})
