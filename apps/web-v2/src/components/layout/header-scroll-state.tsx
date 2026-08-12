'use client'

import { useEffect } from 'react'

/** The header reads this off itself; exported so the header and the observer agree. */
export const SCROLLED_ATTRIBUTE = 'data-scrolled'

/**
 * L-03 — the scroll half of the header's condensation.
 *
 * Renders one out-of-flow sentinel pixel at the top of the document and toggles
 * an attribute on the header when it leaves the viewport. Nothing else.
 *
 * WHY AN INTERSECTION OBSERVER AND NOT A SCROLL HANDLER.
 *
 * ANIMATION_GUIDELINES.md forbids React state driven by scroll, and the reason
 * is INP: a `scroll` listener that calls `setState` re-renders on every frame of
 * every scroll, on the main thread, for the entire life of the page. An
 * IntersectionObserver fires twice — once when the sentinel leaves, once when it
 * returns — off the main thread, and what it does is set one attribute. There is
 * no React state here at all, which is why this component returns a `<div>` and
 * never re-renders.
 *
 * WHY IT REACHES FOR THE HEADER BY ID.
 *
 * The alternative is to make the header itself a Client Component so it can hold
 * a ref. That would pull the entire shell — wordmark, nav list, footer-facing
 * markup — across the client boundary, which CLAUDE.md §5 names as the single
 * most likely performance regression in this codebase. One `getElementById`
 * against a constant is the cheaper trade, and the coupling is declared in both
 * directions: the header owns the id, this owns the attribute.
 *
 * WITHOUT JAVASCRIPT the attribute never appears and the header simply keeps its
 * unscrolled appearance. The header is opaque in both states, so content never
 * shows through it — the condensation is decoration, and decoration is allowed
 * to be the thing that does not arrive.
 */
export function HeaderScrollState({ headerId }: { headerId: string }) {
	useEffect(() => {
		const sentinel = document.getElementById(SENTINEL_ID)
		const header = document.getElementById(headerId)
		if (!sentinel || !header) return

		const observer = new IntersectionObserver(([entry]) => {
			// `entry` is possibly undefined under noUncheckedIndexedAccess, and a
			// callback with an empty entry list is not a state we can interpret —
			// leaving the attribute as it was is correct.
			if (!entry) return
			header.toggleAttribute(SCROLLED_ATTRIBUTE, !entry.isIntersecting)
		})

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [headerId])

	return (
		// Absolutely positioned so it contributes nothing to layout — a 1px element
		// in normal flow would push the whole document down by a pixel, which is a
		// layout shift on every page for a decorative feature. It needs a real
		// height: a zero-area box has no reliable intersection to report.
		<div
			id={SENTINEL_ID}
			aria-hidden="true"
			className="pointer-events-none absolute top-0 left-0 h-px w-px"
		/>
	)
}

const SENTINEL_ID = 'scroll-sentinel'
