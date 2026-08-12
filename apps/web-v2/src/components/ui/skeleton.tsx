import type { ComponentPropsWithRef, CSSProperties } from 'react'
import { cn } from '@/lib/cn'

/**
 * A placeholder that matches the geometry of the thing it replaces.
 *
 * UI_GUIDELINES §9: skeletons match final geometry so nothing shifts when the
 * content arrives. Under `output: 'export'` there is no loading state for
 * content — every page is pre-rendered — so this exists for the client-filtered
 * views (a project list re-sorting, a search result set) and nothing else. If
 * you are reaching for it on a static page, the page is doing something at
 * runtime it does not need to do.
 *
 * THE PULSE IS NOT A SPINNER AND CARRIES NO INFORMATION. It is `opacity` only —
 * law 3 — and the global reduced-motion backstop in themes.css flattens it to a
 * static block, which is a complete design rather than a degraded one.
 *
 * `aria-hidden` plus a live region owned by the CALLER. A skeleton announced by
 * a screen reader says nothing useful ("blank, blank, blank"); the caller
 * announces "Loading projects" once, in words.
 */
export function Skeleton({
	className,
	width,
	height,
	style,
	...props
}: Omit<ComponentPropsWithRef<'div'>, 'children'> & {
	/** Any CSS length. Both are required in spirit: geometry is the point. */
	width?: CSSProperties['width']
	height?: CSSProperties['height']
}) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				'animate-pulse rounded-md bg-surface-hover motion-reduce:animate-none',
				className,
			)}
			style={{ width, height, ...style }}
			{...props}
		/>
	)
}
