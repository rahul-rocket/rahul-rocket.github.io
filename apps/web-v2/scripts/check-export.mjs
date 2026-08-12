#!/usr/bin/env node
/**
 * Export assertions — F0-05.
 *
 * Runs against out/ after `next build`. Each check corresponds to a failure
 * that GitHub Pages produces *silently*: the deploy succeeds, the build is
 * green, and the site is broken in a way nobody notices until a reader reports
 * it. That is the entire reason these are assertions and not documentation.
 *
 * Usage: node scripts/check-export.mjs [outDir]
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const outDir = resolve(process.argv[2] ?? 'out')
const failures = []

function fail(check, detail) {
	failures.push({ check, detail })
}

function walk(dir) {
	const entries = []
	for (const name of readdirSync(dir)) {
		const full = join(dir, name)
		if (statSync(full).isDirectory()) entries.push(...walk(full))
		else entries.push(full)
	}
	return entries
}

if (!existsSync(outDir)) {
	console.error(
		`check-export: ${relative(process.cwd(), outDir)} does not exist. Run \`pnpm build\` first.`,
	)
	process.exit(1)
}

const files = walk(outDir)
const rel = (f) => relative(outDir, f).split('\\').join('/')

/**
 * Must equal `basePath` in next.config.mjs, `site.basePath` in
 * src/config/site.ts, and the constants in check-links.mjs and
 * apply-base-path.mjs. Every absolute URL in the exported HTML carries it; no
 * path inside out/ does.
 */
const BASE_PATH = '/v2'

/*
 * 1. .nojekyll must reach out/.
 *
 * Without it Pages runs Jekyll, which drops every path starting with an
 * underscore — i.e. the whole of _next/. Presents as a fully unstyled site.
 */
if (!existsSync(join(outDir, '.nojekyll'))) {
	fail(
		'.nojekyll present in out/',
		'missing — Jekyll will strip _next/ and the site will serve with no CSS or JS',
	)
}

/*
 * 2. The asset directory must exist and be non-empty.
 *
 * A guard against .nojekyll being present but the export having produced
 * nothing, which would make check 1 pass vacuously.
 */
const nextAssets = files.filter((f) => rel(f).startsWith('_next/'))
if (nextAssets.length === 0) {
	fail('_next/ populated', 'no build assets were emitted')
}

/*
 * 3. Every route must be a directory with an index.html.
 *
 * This is what `trailingSlash: true` buys. Pages has no server-side redirect,
 * so /about (no slash) 404s unless /about/index.html exists.
 */
const htmlFiles = files.filter((f) => f.endsWith('.html'))
if (htmlFiles.length === 0) {
	fail('at least one page exported', 'no .html files in out/')
}
if (!existsSync(join(outDir, 'index.html'))) {
	fail('index.html at the root', 'the home route did not export')
}
for (const f of htmlFiles) {
	const r = rel(f)
	// 404.html is the one legitimate top-level non-index page: Pages serves it
	// by that exact filename.
	if (r === '404.html' || r.endsWith('/index.html') || r === 'index.html') {
		continue
	}
	fail(
		'routes export as dir/index.html',
		`${r} is a bare .html file — trailingSlash may have been turned off`,
	)
}

/*
 * 4. No absolute localhost or 127.0.0.1 URL may survive into the HTML.
 *
 * These come from a metadataBase misconfiguration and are invisible in a local
 * preview, because locally they resolve.
 */
for (const f of htmlFiles) {
	const html = readFileSync(f, 'utf8')
	if (/https?:\/\/(localhost|127\.0\.0\.1)/.test(html)) {
		fail(
			'no localhost URLs in the export',
			`${rel(f)} contains a localhost URL`,
		)
	}
}

/*
 * 5. Nothing in out/ may start with an underscore except _next/.
 *
 * Same Jekyll rule as check 1, from the other direction: .nojekyll protects
 * these today, but a stray underscore path is a smell worth surfacing.
 */
for (const f of files) {
	const r = rel(f)
	if (r.startsWith('_') && !r.startsWith('_next/')) {
		fail(
			'no unexpected underscore paths',
			`${r} — Jekyll-hostile path outside _next/`,
		)
	}
}

/*
 * 6. Q-02 — every og:image is absolute AND resolves inside the export.
 *
 * Both halves matter and both fail invisibly. A RELATIVE og:image is resolved
 * by the consuming client against its own origin, so the card is broken in
 * Slack, iMessage, LinkedIn and WhatsApp simultaneously while looking correct
 * in the page source. An absolute one pointing at a file the export does not
 * contain is a blank card for the same reason, and neither shows up in a build
 * log, a link check, or a local preview.
 *
 * This is also the only thing keeping `ogImageForPath` in src/lib/seo and
 * `slugForRoute` in scripts/generate-og.mjs in step. They are two functions in
 * two languages that must agree on a filename; a shared constant could not have
 * caught a drift, because the drift would be in how each USES it. Checking the
 * built output catches it on the first build after either changes.
 */
for (const f of htmlFiles) {
	const html = readFileSync(f, 'utf8')
	const pattern = /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/gi

	for (const match of html.matchAll(pattern)) {
		const value = match[1]
		if (!value) continue

		if (!/^https?:\/\//i.test(value)) {
			fail(
				'every og:image is absolute',
				`${rel(f)} → ${value} — a relative og:image resolves against the consuming client, not this site`,
			)
			continue
		}

		let pathname
		try {
			pathname = new URL(value).pathname
		} catch {
			fail('every og:image is a valid URL', `${rel(f)} → ${value}`)
			continue
		}

		// The URL carries the deployed base path ('/v2/og/home.png'); out/ does
		// not ('og/home.png'). basePath prefixes the URLs in the HTML, not the
		// directory the export is written to, so it has to come off before this
		// becomes a path on disk. Without this the check fails for every page at
		// once, which reads as a broken OG pipeline rather than as a path bug.
		const onDisk =
			pathname === BASE_PATH
				? '/'
				: pathname.startsWith(`${BASE_PATH}/`)
					? pathname.slice(BASE_PATH.length)
					: pathname

		// A URL outside the base path is a genuine failure, not a lookup miss: it
		// would point a link-preview crawler at the apex application.
		if (onDisk === pathname && pathname !== '/') {
			fail(
				'every og:image is inside the base path',
				`${rel(f)} → ${value} — outside ${BASE_PATH}/, so it names a file in the apex application, not this one`,
			)
			continue
		}

		if (!existsSync(join(outDir, onDisk))) {
			fail(
				'every og:image resolves in the export',
				`${rel(f)} → ${value} — no file at out${onDisk}. Run \`pnpm og:generate\` after the build, or check that ogImageForPath() and slugForRoute() still agree.`,
			)
		}
	}
}

if (failures.length > 0) {
	console.error(`\ncheck-export: ${failures.length} failure(s) in ${outDir}\n`)
	for (const { check, detail } of failures) {
		console.error(`  FAIL  ${check}\n        ${detail}`)
	}
	console.error('')
	process.exit(1)
}

console.log(
	`check-export: OK — ${htmlFiles.length} page(s), ${nextAssets.length} asset(s), .nojekyll present`,
)
