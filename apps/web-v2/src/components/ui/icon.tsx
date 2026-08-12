import type { ComponentPropsWithRef, ReactNode } from 'react'

/**
 * The icon primitive — geometry in, accessible SVG out.
 *
 * DESIGN_SYSTEM §8 specifies Lucide, rendered at 16/20/24px with
 * `stroke-width: 1.75`, one set, no icon fonts. This component owns the second
 * half of that sentence: every icon on the site is drawn through here, so the
 * size steps and the stroke weight cannot drift per call site.
 *
 * WHY THE GEOMETRY IS VENDORED RATHER THAN `lucide-react` INSTALLED.
 *
 * TECH_STACK §2's rule for shadcn/ui is "copied source, not an installed
 * package", and the argument applies harder here: a Lucide icon is ~15 lines of
 * path data with no behaviour, the set this site uses is small enough to read
 * in one screen, and Home's byte headroom is 2.21 KB against a hard 120 KB gate
 * (docs/TASK_BACKLOG.md, Phase 4). Vendoring keeps the icons free of a package
 * boundary that per-icon deep imports have to be defended across, and it makes
 * "one set" (§8) structural: there is one file, and adding a second set means
 * visibly pasting a foreign shape into it.
 *
 * The paths in `icons.tsx` are Lucide's, ISC-licensed, © Lucide Contributors.
 *
 * ACCESSIBILITY IS THE DEFAULT, NOT A PROP YOU MUST REMEMBER. An icon is
 * `aria-hidden` unless it is given a `label`, which is §8's rule inverted into
 * the API: the failure mode of a naked `<svg>` in a button is a control that
 * announces as "button", and it is silent, so the safe case is the one that
 * needs no thought. Passing `label` produces `role="img"` and an accessible
 * name — for the case where the icon IS the whole control's content.
 */

const SIZE_CLASS = {
	sm: 'size-4', // 16px
	md: 'size-5', // 20px
	lg: 'size-6', // 24px
} as const

/**
 * THIS FILE DELIBERATELY DOES NOT USE `cn()`, AND THE REASON IS MEASURED.
 *
 * `cn` is clsx + `tailwind-merge`, and `tailwind-merge` is **8.7 KB gzipped** —
 * it carries a table of every conflicting Tailwind utility group. That is free
 * in a Server Component and it is not free here: `icons.tsx` is the one part of
 * the design system a Client Component is most likely to reach for, and the
 * first one that did (the command palette, L-13) pulled `tailwind-merge` into
 * the shared client chunk of **every route** — +8.7 KB gz across the board,
 * which put Home 838 B over its 120 KB hard limit. Two icons in a search box are
 * not worth a route-wide budget breach (docs/PERFORMANCE.md §2).
 *
 * What is lost is conflict resolution: `<Icon size="md" className="size-8" />`
 * now emits both classes and lets CSS source order decide, where `cn` would have
 * dropped `size-5`. That is not a real use — `size` is a prop precisely so that
 * the three steps in DESIGN_SYSTEM §8 are the only sizes, and overriding it
 * through `className` was never supported. Every real `className` on an icon in
 * this codebase is a colour, which does not conflict with anything here.
 *
 * The rest of `components/ui/` still uses `cn`, correctly: those components have
 * `cva` variants a caller genuinely may need to override, and none of them is a
 * Client Component.
 */
function iconClass(size: keyof typeof SIZE_CLASS, className?: string): string {
	return className
		? `shrink-0 ${SIZE_CLASS[size]} ${className}`
		: `shrink-0 ${SIZE_CLASS[size]}`
}

export interface IconProps
	extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
	/** 16 / 20 / 24px — the three steps in DESIGN_SYSTEM §8, and no others. */
	size?: keyof typeof SIZE_CLASS
	/**
	 * Accessible name. Set ONLY when the icon is the sole content of a control;
	 * an icon beside a text label must stay hidden or it is announced twice.
	 */
	label?: string
	children: ReactNode
}

export function Icon({
	size = 'md',
	label,
	className,
	children,
	...props
}: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			// `currentColor` is what makes an icon a token consumer: it inherits the
			// text colour of whatever it sits in, so it is correct in both themes
			// and in every variant without a colour prop.
			stroke="currentColor"
			// 1.75 in a 24-unit viewBox, so it scales with the box: the line stays
			// optically the same weight at 16, 20, and 24px rather than growing
			// heavier as the icon gets smaller.
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={iconClass(size, className)}
			// Written out rather than spread from a conditional object: Biome's
			// `noSvgWithoutTitle` reads the JSX attributes literally, and a spread
			// hides `aria-hidden` from it — which would mean the lint rule guarding
			// exactly this invariant silently stopped guarding it.
			role={label === undefined ? undefined : 'img'}
			aria-label={label}
			aria-hidden={label === undefined ? 'true' : undefined}
			// An <svg> is focusable in older Edge/IE; a decorative icon inside a
			// button must not be its own tab stop.
			focusable="false"
			{...props}
		>
			{children}
		</svg>
	)
}

/**
 * Builds a named icon component from its path data.
 *
 * The indirection buys one thing worth having: an icon cannot be defined
 * without going through `Icon`, so no icon in the codebase can carry its own
 * viewBox, stroke weight, or size scale.
 */
export function createIcon(displayName: string, paths: ReactNode) {
	function IconComponent(props: Omit<IconProps, 'children'>) {
		return <Icon {...props}>{paths}</Icon>
	}

	IconComponent.displayName = displayName
	return IconComponent
}
