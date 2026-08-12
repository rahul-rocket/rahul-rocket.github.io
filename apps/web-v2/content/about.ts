import type { Fact, Principle } from '@/lib/content/records'

/**
 * A-08 — the `/about` content. docs/WEBSITE_STRUCTURE.md §4.2.
 *
 * WHY TYPESCRIPT AND NOT MDX. CONTENT_STRATEGY §2's rule of thumb is "prose is
 * MDX, records are TypeScript", and the narrative below is prose. It is here
 * anyway because it contains no markup, no components, and no headings — it is
 * four paragraphs consumed as an array by one page. MDX would add a compile
 * step, a component map, and a second way to author copy, in exchange for
 * nothing this page uses. The rule is about *long* prose with components in it,
 * which is the blog and the case studies; both of those are MDX and stay MDX.
 *
 * =========================================================================
 * DRAFTED, AND AWAITING THE AUTHOR'S OWN WORDS. Same standing as
 * `experience.ts` — see the note there, and `site.indexable` in
 * `src/config/site.ts`. The voice is the one PERSONAL_BRAND.md §3 specifies:
 * first person, concrete, no superlatives about self, and owning the
 * trade-off. Replacing the text is a content edit; nothing reads its shape.
 * =========================================================================
 */

/** The intro. First person, and it leads with the point (§6, no throat-clearing). */
export const aboutNarrative: string[] = [
	'I build production systems end to end and I am accountable for the ' +
		'decisions inside them. That is two jobs — delivery and judgment — and ' +
		'most of my last decade has been spent finding out that they are the same ' +
		'job seen from different distances. An architecture you cannot ship is a ' +
		'diagram, and a feature shipped past a boundary you did not think about ' +
		'is a bill that arrives later with interest.',

	'The work I am best at is the unglamorous middle: taking a system that ' +
		'already has users, already has revenue, and already has three years of ' +
		'decisions baked into it, and moving it somewhere better without stopping ' +
		'it. Greenfield is fun and rare. Most engineering is renovation with the ' +
		'building occupied, and the skills it needs — incremental cutovers, ' +
		'measurement before change, boundaries chosen for who has to deploy — are ' +
		'the ones I have deliberately gone looking for.',

	'I write things down. Decision records, runbooks, the reason a strange line ' +
		'is strange. This is not diligence for its own sake: a decision nobody ' +
		'recorded gets re-argued every six months by people reconstructing it from ' +
		'memory, and the reconstruction is always more confident and less accurate ' +
		'than the original. The same instinct is why every case study on this site ' +
		'names what the choice cost, and why this site publishes a backlog of what ' +
		'it has not done.',

	'Outside the work I read more history than technology, which I recommend ' +
		'to anyone who designs systems for a living — it is a long argument ' +
		'against believing that this time the constraints are different.',
]

/**
 * §4.2's "how I work". Each principle carries a concrete example, and the
 * schema requires the body: a principle without one is a slogan, and a page of
 * slogans is the thing this page exists to not be.
 */
export const principles: Principle[] = [
	{
		title: 'Measure before you change, and after',
		body:
			'On an order-search path that everyone agreed was slow, the obvious fix ' +
			'was indexes. I added them and p95 went from 2.4s to 1.6s — a real ' +
			'improvement, and nowhere near the target. The profile said the ' +
			'remaining time was in assembling the response across four joins, so the ' +
			'read path moved onto a projection and landed at 380ms. Without the ' +
			'first measurement I would have shipped the indexes and called it done; ' +
			'without the second I would not have known the projection was the part ' +
			'that mattered.',
	},
	{
		title: 'Choose boundaries by who has to deploy',
		body:
			'The most useful question about a service boundary is not "is this a ' +
			'coherent domain" but "which people are blocked on each other today". ' +
			'When I split a fulfilment monolith, I split it at inventory and ' +
			'deliberately left the rest intact, because inventory was the one place ' +
			'four teams queued behind each other. Splitting the parts that were ' +
			'merely untidy would have bought elegance and cost every one of those ' +
			'teams a network hop.',
	},
	{
		title: 'Both paths live, then a measured switch',
		body:
			'I do not propose rewrites any more. A 300k-line AngularJS migration ' +
			'ran for eight months with both shells live behind a route-level switch, ' +
			'moving routes across one at a time. It was less elegant than a rewrite ' +
			'and it was the only version that could finish, because it never had to ' +
			'ask permission to pause the roadmap. The cost was real: two ' +
			'build pipelines and a period where some shared components existed ' +
			'twice.',
	},
	{
		title: 'Write down what it cost',
		body:
			'Every architecture decision record I write has a section that names ' +
			'what the choice gave up, and it is the section that earns the document. ' +
			'Of forty-one on my last platform, two decisions were later reversed — ' +
			'and both reversals were quick, because the original trade-off was on ' +
			'the page instead of being reconstructed by whoever remembered it most ' +
			'confidently.',
	},
	{
		title: 'Accessibility and performance are correctness, not polish',
		body:
			'They are the two qualities most often deferred and least often ' +
			'retrofitted. On this site both are merge gates: a Lighthouse ' +
			'regression, an axe violation, or a route going over its byte budget ' +
			'fails CI, and all three have been observed failing rather than assumed ' +
			'to work. Treating them as gates rather than as goals is the difference ' +
			'between a number you hit once and a number that stays hit.',
	},
]

/** The sticky rail on ≥ 1280px. Short, factual, and scannable in one pass. */
export const quickFacts: Fact[] = [
	{ label: 'Based in', value: 'India' },
	{ label: 'Timezone', value: 'IST (UTC+5:30)' },
	{ label: 'Working', value: 'Remote, with overlap into CET and ET mornings' },
	{ label: 'Focus', value: 'Distributed systems, platform architecture, web' },
	{ label: 'Languages', value: 'English, Hindi, Marathi' },
	{ label: 'Availability', value: 'Open to conversations' },
]

/** What I'm learning — §4.2. Present tense, and dated by being specific. */
export const learning: string[] = [
	'Rust, seriously enough to write the build tooling I currently write in Node.',
	'The formal side of distributed systems — consensus, linearisability, and what those words cost in practice.',
	'Enough Postgres internals to stop treating the query planner as weather.',
]
