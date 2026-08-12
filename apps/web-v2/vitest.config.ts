import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Vitest — docs/TESTING.md.
 *
 * Node environment only, for now. The content pipeline and the utilities are
 * build-time code, so testing them in Node is both faster and more faithful
 * than testing them in jsdom. The jsdom project (and its dependency) is added
 * in Phase 4, alongside the first component that needs it — not before, so an
 * unused environment cannot sit in the install rotting.
 */
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			// Mirrors tsconfig's paths. Vitest does not read them, so the two are
			// kept in step by hand — and a drift shows up immediately as an
			// unresolved import in `pnpm content:validate`.
			'@content': fileURLToPath(new URL('./content', import.meta.url)),
		},
	},
	test: {
		globals: false,
		environment: 'node',
		include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
		coverage: {
			// Coverage is reported, not gated. A percentage target rewards testing
			// trivial code; docs/TESTING.md gates on which *behaviours* are covered.
			reporter: ['text', 'html'],
			include: ['src/lib/**', 'src/features/**/lib/**'],
		},
	},
})
