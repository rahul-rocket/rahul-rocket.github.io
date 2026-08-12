/**
 * F1-09 — theme constants and the pre-paint script.
 * docs/DESIGN_SYSTEM.md §2, docs/ACCESSIBILITY.md.
 *
 * Deliberately free of React so the same values are usable from the inline
 * script, from Server Components, and from the E2E suite.
 */

export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** The `<html>` attribute themes.css keys off. */
export const THEME_ATTRIBUTE = 'data-theme'

/**
 * The theme baked into the served HTML, and the answer whenever the real one
 * cannot be read — during the server render, and in `getSnapshot` if the
 * attribute is ever missing or malformed.
 *
 * It is exported rather than written as a literal in each of those places
 * because the layout, the pre-paint script and the hook must agree: if the HTML
 * ships `dark` and the hook's server snapshot says `light`, React hydrates
 * against a state the document never had.
 */
export const DEFAULT_THEME: Theme = 'dark'

/** localStorage key. Namespaced so it cannot collide on the shared origin. */
export const THEME_STORAGE_KEY = 'rr-theme'

export function isTheme(value: unknown): value is Theme {
	return (
		typeof value === 'string' && (THEMES as readonly string[]).includes(value)
	)
}

/**
 * Flip the theme, persist it, and report the new value. Browser only.
 *
 * IT READS THE DOM RATHER THAN TAKING THE CURRENT THEME AS AN ARGUMENT, and
 * that is the whole reason it exists here instead of inside the toggle.
 *
 * The `<html>` attribute is what the pre-paint script wrote and what CSS is
 * keyed off, so it is the authority — React state that has not caught up would
 * flip the reader to the theme they are already in. There are now two callers
 * (the header toggle and the command palette's "Toggle theme" action), and two
 * copies of "read the attribute, invert it, write it, persist it" is two places
 * for that subtlety to be lost. One of them would eventually be rewritten
 * against its own state.
 */
export function toggleTheme(): Theme {
	const current = document.documentElement.getAttribute(THEME_ATTRIBUTE)
	const next: Theme = current === 'light' ? 'dark' : 'light'

	document.documentElement.setAttribute(THEME_ATTRIBUTE, next)
	try {
		localStorage.setItem(THEME_STORAGE_KEY, next)
	} catch {
		// Private mode denies localStorage. The theme still applies to this page
		// view; it just will not persist. That is better than throwing.
	}
	return next
}

/**
 * The pre-paint script, as a string, injected into <head> before any markup.
 *
 * WHY THIS MUST BE INLINE, BLOCKING, AND IN THE HEAD.
 *
 * The stored theme lives in localStorage, which a static export cannot read at
 * build time — every page ships with one theme baked into the HTML. If the
 * correction runs in a React effect, the browser paints the served theme first
 * and repaints: the "flash of wrong theme". For a reader who chose dark, that is
 * a full-screen white flash on every navigation, which is both unpleasant and,
 * for photophobia and migraine, a genuine accessibility problem
 * (docs/ACCESSIBILITY.md — it is why this is a P0 rather than a polish item).
 *
 * A blocking inline script in <head> runs before first paint, so there is no
 * frame in which the wrong theme is visible. The cost is ~400 bytes of
 * render-blocking script, which is the correct trade and the only one available
 * without a server.
 *
 * It is written as a string rather than a component because it must not be
 * hydrated, must not be deferred, and must not be transformed — dangerouslySet
 * is the only way to get exactly these bytes into exactly that position.
 */
export const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : '${DEFAULT_THEME}');
    document.documentElement.setAttribute('${THEME_ATTRIBUTE}', theme);
  } catch (e) {
    /* Private mode denies localStorage. The served default is already on the
       element, so failing silently leaves a correct page rather than no page. */
  }
})();
`.trim()
