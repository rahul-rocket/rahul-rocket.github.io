'use client'

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { useReveal } from '@/lib/hooks/use-reveal'

interface RevealOwnProps {
	/** Render as something other than a `<div>` — usually `section` or `li`. */
	as?: ElementType
	/**
	 * Animate the direct children in sequence instead of the element itself.
	 * Delays come from CSS `nth-child`, so this costs no additional JavaScript.
	 */
	stagger?: boolean
	/** Travel distance. Defaults to the 24px in docs/ANIMATION_GUIDELINES.md §3. */
	distance?: number
	children: ReactNode
}

export type RevealProps = RevealOwnProps &
	Omit<ComponentPropsWithoutRef<'div'>, keyof RevealOwnProps>

/**
 * Scroll reveal.
 *
 * The component is deliberately thin: it attaches a ref and two data
 * attributes, and every visual decision lives in src/styles/motion.css. That
 * split is the point — see the header of that file for why the ordering of its
 * selectors is the no-JS guarantee rather than a convention.
 *
 * What this renders on the server is a plain element with no hidden state. The
 * attribute that hides it is added after hydration, and only to elements that
 * are off-screen at mount (`shouldArm`). So:
 *
 *   JavaScript disabled   → visible
 *   Hydration fails       → visible
 *   Observer never fires  → visible
 *   Reduced motion        → visible
 *   Above the fold        → visible, and never animated
 *
 * There is no path that strands content at `opacity: 0`, which is what
 * `e2e/no-js.spec.ts` asserts.
 *
 * NOTE: this is a client component, and it is one of only nine on Home
 * (docs/redesign/COMPONENT_INVENTORY.md §8). It stays cheap because it holds no
 * state and subscribes to a shared observer — adding a hundred of them to a
 * page adds a hundred observed elements, not a hundred observers.
 *
 * IT PASSES `className` THROUGH RATHER THAN CALLING `cn()`, AND THAT IS WORTH
 * 8.7 KB GZ ON HOME.
 *
 * This used to read `className={cn(className)}` — `cn` with a single argument,
 * which merges nothing, resolves no conflict, and differs from the bare value
 * only in rendering `class=""` instead of omitting the attribute. What it did do
 * was pull `tailwind-merge` and its table of conflicting utility groups into the
 * client bundle. Home is the route with the least headroom (120 KB hard limit,
 * docs/PERFORMANCE.md §2) and this was **8.7 KB of it** — the single largest
 * item on the route, spent on a no-op.
 *
 * The rule this leaves behind: `cn` is free in a Server Component and expensive
 * in a Client Component. `components/ui/icon.tsx` carries the same note for the
 * same reason.
 */
export function Reveal({
	as: Component = 'div',
	stagger = false,
	distance,
	className,
	children,
	style,
	...rest
}: RevealProps) {
	const ref = useReveal<HTMLDivElement>()

	return (
		<Component
			ref={ref}
			data-reveal=""
			{...(stagger ? { 'data-stagger': '' } : {})}
			className={className}
			style={
				distance === undefined
					? style
					: { ...style, '--reveal-distance': `${distance}px` }
			}
			{...rest}
		>
			{children}
		</Component>
	)
}
