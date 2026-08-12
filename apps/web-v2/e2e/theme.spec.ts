import { expect, test } from '@playwright/test'
import { THEME_STORAGE_KEY } from '../src/lib/theme'

/**
 * F1-09 — the pre-paint theme script.
 *
 * The thing being defended is a flash: if the theme is resolved by React
 * instead of by a blocking inline script, the browser paints the server's
 * default first and then swaps. It is the single most visible defect a
 * dark-mode site can ship, and it is invisible in a dev-server preview because
 * hydration there is instant.
 *
 * These run against the real export (`serve out/`), so they exercise the served
 * HTML rather than a dev render.
 *
 * THE STORAGE KEY IS IMPORTED, NOT TYPED OUT. It was typed out, as `'ui-theme'`,
 * while `lib/theme.ts` exports `'rr-theme'` — so two of these tests seeded a key
 * nothing reads, got the system preference back, and failed. A third seeded junk
 * under the same wrong key and *passed*, because a key that does not exist and a
 * key holding garbage both fall through to the same branch. That is the worse
 * half: a spec asserting the fallback path while believing it asserts the stored
 * path.
 *
 * Importing the constant is the same discipline `e2e/routes.ts` applies to the
 * route manifest — the suite reads the value the code uses, so the two cannot
 * disagree. A string duplicated across a boundary is a bug with a delay on it.
 */

const BG_DARK = 'rgb(5, 5, 6)'

test.describe('theme', () => {
	// Declared, not assumed. The first version of this file left the browser at
	// Playwright's default (`light`) while asserting `dark`, and two tests failed
	// — correctly. The script follows the SYSTEM preference when nothing valid is
	// stored (docs/DESIGN_SYSTEM.md §10: "Default: system preference"), so a test
	// that does not state the system preference is asserting nothing about the
	// code and everything about the harness.
	test.use({ colorScheme: 'dark' })

	test('resolves to the system preference before first paint', async ({
		page,
	}) => {
		await page.goto('/')
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
	})

	test('honours a stored preference on the very first paint', async ({
		page,
	}) => {
		// Seed storage, then load. The attribute must already be `light` at the
		// moment the document is parsed — not after hydration.
		await page.addInitScript((key) => {
			localStorage.setItem(key, 'light')
		}, THEME_STORAGE_KEY)
		await page.goto('/')

		const themeAtParse = await page.evaluate(
			() => document.documentElement.dataset.theme,
		)
		expect(themeAtParse).toBe('light')

		// And the light palette is genuinely applied, not merely the attribute.
		const background = await page.evaluate(
			() => getComputedStyle(document.body).backgroundColor,
		)
		expect(background).not.toBe(BG_DARK)
	})

	test('follows the system preference when nothing is stored', async ({
		browser,
	}) => {
		const context = await browser.newContext({ colorScheme: 'light' })
		const page = await context.newPage()
		await page.goto('/')
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
		await context.close()
	})

	test('an explicit choice is not overridden by the system', async ({
		browser,
	}) => {
		// The reader chose dark; their OS is light. The choice wins — an OS that
		// switches at sunset must not undo a deliberate preference.
		const context = await browser.newContext({ colorScheme: 'light' })
		const page = await context.newPage()
		await page.addInitScript((key) => {
			localStorage.setItem(key, 'dark')
		}, THEME_STORAGE_KEY)
		await page.goto('/')
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
		await context.close()
	})

	test('falls back to the system preference on a corrupted stored value', async ({
		page,
	}) => {
		// Anything can end up in localStorage. The script must fall back rather
		// than leave the document with no theme attribute at all, which would
		// render the page unstyled — and it must fall back to the SYSTEM
		// preference, not to a hardcoded default, because a junk value is not
		// evidence of what the reader wants.
		await page.addInitScript((key) => {
			localStorage.setItem(key, '{not-a-theme}')
		}, THEME_STORAGE_KEY)
		await page.goto('/')
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
	})
})
