import { type HomeAction, heroActionCandidates } from '@/config/home'
import { builtRoutes } from '@/config/nav'

/**
 * H-01, extended at H-07 — turning a section's candidate actions into the ones
 * that exist.
 *
 * The rule is one line of logic; it lives in its own module because it is the
 * only part of a Home section that can be wrong in a way rendering does not
 * reveal. A hero that shows two buttons looks correct whether or not the gating
 * works, so the gate is tested directly against manifests that do not exist yet.
 *
 * Named `actions.ts` rather than `hero-actions.ts` since H-07. Three sections
 * now resolve destinations by this same rule — the hero, the contact CTA, and
 * the current-focus items — and the alternative to generalising was three
 * copies of a filter whose failure mode is silence. Duplication is usually
 * cheaper than the wrong abstraction (CLAUDE.md §5); this is one rule with
 * three call sites rather than one abstraction over three rules, and what it
 * expresses — the route manifest's `built` flag — has nothing to do with heroes.
 */

/**
 * WEBSITE_STRUCTURE §4.1 — "two actions". A hard cap, not a default.
 *
 * The section is the 30-second impression, and a row of four equally weighted
 * buttons is how a hero stops making a recommendation. Two is also what the
 * primary/secondary pair below can express: a third would need a third visual
 * weight the button set deliberately does not have.
 */
export const HERO_ACTION_LIMIT = 2

/**
 * The CTA's cap. Also two, for the same reason — but it resolves to one today,
 * because `contactActionCandidates` is deliberately a shorter list. A closing
 * call to action exists to make one next step obvious; padding it back out to
 * two with whatever route happens to be built would recommend nothing.
 */
export const CTA_ACTION_LIMIT = 2

/** The paths the export actually contains, as a set, resolved per call. */
function defaultBuiltPaths(): ReadonlySet<string> {
	return new Set(builtRoutes.map((route) => route.path))
}

/**
 * Does this action's destination exist today?
 *
 * `link` actions are never gated: nothing in the route manifest describes an
 * external destination, and an external URL cannot be checked at build time
 * anyway — `check-links.mjs` deliberately skips them (F0-16's note: a merge
 * gate that fails because a third-party site is briefly down blocks a merge for
 * a reason unrelated to the change).
 */
export function isActionAvailable(
	action: HomeAction,
	builtPaths: ReadonlySet<string> = defaultBuiltPaths(),
): boolean {
	return action.kind === 'link' || builtPaths.has(action.route)
}

/**
 * The first `limit` candidates whose destination exists today.
 *
 * Both the candidate list and the manifest are injected rather than read from
 * module scope so the gate can be exercised against future manifests — the
 * interesting cases are the ones this repository will only reach in Phase 7 and
 * Phase 9, and a function that closes over `builtRoutes` can only ever be
 * tested against today.
 */
export function resolveActions(
	candidates: readonly HomeAction[],
	limit: number,
	builtPaths: ReadonlySet<string> = defaultBuiltPaths(),
): HomeAction[] {
	return candidates
		.filter((action) => isActionAvailable(action, builtPaths))
		.slice(0, limit)
}

/** The hero's two, from the hero's candidate list. */
export function resolveHeroActions(
	candidates: readonly HomeAction[] = heroActionCandidates,
	builtPaths: ReadonlySet<string> = defaultBuiltPaths(),
): HomeAction[] {
	return resolveActions(candidates, HERO_ACTION_LIMIT, builtPaths)
}

/** Where an action points. One place, so the two kinds cannot diverge. */
export function actionHref(action: HomeAction): string {
	return action.kind === 'link' ? action.href : action.route
}

/**
 * The attributes an action's `<a>` needs beyond `href`.
 *
 * `rel="me"` on an external destination is what lets the linked profile verify
 * this site back; the footer's GitHub link carries it for the same reason. It
 * lives here rather than at each call site because "an external action carries
 * rel=me" is a property of the action kind, and three sections spelling it out
 * is three places for it to go missing.
 *
 * No `target="_blank"`, matching the footer and the hero: taking the choice
 * away from the reader is not a courtesy.
 */
export function actionLinkProps(action: HomeAction): { rel?: string } {
	return action.kind === 'link' ? { rel: 'me' } : {}
}
