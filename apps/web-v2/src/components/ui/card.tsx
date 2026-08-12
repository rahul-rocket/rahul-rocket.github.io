import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'
import { Heading, type HeadingLevel } from './heading'
import { Surface, type SurfaceProps } from './surface'

/**
 * A card, as composed parts rather than a props bag.
 *
 * UI_GUIDELINES §3 rejects `<Card title subtitle image footer showBadge />` and
 * asks for composition. The parts below are the whole API; a card that needs a
 * shape these do not express is a card that should be written out in its
 * feature directory (duplication is cheaper than the wrong abstraction).
 *
 * NO INTERACTIVITY HERE, DELIBERATELY. There is no `href`, no `onClick`, and no
 * "clickable card" variant, because every implementation of one is either a
 * `<div onClick>` (a blocker — UI_GUIDELINES §4) or a nested-interactive
 * element that swallows the links inside it. The pattern that works is a real
 * `<a>` on the title with a `::after` stretched over the card, and it belongs
 * to the feature that knows what the card links to.
 *
 * `CardMedia` takes explicit dimensions rather than defaulting them: layout
 * shift is a correctness bug and the CLS budget is 0.02 (UI_GUIDELINES §5). A
 * card that cannot state its aspect ratio has an image whose size nobody knows,
 * which is the actual problem.
 */

export interface CardProps extends Omit<SurfaceProps, 'level'> {
	/** `overlay` only for a card that genuinely floats. DESIGN_SYSTEM §6. */
	level?: 'flat' | 'raised' | 'overlay' | 'panel'
	/**
	 * The card contains something to activate — a link, usually on its title.
	 *
	 * THIS IS NOT A STYLE TOGGLE, IT IS AN ASSERTION, and getting it wrong is a
	 * real accessibility bug rather than a cosmetic one. It turns on the lift,
	 * the gradient hairline and the spotlight, which together tell a pointer
	 * user "there is an action here". A card with no action inside it that
	 * responds to hover has made a promise it cannot keep — `Capabilities` is
	 * the example on this site, and it deliberately does not set this.
	 *
	 * `u-lift` responds to `:focus-within` as well as `:hover`, so the
	 * affordance exists for keyboard and touch users too. That is the half
	 * people forget, and it is why this is one flag rather than two classes
	 * copied between features.
	 */
	interactive?: boolean
}

export function Card({
	className,
	level = 'raised',
	interactive = false,
	...props
}: CardProps) {
	return (
		<Surface
			level={level}
			radius="lg"
			className={cn(
				'flex flex-col',
				/*
				 * `overflow-hidden` is the DEFAULT and is dropped when the card lifts,
				 * which looks backwards until you know what each one is for.
				 *
				 * It exists so `CardMedia` is clipped to the card's radius. But
				 * `u-lift`'s glow is a `::after` at `z-index: -1` whose visible part is
				 * the spread OUTSIDE the element's box — and `overflow: hidden` clips
				 * exactly that away, leaving a hover state that moves 3px and appears
				 * to do nothing else.
				 *
				 * A card cannot need both: media wants the clip, a lift wants the
				 * bleed. Every interactive card on this site is text-only, so the
				 * conflict is resolved by the flag rather than by a third prop.
				 */
				interactive ? 'overflow-visible' : 'overflow-hidden',
				interactive &&
					// `hover:border-accent-muted` rather than `border-strong`, and the
					// difference is the point: a card whose edge picks up the accent on
					// hover says "this is the interactive thing you are pointing at",
					// where a neutral edge only says "something changed". The accent is
					// safe on a border because DESIGN_SYSTEM §3's one-accent rule is
					// about MEANING, and this carries the same meaning the accent
					// carries everywhere else on the site — an affordance.
					//
					// It is never the sole signal: `u-lift` moves the card and paints a
					// glow at the same moment, both on `:focus-within` as well as
					// `:hover`, so a reader who cannot perceive the hue change still
					// gets two other cues.
					'u-lift u-hairline transition-colors duration-base hover:border-accent-muted focus-within:border-accent-muted',
				className,
			)}
			{...props}
		/>
	)
}

export function CardMedia({
	className,
	ratio = '16 / 9',
	style,
	...props
}: ComponentPropsWithRef<'div'> & {
	/** CSS `aspect-ratio`. Reserved before load — never omitted. */
	ratio?: string
}) {
	return (
		<div
			className={cn('w-full overflow-hidden bg-surface-hover', className)}
			style={{ aspectRatio: ratio, ...style }}
			{...props}
		/>
	)
}

export function CardBody({
	as: Component = 'div',
	className,
	...props
}: ComponentPropsWithRef<'div'> & { as?: ElementType }) {
	return (
		<Component
			className={cn('flex flex-1 flex-col gap-3 p-6', className)}
			{...props}
		/>
	)
}

export function CardHeader({
	className,
	...props
}: ComponentPropsWithRef<'div'>) {
	return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

/**
 * The title carries a `level`, with no default, for the same reason `Heading`
 * splits level from size: a grid of cards sits at some depth in the document
 * outline and only the page knows which. A default here would be a heading
 * level chosen by a component that cannot see the page.
 */
export function CardTitle({
	level,
	className,
	...props
}: ComponentPropsWithRef<'h3'> & { level: HeadingLevel }) {
	return <Heading level={level} size="h3" className={className} {...props} />
}

export function CardFooter({
	className,
	...props
}: ComponentPropsWithRef<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-wrap items-center gap-3 border-border border-t px-6 py-4',
				className,
			)}
			{...props}
		/>
	)
}
