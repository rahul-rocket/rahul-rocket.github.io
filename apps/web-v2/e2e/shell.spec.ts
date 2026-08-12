import { expect, test } from '@playwright/test'
import { allRoutes } from './routes'

/**
 * The rest of the global shell: the scroll progress rail, the back-to-top
 * button, and the responsiveness guarantee for the header.
 *
 * The rail and the button are CSS scroll-driven animations behind an
 * `@supports (animation-timeline: scroll())` gate, so every test here asserts
 * BOTH branches rather than skipping on engines without the feature. A skipped
 * test is a lie in the suite (CLAUDE.md §15.3) — and the fallback branch is a
 * real guarantee worth pinning, because "absent" is the designed degradation and
 * "frozen at zero" would be the bug.
 */

/** Does this engine implement scroll-driven animations? */
function supportsScrollTimeline(page: import('@playwright/test').Page) {
	return page.evaluate(() => CSS.supports('animation-timeline', 'scroll()'))
}

/** The rail's horizontal scale, 0…1 — what a reader sees as progress. */
function railScale(page: import('@playwright/test').Page) {
	return page.evaluate(() => {
		const rail = document.querySelector('[data-testid="scroll-progress"]')
		if (!rail) return null
		const matrix = new DOMMatrixReadOnly(getComputedStyle(rail).transform)
		return matrix.a
	})
}

async function scrollToBottom(page: import('@playwright/test').Page) {
	// `behavior: 'instant'` is required, not tidiness. globals.css sets
	// `html { scroll-behavior: smooth }`, so a plain `scrollTo` ANIMATES — the
	// first version of this test read the rail mid-flight and measured 23%. The
	// reduced-motion variant passed at the same moment, because the backstop
	// forces `scroll-behavior: auto`, which is what identified the cause.
	await page.evaluate(() =>
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: 'instant',
		}),
	)
	// Then wait for the scroll to actually be at the bottom before sampling, so
	// this cannot go flaky on a slow machine.
	await page.waitForFunction(() => {
		const max = document.documentElement.scrollHeight - window.innerHeight
		return Math.abs(window.scrollY - max) <= 2
	})
	// One more frame for the scroll timeline to sample the new position.
	await page.waitForTimeout(100)
}

test.describe('scroll progress rail', () => {
	test('advances with the scroll position, or is absent where unsupported', async ({
		page,
	}) => {
		await page.goto('/blog/static-export-content-pipeline/')

		const rail = page.getByTestId('scroll-progress')
		// It is always in the markup — it is a Server Component with no JavaScript.
		await expect(rail).toHaveCount(1)

		if (!(await supportsScrollTimeline(page))) {
			// The designed fallback: `display: none`, not a rail stuck at zero.
			await expect(rail).toBeHidden()
			return
		}

		expect(await railScale(page)).toBeCloseTo(0, 1)
		await scrollToBottom(page)
		expect(await railScale(page)).toBeCloseTo(1, 1)
	})

	test('still reports the truth under reduced motion', async ({ browser }) => {
		// THE REGRESSION THIS EXISTS FOR. themes.css forces
		// `animation-duration: 0.01ms !important` on everything under reduced
		// motion. If that ever applied to a scroll timeline, the rail would jump to
		// full at the first pixel of scroll — not "less motion", but false
		// information. docs/ANIMATION_GUIDELINES.md §3 lists item 24 as kept under
		// reduced motion precisely because it is information.
		const context = await browser.newContext({ reducedMotion: 'reduce' })
		const page = await context.newPage()
		await page.goto('/blog/static-export-content-pipeline/')

		if (await supportsScrollTimeline(page)) {
			expect(await railScale(page)).toBeCloseTo(0, 1)
			await scrollToBottom(page)
			expect(await railScale(page)).toBeCloseTo(1, 1)
		} else {
			await expect(page.getByTestId('scroll-progress')).toBeHidden()
		}

		await context.close()
	})
})

test.describe('back to top', () => {
	test('is hidden at the top, reachable after scrolling, and never a hidden tab stop', async ({
		page,
	}) => {
		await page.goto('/blog/static-export-content-pipeline/')

		const button = page.getByTestId('back-to-top')
		await expect(button).toHaveCount(1)

		if (!(await supportsScrollTimeline(page))) {
			await expect(button).toBeHidden()
			return
		}

		// Hidden with `visibility`, not `opacity` — so it is out of the tab order
		// as well as invisible. An invisible but focusable control is the classic
		// keyboard trap, and `toBeHidden()` is false for an `opacity: 0` element,
		// which is exactly the distinction being asserted.
		await expect(button).toBeHidden()

		await scrollToBottom(page)
		await expect(button).toBeVisible()
	})

	test('works with JavaScript disabled, because it is a link', async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false })
		const page = await context.newPage()
		await page.goto('/blog/static-export-content-pipeline/')

		// The whole design rests on this: it is an `<a href="#main">`, so it needs
		// no script to work. A `<button onClick={scrollTo}>` would be dead here.
		await expect(page.getByTestId('back-to-top')).toHaveAttribute(
			'href',
			'#main',
		)

		await context.close()
	})
})

