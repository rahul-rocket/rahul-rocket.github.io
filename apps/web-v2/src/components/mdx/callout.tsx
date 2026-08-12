import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import {
	AlertTriangleIcon,
	InfoIcon,
	LightbulbIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/cn'

/**
 * B-06 — `Callout`. docs/BLOG_SYSTEM.md §6.
 *
 * NEVER COLOUR ALONE (CLAUDE.md §8). Each variant carries an icon *and* a word,
 * so the distinction between a note and a warning survives greyscale, a
 * colour-vision deficiency, and Windows High Contrast Mode — where the tinted
 * left border is the first thing the OS discards.
 *
 * The visible label is real text rather than an `aria-label` on the container,
 * because a sighted reader needs the same signal a screen-reader user gets. It
 * is a `<p>` and not a heading: a callout inside a post must not appear in the
 * document outline, or the table of contents fills with "Note".
 *
 * `role` is deliberately absent. `role="note"` is mapped inconsistently and
 * adds nothing a labelled aside does not already give; `role="alert"` would be
 * actively wrong, since nothing here is time-sensitive and it would interrupt a
 * reader mid-sentence.
 */
const callout = cva(
	'my-8 flex gap-3 rounded-md border border-l-2 p-4 text-body leading-body',
	{
		variants: {
			variant: {
				note: 'border-border border-l-accent bg-surface',
				tip: 'border-border border-l-success bg-surface',
				warning: 'border-border border-l-warning bg-surface',
			},
		},
		defaultVariants: { variant: 'note' },
	},
)

const ICONS = {
	note: InfoIcon,
	tip: LightbulbIcon,
	warning: AlertTriangleIcon,
} as const

const LABELS = {
	note: 'Note',
	tip: 'Tip',
	warning: 'Warning',
} as const

export interface CalloutProps
	extends Omit<ComponentPropsWithRef<'aside'>, 'title'>,
		VariantProps<typeof callout> {
	/** Overrides the variant's word. The word itself is never removed. */
	title?: string
	children: ReactNode
}

export function Callout({
	variant = 'note',
	title,
	className,
	children,
	...props
}: CalloutProps) {
	const resolved = variant ?? 'note'
	const IconComponent = ICONS[resolved]
	const label = title ?? LABELS[resolved]

	return (
		<aside
			aria-label={label}
			className={cn(callout({ variant }), className)}
			{...props}
		>
			<IconComponent
				size="sm"
				className={
					resolved === 'warning'
						? 'mt-1 text-warning'
						: resolved === 'tip'
							? 'mt-1 text-success'
							: 'mt-1 text-accent'
				}
			/>
			<div className="flex min-w-0 flex-col gap-1">
				<p className="font-heading text-text text-xs uppercase tracking-caps">
					{label}
				</p>
				<div className="[&>*+*]:mt-3 [&_p]:text-text-muted">{children}</div>
			</div>
		</aside>
	)
}
