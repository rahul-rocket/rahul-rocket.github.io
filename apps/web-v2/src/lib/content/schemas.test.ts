import { describe, expect, it } from 'vitest'
import {
	caseStudyFrontmatterSchema,
	postFrontmatterSchema,
	slugSchema,
} from './schemas'

/**
 * F1-10 — the schema tests.
 *
 * These are all *negative* cases, deliberately. A schema that accepts valid
 * input is demonstrated by every build; what needs proving is that it rejects
 * the specific mistakes it exists to catch. An untested schema tends to be one
 * `.optional()` away from validating nothing at all, and it reports green the
 * whole time.
 */

const valid = {
	title: 'Validating content at the build boundary',
	summary:
		'Every frontmatter field passes a Zod schema before rendering, so a malformed post fails the build instead of shipping.',
	publishedAt: '2026-07-29',
	tags: ['architecture'],
}

describe('postFrontmatterSchema', () => {
	it('accepts a well-formed post and defaults draft to false', () => {
		const result = postFrontmatterSchema.parse(valid)
		expect(result.draft).toBe(false)
		expect(result.publishedAt).toBeInstanceOf(Date)
	})

	it('rejects a title that would be truncated in search results', () => {
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, title: 'x'.repeat(71) }),
		).toThrow()
	})

	it('rejects a title too short to be a title', () => {
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, title: 'Short' }),
		).toThrow()
	})

	it('rejects a summary outside meta-description bounds', () => {
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, summary: 'Too short.' }),
		).toThrow()
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, summary: 'x'.repeat(181) }),
		).toThrow()
	})

	it('rejects a tag outside the controlled vocabulary', () => {
		// The failure this prevents: `nextjs`, `next-js`, and `Next.js` becoming
		// three archives with one post each.
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, tags: ['Next.js'] }),
		).toThrow()
	})

	it('requires between one and five tags', () => {
		expect(() => postFrontmatterSchema.parse({ ...valid, tags: [] })).toThrow()
		expect(() =>
			postFrontmatterSchema.parse({
				...valid,
				tags: [
					'architecture',
					'react',
					'testing',
					'career',
					'nodejs',
					'nextjs',
				],
			}),
		).toThrow()
	})

	it('rejects an unknown key rather than ignoring it', () => {
		// `.strict()` earns its place here: a mistyped `publishedOn` would
		// otherwise be silently dropped and the post would take today's date, or
		// fail for a reason that does not mention the typo.
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, publishedOn: '2026-01-01' }),
		).toThrow()
	})

	it('rejects updatedAt earlier than publishedAt', () => {
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, updatedAt: '2020-01-01' }),
		).toThrow()
	})

	it('rejects a relative ogImage', () => {
		// A relative OG image resolves against the consuming client — Slack,
		// Twitter, iMessage — not against the site, so the preview silently breaks.
		expect(() =>
			postFrontmatterSchema.parse({ ...valid, ogImage: 'og/post.png' }),
		).toThrow()
	})
})

describe('slugSchema', () => {
	it.each(['a-valid-slug', 'post2', 'x'])('accepts %s', (slug) => {
		expect(slugSchema.parse(slug)).toBe(slug)
	})

	it.each([
		'Uppercase',
		'trailing-',
		'-leading',
		'double--hyphen',
		'with space',
	])('rejects %s', (slug) => {
		// Uppercase is the dangerous one: it works on Windows and 404s on the
		// Linux runner that builds the site.
		expect(() => slugSchema.parse(slug)).toThrow()
	})
})

describe('caseStudyFrontmatterSchema', () => {
	// Note the absence of `tags`. A case study is categorised by its `stack`,
	// which resolves against skills.ts — not by the blog's tag vocabulary. The
	// first draft of this fixture spread the post fixture wholesale and `.strict()`
	// rejected it, which is the rule working exactly as intended.
	const { tags: _tags, ...base } = valid
	// P-01 added `problem`, `period` and `metrics` as required fields, and
	// `metrics[].method` is the one that matters: PROJECT_CASE_STUDIES §5 says
	// every number states its measurement, and a required field is the only
	// place that rule can be enforced rather than remembered.
	const study = {
		...base,
		stack: ['typescript'],
		role: 'Lead engineer',
		order: 1,
		problem: 'Reconciliation took six hours a day and still missed breaks.',
		period: { from: '2024-02', to: '2024-11' },
		metrics: [
			{
				label: 'Daily manual review',
				before: '6h',
				after: '20m',
				method:
					'Median of the operations team daily time log, eight weeks either side',
			},
		],
	}

	it('accepts a well-formed case study', () => {
		expect(caseStudyFrontmatterSchema.parse(study).order).toBe(1)
	})

	it('requires a measurement method on every metric', () => {
		// The field that makes the rest of the numbers on this site credible.
		expect(() =>
			caseStudyFrontmatterSchema.parse({
				...study,
				metrics: [{ label: 'Latency', after: '380ms' }],
			}),
		).toThrow()
	})

	it('requires at least one stack entry', () => {
		expect(() =>
			caseStudyFrontmatterSchema.parse({ ...study, stack: [] }),
		).toThrow()
	})

	it('rejects a negative or fractional order', () => {
		expect(() =>
			caseStudyFrontmatterSchema.parse({ ...study, order: -1 }),
		).toThrow()
		expect(() =>
			caseStudyFrontmatterSchema.parse({ ...study, order: 1.5 }),
		).toThrow()
	})
})
