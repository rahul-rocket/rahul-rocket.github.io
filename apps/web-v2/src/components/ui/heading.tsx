import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * A heading whose SIZE and LEVEL are separate props, which is the entire
 * reason this component exists.
 *
 * UI_GUIDELINES §4 calls "a heading level chosen for its size" a blocker, and
 * bare `<h2 className="text-h3">` is exactly the shape that invites it: the
 * level and the size sit in the same place and the author picks whichever looks
 * right. Splitting them makes the document outline a deliberate decision — you
 * cannot write this component without saying, separately, what the heading
 * *means* and how big it is.
 *
 * `size` defaults to the level's natural step, so the common case stays short
 * and only a deliberate mismatch is verbose.
 *
 * Tracking tightens as size grows. That is optical correction, not decoration:
 * the same letter-spacing that reads as generous at body size reads as loose at
 * 8rem (DESIGN_SYSTEM §4, tokens.css).
 */
const heading = cva('font-heading text-text text-balance', {
	variants: {
		size: {
			mega: 'text-mega leading-mega tracking-mega',
			display: 'text-display leading-display tracking-display',
			h1: 'text-h1 leading-heading tracking-heading',
			h2: 'text-h2 leading-heading tracking-heading',
			h3: 'text-h3 leading-heading tracking-heading',
		},
	},
	defaultVariants: { size: 'h2' },
})

type HeadingSize = NonNullable<VariantProps<typeof heading>['size']>

/** 1–6, not `h1`-style strings: the number is the outline depth, not a tag. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * The size a level gets when the caller does not say. Levels 4–6 exist in the
 * outline but have no distinct step in the type scale — DESIGN_SYSTEM §4 stops
 * at h3 deliberately (a constrained scale, §1.4), and a document nesting six
 * levels deep has a structure problem that a seventh font size would hide.
 */
const SIZE_FOR_LEVEL: Record<HeadingLevel, HeadingSize> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h3',
	5: 'h3',
	6: 'h3',
}

/**
 * The sizes a gradient fill is permitted on — DS-14.
 *
 * THE RULE IS THE WCAG LARGE-TEXT THRESHOLD, NOT A TASTE JUDGEMENT, which is
 * what makes it checkable rather than arguable. `--ui-gradient-text` holds
 * `--ui-text` for its first third and only then runs into the spectrum, so the
 * tail of a gradient heading sits below the 4.5:1 body-text floor and above the
 * 3:1 large-text one. WCAG defines large text as 24px, or 18.66px bold.
 *
 * So the permitted set is exactly the steps whose SMALLEST clamp value clears
 * 24px, because a size that qualifies only on a desktop viewport does not
 * qualify:
 *
 *   mega     52px → 128px   ✓
 *   display  44px →  88px   ✓
 *   h1       32px →  52px   ✓
 *   h2       24px →  34px   ✗ — exactly at the threshold, no margin
 *   h3       20px →  24px   ✗ — below it at every viewport that matters
 *
 * Enforced as a type, so `<Heading size="h3" gradient />` does not compile.
 * Small gradient text is the most common way this effect is misused and is the
 * reason it usually reads as amateur; here it cannot be written.
 */
const GRADIENT_SIZES = ['mega', 'display', 'h1'] as const
type GradientSize = (typeof GRADIENT_SIZES)[number]

interface HeadingBaseProps
	extends Omit<ComponentPropsWithRef<'h2'>, 'color'>,
		VariantProps<typeof heading> {
	/** Outline depth. Chosen from document structure, never from appearance. */
	level: HeadingLevel
}

export type HeadingProps = HeadingBaseProps &
	(
		| {
				/**
				 * Fill the heading with the brand gradient. Display sizes only.
				 *
				 * Degrades to solid `--ui-text` wherever `background-clip: text` does
				 * not apply, and to solid black in print — both handled in CSS, so
				 * there is no state in which this produces an invisible heading. See
				 * the note on `.u-gradient-text` in utilities.css.
				 */
				gradient: true
				size: GradientSize
		  }
		| { gradient?: false; size?: HeadingBaseProps['size'] }
	)

export function Heading({
	level,
	size,
	gradient,
	className,
	...props
}: HeadingProps) {
	const Component = `h${level}` as const

	return (
		<Component
			className={cn(
				heading({ size: size ?? SIZE_FOR_LEVEL[level] }),
				gradient && 'u-gradient-text',
				className,
			)}
			{...props}
		/>
	)
}

export { heading as headingVariants }
