/**
 * `YYYY-MM` bounds → a readable period. Shared by the case-study header, the
 * project card, `/experience`, and the résumé, so all four render a date range
 * identically.
 *
 * Built from a fixed month table rather than `Intl.DateTimeFormat`, because
 * `new Date('2023-06')` is parsed as UTC midnight and then formatted in the
 * *runtime's* timezone — which silently renders "May 2023" for anyone west of
 * Greenwich. A month is not an instant, and treating it as one is the bug this
 * function exists to avoid. `formatDate` in `lib/` handles genuine instants and
 * is the right tool there.
 */
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
] as const

export function formatMonth(value: string): string {
	const [year, month] = value.split('-')
	const index = Number(month) - 1
	const name = MONTHS[index]
	if (!year || !name) return value
	return `${name} ${year}`
}

/** Short form for dense rows: `Jun 2023`. */
export function formatMonthShort(value: string): string {
	const full = formatMonth(value)
	const [name, year] = full.split(' ')
	if (!name || !year) return full
	// May is already three letters; slicing it is a no-op rather than a bug.
	return `${name.slice(0, 3)} ${year}`
}

export function formatPeriod(period: { from: string; to?: string }): string {
	const from = formatMonthShort(period.from)
	// "Present" rather than an open-ended dash: an absent end date means the work
	// is current, and the reader should not have to infer that from punctuation.
	return `${from} — ${period.to ? formatMonthShort(period.to) : 'Present'}`
}

/** `<time datetime>` needs a machine value; `YYYY-MM` is a valid one. */
export function periodDuration(period: { from: string; to?: string }): string {
	const [fromYear, fromMonth] = period.from.split('-').map(Number)
	if (fromYear === undefined || fromMonth === undefined) return ''

	const end = period.to ? period.to.split('-').map(Number) : null
	const toYear = end?.[0] ?? new Date().getUTCFullYear()
	const toMonth = end?.[1] ?? new Date().getUTCMonth() + 1

	const months = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1
	if (months < 12) return `${months} mo`

	const years = Math.floor(months / 12)
	const remainder = months % 12
	return remainder === 0 ? `${years} yr` : `${years} yr ${remainder} mo`
}