test.describe('breadcrumb', () => {
	test('is a labelled landmark whose last crumb is the page, not a link', async ({
		page,
	}) => {
		await page.goto('/blog/static-export-content-pipeline/')

		const trail = page.getByRole('navigation', { name: 'Breadcrumb' })
		await expect(trail).toBeVisible()

		// The parent is reachable — the whole reason a breadcrumb is on this route
		// and not on top-level ones.
		await expect(trail.getByRole('link', { name: 'Writing' })).toHaveAttribute(
			'href',
			'/blog/',
		)

		// The terminus is `aria-current="page"` and is NOT a link. A trail that
		// links the page you are on is a control that appears to do something and
		// does nothing.
		const current = trail.locator('[aria-current="page"]')
		await expect(current).toHaveText('Validating content at the build boundary')
		await expect(current).toHaveCount(1)
		await expect(
			trail.getByRole('link', {
				name: 'Validating content at the build boundary',
			}),
		).toHaveCount(0)
	})

	test('is absent from top-level routes', async ({ page }) => {
		// docs/WEBSITE_STRUCTURE.md §2: breadcrumbs are for the nested route
		// families only. "Home › Writing" on /blog/ would restate the header.
		await page.goto('/blog/')
		await expect(
			page.getByRole('navigation', { name: 'Breadcrumb' }),
		).toHaveCount(0)
	})
})

/**
 * The header is the one component on every route that has to survive 320px —
 * the narrowest viewport in the support matrix — and it now carries four
 * controls. UI_GUIDELINES §5 bans horizontal scroll outright, and this is where
 * it would appear first.
 */
test.describe('responsive shell', () => {
	test.use({ viewport: { width: 320, height: 640 } })

	for (const route of allRoutes) {
		test(`does not scroll horizontally at 320px — ${route.path}`, async ({
			page,
		}) => {
			await page.goto(route.path)

			const overflow = await page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
			)
			expect(
				overflow,
				'the document is wider than the viewport',
			).toBeLessThanOrEqual(0)
		})
	}

	test('keeps every header control reachable and tappable at 320px', async ({
		page,
	}) => {
		await page.goto('/')

		// The three interactive controls that survive to the narrowest viewport.
		// The desktop nav is deliberately absent below `md` — the sheet carries it.
		for (const id of ['palette-trigger', 'theme-toggle', 'menu-trigger']) {
			const control = page.getByTestId(id)
			await expect(control).toBeVisible()

			const box = await control.boundingBox()
			// WCAG 2.2 §2.5.8 target size (minimum) is 24×24 CSS px.
			expect(
				box?.height ?? 0,
				`${id} is too short to tap`,
			).toBeGreaterThanOrEqual(24)
			expect(
				box?.width ?? 0,
				`${id} is too narrow to tap`,
			).toBeGreaterThanOrEqual(24)
		}
	})

	test('keeps the wordmark on one line', async ({ page }) => {
		// THE ASSERTION THE OVERFLOW TEST CANNOT MAKE. Wrapping is how the browser
		// AVOIDS overflowing, so a header whose controls no longer fit passes the
		// scrollWidth check while the wordmark silently breaks onto a second line
		// inside a fixed-height header. That is what actually happened when the
		// palette trigger was added, and it was found by looking at a screenshot.
		await page.goto('/')

		const wordmark = page.locator('#site-header a').first()
		const box = await wordmark.boundingBox()
		const lineHeight = await wordmark.evaluate(
			(el) => Number.parseFloat(getComputedStyle(el).lineHeight) || 0,
		)

		expect(lineHeight).toBeGreaterThan(0)
		expect(
			box?.height ?? 0,
			'the wordmark has wrapped onto a second line',
		).toBeLessThan(lineHeight * 1.8)
	})

	test('the palette panel fits the viewport at 320px', async ({ page }) => {
		await page.goto('/')
		await page.getByTestId('palette-trigger').click()

		const input = page.getByTestId('palette-input')
		await expect(input).toBeVisible()

		const box = await input.boundingBox()
		expect(box?.width ?? 0).toBeGreaterThan(0)
		expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
	})
})
