#!/usr/bin/env node
/*
 * Serve the export the way the base path expects.
 *
 * WHY `serve out` STOPPED BEING ENOUGH
 *
 * This app is published under /v2 (next.config.mjs), so every URL inside the
 * exported HTML — assets from `basePath`, navigation from apply-base-path.mjs —
 * begins '/v2/'. But out/ has no v2/ directory in it: basePath rewrites the URLs
 * in the pages, not the directory the export is written to. Serving out/ at the
 * root therefore yields pages whose every stylesheet, script and link 404s,
 * which presents as an unstyled site rather than as an error.
 *
 * WHAT THIS DOES, AND WHY IT MOUNTS THE TREE TWICE
 *
 * It builds .preview/ containing the export at BOTH the root and under v2/:
 *
 *   .preview/         <- out/, so a bare path like /about/ still resolves
 *   .preview/v2/      <- out/, so /v2/about/ and every /v2/_next/ asset resolve
 *
 * The v2/ mount is the one that matters: it is what makes the page render
 * correctly, because that is where the HTML's own URLs point. The root mount
 * exists so the E2E suite's site-absolute `page.goto('/about/')` calls keep
 * working without a prefix pass over every spec — the page they land on loads its
 * assets from /v2/ regardless, so what is being tested is the real export.
 *
 * THIS IS A PREVIEW, NOT THE ARTIFACT. In production the root is a DIFFERENT
 * application (apps/web). For a faithful whole-site preview, including how the
 * two sit together, use `pnpm pages:serve` at the repository root — that runs the
 * same assembler the deploy workflow uses.
 *
 * Usage:  node scripts/serve-preview.mjs --port 3001
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const PREVIEW = join(ROOT, '.preview')
const BASE_PATH = 'v2'

const portIndex = process.argv.indexOf('--port')
const port = portIndex === -1 ? '3001' : process.argv[portIndex + 1]

if (!existsSync(OUT)) {
	console.error(
		'serve-preview: out/ not found. Run `pnpm build` first — this serves the ' +
			'export, it does not create it.',
	)
	process.exit(1)
}

// Rebuilt every run. A stale .preview/ would serve a route that no longer exists
// and make a deleted page look live.
if (existsSync(PREVIEW)) rmSync(PREVIEW, { recursive: true, force: true })
mkdirSync(PREVIEW, { recursive: true })

cpSync(OUT, PREVIEW, { recursive: true, dereference: true })
cpSync(OUT, join(PREVIEW, BASE_PATH), { recursive: true, dereference: true })

console.log(
	`serve-preview: serving out/ at http://localhost:${port}/${BASE_PATH}/ ` +
		`(and at / for the E2E suite's site-absolute paths)`,
)

// `serve` is already a devDependency here; no new dependency for this.
const child = spawn(
	'serve',
	[PREVIEW, '--no-clipboard', '--listen', String(port)],
	{ stdio: 'inherit', shell: true },
)
child.on('exit', (code) => process.exit(code ?? 0))
