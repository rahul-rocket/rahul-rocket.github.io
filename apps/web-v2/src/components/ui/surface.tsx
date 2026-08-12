import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

/**
 * Elevation — three levels, and a fourth means the layout is confused
 * (DESIGN_SYSTEM §6).
 *
 * ELEVATION IS NOT SHADOW-FIRST. On near-black, a shadow is invisible; depth
 * comes from surface lightness plus a 1px border. The shadow token appears on
 * exactly one level here — `overlay` — which is the only one that genuinely
 * floats above the document: dialog, popover, dropdown.
 *
 * `glass` is the composed surface from redesign/DESIGN_SYSTEM §2.1, and it
 * carries that document's three hard rules with it. Two of them are enforced
 * here, one cannot be:
 *
 *   - Never animated. Nothing in this variant transitions, and `backdrop-filter`
 *     is not in any transition property in the codebase.
 *   - Opaque fallback. `@supports not (backdrop-filter)` in surfaces.css falls
 *     back to `--ui-surface-raised`; that is a complete design, not a degraded
 *     one.
 *   - "Only on small, fixed-position surfaces" is a JUDGEMENT the type system
 *     cannot make. A blurred surface re-samples everything behind it every
 *     frame — free at header size, 8–15ms/frame on a mid-range Android at
 *     section size. If you are reaching for `glass` on something that scrolls
 *     with the page, the answer is `raised`.
 */
const surface = cva('', {
	variants: {
		level: {
			/* Level 0 — flush with the page. A boundary, not a plane. */
			flat: 'bg-bg border border-border',
			/*
			 * Level 1 — the card plane.
			 *
			 * `shadow-sm` is new and it is a LIGHT-THEME fix, not a decoration. The
			 * dark theme builds elevation from surface lightness plus a hairline
			 * (DESIGN_SYSTEM §6) and barely renders this shadow at all. The light
			 * theme has the opposite problem: `--ui-surface` is pure white on an
			 * off-white page, so a bordered card with no shadow reads as a drawn
			 * rectangle rather than as an object above the page — which is most of
			 * why the light theme looked like an unstyled document.
			 *
			 * The token is defined per theme, so one class buys the right answer in
			 * both: near-invisible on near-black, and a spectrum-tinted contact
			 * shadow on paper.
			 *
			 * `u-card-fill` is the lit gradient — see `--ui-card-fill` in
			 * surfaces.css. It is applied ON TOP of `bg-surface` rather than instead
			 * of it, deliberately: `background-image` is one of the properties print
			 * and forced-colors modes drop, and the flat colour underneath is exactly
			 * the one `check:contrast` measures text against. The card degrades to
			 * the card the checker verified.
			 */
			raised: 'u-card-fill bg-surface border border-border shadow-sm',
			/* Level 2 — floating. Dialog, popover, dropdown. */
			overlay: 'bg-surface-raised border border-border shadow-overlay',
			/* Level 2, translucent. Header, command palette, mobile sheet. */
			glass: 'bg-glass border border-glass-border u-glass',
			/*
			 * Level 2, translucent, and LARGE — the proof strip, the CTA panel.
			 *
			 * Separate from `glass` because blur cost scales with area and these
			 * are section-sized. It uses the lighter `--ui-glass-panel-blur`, and
			 * the same hard rule still applies: fixed-size, never animated, and
			 * never on something that scrolls under a moving backdrop. If you are
			 * reaching for this on a card grid, the answer is `raised`.
			 */
			panel:
				'bg-glass-panel border border-glass-border u-glass-panel shadow-md',
		},
		radius: {
			sm: 'rounded-sm',
			md: 'rounded-md',
			lg: 'rounded-lg',
			/* Panel scale — a section-sized surface, not a card. See tokens.css. */
			xl: 'rounded-xl',
			'2xl': 'rounded-2xl',
			none: 'rounded-none',
		},
	},
	defaultVariants: { level: 'raised', radius: 'md' },
})

export interface SurfaceProps
	extends ComponentPropsWithRef<'div'>,
		VariantProps<typeof surface> {
	as?: ElementType
}

export function Surface({
	as: Component = 'div',
	level,
	radius,
	className,
	...props
}: SurfaceProps) {
	return (
		<Component
			className={cn(surface({ level, radius }), className)}
			{...props}
		/>
	)
}

export { surface as surfaceVariants }
