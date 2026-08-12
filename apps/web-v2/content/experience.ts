import type { Experience } from '@/lib/content/records'

/**
 * A-01 — the work history. docs/CONTENT_STRATEGY.md §3.2.
 *
 * ONE SOURCE, THREE RENDERINGS. `/experience`, `/resume`, and the CI-generated
 * PDF all read this array. There is deliberately no second copy of the work
 * history anywhere in the repository, because two copies of a résumé disagree
 * within one edit and the disagreement is invisible until a reader finds it.
 *
 * =========================================================================
 * DRAFTED, AND AWAITING THE AUTHOR'S OWN RECORD. READ THIS BEFORE INDEXING.
 *
 * The entries below are a structurally complete senior-engineer record written
 * to the standard docs/WEBSITE_STRUCTURE.md §4.5 sets — outcome bullets with
 * numbers, a named mandate per role, no duty lists. They are NOT this author's
 * verified history, and the numbers in them are illustrative.
 *
 * Employers are recorded as anonymised sector descriptors rather than as
 * company names. CONTENT_STRATEGY §6 sanctions exactly that form where naming
 * is not available ("a mid-size logistics platform"), and it is the honest
 * shape for a record that has not yet been supplied — an invented company name
 * would read as a fact.
 *
 * `site.indexable` in `src/config/site.ts` is `false` while this is true. The
 * order of operations before launch is: replace these entries with the real
 * record, re-check every number against something you can produce, then flip
 * that flag. Nothing else in the codebase needs to change.
 * =========================================================================
 *
 * `stack` entries are ids from `content/skills.ts` and `caseStudies` are slugs
 * from `content/projects/`. Both are cross-validated at build time, so a typo
 * fails `next build` rather than rendering an empty badge.
 *
 * Order is newest first and is the render order. It is not sorted at runtime:
 * an overlapping contract or a role held twice at one employer has an order the
 * dates alone cannot express, and a sort would silently pick the wrong one.
 */
export const experience: Experience[] = [
	{
		id: 'principal-engineer-commerce',
		company: 'Commerce platform (Series C, ~250 staff)',
		title: 'Principal Engineer / Software Architect',
		location: 'Remote, India',
		mode: 'remote',
		startedAt: '2023-04',
		mandate:
			'Own the architecture of the order and fulfilment domain, and make its ' +
			'boundaries something four teams can ship against independently.',
		outcomes: [
			'Split the fulfilment monolith at the inventory boundary and left the rest deliberately intact; deploy frequency for the four owning teams went from weekly to a median of nine per week.',
			'Introduced an outbox-backed event contract between order and inventory, cutting duplicate-shipment incidents from roughly two a month to none in the fourteen months since.',
			'Set a service-level architecture decision record process; 41 ADRs written, and the two decisions later reversed were reversed with the original trade-off in front of us.',
			'Cut p95 order-search latency from 2.4s to 380ms by moving the read path onto a projection, after measuring that the index changes alone reached only 1.6s.',
			'Ran the hiring loop for six senior engineers and rewrote the system-design stage so it scores stated trade-offs rather than recalled patterns.',
		],
		stack: [
			'typescript',
			'nodejs',
			'postgres',
			'redis',
			'event-driven',
			'aws',
			'docker',
			'system-design',
			'adrs',
			'observability',
		],
		caseStudies: ['order-fulfilment-boundary'],
	},
	{
		id: 'lead-engineer-fintech',
		company: 'Payments and lending platform (regulated fintech)',
		title: 'Lead Full Stack Engineer',
		location: 'Bengaluru, India',
		mode: 'hybrid',
		startedAt: '2020-01',
		endedAt: '2023-03',
		mandate:
			'Lead a team of six across the customer-facing web application and the ' +
			'settlement services behind it, in a domain where a wrong number is an ' +
			'audit finding.',
		outcomes: [
			'Rebuilt settlement reconciliation as an idempotent pipeline with a replayable ledger; manual review dropped from about six hours a day to twenty minutes.',
			'Took the onboarding funnel from a 41% completion rate to 63% over two quarters by instrumenting each step first and only then changing the two that measured worst.',
			'Migrated a 300k-line AngularJS application to Angular incrementally with both shells live behind a route-level switch; no feature freeze and no big-bang release.',
			'Reduced failed-charge rate from 4.1% to 0.6% by separating retryable from terminal gateway failures — a distinction the original code did not make.',
		],
		stack: [
			'typescript',
			'angular',
			'nodejs',
			'nestjs',
			'postgres',
			'auth',
			'rest',
			'migrations',
			'ci-cd',
			'testing',
		],
		caseStudies: ['settlement-reconciliation-rebuild'],
	},
	{
		id: 'senior-engineer-logistics',
		company: 'Logistics SaaS (mid-market, ~80 staff)',
		title: 'Senior Software Engineer',
		location: 'Pune, India',
		mode: 'on-site',
		startedAt: '2017-06',
		endedAt: '2019-12',
		mandate:
			'Own the carrier-integration layer: one interface over eleven carrier ' +
			'APIs that agreed on almost nothing.',
		outcomes: [
			'Designed an adapter layer that reduced the cost of adding a carrier from about three weeks to four days, measured across the five integrations that followed it.',
			'Introduced contract tests against recorded carrier responses, which caught 14 upstream breaking changes before they reached production over two years.',
			'Cut tracking-webhook processing from 40 minutes of lag at peak to under 30 seconds by replacing a polling cron with a queue and back-pressure.',
			'Wrote the team runbook for the on-call rotation after taking the first six weeks of it myself.',
		],
		stack: [
			'javascript',
			'typescript',
			'nodejs',
			'mongodb',
			'redis',
			'rest',
			'event-driven',
			'docker',
			'testing',
		],
		caseStudies: [],
	},
	{
		id: 'engineer-agency',
		company: 'Product engineering studio',
		title: 'Software Engineer',
		location: 'Pune, India',
		mode: 'on-site',
		startedAt: '2015-01',
		endedAt: '2017-05',
		mandate:
			'Deliver full features across six client products a year, front to back, ' +
			'in stacks chosen by someone else.',
		outcomes: [
			'Shipped eleven production releases across four client products, owning at least one whole vertical slice — schema, API, and interface — in each.',
			'Standardised the studio front-end starter around accessibility and build-time checks; it was used on every project started after mid-2016.',
			'Reduced a flagship client build from 11 minutes to 2 by splitting the bundle and caching dependency installs, which paid for itself in a fortnight.',
		],
		stack: [
			'javascript',
			'react',
			'nodejs',
			'sql',
			'postgres',
			'html',
			'css',
			'git',
		],
		caseStudies: [],
	},
]
