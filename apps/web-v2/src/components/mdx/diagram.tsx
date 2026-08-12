import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * P-08 / B-06 — `Diagram`. docs/WEBSITE_STRUCTURE.md §4.7,
 * docs/PROJECT_CASE_STUDIES.md §6, docs/ACCESSIBILITY.md.
 *
 * THE PROSE IS THE SOURCE OF TRUTH AND THE DIAGRAM IS THE AID. That ordering is
 * the rule the site commits to, and this component makes it structural: both
 * `description` (the `<desc>`) and `equivalent` (the prose that follows) are
 * required props. A diagram that cannot be described in a paragraph is a
 * diagram whose author has not decided what it says, and the reader who gets
 * the paragraph instead of the picture — screen-reader user, high-contrast
 * user, someone on a printout — must lose nothing.
 *
 * `<title>` and `<desc>` are inside the `<svg>` and referenced by
 * `aria-labelledby`, which is the only combination assistive technology
 * consistently reads. `role="img"` is required alongside them: without it,
 * several screen readers walk the shapes instead of the label.
 *
 * TOKENS ONLY, INCLUDING INSIDE THE SVG. The children are authored with
 * `stroke="currentColor"` and token-driven `fill` classes, so a diagram is
 * legible in both themes without a second copy — P-08's acceptance criterion.
 * A hard-coded `#3ab` here is the same blocker it is in a component.
 */
export function Diagram({
	title,
	description,
	equivalent,
	viewBox = '0 0 800 400',
	children,
	className,
}: {
	/** Names the diagram. Becomes `<title>` and the caption. */
	title: string
	/** What it shows, in one or two sentences. Becomes `<desc>`. */
	description: string
	/**
	 * THE PROSE EQUIVALENT, RENDERED VISIBLY BELOW THE DIAGRAM FOR EVERYONE.
	 * Not `sr-only`: hiding it would make the accessible path the second-class
	 * one, and the paragraph is genuinely the better artifact for a reader
	 * skimming on a phone.
	 */
	equivalent: ReactNode
	viewBox?: string
	children: ReactNode
	className?: string
}) {
	const id = slugify(title)
	const titleId = `diagram-${id}-title`
	const descId = `diagram-${id}-desc`

	return (
		<figure className={cn('my-10 flex flex-col gap-4', className)}>
			<div className="overflow-x-auto rounded-lg border border-border bg-surface p-6">
				<svg
					viewBox={viewBox}
					role="img"
					aria-labelledby={`${titleId} ${descId}`}
					// The width floor is what makes the horizontal scroll above work:
					// below it the diagram would compress until its labels collide,
					// which is less readable than a scrollbar the reader controls.
					className="block h-auto w-full min-w-[36rem]"
					fill="none"
					stroke="currentColor"
					strokeWidth={1.5}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title id={titleId}>{title}</title>
					<desc id={descId}>{description}</desc>
					{children}
				</svg>
			</div>

			<figcaption className="flex flex-col gap-2 text-sm text-text-muted">
				<span className="font-heading text-text text-xs uppercase tracking-caps">
					{title}
				</span>
				{equivalent}
			</figcaption>
		</figure>
	)
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}
