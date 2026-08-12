import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Body and meta text.
 *
 * The `subtle` tone is the reason this is a component rather than a pair of
 * utilities. `--ui-text-subtle` is verified at 3:1, which is the AA bar for
 * text at 24px or larger, and it fails 4.5:1 below that — the blog index
 * shipped it at `text-sm` once and axe rejected the page, while
 * `check-contrast.mjs` stayed green because the token met its own contract
 * (DESIGN_SYSTEM §3).
 *
 * So the misuse is blocked in the type system instead: `tone="subtle"` is only
 * reachable through `SubtleText`, which fixes the size at `h3` (1.25rem → 1.5rem
 * — above the 24px large-text threshold at its upper end and never below
 * 18.66px bold). Small secondary text uses `tone="muted"`, whose token carries
 * a 4.5:1 floor.
 */
const text = cva('font-body', {
	variants: {
		size: {
			/*
			 * The one-line purpose statement under a heading, and its own step in
			 * the scale rather than `text-body` with a class on top.
			 *
			 * A lede set at body size under a 5rem headline is not a hierarchy, it
			 * is a caption: the eye jumps from the headline to the buttons and the
			 * sentence explaining the page goes unread. One step up, with leading
			 * tightened from 1.7 to 1.5 because a short block does not need the
			 * open leading that a long one does, is enough to make it the second
			 * thing read instead of the fifth.
			 */
			lede: 'text-lede leading-lede tracking-lede',
			body: 'text-body leading-body tracking-body',
			sm: 'text-sm leading-body tracking-body',
			xs: 'text-xs leading-body tracking-body',
		},
		tone: {
			default: 'text-text',
			muted: 'text-text-muted',
			subtle: 'text-text-subtle',
			accent: 'text-accent',
			/* Status tones. Never the only signal — DESIGN_SYSTEM §3 "never colour
			   alone" — so each of these is expected to accompany an icon or a word,
			   which is why there is no `status` component that renders colour by
			   itself. */
			success: 'text-success',
			warning: 'text-warning',
			danger: 'text-danger',
		},
		/* Uppercase eyebrow labels. Applied to SHORT labels only: DESIGN_SYSTEM
		   §4 bans uppercase on multi-word headings because it harms scanning and
		   is mispronounced by some screen-reader engines. */
		caps: { true: 'uppercase tracking-caps', false: '' },
	},
	defaultVariants: { size: 'body', tone: 'default', caps: false },
})

export interface TextProps
	extends Omit<ComponentPropsWithRef<'p'>, 'color'>,
		Omit<VariantProps<typeof text>, 'tone'> {
	/** `p` by default; `span`, `dd`, `figcaption`, `time` where meaning differs. */
	as?: ElementType
	tone?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger'
}

export function Text({
	as: Component = 'p',
	size,
	tone,
	caps,
	className,
	...props
}: TextProps) {
	return (
		<Component
			className={cn(text({ size, tone, caps }), className)}
			{...props}
		/>
	)
}

/**
 * The only door to `--ui-text-subtle`, and it locks the size open at the
 * large-text step. See the note above: this token is a large-text token, and
 * that is a constraint rather than a hint.
 */
export function SubtleText({
	as: Component = 'p',
	caps,
	className,
	...props
}: Omit<TextProps, 'size' | 'tone'>) {
	return (
		<Component
			className={cn(
				text({ tone: 'subtle', caps }),
				'text-h3 leading-heading',
				className,
			)}
			{...props}
		/>
	)
}

export { text as textVariants }
