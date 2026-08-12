import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Vertical rhythm, owned by the section wrapper.
 *
 * DESIGN_SYSTEM §5's rule in component form: "vertical rhythm is owned by the
 * section wrapper, never by margins on the last child". Every page is a stack
 * of these, and no component inside one carries an outer margin — which is what
 * makes a component reusable in a layout its author never saw
 * (UI_GUIDELINES §5).
 *
 * `--space-section` is `clamp(4rem, 10vw, 9rem)`, so the rhythm scales with the
 * viewport without a single breakpoint.
 *
 * A `<section>` element with no accessible name is a generic region and adds
 * nothing to the outline, so `labelledBy` is the normal case: point it at the
 * id of the heading the section is about, and assistive technology can navigate
 * by region. Where no heading exists, `as="div"` is honest — a nameless
 * `<section>` is not.
 */
const section = cva('', {
	variants: {
		spacing: {
			section: 'py-section',
			/* Half rhythm, for a subsection that belongs to the block above it
			   rather than standing on its own. */
			compact: 'py-12',
			/* The first section on a page sits under a sticky header that already
			   occupies 4.5rem; a full section pad below it reads as a hole. */
			lead: 'pt-12 pb-section',
			none: '',
		},
		/*
		 * `subtle` WAS DELIBERATELY ABSENT FROM THIS LIST, AND IS HERE NOW BECAUSE
		 * DS-12 CLOSED THE HOLE THAT KEPT IT OUT.
		 *
		 * The old note read: "`--ui-bg-subtle` has no text pair in the contrast
		 * contract, so `check:contrast` cannot see a failure on it — axe found one
		 * in the footer. A section always carries text, so offering it here would
		 * be offering the one surface that is not verified to hold any." That was
		 * exactly right, and the fix was never to keep avoiding the role: it was
		 * to give it the five assertions every other surface already had.
		 * `scripts/check-contrast.mjs` now checks text, muted text, subtle meta,
		 * accent and the strong border against it, in both themes and all five
		 * tones. It is verified, so it is offered.
		 *
		 * It earns its place visually too. A page that alternates `none` and
		 * `subtle` between sections has a rhythm the mesh alone cannot give it —
		 * the wash is continuous by design, so section boundaries need a
		 * discontinuity of their own.
		 */
		surface: {
			none: '',
			subtle: 'bg-bg-subtle',
			raised: 'bg-surface',
		},
	},
	defaultVariants: { spacing: 'section', surface: 'none' },
})

export interface SectionProps
	extends ComponentPropsWithRef<'section'>,
		VariantProps<typeof section> {
	as?: ElementType
	/** Id of the heading that names this region — becomes `aria-labelledby`. */
	labelledBy?: string
}

export function Section({
	as: Component = 'section',
	spacing,
	surface,
	labelledBy,
	className,
	...props
}: SectionProps) {
	return (
		<Component
			aria-labelledby={labelledBy}
			className={cn(section({ spacing, surface }), className)}
			{...props}
		/>
	)
}

export { section as sectionVariants }
