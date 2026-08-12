'use client'

import { useMediaQuery } from './use-media-query'

/**
 * `prefers-reduced-motion: reduce`, live.
 *
 * Live rather than read-once because the preference can change while the page
 * is open — a reader turning it on mid-session is exactly the reader who most
 * needs it to take effect without a reload.
 *
 * The contract this serves is in docs/ANIMATION_GUIDELINES.md §2: the
 * reduced-motion state is the FINISHED state, never a hidden one. Callers use
 * this to decide whether to *register* an animation at all — not to shorten
 * one. There is also a global CSS backstop in themes.css, so a component that
 * forgets this hook cannot regress the guarantee on its own.
 */
export function useReducedMotion(): boolean {
	return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * A pointer that can hover precisely — a mouse or trackpad, not a finger.
 *
 * Gate pointer-driven effects on THIS, never on viewport width. A width check
 * attaches pointer handlers to a touchscreen laptop and skips them on a small
 * desktop window; it is testing the wrong thing. Handlers that are never
 * attached also cost no INP, which is the budget these effects threaten
 * (docs/redesign/ANIMATION_GUIDE.md §6).
 */
export function useFinePointer(): boolean {
	return useMediaQuery('(pointer: fine)')
}
