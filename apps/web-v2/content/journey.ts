import type { Milestone } from '@/lib/content/records'

/**
 * A-01 — the journey. docs/WEBSITE_STRUCTURE.md §4.3.
 *
 * TRAJECTORY, NOT A SECOND RÉSUMÉ. `/experience` is the verifiable record;
 * this is the narrative counterpart, and the test for an entry is whether
 * something *changed* because of it. A milestone that reads "joined X as Y" is
 * a duty list entry and belongs in `experience.ts`, which already has it.
 *
 * The `changed` field exists to force that: an entry that cannot state what it
 * altered is not an inflection point, and the schema will not accept it empty.
 *
 * =========================================================================
 * DRAFTED, AND AWAITING THE AUTHOR'S OWN ACCOUNT. Same standing as
 * `experience.ts` — see the note there, and `site.indexable` in
 * `src/config/site.ts`.
 * =========================================================================
 *
 * Ordered oldest first. `/journey` renders it as an `<ol>` in exactly this
 * order, so the DOM sequence is the chronology regardless of which side of the
 * spine a milestone is drawn on (§4.3: the alternation is CSS only).
 */
export const journey: Milestone[] = [
	{
		id: 'first-production-bug',
		year: 2015,
		title: 'The first outage that was mine',
		story:
			'Six months in, I shipped a migration that added a NOT NULL column to a ' +
			'table with four million rows, on a Friday, during business hours. The ' +
			'lock held for eleven minutes and took checkout down with it. Nobody ' +
			'blamed me, which was worse than being blamed — the senior engineer sat ' +
			'with me afterwards and asked what I had expected to happen, and I did ' +
			'not have an answer, because I had not thought about it at all.',
		changed:
			'I stopped treating a migration as part of the diff and started treating it as a deploy of its own, with its own plan and its own rollback.',
	},
	{
		id: 'first-whole-slice',
		year: 2016,
		title: 'Owning a vertical slice instead of a ticket',
		story:
			'A client project was short a backend engineer, so I took a feature from ' +
			'schema to interface on my own for the first time. It was slower than ' +
			'splitting it would have been, and the result was noticeably more ' +
			'coherent: the API stopped being a translation layer between two ' +
			'people’s mental models, because there was only one. That experience is ' +
			'most of why I describe myself as full stack rather than as a front-end ' +
			'engineer who can write an endpoint.',
		changed:
			'I began asking to own whole slices, and started reading the database as carefully as the component tree.',
	},
	{
		id: 'integration-layer',
		year: 2018,
		title: 'Eleven carrier APIs that agreed on nothing',
		story:
			'The logistics product integrated with eleven carriers, each with its own ' +
			'idea of what a tracking event was, and every new integration cost about ' +
			'three weeks of nearly identical work. I argued for an adapter layer and ' +
			'was told to prove it on the next one. It took a fortnight longer than ' +
			'the direct implementation would have, and the five integrations after it ' +
			'took four days each. It was the first time I made an architectural ' +
			'argument in cost terms rather than in taste terms, and the first time ' +
			'one landed.',
		changed:
			'I learned that an abstraction is a claim about future cost, and that the claim has to be made out loud before it is believable.',
	},
	{
		id: 'regulated-domain',
		year: 2020,
		title: 'Moving into a domain where being wrong is an audit finding',
		story:
			'Payments was the first environment I worked in where a rounding error ' +
			'was not a bug report but a regulatory event, and where "we will fix it ' +
			'forward" was not available. The discipline it forced — idempotency ' +
			'everywhere, a replayable ledger, reconciliation as a first-class ' +
			'feature rather than a monthly spreadsheet — turned out to be good ' +
			'engineering practice that I had previously treated as optional ' +
			'ceremony for everything else.',
		changed:
			'Correctness under retry became the first thing I design, rather than something I add once the happy path works.',
	},
	{
		id: 'leading-without-writing',
		year: 2021,
		title: 'Leading six people and writing far less code',
		story:
			'My first real lead role, and my first genuinely uncomfortable one. My ' +
			'throughput as an individual halved and I spent two months quietly ' +
			'measuring myself against it before noticing that the team’s throughput ' +
			'had not. The change that actually mattered was in code review: I ' +
			'stopped correcting and started asking what the author had considered, ' +
			'which is slower per comment and much faster per engineer.',
		changed:
			'I started treating review as the highest-leverage teaching surface available, and my own commit count as a bad proxy for anything.',
	},
	{
		id: 'strangler-migration',
		year: 2022,
		title: 'A migration with no feature freeze',
		story:
			'Three hundred thousand lines of AngularJS, a product team that could not ' +
			'stop shipping for a quarter, and a framework two years past end of life. ' +
			'We ran both shells at once behind a route-level switch and moved routes ' +
			'across one at a time for eight months. It was less elegant than a ' +
			'rewrite and it was the only version that was ever going to finish, ' +
			'because it never needed permission to pause the roadmap.',
		changed:
			'I stopped proposing rewrites. Every migration I have designed since has both paths live and a measured switch.',
	},
	{
		id: 'architecture-in-writing',
		year: 2023,
		title: 'Architecture as something written down',
		story:
			'Becoming an architect turned out to mean writing more than diagramming. ' +
			'The decisions that survived were the ones recorded with their ' +
			'alternatives and their cost; the ones that were re-argued every six ' +
			'months were the ones that lived only in a whiteboard photograph. Two of ' +
			'the forty-one decision records I wrote were later reversed, and both ' +
			'reversals were fast precisely because the original reasoning was in ' +
			'front of us instead of being reconstructed from memory.',
		changed:
			'A decision is not made until it is written down with what it cost — which is also the structure every case study on this site follows.',
	},
	{
		id: 'site-as-argument',
		year: 2026,
		title: 'Building this site as the argument, not the brochure',
		story:
			'A portfolio for an engineer should be evidence rather than assertion, so ' +
			'this one is built as a product: a token layer, a typed content model, ' +
			'per-route byte budgets, accessibility and Lighthouse gates that block ' +
			'merges, and a backlog that records what is not done. The most useful ' +
			'thing it produced was a measurement that contradicted three milestones ' +
			'of my own documentation — a 9.4 KB cost I had attributed to React’s ' +
			'runtime turned out to be one import of a class-merging utility.',
		changed:
			'The site now gates its own claims. Nothing ships to it that its own CI cannot verify.',
	},
]
