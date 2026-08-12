import { describe, expect, it } from 'vitest'
import { extractHeadings, slugifyHeading } from './headings'

/**
 * P-06 / B-03 — the table-of-contents extractor.
 *
 * THE SLUG ALGORITHM IS THE WHOLE RISK. `rehype-slug` writes the ids in the
 * rendered HTML using `github-slugger`; this file computes the ids the table of
 * contents links to. If the two disagree, every entry in the rail points at
 * nothing — and a fragment that resolves to no element is invisible in review,
 * in a screenshot, and in a normal build.
 *
 * The case that actually broke was "Challenges & Solutions". The ampersand is
 * stripped and the two spaces around it are NOT collapsed, so the id is
 * `challenges--solutions` with two hyphens. A reasonable-looking
 * `.replace(/\s+/g, '-')` produced one, and `check-links.mjs`'s fragment check
 * caught it on every case study at once. Both are pinned below.
 */
describe('slugifyHeading', () => {
	it.each([
		['Overview', 'overview'],
		['The Problem', 'the-problem'],
		['Options Considered', 'options-considered'],
		['Implementation Highlights', 'implementation-highlights'],
		// The apostrophe is REMOVED, not replaced — `what-id-do-differently`,
		// not `what-i-d-do-differently`.
		["What I'd Do Differently", 'what-id-do-differently'],
		// Whitespace runs are NOT collapsed. This is the one that broke.
		['Challenges & Solutions', 'challenges--solutions'],
		['Outcome', 'outcome'],
		['Architecture', 'architecture'],
	])('%s → %s', (input, expected) => {
		expect(slugifyHeading(input)).toBe(expected)
	})

	it('keeps digits and existing hyphens', () => {
		expect(slugifyHeading('Phase 2 — design-system')).toBe(
			'phase-2--design-system',
		)
	})
})

describe('extractHeadings', () => {
	it('collects level-two headings in document order', () => {
		const markdown = [
			'# Not collected — that is the page h1',
			'',
			'## Overview',
			'Some prose.',
			'',
			'### Also not collected',
			'',
			'## The Problem',
		].join('\n')

		expect(extractHeadings(markdown)).toEqual([
			{ id: 'overview', text: 'Overview' },
			{ id: 'the-problem', text: 'The Problem' },
		])
	})

	it('ignores headings inside fenced code blocks', () => {
		// A `## comment` in a shell sample is a comment. Collecting it would put
		// "install the dependencies" in the table of contents with an id that
		// does not exist on the page.
		const markdown = [
			'## Real heading',
			'',
			'```sh',
			'## install the dependencies',
			'pnpm install',
			'```',
			'',
			'## Second real heading',
		].join('\n')

		expect(extractHeadings(markdown).map((heading) => heading.text)).toEqual([
			'Real heading',
			'Second real heading',
		])
	})

	it('strips inline emphasis and code ticks from the rendered text', () => {
		const markdown = '## The **Problem** with `cn`'
		expect(extractHeadings(markdown)[0]).toEqual({
			id: 'the-problem-with-cn',
			text: 'The Problem with cn',
		})
	})

	it('suffixes a repeated slug the way github-slugger does', () => {
		// Two sections called "Outcome" would otherwise both link to the first.
		const markdown = ['## Outcome', '## Outcome', '## Outcome'].join('\n')
		expect(extractHeadings(markdown).map((heading) => heading.id)).toEqual([
			'outcome',
			'outcome-1',
			'outcome-2',
		])
	})

	it('returns nothing for a document with no level-two headings', () => {
		expect(extractHeadings('Just prose.\n\n# And an h1.')).toEqual([])
	})
})
