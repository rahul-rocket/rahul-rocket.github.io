import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * The long-form container.
 *
 * Everything visual lives in `src/styles/typography.css`, scoped to `.prose`.
 * This component exists so that the measure is applied by a container rather
 * than by the elements inside it (DESIGN_SYSTEM §4) — MDX output has no
 * component to hang classes on, so the wrapper is the only place the rule can
 * be stated.
 *
 * It is also the one place the "no outer margins on children" rule inverts, and
 * typography.css says why: the rhythm between a paragraph and the heading after
 * it is a property of the flow, not of either element.
 */
export function Prose({
	as: Component = 'div',
	className,
	...props
}: ComponentPropsWithRef<'div'> & { as?: ElementType }) {
	return <Component className={cn('prose', className)} {...props} />
}
