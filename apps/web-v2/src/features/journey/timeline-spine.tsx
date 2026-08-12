/**
 * A-06 — the timeline spine, drawn as the reader scrolls.
 *
 * NO GSAP, AND THE DEVIATION IS THE INTERESTING PART. The backlog names this as
 * one of two sanctioned GSAP usages: a ScrollTrigger scrub, dynamically
 * imported, contributing zero bytes to Home. That budget is real, and the
 * feature it buys is "a line whose height tracks scroll position" — which CSS
 * scroll-driven animations do natively, at zero bytes on *every* route rather
 * than zero bytes on all but one.
 *
 * GSAP is therefore still not a dependency of this project. CLAUDE.md §15.4
 * requires a TECH_STACK §2 entry with a byte cost before any dependency is
 * added, and the honest entry here would have had to argue for ~30 KB against a
 * fifteen-line stylesheet. The shell already made the same call twice — the
 * scroll-progress rail and the back-to-top button are both
 * `animation-timeline: scroll()` behind an `@supports` gate.
 *
 * THE FALLBACK IS A FULLY DRAWN LINE, NOT A FROZEN ONE. That is A-06's
 * acceptance criterion ("under reduced motion the spine renders complete and
 * static") and it is what the `@supports` gate in `motion.css` produces: the
 * animated variant only applies where scroll timelines exist, so a browser
 * without them, a reader with reduced motion, and a page with JavaScript
 * disabled all get the same complete spine. There is no code path that leaves
 * it half-drawn.
 *
 * `aria-hidden`, because it is a decorative rule. The `<ol>` beside it carries
 * the sequence, and a screen-reader user gains nothing from being told a line
 * exists.
 */
export function TimelineSpine() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute top-2 bottom-2 left-1.5 w-px bg-border lg:left-1/2"
		>
			{/* The drawn portion runs the spectrum from the accent down through
			    indigo and violet, so a long journey page reads as a gradient rather
			    than as one flat teal line four thousand pixels tall. It is
			    decorative by definition — the `<ol>` beside it carries the sequence
			    — so DS-14's "spectrum for light, never for meaning" rule is
			    satisfied: nothing here is information. */}
			<div className="u-timeline-spine u-spine-fill h-full w-full origin-top" />
		</div>
	)
}
