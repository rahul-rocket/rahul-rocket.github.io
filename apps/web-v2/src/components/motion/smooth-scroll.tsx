'use client'

import { useEffect } from 'react'
import {
	useFinePointer,
	useReducedMotion,
} from '@/lib/hooks/use-reduced-motion'

/**
 * L-08 — the Lenis smooth-scroll layer.
 *
 * Renders nothing. It exists to own one side effect and its teardown.
 *
 * THE THREE HARD RULES (docs/ANIMATION_GUIDELINES.md §5). Violating any one of
 * them removes Lenis from the project rather than earning it an exception, so
 * each is implemented as a gate rather than a setting:
 *
 *   1. Disabled under `prefers-reduced-motion`. Smooth scrolling is a documented
 *      vestibular trigger, which is why it is a gate on *constructing* the
 *      instance and not a shorter duration.
 *   2. Disabled on touch. Native iOS/Android scrolling is better than any
 *      emulation of it, and Lenis interferes with overscroll and with the
 *      address-bar collapse. The gate is `pointer: fine`, never a viewport
 *      width — a touchscreen laptop is a fine-pointer device that also has a
 *      wide viewport, and a narrow desktop window is not a phone.
 *   3. Must not break find-in-page, keyboard scrolling, scrollbar dragging, or
 *      `scroll-margin-top` on anchor targets. This is the rule that constrains
 *      the configuration below, and it is the reason for the CSS note.
 *
 * WHY BOTH GATES ARE LIVE RATHER THAN READ ONCE.
 *
 * `useReducedMotion` and `useFinePointer` are `matchMedia` subscriptions, so a
 * reader who turns reduced motion on mid-session re-runs this effect and the
 * cleanup destroys the instance. That reader is precisely the one who cannot be
 * asked to reload the page to be taken seriously.
 *
 * WHY THE IMPORT IS DYNAMIC.
 *
 * Measured: the Lenis chunk is 5.34 KB gz, and Home has 1.92 KB of headroom
 * against the 120 KB hard limit. A static import would not fit — and would put
 * those bytes on every route, for every reader, including the touch and
 * reduced-motion readers who are gated out of ever using them.
 * docs/redesign/PERFORMANCE_PLAN.md §2 lists Lenis as excluded from the initial
 * payload for exactly this reason.
 *
 * Importing inside the effect, after the gates, means the chunk is requested only
 * by a reader who will actually get smoothing — and never during the critical
 * path, because effects run after paint. Mounting this component costs Home
 * 0.29 KB gz (117.79 → 118.08), which is this file, not the library.
 *
 * `size-limit` cannot verify any of that: it measures what the HTML references,
 * and a lazy chunk is referenced by nothing. So `e2e/smooth-scroll.spec.ts`
 * asserts it directly — a script request after load on a fine pointer, and none
 * at all on touch.
 *
 * WHY IT IS NOT A PROVIDER DESPITE THE NAME IN ARCHITECTURE.md §5.
 *
 * Nothing needs to read the instance yet. A context would put a client boundary
 * around the tree for a value with no consumers, and CLAUDE.md §5 names exactly
 * that as the most likely performance regression here. When something needs
 * programmatic `scrollTo`, the context arrives with its first consumer.
 */
export function SmoothScroll() {
	const prefersReducedMotion = useReducedMotion()
	const hasFinePointer = useFinePointer()

	// Rules 1 and 2. Both hooks report `false` during the server render and on the
	// first client render (see use-media-query.ts), so the enhancement switches on
	// after hydration rather than being promised by the static HTML.
	const enabled = hasFinePointer && !prefersReducedMotion

	useEffect(() => {
		if (!enabled) return

		// The effect can be cleaned up before this resolves — a reader who toggles
		// reduced motion during the fetch, or who navigates away. Without the flag
		// the instance would be constructed after teardown and never destroyed,
		// leaving an orphaned rAF loop driving the scroll position of a page that
		// no longer wants one.
		let cancelled = false
		let lenis: { destroy: () => void } | undefined

		import('lenis').then(({ default: Lenis }) => {
			if (cancelled) return

			lenis = new Lenis({
				// Rule 3, the whole of it. Lenis is a *velocity smoothing* layer over
				// the real scroll position: it calls `window.scrollTo` every frame
				// rather than transforming a wrapper element. That distinction is what
				// keeps find-in-page, the native scrollbar, and `scroll-margin-top`
				// working, because the document's scroll position is genuinely where
				// the browser thinks it is. Setting `wrapper`/`content` to a custom
				// element would opt into the transform-based mode and break all three.
				// The defaults are correct; they are not restated here, because a
				// restated default is a value somebody will later "tune".
				smoothWheel: true,

				// Keyboard scrolling (Space, PageDown, Home, End) and anchor jumps are
				// left entirely to the browser. `anchors` defaults to false and stays
				// false: Lenis's anchor handling re-implements the jump with its own
				// easing, which ignores `scroll-margin-top` — and the skip link's
				// `scroll-mt-header` is the one anchor on the site that is a P0
				// accessibility feature rather than a convenience.
				syncTouch: false,

				// Nested scrollable regions — code blocks, the overflow containers in
				// MDX — scroll natively instead of bubbling into the smoothed page.
				allowNestedScroll: true,

				// Lenis drives its own requestAnimationFrame loop. A hand-rolled loop
				// here would be the same code with one more place to leak it.
				autoRaf: true,
			})
		})

		return () => {
			cancelled = true
			lenis?.destroy()
		}
	}, [enabled])

	return null
}
