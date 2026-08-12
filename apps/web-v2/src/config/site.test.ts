import { describe, expect, it } from 'vitest'
import { absoluteUrl, site } from './site'

/**
 * These assertions look trivial. They are not: every one of them describes a
 * failure that is invisible locally and only shows up in a feed reader, a link
 * preview, or Search Console — days after the deploy.
 */
describe('absoluteUrl', () => {
	it('resolves a root-relative path against the site origin', () => {
		expect(absoluteUrl('/blog/')).toBe('https://rahul-rocket.github.io/blog/')
	})

	it('resolves a bare path the same way', () => {
		expect(absoluteUrl('blog/')).toBe('https://rahul-rocket.github.io/blog/')
	})

	it('never emits a protocol-relative or relative URL', () => {
		for (const path of ['/', 'og/home.png', '/projects/a/']) {
			expect(absoluteUrl(path)).toMatch(/^https:\/\//)
		}
	})
})

describe('site', () => {
	it('has no trailing slash on the URL', () => {
		// A trailing slash here doubles up in every URL built from it.
		expect(site.url.endsWith('/')).toBe(false)
	})
})
