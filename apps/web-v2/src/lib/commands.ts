import { builtRoutes } from '@/config/nav'
import { site } from '@/config/site'

/**
 * L-13 — the command palette's data model and its matching, with no React in
 * sight.
 *
 * WHY THE MATCHING LIVES HERE RATHER THAN IN THE COMPONENT.
 *
 * Ranking is the only part of a command palette that can be *silently* wrong.
 * A broken dialog is obvious the first time anyone presses ⌘K; a ranker that
 * puts "Uses" above "Blog" for the query "b" looks like it is working. That is
 * the failure docs/TESTING.md §1 calls silent, so it is a pure function with
 * unit tests beside it (`commands.test.ts`) rather than behaviour reachable only
 * through a browser.
 *
 * It also keeps the client bundle honest: this module is imported by a
 * `'use client'` component, so every byte here ships. There is nothing in it but
 * data and two string functions.
 */

/** Rendered in this order. A group with no matches is not rendered at all. */
export const COMMAND_GROUPS = ['Navigation', 'Writing', 'Actions'] as const

export type CommandGroup = (typeof COMMAND_GROUPS)[number]

/**
 * The actions the palette can perform in place. Deliberately a closed union
 * rather than a callback on the command: commands are built in a Server
 * Component and handed to a client one, and a function cannot cross that
 * boundary. The client switches on this string.
 */
export type CommandAction = 'toggle-theme'

interface CommandBase {
	/** Stable across renders; used as the React key and the DOM id. */
	id: string
	label: string
	group: CommandGroup
	/** Secondary line. Also searched, so "static export" finds a post by its description. */
	hint?: string
}

/**
 * LINKS AND ACTIONS ARE DIFFERENT TYPES BECAUSE THEY ARE DIFFERENT ELEMENTS.
 *
 * CLAUDE.md §7: links navigate, buttons act. A palette that renders every row as
 * a `<div role="option">` with a click handler loses middle-click, ⌘-click,
 * "copy link address", and the browser's own "this is a link" announcement — for
 * rows that are, in fact, links. Modelling the distinction in the type means the
 * component cannot render the wrong element for a row: there is no branch where
 * a `LinkCommand` becomes a `<button>`.
 */
export interface LinkCommand extends CommandBase {
	kind: 'link'
	href: string
	/** Leaves the site — the component adds the affordance and `rel`. */
	external?: boolean
}

export interface ActionCommand extends CommandBase {
	kind: 'action'
	action: CommandAction
}

export type Command = LinkCommand | ActionCommand

/**
 * Everything the palette can reach, assembled at build time.
 *
 * `posts` is a parameter rather than a `getPosts()` call because the content
 * loaders use `node:fs` and this module is pulled into the client bundle. The
 * import would not merely be wasteful — it would not build.
 *
 * ROUTES COME FROM `builtRoutes`, NOT `staticRoutes`, and that is the same rule
 * the header and footer follow (config/nav.ts): the palette may only offer
 * routes that exist in the export. Offering the other nine would put nine 404s
 * behind a search box, and on GitHub Pages a 404 is terminal.
 */
export function buildCommands(
	posts: readonly { href: string; title: string; description?: string }[],
): Command[] {
	return [
		...builtRoutes.map(
			(route): LinkCommand => ({
				kind: 'link',
				id: `nav:${route.path}`,
				label: route.label,
				group: 'Navigation',
				hint: route.path,
				href: route.path,
			}),
		),
		...posts.map(
			(post): LinkCommand => ({
				kind: 'link',
				id: `post:${post.href}`,
				label: post.title,
				group: 'Writing',
				hint: post.description,
				href: post.href,
			}),
		),
		{
			kind: 'action',
			id: 'action:theme',
			label: 'Toggle theme',
			group: 'Actions',
			hint: 'Switch between light and dark',
			action: 'toggle-theme',
		},
		{
			kind: 'link',
			id: 'action:source',
			label: 'View source',
			group: 'Actions',
			hint: 'This site on GitHub',
			href: site.social.github,
			external: true,
		},
	]
}

/**
 * Ranked, filtered commands. Empty query returns everything in authored order.
 *
 * THE FIVE TIERS, AND WHY SUBSEQUENCE MATCHING IS LAST.
 *
 * Pure subsequence matching — the "fuzzy" people usually mean — matches far too
 * much on a short query: with one corpus-wide rank, "ab" matches "About" and
 * "Validating content at the build boundary" equally, and the second one wins on
 * alphabetical luck. Tiering fixes it without a scoring heuristic nobody can
 * predict: anything that matches the *label* by substring outranks everything
 * that only matches fuzzily, and a label that *starts* with the query outranks
 * the rest of those. Fuzzy matching still catches "sec" → "Static Export
 * Content…", it just cannot outrank a literal hit.
 *
 * Ties keep authored order, which is why the sort must be stable — it is, in
 * every engine in the support matrix (ES2019 requires it).
 */
export function filterCommands(
	commands: readonly Command[],
	query: string,
): Command[] {
	const needle = query.trim().toLowerCase()
	if (!needle) return [...commands]

	const ranked: { command: Command; tier: number }[] = []

	for (const command of commands) {
		const label = command.label.toLowerCase()
		const haystack = `${label} ${command.hint?.toLowerCase() ?? ''}`

		const tier = label.startsWith(needle)
			? 0
			: label.includes(needle)
				? 1
				: haystack.includes(needle)
					? 2
					: isSubsequence(label, needle)
						? 3
						: isSubsequence(haystack, needle)
							? 4
							: -1

		if (tier >= 0) ranked.push({ command, tier })
	}

	return ranked.sort((a, b) => a.tier - b.tier).map((entry) => entry.command)
}

/** Groups in `COMMAND_GROUPS` order, empty groups dropped. Both are rendering rules. */
export function groupCommands(
	commands: readonly Command[],
): { group: CommandGroup; commands: Command[] }[] {
	return COMMAND_GROUPS.map((group) => ({
		group,
		commands: commands.filter((command) => command.group === group),
	})).filter((entry) => entry.commands.length > 0)
}

/**
 * Are `needle`'s characters present in `haystack`, in order but not necessarily
 * adjacent? Both are expected pre-lowercased — casing is the caller's job so
 * this is not re-lowercasing the same label once per keystroke.
 */
function isSubsequence(haystack: string, needle: string): boolean {
	let index = 0
	for (const character of haystack) {
		if (character === needle[index]) index++
		if (index === needle.length) return true
	}
	return index === needle.length
}
