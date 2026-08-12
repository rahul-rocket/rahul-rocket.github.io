import type { Service } from '@/lib/content/records'

/**
 * `/services` — how an engagement is shaped.
 *
 * NOT IN THE ORIGINAL INFORMATION ARCHITECTURE, AND ADDED DELIBERATELY.
 * docs/WEBSITE_STRUCTURE.md §1's route-count discipline says a route exists
 * only when it has enough content to justify a page a reader would not regret
 * opening. This one earns it by answering a question no other page answers:
 * `/contact` says how to reach me and `/about` says how I work, but neither
 * says what a piece of work with me actually looks like or when it is the wrong
 * fit. §1 and §4 were updated in the same change that added this file.
 *
 * NO RATES, NO AVAILABILITY CLAIMS, AND NO CLIENT LIST. Pricing belongs in a
 * conversation about scope, a stale availability line is worse than none (that
 * is `/now`'s job, where the date makes it honest), and PERSONAL_BRAND.md §3's
 * attribution rule means no client is named here without permission on record.
 *
 * `bestFor` names the fit. It reads as a qualifier and it is: telling a reader
 * this is the wrong engagement for them is the cheapest credibility on the page
 * and saves both of us a call.
 */
export const services: Service[] = [
	{
		id: 'architecture-review',
		title: 'Architecture review',
		summary:
			'A structured read of an existing system and the decisions inside it, ' +
			'ending in a written document you can act on without me. Two to three ' +
			'weeks, mostly reading code, tracing a request end to end, and talking ' +
			'to the people who are on call for it.',
		deliverables: [
			'A decision record per significant finding: what the system does now, what it costs, and the options with their trade-offs named.',
			'A prioritised list separating "this will hurt in six months" from "this is untidy and fine".',
			'A sequenced migration path for the top two findings, with the measurement that tells you it worked.',
			'A walkthrough session with the team, because a document nobody was in the room for is a document nobody owns.',
		],
		bestFor:
			'A system with real users where the team already suspects where the problem is and needs an outside read that is allowed to say so.',
	},
	{
		id: 'delivery',
		title: 'Delivery — full stack, front to back',
		summary:
			'Building and shipping the thing, including the unglamorous parts: ' +
			'schema and migrations, the API, the interface, the tests, the CI, and ' +
			'the runbook. I work inside your process and your repository rather ' +
			'than delivering over a wall.',
		deliverables: [
			'Working software in your repository, in small reviewed increments, deployed on your pipeline rather than a parallel one.',
			'Tests at the level the risk actually sits, and a CI gate that has been observed failing before it is trusted.',
			'Migrations designed as their own deploy, with a rollback exercised before it is needed.',
			'Documentation of the decisions, not just the code — so the work survives my leaving.',
		],
		bestFor:
			'A team that needs a senior pair of hands on a whole vertical slice, not a specialist on one layer of it.',
	},
	{
		id: 'migration',
		title: 'Incremental migration',
		summary:
			'Moving a system that already has users off something it has outgrown — ' +
			'a framework past end of life, a monolith at the wrong boundary, a ' +
			'datastore chosen for a different shape of problem — without a feature ' +
			'freeze and without a big-bang release.',
		deliverables: [
			'A cutover design with both paths live and a switch that can be flipped per route, per tenant, or per percentage.',
			'The seam itself: the adapter, the dual-write, or the projection that lets old and new coexist.',
			'A measurement plan that says what "done" looks like and what would make us stop.',
			'An explicit statement of the interim cost — the duplication, the extra pipeline, the period of two ways to do one thing.',
		],
		bestFor:
			'A product that cannot stop shipping for a quarter, which is most products. If a rewrite is genuinely viable, take it — it is cheaper.',
	},
	{
		id: 'performance-accessibility',
		title: 'Performance and accessibility remediation',
		summary:
			'Taking a web application from "we know it is bad" to a measured, ' +
			'gated position — Core Web Vitals, WCAG 2.2 AA, keyboard operability — ' +
			'and leaving behind the CI that stops it regressing the week after I go.',
		deliverables: [
			'A measured baseline on real conditions and real devices, not on a developer laptop over office wifi.',
			'The fixes, in order of measured impact, with the number before and after each one.',
			'Merge gates in CI — budgets, axe, Lighthouse — each observed failing on a deliberately bad change before it is trusted.',
			'A manual accessibility audit, because automated tools find roughly a third of real issues and the report should say so.',
		],
		bestFor:
			'A product with an accessibility obligation or a conversion problem, where the goal is a number that stays fixed rather than one that is hit once.',
	},
]
