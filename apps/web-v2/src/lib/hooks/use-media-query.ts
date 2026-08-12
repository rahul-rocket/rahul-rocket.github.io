'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * A media query as reactive state.
 *
 * `useSyncExternalStore` rather than the usual `useState` + `useEffect` pair.
 * Under `output: 'export'` the HTML is generated at build time, where
 * `matchMedia` does not exist, so the hook needs an explicit server snapshot —
 * and this is the hook React provides for exactly that shape. The
 * useState/useEffect version renders once with the wrong value and then
 * re-renders, which is a wasted render on every mount and a hydration mismatch
 * warning if the initial value is guessed.
 *
 * The server snapshot is `false` for every query, which is deliberate rather
 * than arbitrary: every caller here gates an *enhancement* (pointer effects,
 * motion), so `false` means "assume the plain version" and the enhancement
 * switches on after hydration if it applies. Guessing `true` would mean the
 * static HTML promises something the device may not support.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query)
			list.addEventListener('change', onChange)
			return () => list.removeEventListener('change', onChange)
		},
		[query],
	)

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	)
}
