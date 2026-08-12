import { describe, expect, it } from 'vitest'
import { absoluteUrl, site } from './site'

/**
 * These assertions look trivial. They are not: every one of them describes a
 * failure that is invisible locally and only shows up in a feed reader, a link
 * preview, or Search Console — days after the deploy.
 */
describe('absoluteUrl', () => {
	it('resolves a root-relative path under the /v2 base path', () => {
		expect(absoluteUrl('/blog/')).toBe(
			'https://rahul-rocket.github.io/v2/blog/',
		)
	})

	it('resolves a bare path the same way', () => {
		expect(absoluteUrl('blog/')).toBe('https://rahul-rocket.github.io/v2/blog/')
	})

	it('keeps the base path on a fragment-only reference', () => {
		// JSON-LD @ids are built this way (PERSON_ID, WEBSITE_ID). Dropping the
		// prefix here would give two different sites the same node identity.
		expect(absoluteUrl('/#person')).toBe(
			'https://rahul-rocket.github.io/v2/#person',
		)
	})

	it('never emits a protocol-relative or relative URL', () => {
		for (const path of ['/', 'og/home.png', '/projects/a/']) {
			expect(absoluteUrl(path)).toMatch(/^https:\/\//)
		}
	})

	it('never emits a URL outside the base path', () => {
		// The regression this guards is exactly the one `absoluteUrl` strips the
		// leading slash to prevent: a URL that resolves to the apex, which is a
		// DIFFERENT application (apps/web), not a 404. It would look plausible.
		for (const path of ['/', '/blog/', '/#person', 'og/home.png']) {
			expect(absoluteUrl(path)).toContain('/v2/')
		}
	})
})

describe('site', () => {
	it('has no trailing slash on the URL', () => {
		// A trailing slash here doubles up in every URL built from it.
		expect(site.url.endsWith('/')).toBe(false)
	})

	it('agrees with the configured basePath', () => {
		// These must not drift: `basePath` prefixes what Next emits, `url`
		// prefixes what the metadata builders emit, and a mismatch is a site whose
		// pages and whose canonicals disagree about where they live.
		expect(site.url.endsWith(site.basePath)).toBe(true)
	})
})
