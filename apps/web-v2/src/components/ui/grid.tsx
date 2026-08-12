import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Two-dimensional layout, mobile-first.
 *
 * The breakpoints are the five in DESIGN_SYSTEM §5 — `sm 640 · md 768 · lg 1024
 * · xl 1280 · 2xl 1536`, declared as tokens in globals.css so the documented
 * numbers and Tailwind's are provably the same set rather than two lists that
 * happen to agree today.
 *
 * The variants stop at `md` and `lg`, and that is §5's rule made structural:
 * "layout decisions are made at `lg` and `xl`; `sm`/`md` mostly adjust type and
 * padding". A column count that changes at four breakpoints is a layout nobody
 * can hold in their head, and the fix is a `minItemWidth` grid, below.
 *
 * `as="ul"` for a card grid. A grid of things IS a list (UI_GUIDELINES §4), and
 * `display: grid` on a `<ul>` does not remove its list semantics in any engine
 * this site supports — except Safari with `list-style: none`, which is why
 * `role="list"` is restored explicitly.
 */
const grid = cva('grid', {
	variants: {
		cols: {
			1: 'grid-cols-1',
			2: 'grid-cols-1 md:grid-cols-2',
			3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
			4: 'grid-cols-2 lg:grid-cols-4',
			/* The 12-column layout grid, for compositions that place items by
			   span rather than by count. */
			12: 'grid-cols-12',
		},
		gap: {
			2: 'gap-2',
			4: 'gap-4',
			6: 'gap-6',
			8: 'gap-8',
			12: 'gap-12',
		},
	},
	defaultVariants: { cols: 3, gap: 6 },
})

export interface GridProps
	extends ComponentPropsWithRef<'div'>,
		VariantProps<typeof grid> {
	as?: ElementType
}

export function Grid({
	as: Component = 'div',
	cols,
	gap,
	className,
	...props
}: GridProps) {
	const isList = Component === 'ul' || Component === 'ol'

	return (
		<Component
			// Safari drops list semantics when `list-style: none` is applied, which
			// Preflight does to every ul. Restoring the role is the documented fix
			// and costs nothing where it is not needed.
			{...(isList ? { role: 'list' } : {})}
			className={cn(grid({ cols, gap }), className)}
			{...props}
		/>
	)
}

/**
 * A grid that decides its own column count from the space available.
 *
 * `repeat(auto-fit, minmax(…, 1fr))` — the track sizing lives in `utilities.css`
 * because it is a value, not a decision, and a component full of
 * `grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]` is the arbitrary-value smell
 * UI_GUIDELINES §1 rules out.
 *
 * Prefer this to `Grid` whenever the item count is content-driven. It is the
 * answer to "the layout needs a fourth breakpoint": it reflows continuously, so
 * it is also already correct at 400% zoom (WCAG 1.4.10), where a fixed
 * three-column grid has to be walked back one breakpoint at a time.
 *
 * The `min(…, 100%)` inside the utility is not optional — a bare `minmax(18rem,
 * 1fr)` overflows any container narrower than 18rem, which is a 320px viewport
 * with the gutter applied. That is the horizontal scroll UI_GUIDELINES §5 bans.
 */
const autoGrid = cva('grid', {
	variants: {
		min: {
			sm: 'u-autofit-sm',
			md: 'u-autofit-md',
			lg: 'u-autofit-lg',
		},
		gap: {
			2: 'gap-2',
			4: 'gap-4',
			6: 'gap-6',
			8: 'gap-8',
			12: 'gap-12',
		},
	},
	defaultVariants: { min: 'md', gap: 6 },
})

export interface AutoGridProps
	extends ComponentPropsWithRef<'div'>,
		VariantProps<typeof autoGrid> {
	as?: ElementType
}

export function AutoGrid({
	as: Component = 'div',
	min,
	gap,
	className,
	...props
}: AutoGridProps) {
	const isList = Component === 'ul' || Component === 'ol'

	return (
		<Component
			{...(isList ? { role: 'list' } : {})}
			className={cn(autoGrid({ min, gap }), className)}
			{...props}
		/>
	)
}

export { autoGrid as autoGridVariants, grid as gridVariants }
