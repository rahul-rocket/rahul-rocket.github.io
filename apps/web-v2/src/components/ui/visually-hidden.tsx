import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Text for assistive technology that is not painted.
 *
 * `sr-only` (Tailwind's, which is the standard clip-rect recipe) rather than
 * `display: none`, `visibility: hidden`, or `opacity: 0` — the first two remove
 * the content from the accessibility tree entirely, which is the opposite of
 * the intent, and the third leaves a focusable element that cannot be seen.
 *
 * This is a LAST resort, not a convenience. Visible text that explains itself
 * beats hidden text that only some readers get: if a control needs a hidden
 * label to make sense, the usual fix is to give it a visible one. The legitimate
 * uses on this site are the heading that names a region already obvious from
 * layout, and the word that disambiguates a repeated link.
 */
export function VisuallyHidden({
	as: Component = 'span',
	className,
	...props
}: ComponentPropsWithRef<'span'> & { as?: ElementType }) {
	return <Component className={cn('sr-only', className)} {...props} />
}
