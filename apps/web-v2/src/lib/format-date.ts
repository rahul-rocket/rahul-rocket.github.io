import { site } from '@/config/site'

/**
 * Date formatting — one implementation, `Intl`, no library.
 *
 * `timeZone: 'UTC'` is not optional. Frontmatter dates are bare `YYYY-MM-DD`,
 * which `z.coerce.date()` parses as UTC midnight. Formatted in a timezone west
 * of UTC, that renders as the *previous day* — so a post dated the 1st shows as
 * the 30th for every reader in the Americas, and the build machine's timezone
 * silently decides what the site says.
 */
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat(site.locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(date)
}

/** `YYYY-MM-DD` for `<time datetime>`, sitemaps, and feeds. */
export function toIsoDate(date: Date): string {
	const iso = date.toISOString().slice(0, 10)
	return iso
}
