import { describe, expect, it } from 'vitest'
import { formatDate, toIsoDate } from './format-date'

/**
 * F1-10. One of these assertions is the entire reason the module exists.
 */
describe('formatDate', () => {
	it('formats a frontmatter date in UTC, not the build machine timezone', () => {
		// THE bug this guards. `z.coerce.date()` parses '2026-03-01' as UTC
		// midnight. Formatted in any timezone west of UTC that is 28 February —
		// so the published date would be decided by where the build ran, and CI
		// (UTC) and a developer in New York would disagree about what the site
		// says. Without `timeZone: 'UTC'` this test fails on a US machine and
		// passes in CI, which is the worst possible way to find out.
		expect(formatDate(new Date('2026-03-01'))).toBe('March 1, 2026')
	})

	it('formats the first and last day of a year correctly', () => {
		expect(formatDate(new Date('2026-01-01'))).toBe('January 1, 2026')
		expect(formatDate(new Date('2026-12-31'))).toBe('December 31, 2026')
	})
})

describe('toIsoDate', () => {
	it('emits YYYY-MM-DD for sitemaps and feeds', () => {
		expect(toIsoDate(new Date('2026-03-01T12:34:56Z'))).toBe('2026-03-01')
	})
})
