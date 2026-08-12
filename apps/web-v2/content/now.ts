import type { Now } from '@/lib/content/records'

/**
 * C-12 — `/now`. docs/WEBSITE_STRUCTURE.md §1.
 *
 * A DATED SNAPSHOT, AND THE DATE IS THE FEATURE. `updated` below is the page's
 * `dateModified` in both the rendered markup and the JSON-LD, and it comes from
 * this file — never from the build date. C-12's acceptance criterion says so
 * explicitly: a `/now` that claims to have been updated on every deploy has
 * converted its one honest signal into noise.
 *
 * The corollary is that this file going stale is *information*, not a bug. A
 * `/now` last touched a year ago says something true about the site.
 */
export const now: Now = {
	updated: new Date('2026-08-01'),

	intro:
		'A snapshot of what I am working on, reading, and available for. Updated ' +
		'by hand, and the date above is the date I last touched it rather than ' +
		'the date this site was last deployed.',

	sections: [
		{
			title: 'Building',
			items: [
				'This site — a static Next.js export with per-route byte budgets, accessibility and Lighthouse gates in CI, and a public backlog of what it has not done.',
				'A small Rust command-line tool for auditing the design tokens actually referenced by a stylesheet, because the ones nobody uses are the ones that drift.',
			],
		},
		{
			title: 'Working on',
			items: [
				'Read-path projections for an order domain, and the operational question nobody enjoys: what to do when a projection falls behind.',
				'Rewriting a system-design interview stage so it scores stated trade-offs instead of recalled patterns.',
			],
		},
		{
			title: 'Reading',
			items: [
				'Designing Data-Intensive Applications, for the third time — it reads differently once you have been on call for the failure modes.',
				'Papers on CRDTs, mostly to work out where they are the wrong answer.',
			],
		},
		{
			title: 'Learning',
			items: [
				'Rust, seriously enough to move my build tooling onto it.',
				'Enough Postgres internals to stop treating the query planner as weather.',
			],
		},
	],

	availability:
		'Open to conversations about architecture and platform work, and to ' +
		'short engagements that have a defined question at the end of them. The ' +
		'fastest way to a useful reply is a paragraph about the actual problem.',
}
