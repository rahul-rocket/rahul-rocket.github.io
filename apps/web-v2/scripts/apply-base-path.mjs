#!/usr/bin/env node
/*
 * Prefix every site-absolute URL in the export with the base path.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT A CONFIG OPTION
 *
 * `basePath: '/v2'` in next.config.mjs prefixes only the URLs Next itself
 * emits: script and stylesheet tags, `next/image` output, `next/link` hrefs.
 * This site navigates with plain `<a href="/about/">` on purpose — CLAUDE.md §1,
 * "Navigation is plain <a>, deliberately", because next/link costs +3.95 KB gz
 * on every route and `e2e/route-change.spec.ts` asserts navigation is a document
 * load. Next never sees those anchors, so it cannot prefix them.
 *
 * The consequence without this script is worse than a broken link. The apex of
 * this Pages site is a DIFFERENT application (`apps/web`), so `/about/` on a /v2
 * page does not 404 — it silently navigates the reader out of this site into
 * another one, and the two look nothing alike. That is the failure this closes.
 *
 * WHY REWRITE THE EXPORT RATHER THAN THE 37 SOURCE FILES
 *
 * There is no chokepoint. Thirty-seven files under src/ emit an anchor, hrefs
 * also arrive from `content/` records and from MDX prose, and a helper applied
 * by hand at every call site is a rule enforced by good intentions — which
 * §5 of CLAUDE.md rejects. One pass over out/ is provably total, and
 * `check-links.mjs` independently fails the build on any site-absolute href that
 * escapes the prefix, so this script cannot quietly miss one. There is precedent
 * for post-processing the export here: generate-og.mjs and generate-feeds.mjs
 * both read out/ rather than the source.
 *
 * ORDER MATTERS. This must run after `next build` and BEFORE
 * generate-feeds.mjs, whose `absolutise()` assumes every href it finds already
 * carries the prefix. See package.json's `build` script.
 *
 * Zero dependencies.
 *
 * Usage:  node scripts/apply-base-path.mjs [--verbose]
 * Exit:   0 rewrote cleanly · 1 out/ missing, or a URL was already prefixed
 *           in a way that suggests this ran twice
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const VERBOSE = process.argv.includes('--verbose')

/**
 * Must equal `basePath` in next.config.mjs and `site.basePath` in
 * src/config/site.ts. Kept as a literal because this script must not import
 * TypeScript; `check-links.mjs` holds the same literal and both are verified
 * against the built HTML by that script's own gate.
 */
const BASE_PATH = '/v2'

/**
 * Attributes that carry a URL we must fix. `srcset` is included and is the one
 * with a different grammar — a comma-separated list of `url descriptor` pairs —
 * so it gets its own pass below rather than sharing the single-URL one.
 */
const URL_ATTRIBUTES = ['href', 'src', 'action', 'poster', 'data-href']

/**
 * Is this a site-absolute URL that still needs the prefix?
 *
 * Everything rejected here is rejected for a specific reason:
 * - already under BASE_PATH — Next prefixed it (assets), or we already did.
 * - `//` — protocol-relative, points at another origin.
 * - not starting with `/` — relative or a scheme (http:, mailto:, tel:, data:)
 *   or a bare `#` fragment, all of which resolve correctly as-is.
 */
function needsPrefix(url) {
	if (!url.startsWith('/')) return false
	if (url.startsWith('//')) return false
	if (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`)) return false
	return true
}

function prefix(url) {
	// '/' becomes '/v2/', not '/v2', so it keeps naming a directory. Without the
	// trailing slash GitHub Pages serves the page but resolves its relative
	// assets one level too shallow — the unstyled-site failure in GITHUB_PAGES.md.
	return url === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${url}`
}

/** Rewrite the single-URL attributes. */
function rewriteAttributes(html, counters) {
	let result = html
	for (const attribute of URL_ATTRIBUTES) {
		const pattern = new RegExp(`(\\s${attribute}=")([^"]*)(")`, 'g')
		result = result.replace(pattern, (match, open, url, close) => {
			if (!needsPrefix(url)) return match
			counters.urls++
			return `${open}${prefix(url)}${close}`
		})
	}
	return result
}

/**
 * Rewrite `srcset`, whose value is `url 1x, url 2x` — each candidate's URL is
 * the run up to the first whitespace. Splitting on commas is safe here because
 * the URLs this export emits are static file paths with no commas in them; a
 * data: URI in a srcset would break it, which is why `needsPrefix` rejects
 * anything not starting with '/' and this loop preserves non-matches verbatim.
 */
function rewriteSrcset(html, counters) {
	return html.replace(
		/(\ssrcset=")([^"]*)(")/g,
		(match, open, value, close) => {
			let touched = false
			const rewritten = value
				.split(',')
				.map((candidate) => {
					const trimmed = candidate.trim()
					if (!trimmed) return candidate
					const spaceIndex = trimmed.search(/\s/)
					const url = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex)
					const descriptor = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex)
					if (!needsPrefix(url)) return candidate
					touched = true
					counters.urls++
					return `${prefix(url)}${descriptor}`
				})
				.join(', ')
			if (!touched) return match
			return `${open}${rewritten}${close}`
		},
	)
}

