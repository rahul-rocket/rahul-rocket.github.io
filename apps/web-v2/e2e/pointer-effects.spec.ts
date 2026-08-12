import { expect, test } from '@playwright/test'

/**
 * The pointer layer — and this spec exists because of how it failed the first
 * time.
 *
 * `usePointerField` and `.u-spotlight` were both written, both documented at
 * length, and both shipped. The hook's own docstring names three subscribers.
 * The repository had zero: nothing imported the hook, nothing used the class,
 * and the effect had never run on any route. It read as finished in review for
 * four milestones because every piece of it was there except the connection.
 *
 * A unit test cannot catch that — each half is correct in isolation, which is
 * exactly the problem. What catches it is an assertion that the custom
 * properties actually arrive in the DOM after a real pointer moves, which is
 * this file.
 *
 * ALL THREE GATES ARE ASSERTED, NOT JUST THE HAPPY PATH. An effect that runs
 * where it should not is a worse bug than one that never runs: a magnetic
 * translate under `prefers-reduced-motion` is a preference ignored, and a
 * pointer listener on a touch device is INP spent on a subscriber whose output
 * nothing will ever read.
 */

/**
 * The custom properties the CSS reads. Written as strings rather than imported
 * because they are a contract between two files that do not import each other —
 * `pointer-effects.tsx` writes them and `motion.css` reads them — and a test
 * that derived them from one side could not detect the two sides disagreeing.
 */
const SPOTLIGHT = ['--mx', '--my'] as const
const MAGNET = ['--mag-x', '--mag-y'] as const

/**
 * The element's box, after making sure it is actually on screen.
 *
 * `scrollIntoViewIfNeeded` is load-bearing rather than defensive, and leaving it
 * out is how the first version of this spec failed against a working
 * implementation. `boundingBox()` returns VIEWPORT-relative coordinates, and
 * `mouse.move` clamps to the viewport — so an element below the fold yields a
 * `y` the pointer can never reach, the move lands somewhere else entirely, and
 * the assertion reports "the effect does not run" when what actually happened is
 * "the pointer was never over it". At the suite's 1280x720 desktop profile the
 * hero's status panel sits in the lower row of an 85svh hero, which is exactly
 * that case.
 */
async function boxOf(page: import('@playwright/test').Page, selector: string) {
	const target = page.locator(selector).first()
	await target.scrollIntoViewIfNeeded()
	const box = await target.boundingBox()
	if (!box) throw new Error(`${selector} has no box`)
	return box
}

/** The inline `style` attribute of the first matching element, or ''. */
async function styleOf(
	page: import('@playwright/test').Page,
	selector: string,
): Promise<string> {
	return (await page.locator(selector).first().getAttribute('style')) ?? ''
}

test.describe('pointer effects — where they run', () => {
	// A mouse, and no reduced-motion preference: the one configuration in which
	// both halves are supposed to be active.
	// Stated rather than inherited: a test that does not declare the preference
	// it depends on is asserting something about the harness's defaults rather
	// than about the code. `reducedMotion` is a CONTEXT option in Playwright
	// 1.49, not a top-level test option — same shape `smooth-scroll.spec.ts` uses.
	test.use({
		isMobile: false,
		hasTouch: false,
		contextOptions: { reducedMotion: 'no-preference' },
	})

	test('the spotlight follows the pointer across a decorated panel', async ({
		page,
	}) => {
		await page.goto('/')

		const panel = page.locator('[data-spotlight]').first()
		await expect(panel).toBeVisible()

		// Nothing is written before the pointer has been anywhere — the fallbacks
		// in `--ui-spotlight` (50%/50%) are what the un-hovered panel uses, and a
		// panel that arrives pre-lit would mean the effect is not pointer-driven.
		expect(await styleOf(page, '[data-spotlight]')).not.toContain('--mx')

		const box = await boxOf(page, '[data-spotlight]')

		await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4)
		// Two moves: the subscriber coalesces to one `requestAnimationFrame`, so a
		// single move can be flushed after the assertion reads the attribute.
		await page.mouse.move(box.x + box.width * 0.32, box.y + box.height * 0.42)

		await expect
			.poll(() => styleOf(page, '[data-spotlight]'))
			.toContain(SPOTLIGHT[0])

		const style = await styleOf(page, '[data-spotlight]')
		expect(style).toContain(SPOTLIGHT[1])

		// Positions are element-relative pixels, which is what `--ui-spotlight`'s
		// `at var(--mx) var(--my)` expects. A viewport-relative value would put the
		// glow off the panel entirely on any page that has scrolled — the bug this
		// assertion exists to name.
		const mx = Number(/--mx:\s*([\d.]+)px/.exec(style)?.[1])
		expect(mx).toBeGreaterThan(0)
		expect(mx).toBeLessThan(box.width)
	})

	test('a magnetic control leans toward the pointer and releases', async ({
		page,
	}) => {
		await page.goto('/')

		const button = page.locator('[data-magnetic]').first()
		await expect(button).toBeVisible()

		const box = await boxOf(page, '[data-magnetic]')

		// Off-centre, so a lean produces a non-zero offset on both axes. Dead
		// centre would pass against an implementation that always writes 0.
		await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.8)
		await page.mouse.move(box.x + box.width * 0.86, box.y + box.height * 0.81)

		await expect
			.poll(() => styleOf(page, '[data-magnetic]'))
			.toContain(MAGNET[0])

		const leaning = await styleOf(page, '[data-magnetic]')
		const magX = Number(/--mag-x:\s*(-?[\d.]+)px/.exec(leaning)?.[1])
		expect(Math.abs(magX)).toBeGreaterThan(0)
		// The cap. A control that moves far enough to notice is a control that
		// moves out from under the pointer, which turns an affordance into a game.
		expect(Math.abs(magX)).toBeLessThanOrEqual(6)

		// RELEASE IS THE HALF THAT GETS SKIPPED. Leaving the field must return the
		// control to rest; the common bug is clamping instead, which leaves every
		// button on the page frozen at full lean toward a pointer that has gone.
		await page.mouse.move(0, 0)
		await page.mouse.move(1, 1)

		await expect
			.poll(() => styleOf(page, '[data-magnetic]'))
			.not.toContain(MAGNET[0])
	})
})

