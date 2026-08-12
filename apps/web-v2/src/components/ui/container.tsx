import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * The horizontal constraint: max width plus the page gutter.
 *
 * Two widths, both tokens (DESIGN_SYSTEM §5). `page` is the 1440px layout
 * container; `reading` is the 72ch measure. The measure is enforced by a
 * CONTAINER, never per element — a `max-width` on every paragraph produces a
 * ragged column the moment one of them is a list or a figure (§4, "enforced by
 * a `prose` container, not per-element").
 *
 * The gutter is `clamp(1.25rem, 5vw, 2.5rem)` and applies at every width, which
 * is what keeps the no-horizontal-scroll-at-320px rule (UI_GUIDELINES §5) a
 * property of the layout rather than something each page re-checks.
 */
const container = cva('mx-auto w-full px-gutter', {
	variants: {
		width: {
			page: 'max-w-page',
			reading: 'max-w-reading',
			/* Edge-to-edge content that still wants the gutter — a full-bleed
			   backdrop with padded content inside it. */
			full: 'max-w-none',
		},
	},
	defaultVariants: { width: 'page' },
})

export interface ContainerProps
	extends ComponentPropsWithRef<'div'>,
		VariantProps<typeof container> {
	as?: ElementType
}

export function Container({
	as: Component = 'div',
	width,
	className,
	...props
}: ContainerProps) {
	return (
		<Component className={cn(container({ width }), className)} {...props} />
	)
}

export { container as containerVariants }
