import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'
import { Text } from './text'

/**
 * The small mono label with a rule leading into it — the site's one repeated
 * typographic device.
 *
 * PROMOTED FROM `features/home/`, AND THE PROMOTION RULE IS WHY IT MOVED NOW
 * RATHER THAN EARLIER. ARCHITECTURE §4 allows a component into `ui/` when it is
 * "used by 2+ features, has no domain vocabulary in its props, and has a stable
 * API". It sat in the home feature through four uses because four uses by ONE
 * feature is repetition, not generality — a primitive promoted on that evidence
 * is how a design system fills with components nobody outside one page calls.
 *
 * What changed is `PageHeader`, which had been carrying its own hand-rolled
 * copy of the same treatment: a `text-xs` accent mono label with a
 * `before:h-px before:w-8` rule. That is the second caller, it lives in
 * `components/layout/`, and `components/` may not import from `features/` —
 * so the choice was to promote it or to keep two implementations of one device
 * that would drift apart on the first tuning pass. The duplicate is gone.
 *
 * The rule is a `::before` with no content, so it is decoration the
 * accessibility tree never sees and there is no `aria-hidden` to remember.
 *
 * `cn` is free here — this is a Server Component and nothing under it carries
 * `'use client'`, so `tailwind-merge` never reaches the browser (CLAUDE.md §10).
 */
export interface EyebrowProps
	extends Omit<ComponentPropsWithRef<'p'>, 'color'> {
	/** `p` by default; `span` where it sits inside a heading or a label. */
	as?: ElementType
}

export function Eyebrow({ as, className, ...props }: EyebrowProps) {
	return (
		<Text
			as={as}
			size="xs"
			tone="accent"
			caps
			className={cn(
				"inline-flex items-center gap-3 font-mono before:h-px before:w-8 before:bg-accent before:content-['']",
				className,
			)}
			{...props}
		/>
	)
}
