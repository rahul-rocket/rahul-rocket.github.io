import { site } from '@/config/site'

/**
 * The brand mark, and the one lockup the header and footer both render.
 *
 * WHY THIS IS NOT IN `components/ui/icons.tsx`. That file's header calls itself
 * "the only file in the codebase that may contain a `<path>`", and the rule it
 * is protecting is *one icon set* (DESIGN_SYSTEM §8): functional iconography
 * must not drift into a second visual language. A brand mark is the opposite
 * kind of object — it is deliberately not part of the set, it is never chosen
 * from a list, and it has exactly one call site shape. Routing it through
 * `createIcon` would put it in the set's size steps and stroke weight, which is
 * precisely what a mark must not inherit. So it lives here, alone, and the icon
 * set's rule is amended in place rather than quietly broken.
 *
 * IT IS DRAWN, NOT IMAGED. An `<img>` costs a request, a layout reservation and
 * a second asset to keep in step with the theme; an inline SVG using
 * `currentColor` and the accent token is themed for free in both light and dark
 * and cannot be the thing that shifts the header on first paint (CLS budget
 * 0.02, CLAUDE.md §10).
 *
 * IT IS ALWAYS `aria-hidden`. Every use of this component is inside a link that
 * already has an accessible name — the wordmark text next to it, or an explicit
 * label. A titled SVG there would make the link announce its name twice.
 */
export function LogoMark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			focusable="false"
			className={className ?? 'size-7 shrink-0'}
		>
			{/* The frame. `--ui-accent-muted` rather than the full accent: the mark
			    reads as one object, and a frame at the same weight as the letter
			    competes with it at 28px. */}
			<rect
				x="1.25"
				y="1.25"
				width="21.5"
				height="21.5"
				rx="6.5"
				stroke="var(--ui-accent-muted)"
				strokeWidth="1.5"
			/>
			{/* The monogram, in `currentColor` so it takes the link's own colour and
			    its hover transition with no extra rule. */}
			<path
				d="M8 18.25V6h4.4a3.1 3.1 0 0 1 0 6.2H8"
				stroke="currentColor"
				strokeWidth="1.9"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="m12.1 12.2 3.6 6.05"
				stroke="currentColor"
				strokeWidth="1.9"
				strokeLinecap="round"
			/>
			{/* The one accent-filled shape on the mark. It is decoration, not
			    meaning — DS-14's test ("could a reader who sees this hue as grey
			    miss something?") is answered by the monogram carrying the identity
			    on its own. */}
			<circle cx="16.9" cy="7.6" r="1.5" fill="var(--ui-accent)" />
		</svg>
	)
}

/**
 * Mark plus name — what the header and the footer actually render.
 *
 * `nameClassName` exists because the two call sites disagree about one thing
 * only: the header hides the name below `sm` to keep a fixed-height bar from
 * running out of room as controls are added (which is the failure
 * `e2e/shell.spec.ts` "keeps the wordmark on one line" was written for), while
 * the footer always has the width for it. Everything else about the lockup is
 * shared, which is the point of it being a component.
 */
export function Logo({
	className,
	nameClassName,
}: {
	className?: string
	nameClassName?: string
}) {
	return (
		<span
			className={
				className ??
				'inline-flex items-center gap-2.5 whitespace-nowrap font-heading text-text tracking-heading'
			}
		>
			<LogoMark />
			<span className={nameClassName}>{site.name}</span>
		</span>
	)
}
