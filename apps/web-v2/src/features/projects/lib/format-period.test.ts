import { describe, expect, it } from 'vitest'
import {
	formatMonth,
	formatMonthShort,
	formatPeriod,
	periodDuration,
} from './format-period'

/**
 * The reason this is tested at all is one line in `format-period.ts`: these
 * functions build their output from a fixed month table rather than from
 * `Intl.DateTimeFormat`.
 *
 * `new Date('2023-06')` is parsed as UTC midnight and then formatted in the
 * RUNTIME's timezone, so the obvious implementation renders "May 2023" for
 * every reader west of Greenwich — and for the CI runner, depending on how it
 * is configured. A month is not an instant. The tests below would pass either
 * way in a UTC container, which is exactly why the implementation avoids the
 * problem instead of relying on the environment to hide it.
 */
describe('formatMonth', () => {
	it.each([
		['2023-01', 'January 2023'],
		['2023-06', 'June 2023'],
		['2023-12', 'December 2023'],
	])('%s → %s', (input, expected) => {
		expect(formatMonth(input)).toBe(expected)
	})

	it('returns the input unchanged when it is not a YYYY-MM', () => {
		// Defensive rather than expected: the schema rejects anything else before
		// it reaches here, so this is what a bypassed schema looks like — visibly
		// wrong rather than silently "January 2001".
		expect(formatMonth('nonsense')).toBe('nonsense')
	})
})

describe('formatMonthShort', () => {
	it.each([
		['2023-01', 'Jan 2023'],
		['2023-05', 'May 2023'],
		['2023-09', 'Sep 2023'],
	])('%s → %s', (input, expected) => {
		expect(formatMonthShort(input)).toBe(expected)
	})
})

describe('formatPeriod', () => {
	it('renders a closed period', () => {
		expect(formatPeriod({ from: '2021-02', to: '2022-01' })).toBe(
			'Feb 2021 — Jan 2022',
		)
	})

	it('renders an open period as Present rather than a dangling dash', () => {
		// An absent end date means the work is current, and a reader should not
		// have to infer that from punctuation.
		expect(formatPeriod({ from: '2023-04' })).toBe('Apr 2023 — Present')
	})
})

describe('periodDuration', () => {
	it('counts months inclusively below a year', () => {
		expect(periodDuration({ from: '2023-01', to: '2023-06' })).toBe('6 mo')
	})

	it('drops the remainder when a period is a whole number of years', () => {
		expect(periodDuration({ from: '2020-01', to: '2021-12' })).toBe('2 yr')
	})

	it('renders years and months together', () => {
		expect(periodDuration({ from: '2020-01', to: '2022-03' })).toBe('2 yr 3 mo')
	})

	it('returns an empty string for a malformed start', () => {
		expect(periodDuration({ from: 'nope' })).toBe('')
	})
})
