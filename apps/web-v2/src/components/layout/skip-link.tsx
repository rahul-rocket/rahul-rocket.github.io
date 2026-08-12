/**
 * L-02 — the skip link. docs/ACCESSIBILITY.md §"Skip link first".
 *
 * The first focusable element in the document, on every page. For a keyboard or
 * switch user it is the difference between reaching the page's content in one
 * key press and tabbing through the whole nav on every navigation.
 *
 * THE HIDING TECHNIQUE IS LOAD-BEARING, AND IT IS NOT `opacity: 0`.
 *
 * `sr-only` clips the link to a 1px box; it does not make it transparent and it
 * does not remove it from the tab order. That matters twice over. An
 * `opacity: 0` link stays clickable and stays in the tab order while being
 * invisible — the classic phantom-focus bug. And it would trip the no-JS spec,
 * which fails any element in the served HTML whose computed opacity is under
 * 0.05, because that is the shape a broken reveal animation takes.
 *
 * `focus:not-sr-only` is the whole interaction: the link exists, silently, until
 * it is focused.
 *
 * `top-4 left-4` rather than `top-0`: pinned flush to the corner, the focus ring
 * would be clipped by the viewport edge on the two sides it hugs, and a focus
 * ring you cannot see fails the same requirement the link exists to serve.
 */
export function SkipLink() {
	return (
		<a
			href="#main"
			// z-50 clears the sticky header (z-40) — see the stacking-order note in
			// globals.css. Without it the link is focusable, "visible", and rendered
			// underneath the header.
			// No focus-ring utilities here: the global `:focus-visible` rule in
			// themes.css already draws it, and a second declaration is a second thing
			// to keep in step with the first.
			className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-surface-raised focus:px-4 focus:py-3 focus:font-heading focus:text-text focus:no-underline focus:shadow-overlay"
		>
			Skip to content
		</a>
	)
}
