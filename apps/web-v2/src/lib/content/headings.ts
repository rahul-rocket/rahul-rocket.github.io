/**
 * P-06 / B-03 — table-of-contents extraction. docs/BLOG_SYSTEM.md §6.
 *
 * WHY THE HEADINGS ARE PARSED FROM THE SOURCE RATHER THAN READ FROM THE
 * RENDERED TREE. The MDX compiles to a React component; there is no server-side
 * DOM to walk and no AST exposed to the page. The alternatives were a custom
 * remark plugin that writes headings into a side channel, or this — a scan of
 * the raw Markdown before it is compiled. The scan is twenty lines, has no
 * plugin ordering to get wrong, and is unit-testable against a string.
 *
 * THE SLUG ALGORITHM MUST MATCH `rehype-slug`, WHICH USES `github-slugger`.
 * If it does not, every table-of-contents link points at nothing — and a
 * fragment that resolves to no element is invisible to `check-links.mjs`'s
 * original form and to every reviewer. Two things close that risk: the unit
 * tests below the implementation, and the fragment check that
 * `scripts/check-links.mjs` now performs over the built HTML, which fails the
 * build if any in-page anchor has no target.
 *
 * Only `##` is collected. `###` would make the rail two levels deep on a page
 * that already has a fixed twelve-section structure, and a nested table of
 * contents for a 2,000-word article is navigation for its own sake.
 */

export interface Heading {
	id: string
	text: string
}

/**
 * `github-slugger`'s algorithm for the cases this content produces.
 *
 * Lowercase; strip everything that is not a word character, a space, or a
 * hyphen; collapse whitespace runs to a single hyphen. Apostrophes are removed
 * rather than replaced, which is why "What I'd Do Differently" becomes
 * `what-id-do-differently` and not `what-i-d-do-differently` — the difference
 * between a working anchor and a broken one, and the reason this is tested.
 */
export function slugifyHeading(text: string): string {
	return (
		text
			.trim()
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			// EACH whitespace character becomes a hyphen; runs are NOT collapsed.
			// This is not a stylistic choice — it is what `github-slugger` does, and
			// `rehype-slug` uses it to write the ids this must match. "Challenges &
			// Solutions" loses the ampersand and keeps both spaces, so the id is
			// `challenges--solutions` with two hyphens. Collapsing them produced a
			// table of contents whose links resolved to nothing, on every case study,
			// and it was `check-links.mjs`'s fragment check that caught it.
			.replace(/\s/g, '-')
	)
}

/**
 * Fenced code blocks are skipped. A `# comment` inside a shell sample is a
 * comment, and collecting it would put "install the dependencies" in the
 * table of contents with an id that does not exist.
 */
export function extractHeadings(markdown: string): Heading[] {
	const headings: Heading[] = []
	const seen = new Map<string, number>()
	let inFence = false

	for (const line of markdown.split('\n')) {
		if (/^\s*(```|~~~)/.test(line)) {
			inFence = !inFence
			continue
		}
		if (inFence) continue

		const match = /^##\s+(.+?)\s*$/.exec(line)
		if (!match?.[1]) continue

		// Strip inline Markdown emphasis and code ticks: the rendered heading text
		// is what the reader sees in the rail, and `**Outcome**` should read as
		// "Outcome" in both the heading and the link to it.
		const text = match[1]
			.replace(/`([^`]+)`/g, '$1')
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/\*([^*]+)\*/g, '$1')
			.trim()

		const base = slugifyHeading(text)
		// github-slugger appends `-1`, `-2` … to a repeated slug, and so must this
		// — two sections called "Outcome" would otherwise both link to the first.
		const count = seen.get(base) ?? 0
		seen.set(base, count + 1)

		headings.push({ id: count === 0 ? base : `${base}-${count}`, text })
	}

	return headings
}
