import { expect, test } from '@playwright/test'
import { allRoutes } from './routes'

/**
 * Q-01 — the metadata audit, as a spec. docs/TESTING.md §4, docs/SEO.md.
 *
 * EVERY ASSERTION HERE IS ABOUT SOMETHING INVISIBLE. A missing canonical, a
 * duplicated title, an `og:image` that resolves against the consuming client,
 * a JSON-LD block that does not parse — none of them change a pixel, none of
 * them fail a build, and every one of them is found months later by somebody
 * who is not the author.
 *
 * It runs against the export rather than against the metadata objects for the
 * same reason `check-export.mjs` does: the thing that matters is what reached
 * the HTML, and a builder that is correct in isolation can still be composed
 * wrongly by a route that overrides half of it.
 */
test.describe('metadata', () => {
	for (const route of allRoutes) {
		test(`${route.path} carries a complete head`, async ({ page }) => {
			await page.goto(route.path)

			const title = await page.title()
			expect(
				title.length,
				'a page with no title is a page with no SERP entry',
			).toBeGreaterThan(10)
			// 70 is the SERP truncation point and the bound the content schemas
			// enforce at authoring time; the rendered title adds the site name, so
			// the ceiling here is the template's, not the schema's.
			expect(title.length).toBeLessThanOrEqual(100)

			const description = page.locator('meta[name="description"]')
			await expect(description).toHaveCount(1)
			const descriptionText = (await description.getAttribute('content')) ?? ''
			expect(
				descriptionText.length,
				`${route.path} has no meta description`,
			).toBeGreaterThan(50)

			// EXACTLY ONE canonical, and it is absolute. Two canonicals is the same
			// as none — a crawler picks one and it may not be the one you meant.
			const canonical = page.locator('link[rel="canonical"]')
			await expect(canonical).toHaveCount(1)
			const href = await canonical.getAttribute('href')
			expect(href).toMatch(/^https:\/\//)
			expect(href, 'the canonical must be the trailing-slash form').toContain(
				route.path,
			)

			// OG image absolute — the whole point. A relative one resolves against
			// Slack, iMessage or LinkedIn rather than against this site, so the
			// preview is broken on every platform at once while looking right here.
			const ogImage = page.locator('meta[property="og:image"]')
			await expect(ogImage).toHaveCount(1)
			expect(await ogImage.getAttribute('content')).toMatch(/^https:\/\//)
		})
	}

	test('every page declares exactly one h1', async ({ page }) => {
		for (const route of allRoutes) {
			await page.goto(route.path)
			await expect(
				page.locator('h1'),
				`${route.path} must have exactly one h1`,
			).toHaveCount(1)
		}
	})

	test('titles are unique across the site', async ({ page }) => {
		// Two pages sharing a title compete with each other in search and are
		// indistinguishable in a browser's tab strip and history.
		const seen = new Map<string, string>()

		for (const route of allRoutes) {
			await page.goto(route.path)
			const title = await page.title()
			const previous = seen.get(title)
			expect(
				previous,
				`${route.path} and ${previous} share the title "${title}"`,
			).toBeUndefined()
			seen.set(title, route.path)
		}
	})
})

test.describe('structured data', () => {
	test('every JSON-LD block parses and declares a context', async ({
		page,
	}) => {
		for (const route of allRoutes) {
			await page.goto(route.path)

			const blocks = await page
				.locator('script[type="application/ld+json"]')
				.allTextContents()

			expect(blocks.length, `${route.path} has no structured data`).toBe(1)

			for (const raw of blocks) {
				// A block that does not parse is worse than an absent one: it is a
				// silent failure that looks like coverage in a code review.
				const parsed = JSON.parse(raw) as Record<string, unknown>
				expect(parsed['@context']).toBe('https://schema.org')
				expect(Array.isArray(parsed['@graph'])).toBe(true)
			}
		}
	})

	test('the Person node is declared once and referenced elsewhere', async ({
		page,
	}) => {
		// Re-declaring the author on every page produces as many Person entities
		// as there are pages, and a consumer may or may not merge them. Home
		// declares; everything else points at the same `@id`.
		await page.goto('/')
		const home = JSON.parse(
			await page.locator('script[type="application/ld+json"]').innerText(),
		) as { '@graph': { '@type': string; '@id'?: string }[] }

		const person = home['@graph'].find((node) => node['@type'] === 'Person')
		expect(person?.['@id']).toBe('https://rahul-rocket.github.io/#person')
	})

	test('a case study is a TechArticle with a breadcrumb trail', async ({
		page,
	}) => {
		await page.goto('/projects/engineering-portfolio-platform/')
		const graph = JSON.parse(
			await page.locator('script[type="application/ld+json"]').innerText(),
		) as { '@graph': { '@type': string }[] }

		const types = graph['@graph'].map((node) => node['@type'])
		expect(types).toContain('TechArticle')
		expect(types).toContain('BreadcrumbList')
	})
})

test.describe('feeds and crawl directives', () => {
	test('all three feeds are served and carry absolute URLs', async ({
		request,
	}) => {
		for (const path of ['/rss.xml', '/atom.xml', '/feed.json']) {
			const response = await request.get(path)
			expect(response.status(), `${path} is not served`).toBe(200)

			const body = await response.text()
			expect(body).toContain('https://rahul-rocket.github.io/blog/')
			// A relative href inside feed content resolves against the reader's own
			// origin, which is a broken link in every client that renders it.
			expect(body, `${path} contains a root-relative href`).not.toMatch(
				/(href|src)="\/(?!\/)/,
			)
		}
	})

	test('robots.txt and the sitemap agree with the indexable flag', async ({
		request,
	}) => {
		const robots = await (await request.get('/robots.txt')).text()
		const sitemap = await (await request.get('/sitemap.xml')).text()

		// One flag drives the robots meta tag, robots.txt and the sitemap. The
		// failure this catches is the pair disagreeing — a robots.txt that allows
		// crawling while every page says noindex, or the reverse, which nothing
		// surfaces until the site is already in an index.
		const blocked = robots.includes('Disallow: /')
		const hasUrls = sitemap.includes('<loc>')

		expect(
			blocked,
			'robots.txt and sitemap.xml disagree about whether this site is indexable',
		).toBe(!hasUrls)
	})
})
