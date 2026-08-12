import { expect, test } from '@playwright/test'

/**
 * F1-11 / B-02 / B-04 / P-05 / A-04 — the content surfaces, exercised.
 * docs/TESTING.md §4.
 *
 * The unit tests cover the loaders and the schemas. This covers the two things
 * they cannot reach: that a post actually renders end to end through the MDX
 * pipeline, and that the filtering — which is DOM manipulation over markup that
 * is already there — hides and reveals the right things and puts its state
 * somewhere a reader can share and go back from.
 *
 * WHY FILTERING IS TESTED AT THIS LEVEL AT ALL. Its logic is trivial; its
 * failure modes are not. A filter that reads the URL on mount but not on
 * `popstate` looks perfect until someone presses Back, and no unit test of the
 * matching function has anything to say about that.
 */

test.describe('a rendered post', () => {
	const post = '/blog/static-export-content-pipeline/'

	test('renders the MDX body with build-time highlighting', async ({
		page,
	}) => {
		await page.goto(post)

		// The highlighter runs during `next build`, so the colours are in the HTML
		// and the page ships zero bytes of Shiki (B-04's acceptance criterion).
		// The `data-language` attribute is what rehype-pretty-code leaves behind.
		const code = page.locator('pre[data-language]').first()
		await expect(code).toBeVisible()
	})

	test('gives every code block a keyboard-reachable, named region', async ({
		page,
	}) => {
		await page.goto(post)

		const block = page.locator('pre[role="region"]').first()
		await expect(block).toHaveAttribute('tabindex', '0')

		const label = await block.getAttribute('aria-label')
		expect(
			label,
			'a focusable scroll region with no accessible name is announced as "group, blank"',
		).toMatch(/code sample$/)
	})

	test('offers a copy control only once JavaScript has run', async ({
		page,
	}) => {
		await page.goto(post)
		const copy = page.getByRole('button', { name: /^Copy/ }).first()
		await expect(copy).toBeVisible()
	})

	test('links every heading in the table of contents to a real target', async ({
		page,
	}) => {
		// The slug algorithm here must match `github-slugger`, which `rehype-slug`
		// uses to write the ids. When it did not, every rail entry on every case
		// study pointed at nothing — and a fragment that resolves to no element is
		// invisible in review and in a screenshot.
		await page.setViewportSize({ width: 1440, height: 900 })
		await page.goto('/projects/engineering-portfolio-platform/')

		const links = page.locator('nav[aria-label="On this page"] a')
		const count = await links.count()
		expect(count).toBeGreaterThan(5)

		for (let index = 0; index < count; index += 1) {
			const href = await links.nth(index).getAttribute('href')
			expect(href).toMatch(/^#/)
			// An attribute selector rather than `#id`: these ids come from
			// `github-slugger` and legitimately contain doubled hyphens
			// ("challenges--solutions"), which is fine in an attribute value and
			// needs escaping in a CSS id selector. `CSS.escape` does not exist in
			// the Node context this assertion runs in.
			await expect(
				page.locator(`[id="${(href ?? '#').slice(1)}"]`),
				`the table of contents links to ${href}, which is not on the page`,
			).toHaveCount(1)
		}
	})
})

test.describe('filtering', () => {
	test('narrows the list and announces the new count', async ({ page }) => {
		await page.goto('/projects/')

		// A DESCENDANT selector, not a child one. The index is deliberately
		// asymmetric — the first study is a direct `<li>` and the rest sit inside
		// a nested `<ul>` (WEBSITE_STRUCTURE §4.6) — so `>` sees exactly one
		// entry and the assertion below would pass against a broken filter.
		const items = page.locator('#project-list li[data-filter-item]')
		const total = await items.count()
		expect(total).toBeGreaterThan(1)

		await page.getByLabel('Search projects').fill('reconciliation')

		// `hidden`, not a class: it removes the entry from the accessibility tree
		// as well as from the layout, and no stylesheet can override it.
		await expect(items.locator('visible=true')).toHaveCount(1)

		await expect(page.getByText(/of \d+ projects shown/)).toBeVisible()
	})

	test('puts the filter in the URL and restores it on Back', async ({
		page,
	}) => {
		await page.goto('/projects/')
		await page.getByLabel('Search projects').fill('reconciliation')

		await expect(page).toHaveURL(/\?q=reconciliation/)

		// A-04's acceptance criterion, and the half most implementations skip: a
		// filter that reads the URL on mount but never listens for `popstate`
		// leaves the reader looking at a stale result set after Back.
		await page.goBack()
		await expect(page).not.toHaveURL(/\?q=/)
		await expect(page.getByLabel('Search projects')).toHaveValue('')
	})

	test('shows an honest empty state rather than a blank page', async ({
		page,
	}) => {
		// X-03. The empty state is in the served HTML from the start and hidden
		// until it is needed — rendering it on demand would mean the one state
		// nobody sees in review is also the one that has never been rendered.
		await page.goto('/blog/')
		await page.getByLabel('Search writing').fill('zzzzzzzz')

		await expect(page.getByText(/Nothing matches those filters/)).toBeVisible()
	})

	test('survives a reload with the filter applied', async ({ page }) => {
		await page.goto('/skills/?depth=primary')

		const groups = page.locator('#skill-groups > section')
		await expect(groups.first()).toBeVisible()

		// The checkbox reflects the URL, not the other way round — which is what
		// makes a link into a filtered view work when it is shared.
		await expect(page.getByRole('checkbox', { name: /Primary/ })).toBeChecked()
	})
})

test.describe('tag archives', () => {
	test('lists only posts carrying the tag, and links back', async ({
		page,
	}) => {
		await page.goto('/blog/tags/performance/')

		await expect(page.locator('h1')).toHaveText('performance')

		const posts = page.locator('#post-list > li')
		expect(await posts.count()).toBeGreaterThan(0)

		// No filter inside an archive: the archive IS the filter, and a second
		// control for one job is a control nobody understands.
		await expect(page.getByLabel('Search writing')).toHaveCount(0)
	})
})
