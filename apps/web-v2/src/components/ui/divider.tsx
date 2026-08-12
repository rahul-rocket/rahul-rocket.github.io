import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * A rule.
 *
 * `<hr>`, which has an implicit `role="separator"` and needs no ARIA — the
 * first rule of ARIA is not to use ARIA (CLAUDE.md §7). Decorative rules are
 * `aria-hidden`, because a separator announced between every card in a grid is
 * noise, and that is the common case rather than the exception.
 *
 * `gradient` is the hairline from surfaces.css: a fade rather than a hard line,
 * used where a full-strength border would cut the page in half. It is a
 * background, not a border, so it cannot be a `border-*` utility.
 */
const divider = cva('m-0 border-0', {
	variants: {
		orientation: {
			horizontal: 'h-px w-full',
			vertical: 'h-full w-px self-stretch',
		},
		tone: {
			default: 'bg-border',
			strong: 'bg-border-strong',
			/* The class, not `bg-[image:var(--ui-hairline-gradient)]`: Tailwind has
			   no background-image namespace to bridge the gradient into, and an
			   arbitrary value in the markup is the smell UI_GUIDELINES §1 rules
			   out. Defined in utilities.css. */
			gradient: 'u-hairline-fade',
		},
	},
	defaultVariants: { orientation: 'horizontal', tone: 'default' },
})

export interface DividerProps
	extends ComponentPropsWithRef<'hr'>,
		VariantProps<typeof divider> {
	/**
	 * Set when the rule carries meaning — a thematic break between two sections
	 * of prose. Default is decorative, and decorative rules are not announced.
	 */
	isSemantic?: boolean
}

export function Divider({
	orientation,
	tone,
	isSemantic = false,
	className,
	...props
}: DividerProps) {
	return (
		<hr
			aria-hidden={isSemantic ? undefined : 'true'}
			aria-orientation={
				isSemantic && orientation === 'vertical' ? 'vertical' : undefined
			}
			className={cn(divider({ orientation, tone }), className)}
			{...props}
		/>
	)
}

export { divider as dividerVariants }