test.describe('pointer effects — where they must not run', () => {
	test.describe('under reduced motion', () => {
		test.use({
			isMobile: false,
			hasTouch: false,
			contextOptions: { reducedMotion: 'reduce' },
		})

		test('lights the panel but never moves the button', async ({ page }) => {
			await page.goto('/')

			const box = await boxOf(page, '[data-magnetic]')

			await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.8)
			await page.mouse.move(box.x + box.width * 0.86, box.y + box.height * 0.81)

			// The spotlight still runs, and that is deliberate rather than an
			// oversight: it is a paint, not a movement. Nothing translates and
			// nothing scales, so removing it would take a legibility cue away from a
			// reader who asked only for less motion.
			const panelBox = await boxOf(page, '[data-spotlight]')
			await page.mouse.move(
				panelBox.x + panelBox.width * 0.3,
				panelBox.y + panelBox.height * 0.4,
			)
			await page.mouse.move(
				panelBox.x + panelBox.width * 0.31,
				panelBox.y + panelBox.height * 0.41,
			)
			await expect
				.poll(() => styleOf(page, '[data-spotlight]'))
				.toContain(SPOTLIGHT[0])

			// The lean does not. Asserted on the inline property rather than on the
			// computed `translate`, because the CSS also gates itself — this checks
			// that the JavaScript half agrees, so the two cannot drift apart with
			// only one of them still honouring the preference.
			expect(await styleOf(page, '[data-magnetic]')).not.toContain(MAGNET[0])
		})
	})

	test.describe('on a touch device', () => {
		// `isMobile` is what makes Chromium report `pointer: coarse`, which is the
		// media query the component gates on — `hasTouch` alone does not. Spreading
		// a `devices[...]` preset here would also carry `defaultBrowserType`, which
		// Playwright rejects inside a describe group. Same pair `smooth-scroll.spec`
		// uses for the same reason.
		//
		// Gating on viewport width instead of on the pointer would attach handlers
		// to a touchscreen laptop and skip them on a narrow desktop window.
		test.use({ isMobile: true, hasTouch: true })

		test('writes nothing, because a finger has no hover position', async ({
			page,
		}) => {
			await page.goto('/')

			const box = await boxOf(page, '[data-spotlight]')

			// A MOUSE MOVE, ON A TOUCH CONTEXT, AND DELIBERATELY NOT A TAP.
			//
			// Tapping was the obvious version and it is a worse test twice over: the
			// panel's centre is a link, so the tap navigated to /experience/ and the
			// assertion then ran against a page with no decorated elements on it —
			// green for the wrong reason, or red for the wrong reason, depending on
			// the route.
			//
			// Moving a pointer is also the stronger assertion. It emits the exact
			// event the subscriber listens for, so what is being proven is that NO
			// LISTENER IS ATTACHED — not merely that this device does not happen to
			// produce the event. The gate is `pointer: fine`, and the whole point of
			// gating with `enabled` rather than returning early inside the callback
			// is that a failing gate costs no listener and no frame at all.
			await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4)
			await page.mouse.move(box.x + box.width * 0.32, box.y + box.height * 0.42)
			await page.waitForTimeout(250)

			expect(await styleOf(page, '[data-spotlight]')).not.toContain(
				SPOTLIGHT[0],
			)
			expect(await styleOf(page, '[data-magnetic]')).not.toContain(MAGNET[0])
		})
	})
})
