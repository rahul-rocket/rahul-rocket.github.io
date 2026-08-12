/**
 * Motion inventory item 24 — the scroll progress rail, on the header's bottom
 * edge.
 *
 * IT SHIPS ZERO JAVASCRIPT, AND THAT IS A DEPARTURE FROM THE SPEC WORTH READING.
 *
 * docs/ANIMATION_GUIDELINES.md §3 describes item 24 as "`scaleX` on a ref,
 * frame-linked" — a client component with a scroll subscriber writing a
 * transform every frame. This is the same rail with a CSS scroll-driven
 * animation instead (`animation-timeline: scroll(root block)`, in motion.css).
 * §4 of that document is explicit about which to prefer: "If a transition can be
 * done with a CSS class, it must be — it ships zero JavaScript and cannot be
 * broken by hydration."
 *
 * The reason it matters more here than usual is the budget. The header is on
 * every route, and Home has ~1.9 KB of gzipped headroom against a 120 KB hard
 * limit (docs/PERFORMANCE.md §2). A scroll subscriber is small, but it is small
 * on a route that cannot afford it, to compute a number the browser already
 * knows. The CSS version also runs off the main thread, so it cannot contribute
 * to INP the way a per-frame scroll handler can.
 *
 * UNDER REDUCED MOTION IT KEEPS WORKING, WHICH IS REQUIRED AND WAS VERIFIED
 * RATHER THAN ASSUMED. §3 lists item 24 as "Kept — it is information", but the
 * global backstop in themes.css forces `animation-duration: 0.01ms !important`
 * onto every animation, which would ordinarily slam a rail to full width at the
 * first pixel of scroll — actively false information. It does not, because a
 * progress-based timeline resolves its own duration and ignores
 * `animation-duration` entirely. That was measured in Chromium under emulated
 * `prefers-reduced-motion: reduce` before this was written, and it is pinned by
 * `e2e/shell.spec.ts` so the backstop and the rail cannot silently diverge.
 *
 * WITHOUT `animation-timeline` SUPPORT the rail is `display: none` — the
 * `@supports` gate is in the stylesheet. An indicator frozen at zero is worse
 * than no indicator: it reads as a broken page rather than as an absent
 * enhancement. The scrollbar conveys the same information natively.
 *
 * `aria-hidden` because it is a duplicate: scroll position is already exposed to
 * assistive technology by the viewport itself, and a second, unlabelled
 * announcement of it is noise. It is not a `<progress>` for the same reason.
 */
export function ScrollProgress() {
	return (
		<div
			aria-hidden="true"
			data-testid="scroll-progress"
			// `bottom-0` on the header, so it sits exactly on the hairline the
			// header fades in when scrolled — one 2px line rather than two edges.
			className="u-scroll-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
		/>
	)
}
