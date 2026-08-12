import { expect, type Page, test } from '@playwright/test'

/**
 * L-08 acceptance (docs/TASK_BACKLOG.md): "Lenis is inactive under reduced
 * motion and on touch; find-in-page, Space/PageDown, and anchor links all still
 * work. If any fails, Lenis is removed."
 *
 * That last clause is why this file is written the way it is. These are not
 * regression tests for a feature that has already been decided — they are the
 * condition of the dependency staying in `package.json` at all, so each of the
 * three hard rules in docs/ANIMATION_GUIDELINES.md §5 gets a test that would
 * fail if the rule were violated, and none of them is allowed to pass vacuously.
 *
 * NO TEST HERE IS SKIPPED ON A PROJECT. Every block declares the pointer type it
 * needs via `test.use` rather than skipping outside the matching device, for the
 * reason keyboard.spec.ts already gives: a conditional skip leaves the behaviour
 * unverified in two of three engines while the run still reports green
 * (CLAUDE.md §15.3). `isMobile`/`hasTouch` drive the `pointer:` media feature,
 * which is the thing the component actually gates on.
 */

/** The class Lenis puts on <html> while an instance exists. */
const ACTIVE = /(^|\s)lenis(\s|$)/

/**
 * Make the document tall enough to scroll.
 *
 * Every page on the site is a Phase 4 placeholder today, and several are shorter
 * than the viewport — so a scroll assertion against the real content would pass
 * without scrolling anything and go on passing after Lenis broke. The spacer is
 * appended after load, so it tests the scroll layer against a document that
 * genuinely scrolls rather than against whatever the placeholder happens to be
 * this week.
 */
async function makeScrollable(page: Page) {
	await page.evaluate(() => {
		const spacer = document.createElement('div')
		spacer.style.height = '4000px'
		spacer.setAttribute('aria-hidden', 'true')
		document.body.append(spacer)
	})
}

/** Waits for the dynamic import to land. Lenis is fetched after paint, so no
 *  assertion about it is safe on the synchronous first frame. */
async function waitForLenis(page: Page) {
	await expect(page.locator('html')).toHaveClass(ACTIVE)
}

test.describe('smooth scroll — where it is allowed to run', () => {
	// A mouse or trackpad, motion not reduced: the only configuration in which
	// Lenis is permitted to exist. Stated rather than inherited, for the reason
	// theme.spec.ts gives about `colorScheme` — a test that does not declare the
	// preference it depends on is asserting something about the harness's defaults
	// rather than about the code. `reducedMotion` is a context option in
	// Playwright 1.49, not a top-level test option.
	test.use({
		isMobile: false,
		hasTouch: false,
		contextOptions: { reducedMotion: 'no-preference' },
	})

	test('activates, and fetches its bytes only once it has', async ({
		page,
	}) => {
		// Recorded from the first request so the negative half of this pair (the
		// touch test below) is measuring the same thing.
		const lateScripts: string[] = []
		let loaded = false
		page.on('request', (request) => {
			if (loaded && request.resourceType() === 'script') {
				lateScripts.push(new URL(request.url()).pathname)
			}
		})

		await page.goto('/')
		await page.waitForLoadState('load')
		loaded = true

		await waitForLenis(page)

		// The performance claim, asserted rather than assumed: the Lenis chunk is
		// not in the served HTML (docs/redesign/PERFORMANCE_PLAN.md §2 excludes it
		// from Home's payload), so it must arrive as a request made after load.
		// If a refactor turned the dynamic import into a static one this list would
		// be empty and Home's budget would have quietly absorbed ~5 KB gz.
		expect(lateScripts.length).toBeGreaterThan(0)
	})

	test('scrolls the real document, not a transformed wrapper', async ({
		page,
	}) => {
		await page.goto('/')
		await waitForLenis(page)
		await makeScrollable(page)

		// Several ticks rather than one large delta. A wheel event is not a portable
		// unit: the same `deltaY` moves the page ~600px on Desktop Chrome and ~215px
		// under Pixel 5 emulation, because the device's scale factor and Lenis's own
		// normalisation both apply. Accumulating ticks asserts the thing that is
		// actually invariant — the document keeps scrolling — instead of pinning a
		// number that only holds on one device profile.
		await page.mouse.move(200, 300)
		for (let i = 0; i < 4; i++) {
			await page.mouse.wheel(0, 600)
			// Lenis eases toward its target, so each tick needs to settle before the
			// next one is added.
			await page.waitForTimeout(400)
		}

		await expect
			.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 })
			.toBeGreaterThan(400)

		// THIS IS THE FIND-IN-PAGE TEST, and it is written as a structural
		// assertion because find-in-page itself is browser chrome that Playwright
		// cannot drive. What breaks find-in-page is the *other* way to implement
		// smooth scroll: translating a wrapper element while the document stays at
		// scroll position 0. The browser then scrolls to a match that is not where
		// the transform has put it, and Ctrl+F lands on blank space.
		//
		// So: the document's own scroll position must be genuinely non-zero (above)
		// and nothing may be transformed (below). Together those exclude the
		// implementation that would break it.
		const transforms = await page.evaluate(() => {
			const of = (el: Element) => getComputedStyle(el).transform
			return {
				html: of(document.documentElement),
				body: of(document.body),
				main: of(document.querySelector('main') as Element),
			}
		})
		expect(transforms.html).toBe('none')
		expect(transforms.body).toBe('none')
		expect(transforms.main).toBe('none')
	})

	test('leaves keyboard scrolling working', async ({ page }) => {
		await page.goto('/')
		await waitForLenis(page)
		await makeScrollable(page)

		// Focus the document body rather than a control, which is where a reader
		// pressing PageDown to read actually is.
		await page.locator('main').click({ position: { x: 5, y: 5 } })

		for (const key of ['PageDown', 'End', 'Home']) {
			const before = await page.evaluate(() => window.scrollY)
			await page.keyboard.press(key)
			await expect
				.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 })
				.not.toBe(before)
		}
	})

	test('leaves an anchor jump respecting scroll-margin-top', async ({
		page,
	}) => {
		// The P0 of the three. The skip link targets `#main`, which carries
		// `scroll-mt-header` precisely so the jump does not park the reader
		// underneath the sticky header with the first paragraph hidden
		// (docs/ACCESSIBILITY.md §"Never scroll focus off-screen").
		//
		// Lenis's own `anchors` option re-implements the jump with its own easing
		// and ignores that margin, which is why smooth-scroll.tsx leaves it off.
		// This test is what would catch someone turning it on.
		await page.goto('/')
		await waitForLenis(page)
		await makeScrollable(page)

		// Scroll away first, so following the link has somewhere to travel from.
		await page.evaluate(() => window.scrollTo(0, 1500))
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(1000)

		await page.keyboard.press('Tab')
		await page.keyboard.press('Enter')

		const headerHeight = await page.evaluate(
			() =>
				document.querySelector('header')?.getBoundingClientRect().height ?? 0,
		)
		expect(headerHeight).toBeGreaterThan(0)

		// `main` must come to rest below the header, not under it. A negative top is
		// the exact failure `scroll-mt-header` exists to prevent; a top far below
		// the header means the jump never completed.
		await expect
			.poll(
				() =>
					page.evaluate(
						() =>
							document.getElementById('main')?.getBoundingClientRect().top ?? 0,
					),
				{ timeout: 3000 },
			)
			.toBeGreaterThanOrEqual(headerHeight - 2)
	})
})

