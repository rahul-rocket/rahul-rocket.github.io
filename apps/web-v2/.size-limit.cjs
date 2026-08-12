/*
 * F0-15 — per-route byte budgets. docs/PERFORMANCE.md §2.
 *
 * WHY THIS IS GENERATED RATHER THAN A STATIC LIST OF GLOBS.
 *
 * The obvious config — `out/_next/static/chunks/**\/*.js` — is wrong, and wrong
 * in the direction that makes a budget useless. That glob currently sums 236 KB
 * gz, but Home downloads 103 KB of it. The difference is chunks no visitor of
 * this route ever requests: the Pages Router's `framework`/`main`/`pages/_app`
 * bundles that Next emits alongside the App Router build, and the other routes'
 * own chunks. A budget measured that way fails on bytes nobody pays for, and —
 * worse — would pass a route that doubled its real payload as long as some
 * unrelated chunk shrank.
 *
 * So each entry is derived from the served HTML: exactly the scripts and
 * stylesheets that `out/<route>/index.html` references, which is the definition
 * of "what this route costs". Adding a route adds a budget automatically, which
 * is the same property the E2E specs get from the route manifest.
 *
 * `polyfills-*.js` is excluded because Next serves it with `nomodule`: every
 * browser in the support matrix (PERFORMANCE.md §8) skips it entirely. Counting
 * it would inflate every route by ~39 KB of bytes no supported browser fetches.
 *
 * LIMITS are the *hard limits* from PERFORMANCE.md §2, not the targets. The
 * targets (75 KB JS on Home) are the design goal; the hard limits are what CI
 * enforces, which is what that table already says. Home currently measures
 * ~103 KB gz — over target, under the hard limit — and that gap is Next's
 * baseline runtime with zero client components on the page. It is tracked as
 * H-10, and it is recorded rather than hidden: see the note in the backlog.
 */

const { readdirSync, readFileSync, statSync } = require('node:fs')
const { join, posix } = require('node:path')

const OUT = join(__dirname, 'out')

/** Hard limits from PERFORMANCE.md §2, keyed by route prefix. Longest match wins. */
const LIMITS = [
	{ prefix: '/projects/', js: '120 KB', css: '22 KB' },
	{ prefix: '/blog/', js: '120 KB', css: '22 KB' },
	{ prefix: '/', js: '120 KB', css: '20 KB' },
]

function limitsFor(route) {
	const match = LIMITS.filter((l) => route.startsWith(l.prefix)).sort(
		(a, b) => b.prefix.length - a.prefix.length,
	)[0]
	return match ?? LIMITS[LIMITS.length - 1]
}

function walk(dir, base = '') {
	const found = []
	for (const entry of readdirSync(dir)) {
		if (entry === '_next') continue
		const full = join(dir, entry)
		const rel = posix.join(base, entry)
		if (statSync(full).isDirectory()) found.push(...walk(full, rel))
		else if (entry === 'index.html') found.push(`/${rel}`)
	}
	return found
}

function assetsOf(htmlPath, extension) {
	const html = readFileSync(join(OUT, htmlPath), 'utf8')
	const pattern = new RegExp(
		`(?:src|href)="(/_next/[^"]+\\.${extension})"`,
		'g',
	)
	const paths = new Set()
	for (const match of html.matchAll(pattern)) {
		if (extension === 'js' && /\/polyfills-/.test(match[1])) continue
		paths.add(`out${match[1]}`)
	}
	return [...paths]
}

let pages
try {
	pages = walk(OUT)
} catch {
	throw new Error(
		'size-limit: out/ not found. Run `pnpm build` first — budgets are measured on the export, not the source.',
	)
}

const config = []
for (const page of pages.sort()) {
	const route = page.replace(/index\.html$/, '')
	const { js, css } = limitsFor(route)

	const scripts = assetsOf(page, 'js')
	if (scripts.length) {
		config.push({
			name: `${route} — JS`,
			path: scripts,
			limit: js,
			gzip: true,
		})
	}

	const styles = assetsOf(page, 'css')
	if (styles.length) {
		config.push({
			name: `${route} — CSS`,
			path: styles,
			limit: css,
			gzip: true,
		})
	}
}

module.exports = config
