import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * One-dimensional layout: `gap`, never margins.
 *
 * "Space is the parent's job" (UI_GUIDELINES §5) needs a parent that does the
 * job. This is it. The gap steps are the 4px scale from DESIGN_SYSTEM §5 —
 * Tailwind's own `--spacing` multiples, which produce identical values, so
 * there is one spelling of each number rather than two (see the note in
 * globals.css about not bridging `--space-1…24`).
 *
 * `align`/`justify` are exposed because they are layout of the CHILDREN, which
 * is the parent's business. Anything that is layout of the stack ITSELF —
 * width, position, its own margin — belongs to *its* parent and is not a prop
 * here.
 */
const stack = cva('flex', {
	variants: {
		direction: {
			column: 'flex-col',
			row: 'flex-row',
			/* Column on mobile, row from `md`. The single most common responsive
			   stack, spelled once so it is not re-derived per component. */
			responsive: 'flex-col md:flex-row',
		},
		gap: {
			0: 'gap-0',
			1: 'gap-1',
			2: 'gap-2',
			3: 'gap-3',
			4: 'gap-4',
			6: 'gap-6',
			8: 'gap-8',
			12: 'gap-12',
			16: 'gap-16',
		},
		align: {
			start: 'items-start',
			center: 'items-center',
			end: 'items-end',
			baseline: 'items-baseline',
			stretch: 'items-stretch',
		},
		justify: {
			start: 'justify-start',
			center: 'justify-center',
			end: 'justify-end',
			between: 'justify-between',
		},
		/* Off by default. A stack that wraps changes its own height, so it opts
		   in where the layout can absorb that — a tag list, not a header row. */
		wrap: { true: 'flex-wrap', false: 'flex-nowrap' },
	},
	defaultVariants: {
		direction: 'column',
		gap: 4,
		align: 'stretch',
		justify: 'start',
		wrap: false,
	},
})

export interface StackProps
	extends ComponentPropsWithRef<'div'>,
		VariantProps<typeof stack> {
	/** `ul`/`ol` where the children are a list of things — UI_GUIDELINES §4. */
	as?: ElementType
}

export function Stack({
	as: Component = 'div',
	direction,
	gap,
	align,
	justify,
	wrap,
	className,
	...props
}: StackProps) {
	return (
		<Component
			className={cn(stack({ direction, gap, align, justify, wrap }), className)}
			{...props}
		/>
	)
}

export { stack as stackVariants }
