/**
 * The reveal policy, as pure functions.
 *
 * Extracted from the hook so it can be unit-tested in Node. The DOM parts of a
 * reveal (an observer, a class toggle) are trivial and hard to test; the
 * *decisions* are neither, and they are where the accessibility and
 * layout-stability guarantees actually live.
 */

/**
 * The fraction of the viewport an element must reach before it reveals.
 *
 * 15% into the viewport, per docs/ANIMATION_GUIDELINES.md §5 — so an element is
 * armed only if it starts below 85% of the viewport height. Not 50%: on a tall
 * viewport, a 50% threshold means content that has already been scrolled past
 * still has not appeared, which reads as a broken page rather than a subtle one.
 */
export const REVEAL_LINE = 0.85

/**
 * Should this element animate in, or should it simply be visible?
 *
 * The answer is "animate" only when the element starts BELOW the reveal line —
 * i.e. off-screen at load. Two rules meet here and both point the same way:
 *
 *   1. docs/ANIMATION_GUIDELINES.md §10 blocks "entrance animations on body
 *      copy while it is being read". Content above the fold is being read.
 *   2. Arming an already-visible element produces a visible flash. The server
 *      HTML has no `opacity: 0` (that is the no-JS guarantee), so the element
 *      paints, then hydration hides it, then it animates back — visible → hidden
 *      → visible. Deciding at mount time removes the failure rather than
 *      papering over it with a transition.
 *
 * The consequence is worth stating plainly: on a fresh load, everything above
 * the fold is simply present, and everything below animates as the reader
 * arrives at it. That is the behaviour you want, and it falls out of the rules
 * rather than being special-cased.
 */
export function shouldArm(elementTop: number, viewportHeight: number): boolean {
	return elementTop > viewportHeight * REVEAL_LINE
}

/** Stagger step in milliseconds — docs/ANIMATION_GUIDELINES.md §3, item 1. */
export const STAGGER_STEP_MS = 60

/**
 * Total run time of a staggered group.
 *
 * Capped because law 2 puts entrances at ≤ 400ms and a stagger is one entrance,
 * not N of them: eight children at 60ms each would run for 480ms of delay
 * before the last child even starts. Past the cap the step compresses so the
 * group still finishes on time.
 */
export function staggerDelayMs(
	index: number,
	count: number,
	budgetMs = 300,
): number {
	if (index <= 0 || count <= 1) return 0
	const naive = index * STAGGER_STEP_MS
	const lastNaive = (count - 1) * STAGGER_STEP_MS
	if (lastNaive <= budgetMs) return naive
	return Math.round((index / (count - 1)) * budgetMs)
}
