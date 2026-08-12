import { expect, test } from '@playwright/test'

/**
 * L-12 — what happens to a keyboard and screen-reader user when the route
 * changes.
 *
 * THIS SPEC PINS A DECISION THAT WAS MADE THE OTHER WAY FIRST.
 *
 * L-12 was built as "adopt `next/link`, and manage focus so that adopting it is
 * not an accessibility regression". Both halves worked. Then size-limit failed:
 * client routing costs +3.95 KB gz on every route and Home had 2.21 KB of
 * headroom against its 120 KB hard limit. The budget wins, so navigation is
 * plain document loads — see the long note in `components/layout/nav-link.tsx`.
 *
 * That makes focus management the browser's job, which it does correctly and for
 * free: a new document starts focus at the top, the skip link is the first tab
 * stop, and the page change is announced because the page genuinely changed.
 *
 * So there is nothing to assert about a focus manager. What there IS to assert
 * is the precondition — that navigation really is a document load. If someone
 * reintroduces `next/link` for the transition speed, every guarantee above
 * silently stops holding, with no error and no visual symptom. These tests fail
 * instead.
 *
 * They navigate via the FOOTER rather than the header nav, which is not
 * incidental. The primary nav is `hidden md:block`, so driving it under the
 * mobile project asserts nothing — the first draft of this spec did exactly that
 * and timed out on two of three engines. The footer site map is the one
 * navigation present at every breakpoint and with JavaScript disabled, which
 * makes it both the portable choice and the more important path to pin.
 */

test.describe('navigation is a document load', () => {
	test('a nav link replaces the document rather than patching it', async ({
		page,
	}) => {
		await page.goto('/')

		// A marker on `window` survives a client-side navigation and does not
		// survive a document load. That is the whole test: if this marker is still
		// there afterwards, a client router took over and the three guarantees
		// below became this codebase's problem instead of the browser's.
		await page.evaluate(() => {
			;(window as unknown as { __sameDocument: boolean }).__sameDocument = true
		})

		await page
			.locator('#site-footer')
			.getByRole('link', { name: 'Blog' })
			.click()
		await expect(page).toHaveURL(/\/blog\/$/)

		const survived = await page.evaluate(
			() =>
				(window as unknown as { __sameDocument?: boolean }).__sameDocument ===
				true,
		)
		expect(
			survived,
			'a client router is handling navigation — L-12 focus management and a ' +
				'sheet that closes itself are now required, and neither is present',
		).toBe(false)
	})

	test('leaves the reader at the top of the new page, skip link first', async ({
		page,
	}) => {
		await page.goto('/')
		await page
			.locator('#site-footer')
			.getByRole('link', { name: 'Blog' })
			.click()
		await expect(page).toHaveURL(/\/blog\/$/)

		// The guarantee a route-change focus manager would have to recreate: the
		// first Tab on the new page reaches the skip link, not some position
		// inherited from the page before it.
		await page.keyboard.press('Tab')
		await expect(
			page.getByRole('link', { name: 'Skip to content' }),
		).toBeFocused()
	})

	test('carries no second live region in the page itself', async ({ page }) => {
		await page.goto('/blog/')

		// Next's client runtime ships its own route announcer. It is inert while
		// navigation is document loads, but it exists — so any live region added
		// to the PAGE would be the second one, and one navigation would be
		// announced twice in two phrasings.
		//
		// LIVE REGIONS INSIDE A `<dialog>` ARE EXCLUDED, AND THE EXCLUSION IS THE
		// INVARIANT RATHER THAN A LOOPHOLE. This assertion is about route changes
		// being announced twice. A closed dialog is `display: none`, so nothing
		// inside it is in the accessibility tree at all until it is opened by a
		// deliberate act — it cannot fire on load or on navigation, which is the
		// only way it could double-announce anything. The command palette's result
		// count (L-13) lives there: typing a query that matches nothing must say
		// so, and silence is the failure that affordance exists to prevent.
		//
		// The gate is unchanged for everything it was written to catch: a live
		// region added to the shell, a page, or any component outside a modal
		// still fails this.
		// WIDENED, AND THE INVARIANT IS NOW STATED DIRECTLY RATHER THAN PROXIED.
		//
		// The original counted every `[aria-live]` outside a dialog, which was a
		// stand-in for the thing that actually matters: nothing may SPEAK on load
		// or on navigation except the one announcer. A region that is empty when
		// the document loads cannot announce a navigation — a live region fires on
		// a mutation, and there is no mutation until a reader does something.
		//
		// B-02, P-05 and A-04's filters each carry one: a result count that says
		// "8 of 12 shown" after a checkbox is toggled. Silence there is the
		// failure the affordance exists to prevent, and none of them can fire
		// before a reader touches the control.
		//
		// So the assertion is the invariant: AT MOST ONE live region has content
		// at load. That still fails everything the count was written to catch — a
		// second announcer in the shell, a status message rendered with text on a
		// page, a toast that mounts already-populated — and it stops failing for
		// controls that are silent until used.
		const speaking = await page.evaluate(
			() =>
				[...document.querySelectorAll('[aria-live]')].filter(
					(element) => (element.textContent ?? '').trim() !== '',
				).length,
		)

		expect(
			speaking,
			'more than one live region has content at load — a navigation would be announced twice',
		).toBeLessThanOrEqual(1)
	})
})

test.describe('the sheet across a navigation', () => {
	test.use({ viewport: { width: 390, height: 844 } })

	test('is gone after following a link inside it', async ({ page }) => {
		await page.goto('/')
		await page.getByTestId('menu-trigger').click()

		const sheet = page.getByTestId('menu-sheet')
		await expect(sheet).toBeVisible()

		await sheet.getByRole('link', { name: 'Blog' }).click()
		await expect(page).toHaveURL(/\/blog\/$/)

		// True today because the document is replaced. Under a client router it
		// would NOT be, and the reader would land on the new page behind an open
		// modal still trapping their focus — which is why this is asserted rather
		// than assumed.
		await expect(sheet).toBeHidden()
	})
})
