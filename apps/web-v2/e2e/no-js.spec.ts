import { expect, test } from '@playwright/test'
import { allRoutes } from './routes'

/**
 * The highest-value spec in the suite. docs/TESTING.md §4.
 *
 * The reveal-animation pattern this project uses makes it structurally possible
 * to ship a page whose content is invisible without JavaScript: the served HTML
 * carries `opacity: 0` and a script is what removes it. This spec is the
 * mechanism that prevents it. Without it the guarantee in CLAUDE.md §8 is an
 * intention rather than a fact.
 *
 * There is nothing animated on the page today, which is exactly why the spec is
 * written now — it must already be failing-capable before the first reveal
 * animation lands in Phase 4, not added afterwards in response to a bug.
 */
test.use({ javaScriptEnabled: false })

test.describe('without JavaScript', () => {
	for (const route of allRoutes) {
		test(`${route.path} renders its content`, async ({ page }) => {
			await page.goto(route.path)

			await expect(page.locator('h1')).toBeVisible()
			await expect(page.locator('h1')).toHaveText(route.heading)

			// Nothing in the served HTML may be stuck transparent or collapsed.
			// Checked on the computed style, not the attribute, so a stylesheet rule
			// is caught as well as an inline one.
			const hidden = await page.evaluate(() => {
				const offenders: string[] = []
				for (const el of document.querySelectorAll('body *')) {
					const style = getComputedStyle(el)
					if (style.visibility === 'hidden') continue // deliberate, not a reveal

					// Hidden by CSS until hover or focus, with no JavaScript involved —
					// so it is already in its finished state. The opt-out is an explicit
					// attribute rather than a selector list in this spec, because the
					// justification then lives next to the element that claims it and
					// shows up in the diff that adds one.
					if (el.hasAttribute('data-hover-reveal')) continue

					if (Number.parseFloat(style.opacity) < 0.05) {
						offenders.push(`${el.tagName.toLowerCase()}.${el.className}`)
					}
				}
				return offenders
			})
			expect(
				hidden,
				'elements left at opacity 0 with JavaScript disabled',
			).toEqual([])
		})
	}
})

/**
 * L-05's other half. The sheet trigger cannot work without JavaScript — its
 * whole behaviour is `dialog.showModal()` — so the shell hides it and the footer
 * carries the navigation instead (WEBSITE_STRUCTURE.md §2, "the accessibility
 * safety net").
 *
 * Both halves are asserted, because either one alone is a bug: a visible dead
 * button, or a page with no way out of it.
 */
test.describe('navigation without JavaScript', () => {
	test.use({ viewport: { width: 390, height: 844 } })

	test('hides the sheet trigger and navigates by the footer instead', async ({
		page,
	}) => {
		await page.goto('/')

		// Not merely invisible: `visibility: hidden` also takes it out of the tab
		// order and the accessibility tree. An invisible-but-focusable control is
		// the phantom-focus bug, and it would be worse than showing the button.
		await expect(page.getByTestId('menu-trigger')).toBeHidden()

		const footerLinks = page.locator('#site-footer nav a')
		expect(await footerLinks.count()).toBeGreaterThan(0)

		// The fallback has to actually go somewhere — reachable, not just present.
		const href = await footerLinks.first().getAttribute('href')
		const response = await page.goto(href ?? '/')
		expect(response?.status()).toBe(200)
	})
})
