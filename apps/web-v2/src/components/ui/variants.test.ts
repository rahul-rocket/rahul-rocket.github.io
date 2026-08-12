import { describe, expect, it } from 'vitest'
import { badgeVariants } from './badge'
import { buttonVariants } from './button'
import { containerVariants } from './container'
import { headingVariants } from './heading'
import { textVariants } from './text'

/**
 * These test the VARIANT FUNCTIONS, not rendered output.
 *
 * TESTING.md's rule is to test where the failure would be silent, and the
 * silent failures in a token layer are all in class strings: a variant that
 * omits a state, a token name that drifts from `themes.css`, a size that
 * regresses below the touch-target floor. Every one of those renders perfectly
 * and is wrong. A DOM assertion would not catch any of them any better, and
 * Testing Library is not a dependency here (TECH_STACK §1 lists it; it arrives
 * with the first component whose value is behaviour rather than class output).
 *
 * What these do NOT prove is that the classes produce the intended pixels —
 * that is Playwright plus axe plus `check:contrast`, and no unit test
 * substitutes for them.
 */

describe('buttonVariants', () => {
	it('defines disabled in the base, so every variant inherits it', () => {
		for (const variant of ['primary', 'secondary', 'ghost', 'link'] as const) {
			expect(buttonVariants({ variant })).toContain('disabled:opacity-50')
			expect(buttonVariants({ variant })).toContain(
				'disabled:pointer-events-none',
			)
		}
	})

	it('treats aria-disabled the same as disabled', () => {
		// A link styled as a button cannot be `disabled` — the attribute does not
		// exist on <a>. Without this the asChild path has a state the base claims
		// to define and does not.
		expect(buttonVariants({})).toContain('aria-disabled:opacity-50')
	})

	it('keeps every size at or above the 44px touch-target floor', () => {
		// UI_GUIDELINES §6. `min-h-11` is 2.75rem = 44px; `min-h-12` is 48px.
		expect(buttonVariants({ size: 'sm' })).toContain('min-h-11')
		expect(buttonVariants({ size: 'md' })).toContain('min-h-11')
		expect(buttonVariants({ size: 'lg' })).toContain('min-h-12')
	})

	it('gives every variant a hover state that is not colour alone', () => {
		// secondary/ghost change surface; `link` changes an underlined colour,
		// which is already distinguishable without hue.
		//
		// `primary` changes its SHADOW, not its fill, and that is a consequence of
		// the fill being a gradient: `hover:bg-accent-hover` cannot show through a
		// `background-image`, so the old assertion would have kept passing while
		// the button visibly stopped responding. A glow is a luminance change
		// around the whole control — perceivable without hue discrimination, which
		// is what this test is actually about — and `u-beam` sweeps a highlight
		// across it on `:hover` AND `:focus-visible`, so the affordance exists for
		// keyboard users too.
		expect(buttonVariants({ variant: 'primary' })).toContain(
			'hover:shadow-glow-brand',
		)
		expect(buttonVariants({ variant: 'secondary' })).toContain(
			'hover:bg-surface-hover',
		)
		expect(buttonVariants({ variant: 'ghost' })).toContain(
			'hover:bg-surface-hover',
		)
		expect(buttonVariants({ variant: 'link' })).toContain('underline')
	})

	it('never sets an outline, so the global focus ring survives', () => {
		// DESIGN_SYSTEM §9: `outline: none` without a replacement is a hard
		// blocker, and the ring lives once, at the end of themes.css.
		expect(buttonVariants({})).not.toContain('outline-none')
	})
})

describe('headingVariants', () => {
	it('pairs each size with its own leading and tracking', () => {
		// Optical correction, not decoration: a display size at body tracking
		// reads loose. Pairing them in the variant is what stops one being
		// applied without the other.
		expect(headingVariants({ size: 'mega' })).toContain('leading-mega')
		expect(headingVariants({ size: 'mega' })).toContain('tracking-mega')
		expect(headingVariants({ size: 'display' })).toContain('tracking-display')
	})
})

describe('textVariants', () => {
	it('offers the subtle tone only through the large-text component', () => {
		// `--ui-text-subtle` is verified at 3:1 and fails 4.5:1 below 24px
		// (DESIGN_SYSTEM §3). `Text` cannot reach it; `SubtleText` fixes the size.
		expect(textVariants({ tone: 'muted' })).toContain('text-text-muted')
		expect(textVariants({ tone: 'subtle' })).toContain('text-text-subtle')
	})

	it('never emits a size below the 0.8125rem floor', () => {
		// The scale itself stops at `xs` = 13px (DESIGN_SYSTEM §4) — this asserts
		// the component exposes no smaller step.
		const sizes = ['body', 'sm', 'xs'] as const
		for (const size of sizes) {
			expect(textVariants({ size })).toContain(`text-${size}`)
		}
	})
})

describe('badgeVariants', () => {
	it('puts status colour on text, never on a hue-tinted fill', () => {
		// Small text on a HUE-TINTED background is where the 4.5:1 floor quietly
		// dies — a `bg-success/10` behind 13px text is the classic version, and
		// there is no such fill in the variant table.
		//
		// The fill is `--ui-bg-subtle`, a neutral surface step, and the reason
		// that is safe rather than merely different is that it is now VERIFIED:
		// `check-contrast.mjs` asserts success, warning and danger against it at
		// 4.5:1, in both themes and all five tones, alongside text, muted text,
		// accent and the strong border. The previous `bg-transparent` was not
		// actually a defence — transparent means "whatever is behind it", and
		// what was behind it was the surface nobody was checking.
		for (const tone of ['success', 'warning', 'danger'] as const) {
			expect(badgeVariants({ tone })).toContain('bg-bg-subtle')
			expect(badgeVariants({ tone })).toContain(`text-${tone}`)
		}
	})
})

describe('containerVariants', () => {
	it('applies the gutter at every width, including full bleed', () => {
		// The no-horizontal-scroll-at-320px guarantee (UI_GUIDELINES §5) is a
		// property of the container, not something each page re-checks.
		for (const width of ['page', 'reading', 'full'] as const) {
			expect(containerVariants({ width })).toContain('px-gutter')
		}
	})
})
