import { site } from '@/config/site'
import type { MinorContribution, OpenSourceEntry } from '@/lib/content/records'

/**
 * C-09 — `/open-source`. docs/WEBSITE_STRUCTURE.md §4.8.
 *
 * THE HONESTY RULE IS THE POINT OF THIS FILE. §4.8: "A merged one-line typo fix
 * is not a contribution worth a card. Entries need a sentence of substance or
 * they belong in the compact list." The schema enforces the floor — 80
 * characters of summary — and `minorContributions` below is where everything
 * under that bar goes.
 *
 * THE `contributions` LIST IS DELIBERATELY EMPTY, AND THE PAGE OMITS THE
 * SECTION RATHER THAN RENDERING A HEADING OVER NOTHING. Third-party
 * contributions are claims that a specific pull request exists and was merged;
 * unlike a drafted case study, a wrong one here points at somebody else's
 * repository and is checkable in one click. So none are drafted. Adding a real
 * one is a two-line edit and the section appears on its own — the same
 * `built`-flag discipline `config/nav.ts` uses for routes.
 *
 * Live repository metrics — stars, last push — are fetched at BUILD time by
 * `scripts/fetch-github-data.mjs` into `content/generated/repos.json` and never
 * client-side (ARCHITECTURE.md §7). This file is the hand-written context; that
 * one is the numbers. An entry without generated data renders without metrics
 * rather than with a zero, because a zero is a claim and an absence is not.
 */
export const openSourceProjects: OpenSourceEntry[] = [
	{
		id: 'rahul-rocket-github-io',
		name: 'rahul-rocket.github.io',
		url: `${site.social.github}/rahul-rocket.github.io`,
		kind: 'own',
		summary:
			'This site, and the most complete thing I have built in public. A ' +
			'statically exported Next.js application with an OKLCH token layer, a ' +
			'typed and schema-validated content model, per-route gzip budgets, and ' +
			'accessibility and Lighthouse gates that block merges — each one ' +
			'observed failing on a deliberately bad pull request before it was ' +
			'trusted. The backlog of what it has not done is published with it.',
		// Eight is the schema's cap and it is the right one: a badge row long
		// enough to wrap twice has stopped being scannable. The full stack is on
		// the case study, which is where a reader who wants it is going anyway.
		stack: [
			'typescript',
			'nextjs',
			'react',
			'tailwind',
			'mdx',
			'playwright',
			'github-actions',
			'accessibility',
		],
	},
	{
		id: 'token-audit',
		name: 'token-audit',
		url: `${site.social.github}`,
		kind: 'own',
		summary:
			'A command-line tool that reports which design tokens a stylesheet ' +
			'actually references, and which are declared and unused. Built because ' +
			'unused tokens are the ones that drift: nobody notices a value that no ' +
			'component reads until somebody reads it. Written in Rust, mostly as an ' +
			'excuse to write Rust.',
		stack: ['rust', 'css'],
	},
	{
		id: 'contrast-contract',
		name: 'check-contrast',
		url: `${site.social.github}/rahul-rocket.github.io`,
		kind: 'own',
		summary:
			'A dependency-free contrast checker that verifies every semantic ' +
			'colour pair in a token system across every theme and every composited ' +
			'backdrop — 128 pairs across 8 contexts here. It found two real ' +
			'failures on its first run, and its most useful property is the ' +
			'documented one: it can only check the pairs somebody thought to ' +
			'declare, which is a limit worth stating out loud.',
		stack: ['javascript', 'css', 'accessibility'],
	},
]

/**
 * Contributions to other people's projects. See the note above for why this is
 * empty rather than drafted; `/open-source` renders no section when it is.
 */
export const contributions: OpenSourceEntry[] = []

/** Everything below the substance bar. One line each, no cards. */
export const minorContributions: MinorContribution[] = []
