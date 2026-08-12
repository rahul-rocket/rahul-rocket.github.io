'use client'

import { useEffect, useRef } from 'react'
import { usePointerField } from '@/lib/hooks/use-pointer-field'
import {
	useFinePointer,
	useReducedMotion,
} from '@/lib/hooks/use-reduced-motion'

/**
 * The one place the pointer field reaches the DOM.
 *
 * `usePointerField` and `.u-spotlight` were both written, documented and
 * shipped, and NOTHING CALLED EITHER OF THEM. The hook's own docstring names
 * three subscribers — magnetic buttons, the spotlight glow, the parallax
 * backdrop — and the repository had zero. Two complete halves of an effect with
 * no wire between them is the most expensive kind of dead code, because it
 * reads as finished in review. This is the wire.
 *
 * ONE COMPONENT, MOUNTED ONCE, FOR EVERY EFFECT ON EVERY ROUTE. The obvious
 * alternative is a client wrapper per card, which is what most implementations
 * do; on a nine-card grid that is nine components, nine refs and nine
 * subscribers to move one pointer. Here the subscriber does a single
 * `elementFromPoint` and one `closest()` per frame — O(1) in the number of
 * decorated elements — and the elements themselves stay Server Components with
 * a data attribute on them. `Card`, `Button` and the panels below never become
 * client code to be decorated.
 *
 * IT RENDERS NOTHING. There is no element, no wrapper, and therefore no way for
 * it to affect layout, the accessibility tree, or the no-JS render. Everything
 * it does is write custom properties that already have working fallbacks:
 * `--mx`/`--my` default to `50%` (a centred, invisible spotlight at opacity 0)
 * and `--mag-x`/`--mag-y` default to `0` (a button that does not lean).
 *
 * THREE GATES, ALL OF WHICH ATTACH NOTHING WHEN THEY FAIL:
 *   - `pointer: fine` — a finger has no hover position, and a spotlight that
 *     follows a tap is a smear that appears after the reader has already
 *     committed. Gated on the pointer, never on viewport width: a touchscreen
 *     laptop is wide and a desktop window can be narrow.
 *   - `prefers-reduced-motion` — the magnetic lean is motion the reader did not
 *     ask for. Note this disables the LEAN, not the glow: a spotlight is a
 *     paint, not a movement, and removing it would take away a legibility cue
 *     from a reader who only asked for less movement. The CSS agrees — only
 *     `.u-magnetic`'s translate sits inside the no-preference query.
 *   - `hover: hover` is implied by `pointer: fine` and is not checked twice.
 *
 * WHAT THIS IS NOT: a custom cursor. ANIMATION_GUIDELINES §10 blocks those
 * outright, and the brief's "cursor interactions" is answered by lighting the
 * surface the cursor is over rather than by replacing the cursor itself — which
 * keeps every affordance the system cursor carries (text I-beam, resize, the
 * reader's own accessibility cursor settings) intact.
 */

/** How far a magnetic control may lean, in px. See `.u-magnetic` for why it is small. */
const MAGNET_MAX = 6

/**
 * Distance beyond a magnetic control's own box within which it starts to lean,
 * in px. Without a margin the lean can only begin once the pointer is already
 * inside — at which point the reader has arrived and the effect has no job. The
 * approach is where it reads.
 */
const MAGNET_FIELD = 28

export function PointerEffects() {
	const enabled = useFinePointer()
	const reduced = useReducedMotion()

	/**
	 * WHAT THE POINTER IS CURRENTLY OVER, TRACKED BY EVENT RATHER THAN BY
	 * `elementFromPoint`, AND THAT IS A PERFORMANCE DECISION WITH A NUMBER
	 * BEHIND IT.
	 *
	 * The obvious implementation asks `document.elementFromPoint(x, y)` inside
	 * the per-frame subscriber. It reads as O(1) and is not: `elementFromPoint`
	 * has to hit-test against current layout, so it flushes pending style and
	 * layout work — on every frame the pointer moves, which on a 120Hz display is
	 * 120 forced synchronous layouts a second, on a page whose backdrop is four
	 * composited gradient layers. That is precisely the shape PERFORMANCE.md §7
	 * names as the cause of INP regressions, arrived at from CSS rather than from
	 * React.
	 *
	 * `pointerover` bubbles, so ONE delegated listener on the document gives the
	 * same answer for free, computed by the browser during hit-testing it was
	 * already doing to dispatch the event. The per-frame work is then arithmetic
	 * plus a `getBoundingClientRect` on at most a handful of elements that are
	 * known to be under the pointer — and rects are re-read per frame rather than
	 * cached on enter, because the page scrolls under a stationary pointer and a
	 * cached rect would leave the glow behind.
	 */
	const active = useRef<{
		lit: HTMLElement | null
		field: HTMLElement | null
	}>({ lit: null, field: null })

	useEffect(() => {
		if (!enabled) return

		function handleOver(event: PointerEvent) {
			const target = event.target
			if (!(target instanceof Element)) return

			const lit = target.closest<HTMLElement>('[data-spotlight]')
			const field = target.closest<HTMLElement>('[data-magnetic-field]')

			// Leaving a field releases every control in it. Without this a button
			// stays frozen at full lean toward a pointer that has gone somewhere
			// else entirely — the failure people work around by clamping, which
			// keeps the bug and hides it.
			const previous = active.current.field
			if (previous && previous !== field) release(previous)

			active.current = { lit, field }
		}

		document.addEventListener('pointerover', handleOver, { passive: true })
		return () => document.removeEventListener('pointerover', handleOver)
	}, [enabled])

	usePointerField((x, y) => {
		const { lit, field } = active.current

		// The spotlight. Positioned in px relative to the host's own box, which is
		// what `--ui-spotlight`'s `at var(--mx) var(--my)` expects.
		if (lit) {
			const box = lit.getBoundingClientRect()
			lit.style.setProperty('--mx', `${x - box.left}px`)
			lit.style.setProperty('--my', `${y - box.top}px`)
		}

		if (reduced || !field) return

		for (const el of field.querySelectorAll<HTMLElement>('[data-magnetic]')) {
			const box = el.getBoundingClientRect()
			const dx = x - (box.left + box.width / 2)
			const dy = y - (box.top + box.height / 2)

			// Normalised against the half-extent plus the field margin, so a wide
			// button and a small icon button both reach full lean at their own edge
			// rather than the wide one barely moving.
			const nx = dx / (box.width / 2 + MAGNET_FIELD)
			const ny = dy / (box.height / 2 + MAGNET_FIELD)

			// Outside the field on either axis: release rather than clamp.
			if (Math.abs(nx) > 1 || Math.abs(ny) > 1) {
				release(el)
				continue
			}
			el.style.setProperty('--mag-x', `${nx * MAGNET_MAX}px`)
			el.style.setProperty('--mag-y', `${ny * MAGNET_MAX}px`)
		}
	}, enabled)

	return null
}

/**
 * Return a control — or every control in a field — to rest.
 *
 * `removeProperty` rather than setting `0px`, so the element ends with no inline
 * custom property at all and `.u-magnetic`'s own fallback is what applies. The
 * difference matters exactly once: if the reader turns on reduced motion while
 * the page is open, the CSS stops reading `--mag-x` — and an element still
 * carrying an inline offset would simply keep it, frozen, forever.
 */
function release(node: HTMLElement) {
	const targets = node.hasAttribute('data-magnetic')
		? [node]
		: node.querySelectorAll<HTMLElement>('[data-magnetic]')

	for (const el of targets) {
		el.style.removeProperty('--mag-x')
		el.style.removeProperty('--mag-y')
	}
}
