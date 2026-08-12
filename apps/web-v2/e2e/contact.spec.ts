import { expect, test } from '@playwright/test'

/**
 * C-01/C-02 — the contact surface. docs/TESTING.md §4,
 * docs/WEBSITE_STRUCTURE.md §4.12.
 *
 * THE PAGE HAS TWO SHAPES AND BOTH ARE CORRECT. With `site.formspreeEndpoint`
 * set, the form POSTs to that endpoint. With it empty, the same form is a
 * composer: it validates identically and hands the finished message to the
 * reader's own mail client, so nothing typed here can go nowhere. Either way
 * the pre-filled `mailto:` is on the page beside it.
 *
 * So this spec asserts the INVARIANT rather than one of the two layouts: there
 * is always a working way to send a message, it is always reachable by
 * keyboard, and it always works without JavaScript. A spec written against
 * whichever shape happens to be configured today would fail the day the
 * endpoint is filled in, which is the wrong signal entirely.
 *
 * The submit button is matched by /Send message|Compose this message/ for the
 * same reason: the label names what the control actually does in each mode,
 * and the behaviour under test — inline validation, announced — is identical
 * across both.
 */

test.describe('contact', () => {
	test('always offers a reachable way to send a message', async ({ page }) => {
		await page.goto('/contact/')

		const mailto = page.locator('a[href^="mailto:"]').first()
		await expect(mailto).toBeVisible()

		// C-02: the subject and body are pre-filled, so the reader is not staring
		// at an empty compose window wondering what to say.
		const href = (await mailto.getAttribute('href')) ?? ''
		expect(href).toContain('subject=')
		expect(href).toContain('body=')
	})

	test('states what to include and what to expect', async ({ page }) => {
		await page.goto('/contact/')

		// §4.12 asks for both. They are the difference between a contact page and
		// an email address: the reader learns what a useful message looks like and
		// how long to wait before assuming it was lost.
		await expect(
			page.getByRole('heading', { name: /What to include/i }),
		).toBeVisible()
		await expect(
			page.getByRole('heading', { name: /What to expect/i }),
		).toBeVisible()
	})

	test('works with JavaScript disabled', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false })
		const page = await context.newPage()
		await page.goto('/contact/')

		await expect(page.locator('h1')).toHaveText('Get in touch')
		await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible()

		await context.close()
	})

	test('the form validates inline and announces it', async ({ page }) => {
		await page.goto('/contact/')

		// No `test.skip` on a missing form any more: the form is rendered in both
		// modes, so its absence is a failure rather than a configuration.
		await expect(page.locator('form')).toHaveCount(1)

		// Submitting empty must not post. Errors are associated by
		// `aria-describedby` and are words rather than a red border — "never
		// colour alone" applies to validation more than anywhere else.
		await page
			.getByRole('button', { name: /Send message|Compose this message/ })
			.click()

		const name = page.getByLabel('Your name')
		await expect(name).toHaveAttribute('aria-invalid', 'true')

		const describedBy = await name.getAttribute('aria-describedby')
		expect(
			describedBy,
			'an error with no association is an error nobody hears',
		).toBeTruthy()
		// `[id="…"]`, NOT `#…`. React's `useId` produces ids containing colons
		// (`:Rnk:-name-error`), which are legal HTML ids and illegal CSS
		// identifiers — `#` throws "Unexpected token" before it ever queries. This
		// line only started running when the form stopped being conditional, so
		// the bug was latent behind a `test.skip` rather than newly introduced.
		await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
			/enter your name/i,
		)

		// Focus lands on the first invalid field, not on a summary: the reader's
		// next action is to fix it, and moving focus to a summary makes them find
		// the field again themselves.
		await expect(name).toBeFocused()
	})

	test('the honeypot is hidden from assistive technology, not just from sight', async ({
		page,
	}) => {
		await page.goto('/contact/')
		const honeypot = page.locator('input[name="website"]')

		// A screen-reader user must never meet a field they are required to leave
		// empty. `aria-hidden` on the wrapper AND `tabIndex={-1}` on the input are
		// both required — either alone leaves it reachable.
		await expect(honeypot).toHaveAttribute('tabindex', '-1')
		await expect(
			page.locator('[aria-hidden="true"] input[name="website"]'),
		).toHaveCount(1)
	})
})
