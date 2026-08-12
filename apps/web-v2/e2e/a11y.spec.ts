import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { allRoutes, themes } from './routes'

/**
 * F0-13 — axe over every route, in both themes, zero violations.
 * docs/TESTING.md §5, docs/ACCESSIBILITY.md.
 *
 * BOTH THEMES is the point of this spec rather than an extra. Contrast is the
 * most common violation class and it is theme-specific by construction, so a
 * single-theme run passes half of a broken palette. `check-contrast.mjs` checks
 * the token layer; this checks what those tokens resolve to on a rendered page,
 * which is where an overridden or mis-nested variable shows up.
 *
 * Zero violations is the gate, with no allowlist — the moment one exists, it
 * grows. A rule that genuinely cannot apply is disabled with `.disableRules()`
 * and a comment naming the reason, in the diff, where a reviewer sees it.
 *
 * This covers roughly 30–40% of real accessibility issues. The rest comes from
 * the manual checklist in ACCESSIBILITY.md §9, and a green run here must never
 * be reported as the whole story.
 */

/**
 * Drive the theme through the real control, not `document.documentElement`.
 *
 * F1-09 made this possible and it is a materially stronger test: poking the
 * attribute proved only that the CSS responds to it. Clicking proves the button
 * exists, is reachable, is operable, carries the right `aria-pressed`, and
 * actually applies the theme — the whole path a reader uses. A toggle that
 * rendered but did nothing used to pass this spec.
 */
async function setTheme(page: Page, theme: string): Promise<void> {
	const toggle = page.getByTestId('theme-toggle')
	await expect(toggle).toBeVisible()

	// The control reports its own state, so read it rather than assuming the
	// served default — that assumption is exactly what would silently break if
	// the pre-paint script changed.
	for (let attempt = 0; attempt < 2; attempt++) {
		const isDark = (await toggle.getAttribute('aria-pressed')) === 'true'
		if ((theme === 'dark') === isDark) break
		await toggle.click()
	}

	await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
}

test.describe('accessibility', () => {
	for (const route of allRoutes) {
		for (const theme of themes) {
			test(`${route.path} has no axe violations — ${theme}`, async ({
				page,
			}) => {
				await page.goto(route.path)
				await setTheme(page, theme)

				const results = await new AxeBuilder({ page })
					.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
					.analyze()

				// The default failure message is a JSON blob. Naming the rule and the
				// selector is what makes a CI log actionable without a local repro —
				// and this gate exists to be read in CI.
				const summary = results.violations.map(
					(v) =>
						`${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes
							.map((n) => n.target.join(' '))
							.join('\n    ')}`,
				)
				expect(
					summary,
					`axe violations on ${route.path} in ${theme} theme`,
				).toEqual([])
			})
		}
	}
})

/**
 * THE OVERLAYS, SCANNED WHILE THEY ARE OPEN.
 *
 * The loop above scans every route in its resting state, which means the two
 * pieces of markup most likely to carry a violation are never seen: a modal
 * dialog is `display: none` until it is opened, so axe walks straight past it.
 * That is not a hypothetical gap — the violation this suite has actually caught
 * so far was contrast in the footer, and a dialog is denser in controls, labels,
 * and colour pairs than the footer is.
 *
 * Both themes, for the same reason the route loop runs both.
 */
for (const theme of themes) {
	test(`the command palette has no axe violations while open — ${theme}`, async ({
		page,
	}) => {
		await page.goto('/')
		await setTheme(page, theme)

		await page.getByTestId('palette-trigger').click()
		await expect(page.getByTestId('command-palette')).toBeVisible()

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
			.analyze()

		expect(
			results.violations.map((v) => `${v.id} — ${v.help}`),
			`axe violations in the open command palette, ${theme} theme`,
		).toEqual([])
	})

	test(`the mobile sheet has no axe violations while open — ${theme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto('/')
		await setTheme(page, theme)

		await page.getByTestId('menu-trigger').click()
		await expect(page.getByTestId('menu-sheet')).toBeVisible()

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
			.analyze()

		expect(
			results.violations.map((v) => `${v.id} — ${v.help}`),
			`axe violations in the open mobile sheet, ${theme} theme`,
		).toEqual([])
	})
}

/**
 * The toggle is a control, so it must be operable by keyboard and must announce
 * its state. axe cannot check either — it sees a labelled button and stops.
 */
test('the theme toggle is keyboard-operable and persists the choice', async ({
	page,
}) => {
	await page.goto('/')
	const toggle = page.getByTestId('theme-toggle')

	await toggle.focus()
	await expect(toggle).toBeFocused()

	const before = await toggle.getAttribute('aria-pressed')
	await page.keyboard.press('Enter')
	await expect(toggle).not.toHaveAttribute('aria-pressed', before ?? '')

	// The choice must survive a navigation, or the pre-paint script is not
	// reading what the toggle writes — the flash-of-wrong-theme bug, which is
	// invisible in a single-page test.
	const chosen = await page.locator('html').getAttribute('data-theme')
	await page.goto('/blog/')
	await expect(page.locator('html')).toHaveAttribute(
		'data-theme',
		chosen ?? 'dark',
	)
})
