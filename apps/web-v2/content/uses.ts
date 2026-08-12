import type { UsesGroup } from '@/lib/content/records'

/**
 * C-07 — `/uses`. docs/WEBSITE_STRUCTURE.md §4.10.
 *
 * WHY TYPESCRIPT AND NOT `content/uses.mdx`, WHICH CONTENT_STRATEGY §2 NAMES.
 * §4.10 specifies a definition-list layout and requires that every entry carry
 * one line on *why* — "the only part worth reading". As MDX that requirement is
 * a convention nobody can enforce; as records it is a schema field, and an
 * entry without it fails the build. The prose in this page is one clause per
 * item, which is exactly the case where records win. Recorded as a deliberate
 * divergence rather than an oversight.
 *
 * =========================================================================
 * DRAFTED. Hardware and software choices are personal facts; replace them
 * with the author's own before `site.indexable` is flipped. Everything here
 * is safe to be wrong in a way `experience.ts` is not — but a `/uses` page
 * that lists a machine its author does not own is still a false claim.
 * =========================================================================
 */
export const usesGroups: UsesGroup[] = [
	{
		title: 'Hardware',
		items: [
			{
				name: '14" laptop, 32 GB RAM',
				why: 'Thirty-two is the line where a database, a browser with a profiler open, and a language server stop competing.',
			},
			{
				name: 'Two 27" 4K displays, one rotated to portrait',
				why: 'The portrait one holds a diff or a log; reading 200 lines without scrolling changes how carefully I read them.',
			},
			{
				name: 'Mechanical keyboard, tactile switches',
				why: 'Not for the sound. Tactile means I stop bottoming out, which is the part my wrists notice after eight hours.',
			},
			{
				name: 'Wired ethernet',
				why: 'Every call and every deploy is more reliable, and diagnosing a flaky test over flaky wifi wastes an afternoon.',
			},
		],
	},
	{
		title: 'Editor and terminal',
		items: [
			{
				name: 'VS Code',
				why: 'For the TypeScript language server more than the editor; the refactors it gets right are the reason I stopped switching.',
			},
			{
				name: 'Neovim',
				why: 'For anything over SSH and anything under a hundred lines. Muscle memory that has survived four job changes.',
			},
			{
				name: 'Fish shell with a minimal prompt',
				why: 'Autosuggestion from history is the single largest terminal productivity gain I have made, and the prompt is not where I want colour.',
			},
			{
				name: 'tmux',
				why: 'A long-running session survives a dropped VPN, which is the whole argument.',
			},
			{
				name: 'ripgrep and fd',
				why: 'Fast enough that searching becomes a reflex rather than a decision, which changes how well I know an unfamiliar codebase.',
			},
		],
	},
	{
		title: 'Daily software',
		items: [
			{
				name: 'Obsidian',
				why: 'Plain Markdown in a folder I own. Every notes app I lost work in was one that owned the format.',
			},
			{
				name: 'Firefox and Chromium, side by side',
				why: 'Two engines catch layout and accessibility bugs that one engine calls correct.',
			},
			{
				name: 'Excalidraw',
				why: 'Diagrams that look provisional get argued with; diagrams that look finished get approved. That is usually the wrong way round.',
			},
			{
				name: 'Raycast-style launcher',
				why: 'Everything reachable in two keystrokes — which is also why this site has a command palette.',
			},
		],
	},
	{
		title: 'Services',
		items: [
			{
				name: 'GitHub',
				why: 'Code, CI, and this site’s hosting. One fewer moving part than a separate runner and a separate host.',
				url: 'https://github.com',
			},
			{
				name: 'Fastmail',
				why: 'Paying for email means the product is email rather than me.',
			},
			{
				name: '1Password',
				why: 'Shared vaults are the only credential handover process I have seen teams actually follow.',
			},
			{
				name: 'Cloudflare',
				why: 'DNS I can reason about, and a free tier that is honest about what it is.',
			},
		],
	},
	{
		title: 'This site',
		items: [
			{
				name: 'Next.js 15, static export',
				why: 'No server means no runtime to secure, patch, or pay for — and it forces every feature to be enumerable at build time.',
			},
			{
				name: 'Tailwind v4 over a token layer',
				why: 'Utilities never carry raw values; a hex code in a component fails review, so the design system cannot be bypassed quietly.',
			},
			{
				name: 'Biome',
				why: 'One binary for formatting and linting, and fast enough to run on every save without noticing.',
			},
			{
				name: 'Playwright and Vitest',
				why: 'End-to-end against the real export, units for the logic that can be silently wrong. Neither runs against a dev server.',
			},
		],
	},
]
