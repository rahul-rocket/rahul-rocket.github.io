#!/usr/bin/env node
/**
 * Image weight gate — F0-09. Run by lint-staged over staged image files.
 *
 * 500 KB is not a stylistic preference. There is no runtime image optimizer
 * under `output: 'export'` (docs/ARCHITECTURE.md §7), so whatever is committed
 * is exactly what a reader on mobile downloads. An oversized image committed
 * once is permanent in the git history even after it is replaced, which is why
 * this runs before the commit rather than in CI.
 *
 * Usage: node scripts/check-image-size.mjs <file>...
 */

import { statSync } from 'node:fs'
import { relative } from 'node:path'

const LIMIT_BYTES = 500 * 1024

const oversized = []
for (const file of process.argv.slice(2)) {
	const { size } = statSync(file)
	if (size > LIMIT_BYTES) oversized.push({ file, size })
}

if (oversized.length > 0) {
	console.error('\ncheck-image-size: image(s) over 500 KB\n')
	for (const { file, size } of oversized) {
		console.error(
			`  ${relative(process.cwd(), file)} — ${(size / 1024).toFixed(0)} KB`,
		)
	}
	console.error(
		'\nRe-encode to AVIF or WebP at the size it is actually displayed.' +
			'\nIf the file genuinely must ship at this weight, say why in the commit body' +
			'\nand commit with --no-verify — but that is a decision, not a workaround.\n',
	)
	process.exit(1)
}
