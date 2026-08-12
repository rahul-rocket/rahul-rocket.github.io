#!/usr/bin/env node
/*
 * Assemble the single GitHub Pages artifact from the two apps' exports.
 *
 *   apps/web/out/     -> _pages/          (the apex, https://rahul-rocket.github.io/)
 *   apps/web-v2/out/  -> _pages/v2/       (https://rahul-rocket.github.io/v2/)
 *
 * ONE script, run by both CI (.github/workflows/deploy-pages.yml) and by
 * `pnpm pages:serve` locally, because a deployment layout that only exists
 * inside a workflow file cannot be tested before it is published. Every failure
 * this guards against is one that produces a *plausible-looking* site rather
 * than an obvious break:
 *
 * - V2 overwriting V1's `_next/`, `404.html`, `robots.txt`, `sitemap.xml` or
 *   `favicon.ico`. Both apps are Next.js exports, so both want the same paths at
 *   the root. Nesting V2 under v2/ is what prevents it, and `--check-collisions`
 *   asserts the nesting actually happened rather than assuming it.
 * - A missing entry point. Copying an empty or partial out/ yields an artifact
 *   that deploys successfully and serves nothing.
 * - A stale _pages/ from a previous run leaking files that no longer exist in
 *   either export.
 *
 * Zero dependencies.
 *
 * Usage:  node scripts/assemble-pages.mjs [--verbose]
 * Exit:   0 artifact assembled and verified · 1 any check failed
 */

import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync,
} from 'node:fs'
import { dirname, join, posix, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = join(ROOT, '_pages')
const VERBOSE = process.argv.includes('--verbose')

/**
 * The two sources, in copy order. V1 is copied first and to the root; V2 second
 * and into a subdirectory, so if the nesting were ever removed the collision
 * check below would catch V2 clobbering V1 rather than the reverse — which is
 * the direction that matters, because V1 is the established production site.
 */
const SOURCES = [
	{
		name: 'V1 (apps/web)',
		from: join(ROOT, 'apps', 'web', 'out'),
		/** Empty means the root of the artifact. */
		to: '',
		/** A file that must exist afterwards, or the copy was not a real site. */
		entry: 'index.html',
	},
	{
		name: 'V2 (apps/web-v2)',
		from: join(ROOT, 'apps', 'web-v2', 'out'),
		to: 'v2',
		entry: join('v2', 'index.html'),
	},
]

/**
 * Paths at the artifact root that V2 must never own.
 *
 * Each is a file both Next.js exports produce at their own root, so each is a
 * real collision if V2 is ever copied to '' instead of 'v2'. `404.html` is the
 * one with teeth: GitHub Pages serves the root 404.html for every unmatched
 * path across the WHOLE site, so V2's 404 replacing V1's would hand a V1
 * visitor a page from the other application.
 */
const V1_OWNED = [
	'404.html',
	'index.html',
	'robots.txt',
	'sitemap.xml',
	'favicon.ico',
	'_next',
	'manifest.webmanifest',
]

function fail(message) {
	console.error(`\nassemble-pages: ${message}\n`)
	process.exit(1)
}

/** Every file under dir, as posix paths relative to it. */
function walk(dir, base = '') {
	const found = []
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		const rel = posix.join(base, entry)
		if (statSync(full).isDirectory()) found.push(...walk(full, rel))
		else found.push(rel)
	}
	return found
}

function main() {
	// A stale _pages/ is worse than none: it can serve a route that no longer
	// exists in either app, and it makes the collision check pass on last run's
	// files. Rebuilt from nothing every time.
	if (existsSync(DEST)) {
		rmSync(DEST, { recursive: true, force: true })
	}
	mkdirSync(DEST, { recursive: true })

	for (const source of SOURCES) {
		if (!existsSync(source.from)) {
			fail(
				`${source.name}: ${relative(ROOT, source.from)} not found.\n` +
					'  Build both apps first — `pnpm build` at the repo root, or\n' +
					'  `pnpm --filter web build && pnpm --filter web-v2 build`.\n' +
					'  This script copies exports; it does not create them.',
			)
		}

		const files = walk(source.from)
		if (files.length === 0) {
			fail(`${source.name}: ${relative(ROOT, source.from)} is empty.`)
		}

		const target = source.to ? join(DEST, source.to) : DEST
		// `dereference` so a symlinked asset becomes a real file in the artifact —
		// the Pages upload does not follow links out of the uploaded tree.
		cpSync(source.from, target, { recursive: true, dereference: true })

		console.log(
			`assemble-pages: ${source.name} → _pages/${source.to ? `${source.to}/` : ''} ` +
				`(${files.length} files)`,
		)
	}

	// 1. Both entry points must exist. This is the check that a "successful"
	//    deploy of an empty artifact fails.
	for (const source of SOURCES) {
		const entry = join(DEST, source.entry)
		if (!existsSync(entry)) {
			fail(
				`${source.name}: expected entry point _pages/${source.entry.split(sep).join('/')} ` +
					'is missing after the copy.',
			)
		}
	}

	// 2. V1's root-level files must be V1's. Compared by content length against
	//    the source, because a same-named file of a different size is the
	//    signature of an overwrite and is invisible from a directory listing.
	const v1Out = SOURCES[0].from
	for (const name of V1_OWNED) {
		const inArtifact = join(DEST, name)
		const inSource = join(v1Out, name)
		if (!existsSync(inSource) || !existsSync(inArtifact)) continue
		const a = statSync(inSource)
		const b = statSync(inArtifact)
		if (a.isFile() && b.isFile() && a.size !== b.size) {
			fail(
				`collision: _pages/${name} (${b.size} bytes) does not match ` +
					`apps/web/out/${name} (${a.size} bytes). Something overwrote V1's copy.`,
			)
		}
	}

	// 3. V2's 404 must live under v2/ and must not be the root 404. GitHub Pages
	//    serves the ROOT 404.html for every unmatched path on the whole origin,
	//    so this is the single most consequential file in the artifact.
	const rootFourOhFour = join(DEST, '404.html')
	const v2FourOhFour = join(DEST, 'v2', '404.html')
	if (existsSync(rootFourOhFour) && existsSync(v2FourOhFour)) {
		if (statSync(rootFourOhFour).size === statSync(v2FourOhFour).size) {
			fail(
				'collision: _pages/404.html is the same size as _pages/v2/404.html. ' +
					"V2's error page appears to have replaced V1's, which would serve a " +
					'V2 page for every bad URL on the apex site.',
			)
		}
	}

	// 4. V2 must be entirely inside v2/. Catches a future change that copies it
	//    to the root, before it reaches the deploy step.
	const v2Files = new Set(walk(join(DEST, 'v2')))
	const v1Files = new Set(walk(v1Out))
	const escaped = [...v2Files].filter(
		(f) => !v1Files.has(f) && existsSync(join(DEST, f)),
	)
	if (escaped.length > 0) {
		fail(
			`V2 files present at the artifact root: ${escaped.slice(0, 5).join(', ')}` +
				`${escaped.length > 5 ? ` (+${escaped.length - 5} more)` : ''}`,
		)
	}

	const total = walk(DEST).length
	if (VERBOSE) {
		for (const f of walk(DEST).slice(0, 40)) console.log(`  ${f}`)
	}
	console.log(
		`assemble-pages: OK — _pages/ has ${total} files, both entry points present, ` +
			'no V1/V2 collisions.',
	)
}

main()
