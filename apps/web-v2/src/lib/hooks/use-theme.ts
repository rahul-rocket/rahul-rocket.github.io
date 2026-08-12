'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { isTheme, THEME_STORAGE_KEY, type Theme } from '../theme'

const DEFAULT_THEME: Theme = 'dark'

/**
 * Theme state, read from the DOM rather than from React state.
 *
 * The `data-theme` attribute is the source of truth, because the pre-paint
 * script in `lib/theme.ts` has already set it before React exists. A
 * `useState` initialised from `localStorage` would be a *second* source that
 * disagrees with the DOM for one render, which is both a hydration mismatch and
 * a flash.
 *
 * So this subscribes to the attribute via `MutationObserver` and reads it
 * synchronously. `useSyncExternalStore` gives the correct server snapshot for
 * free — at build time there is no document, and the answer is the default.
 */

function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange)
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	})

	// A reader who has never chosen explicitly follows the system, live. Someone
	// who has chosen is not overridden by their OS switching at sunset.
	const media = window.matchMedia('(prefers-color-scheme: light)')
	const onSystemChange = () => {
		if (localStorage.getItem(THEME_STORAGE_KEY)) return
		document.documentElement.setAttribute(
			'data-theme',
			media.matches ? 'light' : 'dark',
		)
	}
	media.addEventListener('change', onSystemChange)

	return () => {
		observer.disconnect()
		media.removeEventListener('change', onSystemChange)
	}
}

function getSnapshot(): Theme {
	const value = document.documentElement.getAttribute('data-theme')
	return isTheme(value) ? value : DEFAULT_THEME
}

export function useTheme() {
	const theme = useSyncExternalStore(
		subscribe,
		getSnapshot,
		() => DEFAULT_THEME,
	)

	const setTheme = useCallback((next: Theme) => {
		document.documentElement.setAttribute('data-theme', next)
		try {
			localStorage.setItem(THEME_STORAGE_KEY, next)
		} catch {
			// Safari private mode. The attribute is already set, so the theme works
			// for this session; only persistence is lost, and that is the right
			// thing to degrade.
		}
	}, [])

	const toggleTheme = useCallback(() => {
		setTheme(getSnapshot() === 'dark' ? 'light' : 'dark')
	}, [setTheme])

	return { theme, setTheme, toggleTheme }
}
