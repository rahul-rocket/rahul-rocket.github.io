import { expect, test } from '@playwright/test'

/**
 * L-02/L-05 acceptance — the shell, driven only by the keyboard.
 *
 * These are the specs the backlog names as the proof for the skip link and the
 * sheet, and they are E2E rather than unit tests on purpose. Focus order,
 * `inert`, and a modal focus trap are browser behaviours; jsdom models all three
 * badly enough that a passing unit test would be evidence of nothing. This suite
 * runs against the real export in three engines (playwright.config.ts).
 *
 * Everything here is asserted through what a keyboard user actually experiences
 * — where focus is after a key press — rather than through the attributes that
 * are supposed to cause it. An implementation that sets every correct attribute
 * and still loses focus fails these tests, which is the point.
 */

test.describe('skip link', () => {
	test('is the first thing Tab reaches, and is visible once it is', async ({
		page,
	}) => {
		await page.goto('/')
		await page.keyboard.press('Tab')

		const skipLink = page.getByRole('link', { name: 'Skip to content' })
		await expect(skipLink).toBeFocused()

		// `sr-only` clips it to a 1px box; focus must undo that. A skip link that
		// stays clipped is present, operable, and useless — a sighted keyboard user
		// has no idea it is there.
		await expect(skipLink).toBeVisible()
		const box = await skipLink.boundingBox()
		expect(box?.width ?? 0).toBeGreaterThan(40)
	})

	test('moves the reader past the header, not just the scroll position', async ({
		page,
	}) => {
		await page.goto('/')
		await page.keyboard.press('Tab')
		await page.keyboard.press('Enter')

		expect(page.url()).toContain('#main')

		// The real guarantee: the NEXT tab stop is inside the content, not back in
		// the navigation. Following the link without moving focus scrolls the page
		// and leaves the reader tabbing through the header again, which is the bug
		// `tabIndex={-1}` on <main> exists to prevent.
		await page.keyboard.press('Tab')
		const focusedIsInsideMain = await page.evaluate(
			() => document.activeElement?.closest('main') !== null,
		)
		expect(focusedIsInsideMain).toBe(true)
	})
})

/**
 * The sheet is mobile-only, so this block sets a phone viewport rather than
 * skipping outside the mobile project. A conditional skip would mean the
 * behaviour is unverified in two of the three engines while the run still
 * reports green — CLAUDE.md §15.3.
 */
test.describe('mobile navigation sheet', () => {
	test.use({ viewport: { width: 390, height: 844 } })

	test('traps focus while open and returns it to the trigger on Escape', async ({
		page,
	}) => {
		await page.goto('/')

		const trigger = page.getByTestId('menu-trigger')
		await expect(trigger).toBeVisible()
		await trigger.click()

		const sheet = page.getByTestId('menu-sheet')
		await expect(sheet).toBeVisible()

		// Focus must move INTO the dialog on open — a modal the keyboard is still
		// outside of is a modal that cannot be operated or dismissed.
		expect(
			await page.evaluate(
				() => document.activeElement?.closest('dialog') !== null,
			),
		).toBe(true)

		// Tab well past the number of focusable elements in the sheet. If the trap
		// is absent, focus reaches the header or the footer within a few presses.
		//
		// The assertion is "never lands on a background control", not "never
		// leaves the dialog", because those are not the same thing and the first
		// draft of this test asserted the wrong one. Tabbing past the last control
		// in a modal dialog hands focus to the browser's own UI, and what the page
		// then reports as `activeElement` is <body> — correct behaviour that the
		// stricter assertion failed on. What `showModal()` actually guarantees, and
		// all that matters here, is that nothing behind the dialog can be reached.
		for (let i = 0; i < 12; i++) {
			await page.keyboard.press('Tab')
			const position = await page.evaluate(() => {
				const active = document.activeElement
				if (!active || active === document.body) return 'document'
				return active.closest('dialog') ? 'sheet' : 'background'
			})
			expect(position, `focus escaped the sheet on Tab #${i + 1}`).not.toBe(
				'background',
			)
		}

		await page.keyboard.press('Escape')
		await expect(sheet).toBeHidden()

		// Restored to the trigger, not to <body>. Focus dumped on the body sends
		// the next Tab back to the top of the document, so dismissing the menu
		// would cost a keyboard user their place on the page.
		await expect(trigger).toBeFocused()
	})

	test('makes the page behind it inert', async ({ page }) => {
		await page.goto('/')
		await page.getByTestId('menu-trigger').click()

		// Not an attribute assertion: `showModal()` does not set `inert` on
		// anything, it makes the rest of the document inert by moving the dialog
		// into the top layer. What can be observed — and what matters — is that
		// background controls cannot be reached or operated.
		const backgroundLink = page.locator('#site-footer a').first()
		await expect(backgroundLink).not.toBeFocused()

		const reachable = await page.evaluate(() => {
			const link = document.querySelector<HTMLElement>('#site-footer a')
			if (!link) return 'no-link'
			link.focus()
			return document.activeElement === link ? 'focusable' : 'inert'
		})
		expect(reachable).toBe('inert')
	})

	test('closes when the backdrop is clicked', async ({ page }) => {
		await page.goto('/')
		await page.getByTestId('menu-trigger').click()

		const sheet = page.getByTestId('menu-sheet')
		await expect(sheet).toBeVisible()

		// Far left of a right-hand sheet — backdrop, not panel. The click lands on
		// the dialog element itself, which is how the handler tells the two apart;
		// a click inside the panel targets a descendant and must NOT close it.
		await page.mouse.click(10, 400)
		await expect(sheet).toBeHidden()
	})

	test('does not close when the panel itself is clicked', async ({ page }) => {
		await page.goto('/')
		await page.getByTestId('menu-trigger').click()

		const sheet = page.getByTestId('menu-sheet')

		// The PANEL's own padding, not the centre of the nav. The nav's centre is
		// empty space only while the route manifest is short; once Phases 5-9
		// landed it sat on a link, and this test began failing by navigating away
		// rather than by finding the bug it exists to find. A click target chosen
		// for "there is nothing here today" is a test that expires silently.
		await page.getByTestId('menu-panel').click({ position: { x: 4, y: 4 } })
		await expect(sheet).toBeVisible()
	})
})
