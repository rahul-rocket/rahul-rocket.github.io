#!/usr/bin/env node
/*
 * F0-16 — internal link checker over out/.
 * docs/DEPLOYMENT.md §3, docs/CONTENT_STRATEGY.md
 *
 * Static export means a broken internal link is a 404 for a real visitor with
 * no server-side redirect to catch it, and nothing in the build fails: Next
 * happily emits an <a href> to a page that does not exist. This is the only
 * check that closes that gap.
 *
 * Deliberately internal-only. External links rot on someone else's schedule; a
 * gate that fails because a third-party site is briefly down blocks a merge for
 * a reason unrelated to the change, and a gate that cries wolf gets bypassed.
 * External link rot is a periodic manual sweep, not a merge gate.
 *
 * NAMING. The backlog calls this `check-links.ts`. It is `.mjs` to match
 * check-export.mjs and check-contrast.mjs, and because a build-gate script that
 * needs a transpiler to run is a gate that can be broken by the transpiler.
 *
 * Zero dependencies.
 *
 * Usage:  node scripts/check-links.mjs [--verbose]
 * Exit:   0 every internal link resolves · 1 one or more do not
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const VERBOSE = process.argv.includes('--verbose')

/**
 * Must equal `basePath` in next.config.mjs and `site.basePath` in
 * src/config/site.ts.
 *
 * out/ has NO prefix in it — `basePath` rewrites the URLs inside the HTML, not
 * the directory the export is written to — so every site-absolute href in a
 * page reads '/v2/about/' while the file it names is 'out/about/index.html'.
 * Without stripping this, the checker reports every internal link on the site as
 * broken, which is the kind of total failure that gets a gate disabled instead
 * of read.
 */
const BASE_PATH = '/v2'

/** A site-absolute href as a path within out/. */
function stripBasePath(pathname) {
	if (pathname === BASE_PATH) return '/'
	if (pathname.startsWith(`${BASE_PATH}/`)) {
		return pathname.slice(BASE_PATH.length)
	}
	// Site-absolute but outside /v2: this link leaves this application for the
	// apex, which this checker cannot see and must not silently pass.
	return null
}

/** Every file in out/, as site-absolute posix paths ('/about/index.html'). */
function walk(dir, base = '') {
	const found = []
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		const rel = posix.join(base, entry)
		if (statSync(full).isDirectory()) found.push(...walk(full, rel))
		else found.push(`/${rel}`)
	}
	return found
}

/**
 * Does a site-absolute href resolve to something in the export?
 *
 * Mirrors what GitHub Pages actually does, which is narrower than what a dev
 * server does: it serves `p`, `p/index.html`, and `p.html`, and it does NOT
 * redirect a missing trailing slash. `/about` without the slash is served, but
 * every relative asset URL inside it then resolves one level too shallow — the
 * silent total-styling-failure mode in GITHUB_PAGES.md. So a directory hit
 * without a trailing slash is reported, not accepted.
 */
function resolveHref(pathname, files) {
	const candidates = [
		pathname,
		posix.join(pathname, 'index.html'),
		`${pathname.replace(/\/$/, '')}.html`,
	]
	for (const candidate of candidates) {
		if (files.has(candidate)) {
			const needsSlash =
				candidate !== pathname && candidate.endsWith('/index.html')
			return { ok: true, needsSlash: needsSlash && !pathname.endsWith('/') }
		}
	}
	return { ok: false, needsSlash: false }
}

function main() {
	let files
	try {
		files = new Set(walk(OUT))
	} catch {
		console.error(
			'check-links: out/ not found. Run `pnpm build` first — this checks the export, not the source.',
		)
		process.exit(1)
	}

	const pages = [...files].filter((f) => f.endsWith('.html'))
	const problems = []
	const anchors = []
	let checked = 0

	for (const page of pages) {
		const html = readFileSync(join(OUT, page), 'utf8')
		const from = page.replace(/index\.html$/, '')

		for (const match of html.matchAll(/\shref\s*=\s*"([^"]*)"/g)) {
			const href = match[1]
			if (!href) continue
			// External, protocol-relative, mail/tel, and pure fragments are out of
			// scope. Fragments are checked separately below, against the same page.
			if (/^(https?:|mailto:|tel:|\/\/|data:)/i.test(href)) continue
			if (href.startsWith('#')) {
				anchors.push({ from, id: href.slice(1) })
				continue
			}

			const [beforeFragment, fragment] = href.split('#')
			// A query string is not part of the path a static host resolves —
			// `/skills/?depth=primary` is the same file as `/skills/`, and the
			// parameters are read by client-side code after it loads. Splitting it
			// off here was missing, and it made every URL-backed filter link on the
			// site look broken while being fine.
			const rawPath = (beforeFragment ?? '').split('?')[0] ?? ''
			if (rawPath === '') continue
			// A relative href resolves against the page it is on, which is already
			// a prefix-free path within out/, so only the site-absolute form needs
			// the base path taken off.
			const pathname = rawPath.startsWith('/')
				? stripBasePath(rawPath)
				: posix.normalize(posix.join(from, rawPath))

			if (pathname === null) {
				problems.push(
					`${from} → ${href}  (site-absolute but outside ${BASE_PATH}/; this ` +
						'app is deployed under that prefix, so the link escapes it)',
				)
				continue
			}

			checked++
			const result = resolveHref(pathname, files)
			if (!result.ok) {
				problems.push(`${from} → ${href}  (no such file in out/)`)
			} else if (result.needsSlash) {
				problems.push(
					`${from} → ${href}  (resolves to a directory but has no trailing slash; ` +
						'GitHub Pages will serve it with the wrong asset base)',
				)
			} else if (VERBOSE) {
				console.log(`  ok  ${from} → ${href}${fragment ? `#${fragment}` : ''}`)
			}
		}
	}

	// Same-page fragments. A wrong one is a skip link or a TOC entry that goes
	// nowhere, which is a keyboard-accessibility failure rather than a typo.
	for (const { from, id } of anchors) {
		const file = files.has(`${from}index.html`)
			? `${from}index.html`
			: from.replace(/\/$/, '')
		if (!files.has(file)) continue
		checked++
		const html = readFileSync(join(OUT, file), 'utf8')
		if (!html.includes(`id="${id}"`) && !html.includes(`name="${id}"`)) {
			problems.push(`${from} → #${id}  (no element with that id on the page)`)
		}
	}

	if (problems.length) {
		console.error('\ncheck-links: broken internal links\n')
		for (const problem of problems) console.error(`  ${problem}`)
	}

	console.log(
		`\ncheck-links: ${checked} internal link(s) across ${pages.length} page(s) — ` +
			(problems.length ? `${problems.length} BROKEN` : 'all resolve'),
	)
	process.exit(problems.length ? 1 : 0)
}

main()
