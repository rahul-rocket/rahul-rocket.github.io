import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * A small label — a tag, a status, a category.
 *
 * THE STATUS TONES CARRY A CONSTRAINT: colour is never the signal
 * (DESIGN_SYSTEM §3, CLAUDE.md §8). A badge reading "Draft" in warning colours
 * is fine because the word is the signal and the colour is emphasis; a badge
 * containing only a coloured dot is not, and there is no icon-only variant here
 * for that reason.
 *
 * `--ui-*-muted` backgrounds are avoided for the status tones: a tinted fill
 * behind small text is where the 4.5:1 floor quietly dies. These are a hairline
 * plus coloured text on the page surface, which is a pair `check:contrast`
 * already verifies.
 *
 * Not a button. A badge that filters a list is a `<button>` and belongs to the
 * feature that owns the filter — `asChild` is deliberately absent so that a
 * "clickable badge" cannot be assembled here without the states a control needs.
 */
const badge = cva(
	'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ' +
		'font-body text-xs leading-none whitespace-nowrap ' +
		'transition-colors duration-fast ease-out-quint',
	{
		variants: {
			tone: {
				/*
				 * `bg-bg-subtle`, and it is worth noting WHY that is newly allowed.
				 *
				 * This role had no pair in the contrast contract until DS-12 closed
				 * that hole — which is precisely why it had to be avoided: a surface
				 * the checker cannot see is a surface that can silently fail, and it
				 * did, on four routes at M7. `check-contrast.mjs` now asserts text,
				 * muted text, subtle meta, accent and the strong border against it in
				 * every theme and every tone, so it is as verified as `--ui-surface`
				 * and may be used like it.
				 *
				 * The visual reason to want it: a badge filled with `--ui-surface` is
				 * the same colour as the card it usually sits on, so it reads as an
				 * outline rather than as a chip. One step off the card is what makes
				 * it an object.
				 */
				neutral: 'border-border bg-bg-subtle text-text-muted',
				accent: 'border-accent-muted bg-bg-subtle text-accent',
				success: 'border-border bg-bg-subtle text-success',
				warning: 'border-border bg-bg-subtle text-warning',
				danger: 'border-border bg-bg-subtle text-danger',
			},
		},
		defaultVariants: { tone: 'neutral' },
	},
)

export interface BadgeProps
	extends ComponentPropsWithRef<'span'>,
		VariantProps<typeof badge> {
	/** `li` inside a tag list — a list of things is a list, UI_GUIDELINES §4. */
	as?: ElementType
}

export function Badge({
	as: Component = 'span',
	tone,
	className,
	...props
}: BadgeProps) {
	return <Component className={cn(badge({ tone }), className)} {...props} />
}

export { badge as badgeVariants }
