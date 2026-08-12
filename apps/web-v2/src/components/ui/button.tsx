import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'
import { Slot } from './slot'

/**
 * The button — the reference implementation of UI_GUIDELINES §1.
 *
 * ALL FIVE STATES LIVE IN THE BASE, not per variant (§1, DESIGN_SYSTEM §9).
 * Repeating them per variant is how a fourth variant ships without a disabled
 * style: the states are a property of "being a button", not of a colour.
 *
 * The focus ring is inherited from the global `:focus-visible` rule at the end
 * of themes.css and is NOT restated here. Restating it means the day one is
 * edited the two disagree with no signal about which wins — the same argument
 * globals.css makes for not repeating the reduced-motion backstop.
 *
 * `.u-press` is the 1px depress from motion.css, which is already inside the
 * reduced-motion backstop. Transform only — nothing here animates a layout
 * property (ANIMATION_GUIDELINES law 3).
 *
 * Sizes are floored at 44px of hit area (UI_GUIDELINES §6): `sm` is visually
 * smaller but keeps a 44px touch target through padding, so a dense toolbar
 * cannot silently produce a control too small to tap.
 */
const button = cva(
	'relative inline-flex items-center justify-center gap-2 rounded-full font-body ' +
		'font-medium no-underline u-press ' +
		'transition-colors duration-fast ease-out-quint ' +
		'disabled:pointer-events-none disabled:opacity-50 ' +
		'aria-disabled:pointer-events-none aria-disabled:opacity-50',
	{
		variants: {
			variant: {
				/*
				 * The call to action. Gradient-filled, and the ordering of the stops
				 * in `--ui-gradient-cta` is what makes that safe: `--ui-accent` is the
				 * FIRST and DARKEST stop, so the `--ui-on-accent` / `--ui-accent` pair
				 * the contrast contract already verifies is the worst case, and every
				 * other pixel of the button has more contrast than the one that was
				 * measured. A gradient running the other way would make the button's
				 * legibility depend on which end the reader looks at, which no
				 * automated check would catch.
				 *
				 * `u-beam` is the sheen that crosses it on hover and on focus —
				 * `:focus-visible` as well as `:hover`, because a pointer-only
				 * flourish on the page's primary action is the exact shape of
				 * UI_GUIDELINES §12's complaint.
				 *
				 * The glow is on `shadow-glow-brand`, not on a border colour change,
				 * so the hover state does not move a single pixel of layout.
				 */
				primary:
					'u-cta-fill text-on-accent u-beam ' +
					'shadow-glow-accent hover:shadow-glow-brand ' +
					'transition-shadow duration-base',
				/* Bordered, surface-filled. Elevation here is border + surface
				   lightness, not shadow — DESIGN_SYSTEM §6. The gradient hairline
				   gives it an edge that catches the page's own light without
				   introducing a second border colour. */
				secondary:
					'u-hairline border border-border-strong bg-surface text-text ' +
					'hover:border-accent-muted hover:bg-surface-hover',
				/* No chrome until interacted with. Still gets a hover surface rather
				   than a colour-only change, because a colour-only hover is invisible
				   to a reader who cannot perceive the hue difference. */
				ghost: 'text-text-muted hover:bg-surface-hover hover:text-text',
				/* A button that reads as a link but is still a button — used where
				   the action does not navigate. Underlined, because "never colour
				   alone" applies to affordances too. */
				link: 'text-accent underline underline-offset-2 hover:text-accent-hover',
			},
			size: {
				sm: 'min-h-11 px-4 py-2 text-sm',
				md: 'min-h-11 px-5 py-2 text-body',
				lg: 'min-h-12 px-7 py-3 text-body',
			},
		},
		defaultVariants: { variant: 'primary', size: 'md' },
	},
)

export type ButtonVariants = VariantProps<typeof button>

export interface ButtonProps
	extends ComponentPropsWithRef<'button'>,
		ButtonVariants {
	/**
	 * Render the child element instead of a `<button>`, keeping these styles.
	 * The way to style a link as a button — UI_GUIDELINES §4: anything that
	 * navigates is an `<a href>`, always, even when it looks like a button.
	 */
	asChild?: boolean
}

export function Button({
	asChild = false,
	variant,
	size,
	className,
	type,
	...props
}: ButtonProps) {
	const Component = asChild ? Slot : 'button'

	return (
		<Component
			// A <button> inside a <form> defaults to type="submit", which is the
			// single most common accidental form submission. Explicit unless the
			// caller says otherwise — and omitted entirely under asChild, where the
			// child is an <a> and `type` would be a meaningless attribute.
			{...(asChild ? {} : { type: type ?? 'button' })}
			className={cn(button({ variant, size }), className)}
			{...props}
		/>
	)
}

export { button as buttonVariants }