/**
 * The `content` of URL-bearing meta tags.
 *
 * Canonical, og:url and og:image are built by `absoluteUrl` in
 * src/config/site.ts and are already absolute WITH the prefix, so they are not
 * matched by `needsPrefix`. This pass exists for the ones that are emitted
 * site-relative — `msapplication-TileImage` and similar — and is a no-op when
 * there are none. It is narrow on purpose: rewriting every `content="..."` would
 * corrupt a description that happens to begin with a slash.
 */
function rewriteMetaContent(html, counters) {
	return html.replace(
		/(<meta\s[^>]*?content=")([^"]*)(")/g,
		(match, open, value, close) => {
			if (!/(?:name|property)="[^"]*(?:image|url|Image|URL)[^"]*"/.test(open)) {
				return match
			}
			if (!needsPrefix(value)) return match
			counters.urls++
			return `${open}${prefix(value)}${close}`
		},
	)
}

function walk(dir) {
	const found = []
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) found.push(...walk(full))
		else found.push(full)
	}
	return found
}

function main() {
	let files
	try {
		files = walk(OUT)
	} catch {
		console.error(
			'apply-base-path: out/ not found. Run `next build` first — this rewrites ' +
				'the export, not the source.',
		)
		process.exit(1)
	}

	// HTML carries the navigation. The web app manifest carries `start_url` and
	// `scope`, which are site-absolute and would otherwise install a shortcut
	// that opens the APEX application rather than this one — a failure that only
	// shows up after someone adds the site to a home screen. Both are rewritten.
	//
	// Nothing else is touched. In particular _next/ JavaScript is left alone,
	// because Next already prefixed every URL it puts there and a second pass
	// would double it.
	//
	// `manifest.json` is matched by name because this app ships a static one from
	// public/ rather than generating a `.webmanifest` from app/manifest.ts; both
	// spellings are handled so that switching to the generated form later does
	// not silently drop out of this pass.
	const targets = files.filter(
		(f) =>
			f.endsWith('.html') ||
			f.endsWith('.webmanifest') ||
			f.endsWith(`${sep}manifest.json`),
	)
	const counters = { urls: 0 }
	let changedFiles = 0

	for (const file of targets) {
		const original = readFileSync(file, 'utf8')
		const before = counters.urls

		let rewritten = original
		if (file.endsWith('.html')) {
			rewritten = rewriteAttributes(rewritten, counters)
			rewritten = rewriteSrcset(rewritten, counters)
			rewritten = rewriteMetaContent(rewritten, counters)
		} else {
			// A manifest is JSON: rewrite its quoted site-absolute values only.
			rewritten = rewritten.replace(
				/"((?:start_url|scope|src))":\s*"([^"]*)"/g,
				(match, key, url) => {
					if (!needsPrefix(url)) return match
					counters.urls++
					return `"${key}": "${prefix(url)}"`
				},
			)
		}

		if (rewritten !== original) {
			writeFileSync(file, rewritten)
			changedFiles++
			if (VERBOSE) {
				console.log(
					`  ${file.slice(OUT.length + 1)} — ${counters.urls - before} URL(s)`,
				)
			}
		}
	}

	console.log(
		`apply-base-path: prefixed ${counters.urls} URL(s) with ${BASE_PATH} across ` +
			`${changedFiles} of ${targets.length} file(s).`,
	)
}

main()
