import { expect, test } from '@playwright/test'

/**
 * L-13 acceptance — the command palette.
 *
 * The dialog behaviours (focus in, trap, Escape, focus restore, inert
 * background) belong to `showModal()` and are already proven for this pattern by
 * `keyboard.spec.ts`'s sheet block. What is asserted here is what the palette
 * adds on top: the shortcut, the filtering, the keyboard accelerators, the
 * action, and the guarantee that none of it is load-bearing.
 *
 * `ControlOrMeta` is Playwright's platform-correct modifier, so this covers ⌘K
 * on WebKit and Ctrl+K on Chromium from one line.
 */

test.describe('command palette', () => {
	test('opens on the shortcut, closes on Escape, and restores focus', async ({
		page,
	}) => {
		await page.goto('/')

		const palette = page.getByTestId('command-palette')
		await expect(palette).toBeHidden()

		await page.keyboard.press('ControlOrMeta+k')
		await expect(palette).toBeVisible()

		// The search box must be focused on open. A palette that opens without the
		// caret in the input makes the reader reach for the mouse to use the
		// keyboard feature they just invoked.
		await expect(page.getByTestId('palette-input')).toBeFocused()

		await page.keyboard.press('Escape')
		await expect(palette).toBeHidden()
		await expect(page.getByTestId('palette-trigger')).toBeFocused()
	})

	test('toggles closed on a second press of the shortcut', async ({ page }) => {
		await page.goto('/')

		await page.keyboard.press('ControlOrMeta+k')
		await expect(page.getByTestId('command-palette')).toBeVisible()

		// `showModal()` on an already-open dialog throws InvalidStateError, so this
		// is the case where a naive handler breaks the page rather than the feature.
		await page.keyboard.press('ControlOrMeta+k')
		await expect(page.getByTestId('command-palette')).toBeHidden()
	})

	test('opens from the visible trigger, for readers who do not know the shortcut', async ({
		page,
	}) => {
		await page.goto('/')
		await page.getByTestId('palette-trigger').click()
		await expect(page.getByTestId('command-palette')).toBeVisible()
	})

	test('filters as you type and offers real links', async ({ page }) => {
		await page.goto('/')
		await page.keyboard.press('ControlOrMeta+k')

		const palette = page.getByTestId('command-palette')
		// Rows are `<a>` and `<button>`, not `role="option"` — asserted through the
		// roles a screen reader would actually encounter, which is what makes this
		// a test of the semantics rather than of the markup.
		await expect(palette.getByRole('link', { name: 'Blog' })).toBeVisible()

		await page.getByTestId('palette-input').fill('blog')
		await expect(palette.getByRole('link', { name: 'Blog' })).toBeVisible()
		// "Toggle theme" shares no subsequence with "blog", so it must be gone.
		await expect(
			palette.getByRole('button', { name: 'Toggle theme' }),
		).toBeHidden()

		// The empty state ECHOES THE QUERY BACK, which is the assertion worth
		// making: "No matches." alone cannot distinguish a palette that filtered
		// correctly from one that never received the keystrokes.
		await page.getByTestId('palette-input').fill('zzzzqqq')
		await expect(palette.getByText(/No matches for/)).toBeVisible()
		await expect(palette.getByText(/zzzzqqq/)).toBeVisible()
	})

	test('Enter on the search box follows the top result', async ({ page }) => {
		await page.goto('/')
		await page.keyboard.press('ControlOrMeta+k')

		await page.getByTestId('palette-input').fill('blog')
		await page.keyboard.press('Enter')

		await page.waitForURL('**/blog/')
		expect(page.url()).toContain('/blog/')
	})

	test('ArrowDown moves focus from the input into the results', async ({
		page,
	}) => {
		await page.goto('/')
		await page.keyboard.press('ControlOrMeta+k')

		await page.keyboard.press('ArrowDown')

		// The accelerator's job is to put focus on a real row. Asserting "focus is
		// on a command row" rather than "on this particular link" keeps the test
		// honest as the corpus grows with the site.
		const focusedIsRow = await page.evaluate(
			() => document.activeElement?.hasAttribute('data-command') ?? false,
		)
		expect(focusedIsRow).toBe(true)
	})

	test('the theme action changes the theme and keeps the header toggle honest', async ({
		page,
	}) => {
		await page.goto('/')

		const before = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme'),
		)

		await page.keyboard.press('ControlOrMeta+k')
		await page.getByRole('button', { name: 'Toggle theme' }).click()

		await expect(page.getByTestId('command-palette')).toBeHidden()

		const after = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme'),
		)
		expect(after).not.toBe(before)

		// The regression this exists for: the header toggle reads the theme from the
		// DOM, and when it only did so on mount, `aria-pressed` went stale the
		// moment the palette changed the theme — a screen reader would announce
		// "pressed" for the light theme. The toggle observes the attribute now.
		await expect(page.getByTestId('theme-toggle')).toHaveAttribute(
			'aria-pressed',
			after === 'dark' ? 'true' : 'false',
		)
	})

	test('is a pure enhancement: nothing it offers is only reachable through it', async ({
		browser,
	}) => {
		// WEBSITE_STRUCTURE.md §2: "never the only path to anything." With
		// JavaScript off the trigger is not operable and the shortcut does nothing,
		// so the footer site map has to carry every route the palette lists.
		const context = await browser.newContext({ javaScriptEnabled: false })
		const page = await context.newPage()
		await page.goto('/')

		await expect(
			page.locator('#site-footer').getByRole('link'),
		).not.toHaveCount(0)
		await expect(
			page.locator('#site-footer').getByRole('link', { name: 'Blog' }),
		).toBeVisible()

		// The trigger is `data-js-only`: present in the markup, but hidden and out
		// of the tab order, because a button whose whole behaviour is showModal()
		// is a dead control without JavaScript.
		await expect(page.getByTestId('palette-trigger')).toBeHidden()

		await context.close()
	})
})
