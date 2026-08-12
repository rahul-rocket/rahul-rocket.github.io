import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/cn'

/**
 * The opener every section on every page composes.
 *
 * WHY THIS EXISTS. Home rendered six sections, and each one hand-assembled the
 * same three elements — `<Reveal><Stack gap={4}><Eyebrow/><Heading/></Stack>` —
 * with a different gap, a different alignment, and in two cases a different
 * heading size. Six copies of one device is not a design system; it is six
 * chances for the seventh to be slightly wrong, and it was already the reason
 * the page's section headings read as a list of similar-sized text rather than
 * as a hierarchy. `PageHeader` is this component's counterpart for the `<h1>`
 * and has always been shared. This is the `<h2>` half, and it was missing.
 *
 * THE INDEX IS THE NEW PART AND IT IS DOING REAL WORK. A section numbered `03`
 * in the margin tells a reader three things a heading alone cannot: that the
 * page is a finite, ordered argument; roughly where in it they are; and that
 * somebody decided the order. It is the cheapest hierarchy on the page — one
 * mono numeral, no layout cost — and it is the device that stops a long
 * single-column scroll reading as an undifferentiated stack of boxes.
 *
 * It is `aria-hidden`, and that is not a shortcut. The number is a position the
 * reader can already perceive from the document outline, and a screen reader
 * announcing "zero three" before every heading is noise that the visual reader
 * is not being charged for. Landmark and heading navigation give the same
 * information in a form that is actually useful in that mode.
 *
 * NOT ANIMATED BY THIS COMPONENT. The caller wraps it in `<Reveal>` where the
 * section is below the fold and does not where it is not — `useReveal` only
 * arms elements that are off-screen at mount, so a `<Reveal>` here would be an
 * inert client component on every above-the-fold section. Keeping the choice
 * with the caller is also what lets the section stagger its own children
 * instead: `data-stagger` applies to the direct children of the armed node, so
 * an intro that armed itself would take the stagger the grid below it wanted.
 */
export function SectionIntro({
	id,
	index,
	eyebrow,
	title,
	lede,
	action,
	align = 'start',
	className,
}: {
	/** The heading's id — the section points `aria-labelledby` at it. */
	id: string
	/** Position in the page's argument, e.g. `1`. Rendered zero-padded. */
	index?: number
	eyebrow?: ReactNode
	title: ReactNode
	lede?: ReactNode
	/** A link out of the section — "All case studies". Sits opposite the title. */
	action?: ReactNode
	/**
	 * `center` for a section whose content is centred under it (the CTA). The
	 * default is `start`, because a centred heading over left-aligned content is
	 * the most common way a page loses its reading edge.
	 */
	align?: 'start' | 'center'
	className?: string
}) {
	const centered = align === 'center'

	return (
		<div
			className={cn(
				'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
				centered && 'md:flex-col md:items-center',
				className,
			)}
		>
			<div
				className={cn(
					'flex max-w-3xl flex-col gap-4',
					centered && 'items-center text-center',
				)}
			>
				{/*
				  The index and the eyebrow share a row, separated by a hairline that
				  fills the space between them. Two small mono labels stacked would be
				  two rows of chrome above the heading; one row reads as a single
				  device and takes the vertical space the heading wants.
				*/}
				{index !== undefined || eyebrow ? (
					<div
						className={cn(
							'flex items-center gap-4',
							centered && 'justify-center',
						)}
					>
						{index !== undefined ? (
							<span
								aria-hidden="true"
								className="font-mono text-sm text-text-subtle tabular-nums tracking-caps"
							>
								{/* Zero-padded so `09` and `10` occupy the same width and the
								    numerals down the left of a page form a column rather than
								    a ragged edge. */}
								{String(index).padStart(2, '0')}
							</span>
						) : null}
						{eyebrow ? <Eyebrow as="span">{eyebrow}</Eyebrow> : null}
					</div>
				) : null}

				{/*
				  `h1` SIZE ON AN `h2` LEVEL, WHICH IS THE ENTIRE REASON `Heading`
				  SPLITS THE TWO. Section headings were at the `h2` step — 24px rising
				  to 34px — against a hero at 128px and body copy at 18px. That is a
				  scale with a hole in the middle of it, and the visible symptom was
				  section titles that scanned as bold paragraphs. One step up restores
				  the gap between "this is a new part of the argument" and "this is a
				  sentence", and it costs nothing: `Heading` was built for exactly
				  this, and the level is still chosen from the outline.
				*/}
				<Heading id={id} level={2} size="h1" gradient className="text-balance">
					{title}
				</Heading>

				{lede ? (
					<Text size="lede" tone="muted" className="max-w-lede text-pretty">
						{lede}
					</Text>
				) : null}
			</div>

			{/* `shrink-0` so a two-word action never wraps to make room for a heading
			    that has the whole rest of the row. */}
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	)
}
