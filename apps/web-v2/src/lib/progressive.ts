/**
 * The "JavaScript is running" flag — L-05's half of the no-JS guarantee.
 *
 * CLAUDE.md §8 requires that everything works with JavaScript disabled. Most of
 * the site satisfies that by being static HTML. One control cannot: the mobile
 * sheet trigger, which is a button whose only behaviour is to call
 * `showModal()` on a `<dialog>`. Without JS it is a button that does nothing.
 *
 * Rather than ship a dead control, the shell hides it until this attribute
 * appears on `<html>`, and readers without JavaScript navigate by the footer
 * site map — which is exactly the job WEBSITE_STRUCTURE.md §2 already assigns
 * the footer ("the accessibility safety net").
 *
 * WHY A BLOCKING SCRIPT RATHER THAN A `useEffect`.
 *
 * The obvious alternative is for the client component to set a flag on mount.
 * That works, but it means the control is invisible until hydration and then
 * appears — a visible pop in the header on every cold load, on the slowest
 * devices most of all. The same argument as the theme script (lib/theme.ts),
 * one order of magnitude smaller: ~90 bytes of render-blocking script buys a
 * header that is correct in the first frame.
 *
 * Kept separate from `themeScript` because they are separate concerns with
 * separate reasons to change; the layout concatenates them into one <script>
 * tag so the separation costs nothing at runtime.
 */

/** Presence-only attribute on `<html>`. globals.css keys `[data-js-only]` off it. */
export const JS_ATTRIBUTE = 'data-js'

export const enhancementScript =
	`document.documentElement.setAttribute('${JS_ATTRIBUTE}','');`.trim()
