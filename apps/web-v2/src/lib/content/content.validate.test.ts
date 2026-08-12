import { describe, expect, it } from 'vitest'
import { footerGroups, primaryNav, staticRoutes } from '@/config/nav'
import { getAllPostsUnfiltered } from './posts'
import { postFrontmatterSchema, TAGS } from './schemas'

/**
 * F1-06 — `pnpm content:validate`.
 *
 * WHY THIS IS A TEST FILE AND NOT `scripts/content-validate.mjs`.
 *
 * The other gate scripts (check-export, check-links, check-contrast) are
 * dependency-free `.mjs` on purpose. This one cannot be: the schemas are
 * TypeScript, they import through the `@/` alias, and the loaders are the real
 * ones the build uses. Reimplementing any of that in a standalone script would
 * mean validating content against a *copy* of the contract — and a copy that
 * drifts is worse than no check, because it reports green while the build fails.
 *
 * Vitest already resolves the alias and compiles TypeScript, and it is already a
 * dependency. So `content:validate` runs Vitest filtered to this file. It runs
 * in `pnpm test` too, which is correct: content validity is not a special
 * category of correctness.
 *
 * It reads content **unfiltered** — drafts and future-dated posts included. A
 * draft with broken frontmatter is still broken, and finding out on the morning
 * it publishes is finding out too late.
 */

const posts = getAllPostsUnfiltered()

describe('blog frontmatter', () => {
	it('finds the content directory', () => {
		// Guards the silent-success failure mode: `readSlugs` returns [] when the
		// directory is missing, so without this assertion a renamed content folder
		// would make every check below vacuously pass.
		expect(posts.length).toBeGreaterThan(0)
	})

	for (const post of posts) {
		describe(`content/blog/${post.slug}.mdx`, () => {
			it('satisfies the schema', () => {
				const result = postFrontmatterSchema.safeParse(post.frontmatter)
				expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
			})

			it('has a slug that is a valid URL segment and filename', () => {
				expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
			})

			it('uses only tags from the controlled vocabulary', () => {
				for (const tag of post.frontmatter.tags) {
					expect(TAGS).toContain(tag)
				}
			})

			it('has a real reading time', () => {
				expect(post.readingTimeMinutes).toBeGreaterThan(0)
			})
		})
	}

	it('has no duplicate slugs', () => {
		const slugs = posts.map((post) => post.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
	})

	it('has no duplicate titles', () => {
		// Two posts with one title means two identical <title> elements, which is
		// an SEO duplicate-content signal and makes search results unusable.
		const titles = posts.map((post) => post.frontmatter.title)
		expect(new Set(titles).size).toBe(titles.length)
	})
})

describe('route manifest', () => {
	it('uses trailing slashes everywhere except the root', () => {
		// trailingSlash: true is load-bearing on GitHub Pages. A path here without
		// one produces a link that resolves one level shallower than the asset
		// paths in the page it loads — the silent total-styling-failure mode.
		for (const route of staticRoutes) {
			expect(route.path.endsWith('/')).toBe(true)
		}
	})

	it('has no duplicate paths', () => {
		const paths = staticRoutes.map((route) => route.path)
		expect(new Set(paths).size).toBe(paths.length)
	})

	it('keeps the footer exhaustive over every route', () => {
		// The footer is the accessibility safety net: every route reachable from
		// every page without JavaScript. A route missing from it is reachable only
		// through the 5-item primary nav — i.e. mostly not reachable at all.
		// Home is exempt; it is the wordmark, not a footer link.
		//
		// This asserts the *manifest*, which exists now, rather than the rendered
		// footer, which is L-06. That is the useful half: the omission this catches
		// is "a route was added and nobody put it in the footer", and it catches it
		// in the PR that adds the route rather than months later.
		const inFooter = new Set(footerGroups.flatMap((group) => group.items))
		const missing = staticRoutes
			.filter((route) => route.path !== '/')
			.map((route) => route.path)
			.filter((path) => !inFooter.has(path))

		expect(missing, 'routes absent from the footer site map').toEqual([])
	})

	it('keeps the primary nav within five items', () => {
		// docs/WEBSITE_STRUCTURE.md §2 — "a nav that requires reading is a nav that
		// failed". The limit is the design decision; this is what enforces it.
		expect(primaryNav.length).toBeLessThanOrEqual(5)
	})

	it('points every nav and footer entry at a route that exists', () => {
		const known = new Set(staticRoutes.map((route) => route.path))
		const referenced = [...primaryNav, ...footerGroups.flatMap((g) => g.items)]
		for (const path of referenced) {
			expect(known, `${path} is linked but not in staticRoutes`).toContain(path)
		}
	})
})
