'use client'

import { useEffect, useRef } from 'react'

/**
 * One pointer listener, one rAF loop, many subscribers.
 *
 * Three effects need the pointer position — magnetic buttons, the spotlight
 * glow, and the parallax backdrop. Implemented independently that is three
 * `pointermove` listeners and three animation frames competing each time the
 * mouse moves, which is a real INP cost: `pointermove` fires at the display's
 * refresh rate, so anything done per-listener is done 120 times a second on a
 * modern laptop.
 *
 * Implemented as one module-level field with a subscriber set, it is one
 * listener and one coalesced frame regardless of how many elements are
 * listening. The per-frame cost becomes a function of how many elements react,
 * not of how many effects exist.
 *
 * Two rules from docs/ANIMATION_GUIDELINES.md §5 are structural here rather
 * than conventional:
 *
 *   - Subscribers receive coordinates and are expected to write to a ref's
 *     style or a CSS custom property. NOTHING here touches React state. Scroll
 *     and pointer handlers that setState are the documented cause of INP
 *     regressions (docs/PERFORMANCE.md §7).
 *   - Updates are throttled to `requestAnimationFrame`. Several moves inside
 *     one frame collapse to a single flush, so the browser is never asked to do
 *     the same work twice before it paints.
 */

type Subscriber = (x: number, y: number) => void

const subscribers = new Set<Subscriber>()
let frame = 0
let pointerX = 0
let pointerY = 0
let listening = false

function flush() {
	frame = 0
	for (const subscriber of subscribers) subscriber(pointerX, pointerY)
}

function handleMove(event: PointerEvent) {
	pointerX = event.clientX
	pointerY = event.clientY
	if (frame) return
	frame = requestAnimationFrame(flush)
}

function start() {
	if (listening) return
	listening = true
	// `passive` — this never calls preventDefault, and saying so lets the browser
	// skip waiting on the handler before it scrolls.
	window.addEventListener('pointermove', handleMove, { passive: true })
}

function stop() {
	if (!listening || subscribers.size > 0) return
	listening = false
	window.removeEventListener('pointermove', handleMove)
	if (frame) cancelAnimationFrame(frame)
	frame = 0
}

/**
 * Subscribe to the pointer field.
 *
 * `enabled` is the capability gate, and passing `false` attaches NOTHING — the
 * effect returns before it reaches the subscriber set. That matters: an effect
 * gated *inside* the callback still pays for the listener and the frame on every
 * move. Callers pass `useFinePointer() && !useReducedMotion()`.
 *
 * The callback is held in a ref and the subscriber is a stable wrapper around
 * it, so `enabled` is the only dependency. Callers can pass an inline closure
 * without resubscribing on every render, and without the caller-supplied
 * dependency array that pattern usually drags along — which is worth avoiding,
 * because a stale entry in one silently freezes the effect at an old closure.
 */
export function usePointerField(onMove: Subscriber, enabled: boolean) {
	const latest = useRef(onMove)

	useEffect(() => {
		latest.current = onMove
	})

	useEffect(() => {
		if (!enabled) return

		const subscriber: Subscriber = (x, y) => latest.current(x, y)
		subscribers.add(subscriber)
		start()

		return () => {
			subscribers.delete(subscriber)
			stop()
		}
	}, [enabled])
}
