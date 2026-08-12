import {
	Children,
	type CSSProperties,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

/**
 * `asChild` support — 34 lines instead of a dependency.
 *
 * UI_GUIDELINES §1 mandates `asChild` for polymorphism rather than an `as`
 * prop, and names Radix's `Slot` as the mechanism. TECH_STACK §2 admits
 * shadcn/ui as *copied source* rather than an installed package, and Radix
 * arrives underneath it — but only for the components whose value IS the
 * behaviour Radix implements (focus traps, roving tabindex, correct ARIA on a
 * dialog or a menu). `Slot` is not one of those. It merges props onto a single
 * child element, and it is the only Radix export the token-layer components in
 * this directory need.
 *
 * Pulling `@radix-ui/react-slot` in for it would put a package on the critical
 * path of every route that renders a `<Button asChild>` — Home's headroom is
 * 2.21 KB (docs/TASK_BACKLOG.md, Phase 4) — to buy a function whose entire
 * contract is "clone the child, merge className, merge style, chain handlers".
 * When the first genuinely behavioural component lands (dialog, menu,
 * tooltip), Radix comes with it and this file can be deleted in the same
 * change; until then it is the cheaper half of the trade.
 *
 * The merge rules, stated because they are what a caller depends on:
 *
 *   className   merged through `cn()`, so the child's own utilities win a
 *               Tailwind conflict — the child is the more specific author.
 *   style       merged, child wins per property.
 *   handlers    both run, slot's first, and the child's still runs even if the
 *               slot's called `preventDefault` — suppressing it would make a
 *               composed component behave differently from an uncomposed one.
 *   everything  slot props first, child props override.
 *
 * It deliberately does NOT support multiple children. `<Button asChild>` with
 * two children has no single element to become, and failing loudly at the call
 * site beats silently styling the first one.
 */

/**
 * The props a slotted parent may hand down.
 *
 * The index signature is deliberate and is the one place `unknown` earns its
 * keep here. `Slot` sits in a `asChild ? Slot : 'button'` union at every call
 * site, so TypeScript checks the *caller's* props — button props, anchor props,
 * whatever the host element takes — against this type. Enumerating one host's
 * attributes would reject every other host. `unknown` (never `any`, CLAUDE.md
 * §6) keeps the values opaque, which is why the two typed reads below are
 * explicit casts rather than free property access.
 */
type SlotProps = {
	children?: ReactNode
	className?: string
	style?: CSSProperties
	[prop: string]: unknown
}

export function Slot({ children, ...slotProps }: SlotProps) {
	const child = Children.only(children)

	if (!isValidElement(child)) {
		throw new Error(
			'Slot: `asChild` requires a single React element child. Received a ' +
				'text node or fragment, which has no element to merge props onto.',
		)
	}

	const typed = child as ReactElement<Record<string, unknown>>
	const childProps = typed.props

	return cloneElement(typed, {
		...slotProps,
		...childProps,
		className: cn(
			slotProps.className,
			childProps.className as string | undefined,
		),
		style: {
			...slotProps.style,
			...(childProps.style as CSSProperties | undefined),
		},
		...mergeHandlers(slotProps, childProps),
	})
}

/**
 * Chains every `on*` prop present on both sides. Written generically rather
 * than enumerating onClick/onKeyDown/… because a component that forgets to
 * chain one handler produces a bug that only appears under `asChild`, i.e. in
 * the composition path least likely to be covered by a test.
 */
function mergeHandlers(
	slotProps: Record<string, unknown>,
	childProps: Record<string, unknown>,
): Record<string, unknown> {
	const merged: Record<string, unknown> = {}

	for (const key of Object.keys(slotProps)) {
		if (!key.startsWith('on')) continue

		const slotHandler = slotProps[key]
		const childHandler = childProps[key]

		if (typeof slotHandler !== 'function') continue
		if (typeof childHandler !== 'function') {
			merged[key] = slotHandler
			continue
		}

		merged[key] = (...args: unknown[]) => {
			slotHandler(...args)
			childHandler(...args)
		}
	}

	return merged
}
