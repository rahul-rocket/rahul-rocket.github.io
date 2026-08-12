'use client'

import { useEffect, useState } from 'react'
import {
	DEFAULT_THEME,
	isTheme,
	THEME_ATTRIBUTE,
	type Theme,
	toggleTheme,
} from '@/lib/theme'

/**
 * F1-09 — the theme control.
 *
 * A real `<button>` with `aria-pressed`, not a styled div and not a checkbox
 * pretending to be a switch. Buttons act (CLAUDE.md §7).
 *
 * L-07 landed the rest: it now lives in the header and is styled to sit beside
 * the nav. The accessible state announcement asked for by that task is
 * `aria-pressed`, and deliberately nothing else — a screen reader announces the
 * pressed state on activation by itself, so an additional `aria-live` region
 * would announce the same change a second time, in different words. Two
 * announcements for one action is the failure mode people describe as "the
 * screen reader talking over itself"; the fix is to let the role do its job.
 *
 * It stays visible at every breakpoint rather than moving into the mobile sheet.
 * The theme is a comfort and accessibility setting, and burying it two
 * interactions deep on the devices most likely to be used in the dark is the
 * wrong trade for a control this small.
 *
 * THE VISIBLE LABEL IS DRIVEN BY CSS, NOT BY REACT STATE, AND THAT IS A
 * PERFORMANCE REQUIREMENT.
 *
 * The first version rendered "Theme" on the server and swapped it to "Dark" or
 * "Light" in an effect. That post-hydration text change registers a **new LCP
 * candidate** at hydration time: Lighthouse measured FCP at 0.8s and LCP at
 * 1.8s on a page whose largest element is a heading that painted with the first
 * frame. It pushed every route past the 1.8s hard limit in PERFORMANCE.md §2.
 *
 * Rendering both labels and letting `:root[data-theme]` choose between them
 * means the served markup is already final: no mutation after hydration, no new
 * LCP candidate, and the correct label is visible before React runs at all —
 * which is also simply better for the reader.
 *
 * Only `aria-pressed` is synced from state. An attribute change is not a paint,
 * so it costs nothing here.
 *
 * This is the only `'use client'` component in the tree, and it is a leaf, so it
 * pulls nothing else into the bundle with it.
 */
export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme | null>(null)

	/**
	 * Observe the attribute rather than read it once on mount.
	 *
	 * This button is no longer the only thing that changes the theme — the command
	 * palette has a "Toggle theme" action (L-13). A mount-only read left
	 * `aria-pressed` stating the opposite of the truth the moment the palette was
	 * used, which is worse than having no state at all: a screen reader would
	 * announce "pressed" for the light theme. Observing `data-theme` means the
	 * button is correct no matter who wrote it, including the pre-paint script and
	 * anything added later.
	 */
	useEffect(() => {
		const root = document.documentElement

		function sync() {
			const current = root.getAttribute(THEME_ATTRIBUTE)
			setTheme(isTheme(current) ? current : DEFAULT_THEME)
		}

		sync()
		const observer = new MutationObserver(sync)
		observer.observe(root, {
			attributes: true,
			attributeFilter: [THEME_ATTRIBUTE],
		})
		return () => observer.disconnect()
	}, [])

	// The mutation itself lives in lib/theme.ts because the palette performs the
	// same one. All that is left here is reflecting it — and the observer above
	// does that, so this does not set state at all.
	function toggle() {
		toggleTheme()
	}

	return (
		<button
			type="button"
			onClick={toggle}
			// Before hydration this reflects the served default. The effect corrects
			// it within a frame, and correcting an attribute causes no repaint.
			aria-pressed={theme === null ? undefined : theme === 'dark'}
			// The name states the control, not its value — `aria-pressed` carries the
			// state, and duplicating it in the name makes screen readers announce it
			// twice, in contradictory tenses.
			aria-label="Dark theme"
			data-testid="theme-toggle"
			className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text"
		>
			{/* Both labels always render; CSS shows one. The emoji is decorative and
			    hidden from assistive tech — the text beside it is the real label, so
			    nothing depends on colour or on an icon font loading.

			    The WORD is dropped below `sm`, not the label. Three controls plus the
			    wordmark do not fit a 320px header, and the emoji alone still says
			    which theme is active. Nothing is lost to assistive technology: the
			    accessible name is `aria-label` on the button and does not change with
			    the viewport. This is a media query, not a state change, so it still
			    cannot mutate after hydration — the LCP argument above holds. */}
			<span data-theme-label="dark">
				<span aria-hidden="true">🌙</span>
				<span className="hidden sm:inline"> Dark</span>
			</span>
			<span data-theme-label="light">
				<span aria-hidden="true">☀️</span>
				<span className="hidden sm:inline"> Light</span>
			</span>
		</button>
	)
}
