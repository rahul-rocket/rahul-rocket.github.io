import { ArrowUpIcon } from '@/components/ui/icons'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

/**
 * Back to top — a link, not a button, and it ships zero JavaScript.
 *
 * WHY IT IS AN `<a href="#main">`.
 *
 * The usual implementation is a `<button onClick={() => window.scrollTo(...)}>`,
 * which is a control that does nothing without JavaScript, moves the scroll
 * position without moving focus, and has to reimplement smooth scrolling that
 * `html { scroll-behavior: smooth }` already provides (globals.css). An anchor
 * to `#main` gets all three right for free: it works with JavaScript disabled,
 * the browser moves focus as well as the viewport, and `#main` already carries
 * `tabIndex={-1}` and `scroll-mt-header` for exactly this — it is the skip
 * link's target, and "the top of the content" is the same place for both.
 *
 * CLAUDE.md §7: links navigate, buttons act. This navigates.
 *
 * THE REVEAL IS CSS, AND WHAT IT HIDES WITH MATTERS.
 *
 * It fades in after the first viewport of scroll via `animation-timeline`
 * (motion.css) — no scroll listener, nothing on the main thread. The hidden
 * state is `visibility: hidden`, never `opacity: 0`: an invisible but focusable
 * control is the classic keyboard trap, and `visibility` removes it from the tab
 * order and the accessibility tree while `opacity` would leave it in both. The
 * same reasoning as `[data-js-only]` in globals.css.
 *
 * Without `animation-timeline` support it is `display: none`. This is a pure
 * enhancement — Home, `Ctrl`/`Cmd`+`Home`, and the skip link all do the same job
 * — and a floating button pinned over the content at every scroll position is a
 * worse default than no button.
 *
 * THE NAME IS REAL TEXT, not an `aria-label`. A visually hidden `<span>`
 * survives translation and is what the icon's own `aria-hidden` default assumes
 * (components/ui/icon.tsx). The 44px tap target is `size-11`, which is WCAG 2.2
 * §2.5.8's minimum rather than a number chosen by eye.
 */
export function BackToTop() {
	return (
		<a
			href="#main"
			data-testid="back-to-top"
			// z-30 — below the header (z-40), above page content. The stacking
			// contract is in globals.css and this line is registered there.
			className="u-back-to-top fixed right-4 bottom-4 z-30 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text no-underline shadow-overlay hover:bg-surface-hover sm:right-8 sm:bottom-8"
		>
			<ArrowUpIcon />
			<VisuallyHidden>Back to top</VisuallyHidden>
		</a>
	)
}
