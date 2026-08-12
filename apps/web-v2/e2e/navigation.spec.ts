import { expect, test } from '@playwright/test'
import { allRoutes } from './routes'

/**
 * F0-11 — every route loads, from the real export.
 *
 * The 200 assertion is not redundant with the heading assertion: GitHub Pages
 * serves 404.html with a 404 status and real content, so a page that renders
 * text can still be a missing route. Only the status distinguishes them.
 */
test.describe('navigation', () => {
	for (const route of allRoutes) {
		test(`${route.path} loads with a single correct h1`, async ({ page }) => {
			const response = await page.goto(route.path)
			expect(response?.status()).toBe(200)

			const headings = page.locator('h1')
			await expect(headings).toHaveCount(1)
			await expect(headings).toHaveText(route.heading)

			await expect(page).toHaveTitle(/Rahul Rocket/)
		})
	}

	test('trailing-slash form is what is served', async ({ page }) => {
		// trailingSlash: true in next.config.mjs is load-bearing on Pages: without
		// it every internal link resolves one level shallower than the asset paths
		// in the HTML it loads, and the page renders with no styling at all.
		// Asserting it here means the config cannot be changed silently.
		const response = await page.goto('/')
		expect(response?.url()).toMatch(/\/$/)
	})
})

test('an unknown path serves the custom 404', async ({ page }) => {
	const response = await page.goto('/this-route-does-not-exist/')
	expect(response?.status()).toBe(404)
	await expect(page.locator('body')).toContainText(/404|not found/i)
})
