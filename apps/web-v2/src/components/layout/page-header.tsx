import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/cn'

/**
 * The `<PageHeader />` every route composes — docs/WEBSITE_STRUCTURE.md §3.
 *
 * "h1 + one-line purpose statement", spelled once. The `<h1>` is the page's
 * subject and there is exactly one per page; this component is what makes that
 * true structurally rather than by review, because a page that used it cannot
 * accidentally emit a second.
 *
 * NOT ANIMATED, ON ANY ROUTE. On most pages this is the LCP element, and
 * PERFORMANCE.md §4 does not permit animating the LCP element. There is no
 * `<Reveal>` here and adding one would be a regression rather than a
 * decoration — the same rule the hero's `<h1>` is held to. Note what that
 * means for the gradient below: a gradient FILL is not an animation. It is a
 * paint property present in the first frame, it moves nothing, and it cannot
 * register a second LCP candidate.
 *
 * `display` RATHER THAN `h1` SIZE, AND THAT IS THE CHANGE THAT MATTERS HERE.
 * Every non-home route opened with a heading at the `h1` step — 2rem rising to
 * 3.25rem — which is a size, not a statement. The type scale has two steps
 * above it that were reachable only from Home, so thirteen of fourteen routes
 * were visually indistinguishable from each other and from a documentation
 * site. `display` tops out at 5.5rem and is what makes a page title read as a
 * title. `size` is still separate from `level`, so a route that genuinely needs
 * the quieter step asks for it.
 *
 * The eyebrow is `components/ui/eyebrow` now, not a local copy. This file used
 * to hand-roll the mono-label-and-rule treatment that the home feature had
 * already built, which is two implementations of one device — see the note on
 * that component for why the duplicate became a promotion.
 *
 * `id` defaults to `page-title` so a `<section aria-labelledby>` can point at it
 * and so `/resume`'s print styles have a stable hook.
 */
export function PageHeader({
	title,
	lede,
	eyebrow,
	meta,
	id = 'page-title',
	size = 'display',
	className,
}: {
	title: ReactNode
	/** The one-line purpose statement. Optional only where the title is enough. */
	lede?: ReactNode
	/** A small label above the title — a section name, a date, a category. */
	eyebrow?: ReactNode
	/** Dates, counts, reading time. Rendered under the lede, quieter. */
	meta?: ReactNode
	id?: string
	/**
	 * `display` is the page-title step. `h1` is the quieter one, for routes whose
	 * title is long enough that the display step would wrap to four lines — the
	 * case studies, whose titles are sentences.
	 */
	size?: 'display' | 'h1'
	className?: string
}) {
	return (
		<header className={cn('flex flex-col gap-5', className)}>
			{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

			{/*
			  The gradient is on the display step only, which the type below
			  enforces: `Heading` will not compile with `gradient` at any size
			  smaller than `display`. The fill holds `--ui-text` for its first third
			  and only then runs into the spectrum, so the opening words of every
			  page title are at full body-text contrast — and it degrades to solid
			  text with no gradient support, in forced-colors mode, and in print.
			  See `.u-gradient-text` in utilities.css for all four guarantees.
			*/}
			{size === 'display' ? (
				<Heading
					id={id}
					level={1}
					size="display"
					gradient
					className="max-w-[16ch]"
				>
					{title}
				</Heading>
			) : (
				<Heading id={id} level={1} size="h1" className="max-w-[24ch]">
					{title}
				</Heading>
			)}

			{lede ? (
				<Text size="lede" tone="muted" className="max-w-lede text-balance">
					{lede}
				</Text>
			) : null}

			{meta ? <div className="text-sm text-text-muted">{meta}</div> : null}
		</header>
	)
}
