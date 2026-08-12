/**
 * The page-wide ambient backdrop — one fixed layer carrying the tone mesh.
 *
 * WHY THIS IS A COMPONENT THE PAGE RENDERS, AND NOT ONE LINE IN THE ROOT
 * LAYOUT. It was the latter first, and it could not work.
 *
 * A tone is a set of custom properties, and custom properties reach an element
 * by INHERITANCE — down the tree, from ancestors. Put the backdrop in the root
 * layout and the tone attribute anywhere a page can reach (`PageContainer`,
 * a section, `<main>`'s children) and the two are siblings or cousins: the
 * backdrop is never a descendant of the thing carrying the tone, so it renders
 * the default arrangement on every route no matter what the page asked for.
 * The failure is silent, which is the worst property a design system feature
 * can have — fourteen routes would have shared one backdrop while the code read
 * as though they did not.
 *
 * The alternatives were worse. `body:has([data-tone])` works, but it means
 * declaring all five tone blocks a second time scoped to this element — two
 * places to edit, which is one more than the number that stays correct. Setting
 * the attribute on `<html>` needs the route inside the root layout, and a
 * static export's root layout does not know which route it is rendering.
 *
 * So the attribute goes on this element itself. `[data-tone="…"]` in
 * surfaces.css matches it directly, binds the three tone properties, and the
 * `::before` that paints the mesh inherits them from its own parent — which is
 * the one inheritance relationship that is guaranteed to hold.
 *
 * `position: fixed` still resolves against the viewport wherever this sits in
 * the DOM, so being rendered inside a page's content costs nothing in
 * placement. The one caveat is the standard one: an ancestor with `transform`,
 * `filter` or `perspective` would make it a containing block. Nothing in the
 * shell or the page wrappers sets any of the three, and if that ever changes
 * the symptom is a backdrop that scrolls, which is immediately visible rather
 * than silent.
 *
 * `aria-hidden` with no focusable content, so it is absent from the
 * accessibility tree and from the tab order regardless of where it is rendered.
 */
export function PageBackdrop({
	tone,
}: {
	/** Omitted is the default (teal-led) arrangement — Home's. */
	tone?: 'work' | 'writing' | 'record' | 'contact'
}) {
	return (
		<div
			className="u-page-backdrop u-drift"
			data-tone={tone}
			aria-hidden="true"
		/>
	)
}
