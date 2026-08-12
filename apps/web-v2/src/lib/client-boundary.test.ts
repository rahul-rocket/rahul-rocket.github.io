import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * THE `cn`-IN-A-CLIENT-COMPONENT RULE, AS A TEST RATHER THAN A PARAGRAPH.
 * CLAUDE.md §10, docs/PERFORMANCE.md §2, docs/TASK_BACKLOG.md L-13 and H-01.
 *
 * `lib/cn.ts` is clsx plus `tailwind-merge`, and `tailwind-merge` is 8.7 KB gz
 * because it carries a table of every conflicting Tailwind utility group.
 * Importing it from anything under `'use client'` puts it in the shared chunk
 * of every route that renders that component.
 *
 * This is not hypothetical and it is not a small effect. It was the single
 * largest item on the home page for three milestones, arriving through
 * `<Reveal>`'s `className={cn(className)}` — `cn` with one argument, which
 * merges nothing. Three probe builds put a number on it: a client component
 * with `useState` and no `cn` costs 0.27 KB; the same component importing `cn`
 * costs 9.37 KB. Removing that one import took Home from 118.51 KB to
 * 108.72 KB.
 *
 * For three milestones the cost was documented as React's unavoidable hydration
 * runtime. It was not, and the reason nobody noticed is that a byte budget
 * reports a total rather than a cause. A grep does report the cause, which is
 * why this exists: the rule was written down twice and violated twice anyway,
 * and a rule that has already been broken by people who knew it is a rule that
 * needs a gate.
 *
 * The failure it catches is invisible in review. A `cn(...)` call in a client
 * leaf looks exactly like every other one in the codebase, and the only signal
 * is a bundle that grew by nine kilobytes — attributed, if anyone looks, to
 * whichever feature happened to land that week.
 */

// `fileURLToPath`, not `.pathname`: on Windows the latter yields `/D:/…`, which
// `readdirSync` resolves against the current drive as `D:\D:\…` and the whole
// suite fails to collect. CI is Linux, so this gate only breaks locally.
const SRC = fileURLToPath(new URL('..', import.meta.url))

function walk(dir: string): string[] {
	const found: string[] = []
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) {
			found.push(...walk(full))
		} else if (/\.tsx?$/.test(entry) && !entry.endsWith('.test.ts')) {
			found.push(full)
		}
	}
	return found
}

/**
 * A file is a Client Component when the DIRECTIVE is the first statement — not
 * when the string appears anywhere. Several files in this codebase discuss
 * `'use client'` in a comment, and a naive grep flags every one of them, which
 * is how a gate teaches people to ignore it.
 */
function isClientComponent(source: string): boolean {
	const withoutComments = source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/^\s*\/\/.*$/gm, '')
	return /^\s*['"]use client['"]/.test(withoutComments)
}

describe('the client boundary', () => {
	const files = walk(SRC).map((path) => ({
		path: path.replace(SRC, 'src/'),
		source: readFileSync(path, 'utf8'),
	}))

	const clientComponents = files.filter((file) =>
		isClientComponent(file.source),
	)

	it('finds the client components at all', () => {
		// A guard on the guard. If `isClientComponent` ever stops matching — a
		// formatter change, a directive moved below an import — this test would
		// pass by checking nothing, which is the failure mode of every
		// convention-scanning test.
		expect(clientComponents.length).toBeGreaterThan(10)
	})

	it('has no client component importing `cn`', () => {
		const offenders = clientComponents
			.filter((file) => /from ['"]@\/lib\/cn['"]/.test(file.source))
			.map((file) => file.path)

		expect(
			offenders,
			'`cn` pulls tailwind-merge (8.7 KB gz) across the client boundary and ' +
				'into the shared chunk of every route that renders this component. ' +
				'Build the class string directly, or use a ternary over two complete ' +
				'strings. CLAUDE.md §10.',
		).toEqual([])
	})

	it('has no client component in the design-system layer', () => {
		// `components/ui/` is presentational by contract. A client boundary inside
		// it pulls every consumer's subtree into the bundle, which is the single
		// most likely performance regression in this codebase (CLAUDE.md §5).
		const offenders = clientComponents
			.filter((file) => file.path.startsWith('src/components/ui/'))
			.map((file) => file.path)

		expect(offenders).toEqual([])
	})
})