test.describe('smooth scroll — where it must not run', () => {
	test.describe('on a touch device', () => {
		test.use({ isMobile: true, hasTouch: true })

		test('never activates and never costs the reader a byte', async ({
			page,
		}) => {
			const lateScripts: string[] = []
			let loaded = false
			page.on('request', (request) => {
				if (loaded && request.resourceType() === 'script') {
					lateScripts.push(new URL(request.url()).pathname)
				}
			})

			await page.goto('/')
			await page.waitForLoadState('load')
			loaded = true
			await page.waitForLoadState('networkidle')

			await expect(page.locator('html')).not.toHaveClass(ACTIVE)

			// The paired assertion to the fine-pointer test above. Native scrolling
			// on iOS and Android is better than any emulation of it, and the reader
			// who gets the better behaviour must also not download the worse one.
			expect(lateScripts).toEqual([])
		})
	})

	test.describe('under reduced motion', () => {
		test.use({ isMobile: false, hasTouch: false })

		test('tears the instance down when the preference is turned on mid-session', async ({
			page,
		}) => {
			// Written as a live toggle rather than as "load with reduce and assert
			// absence", for two reasons.
			//
			// One: the negative assertion on its own is vacuous. If the dynamic
			// import were broken, or the class name were wrong, or the component
			// were never mounted, "no lenis class" would pass and the suite would
			// report the reduced-motion guarantee as verified while testing nothing.
			// Proving the class appears first makes the disappearance mean something.
			//
			// Two: it is the real scenario. Reduced motion gets switched on *by
			// someone made unwell by the page they are currently looking at*, and
			// that reader must not have to reload to be taken seriously. It is the
			// reason the gates in smooth-scroll.tsx are live matchMedia
			// subscriptions instead of a value read once at mount.
			await page.emulateMedia({ reducedMotion: 'no-preference' })
			await page.goto('/')
			await waitForLenis(page)

			await page.emulateMedia({ reducedMotion: 'reduce' })
			await expect(page.locator('html')).not.toHaveClass(ACTIVE)
		})

		test('does not activate when the preference is set before load', async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: 'reduce' })
			await page.goto('/')
			await page.waitForLoadState('networkidle')
			await expect(page.locator('html')).not.toHaveClass(ACTIVE)
		})
	})
})
