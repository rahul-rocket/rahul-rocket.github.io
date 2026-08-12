'use client'

import { useEffect, useRef } from 'react'
import { REVEAL_LINE, shouldArm } from '../reveal-policy'

/**
 * Scroll reveal — one shared IntersectionObserver, no dependency, ~0.5 KB.
 *
 * WHY THIS IS NOT MOTION'S `whileInView`.
 *
 * Scroll reveal is the most-used animation on the site by an order of
 * magnitude: it appears in every section of every route. Built on `whileInView`
 * it makes Motion a dependency of every page (~16 KB gz for the domAnimation
 * feature set, plus the LazyMotion shell) and pushes a `'use client'` boundary
 * high into the tree. Home has roughly 15 KB of JS headroom in total before CI
 * blocks the merge (docs/redesign/PERFORMANCE_PLAN.md §1), so that single
 * choice is most of the budget.
 *
 * Built as an observer plus a CSS class it costs 0.5 KB, needs no provider, and
 * — because the animation itself lives entirely in CSS — it CANNOT leave
 * content at `opacity: 0` when JavaScript fails. The served HTML carries no
 * hidden state at all; the arming attribute is added after hydration, and only
 * to elements that are off-screen. Reduced motion, disabled JS, a hydration
 * error, an observer that never fires: every one of those failure modes lands
 * on "the content is visible".
 *
 * One observer is shared by every element on the page rather than one per
 * component, so the callback cost is bounded no matter how many sections
 * register.
 */

let observer: IntersectionObserver | null = null
const registered = new WeakSet<Element>()

function getObserver(): IntersectionObserver {
	if (observer) return observer
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue
				entry.target.setAttribute('data-revealed', 'true')
				// once: true — docs/ANIMATION_GUIDELINES.md §1 law 4. Re-animating on
				// every scroll-by is the single most common way a portfolio becomes
				// exhausting to read.
				observer?.unobserve(entry.target)
			}
		},
		{
			// The element is 15% into the viewport. Expressed as a negative bottom
			// margin so the observer, not a scroll handler, does the arithmetic.
			rootMargin: `0px 0px -${Math.round((1 - REVEAL_LINE) * 100)}% 0px`,
			threshold: 0,
		},
	)
	return observer
}

/**
 * Returns a ref to attach to the element that should reveal.
 *
 * The arming decision happens once, at mount, against the element's real
 * position — see `shouldArm` for why an already-visible element must never be
 * armed.
 */
export function useReveal<T extends HTMLElement>() {
	const ref = useRef<T>(null)

	useEffect(() => {
		const element = ref.current
		if (!element || registered.has(element)) return

		// Reduced motion is checked here, not in CSS alone, so that no observer is
		// created at all — a listener that runs and is then ignored still costs.
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
		if (reduced.matches) {
			element.setAttribute('data-revealed', 'true')
			return
		}

		if (!shouldArm(element.getBoundingClientRect().top, window.innerHeight)) {
			element.setAttribute('data-revealed', 'true')
			return
		}

		registered.add(element)
		element.setAttribute('data-reveal-armed', 'true')
		const active = getObserver()
		active.observe(element)

		return () => {
			active.unobserve(element)
		}
	}, [])

	return ref
}
