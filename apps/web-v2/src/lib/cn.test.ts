import { describe, expect, it } from 'vitest'
import { cn } from './cn'

/**
 * These are not tests of tailwind-merge. They are tests of the *configuration*
 * in cn.ts, and specifically of the collisions our token names create with
 * tailwind-merge's default validators.
 *
 * Each collision fails silently in production — a heading rendering at body
 * size, a shadow that never appears — so each gets an assertion in both
 * directions: same group must override, different groups must coexist.
 */

describe('cn', () => {
	it('resolves conditionals and arrays through clsx', () => {
		expect(cn('block', false && 'hidden', ['p-4', null])).toBe('block p-4')
	})

	it('does not dedupe classes it does not recognise as conflicting', () => {
		// Worth pinning: tailwind-merge resolves *Tailwind* conflicts, it is not a
		// general-purpose deduplicator. A bare `a` twice stays twice. Anything
		// relying on cn() to tidy arbitrary class strings is relying on behaviour
		// that does not exist.
		expect(cn('a', 'a')).toBe('a a')
	})

	describe('type scale vs text color — the collision that motivated the config', () => {
		it('keeps a size and a color together', () => {
			// With tailwind-merge's default config `text-h1` is classified as a
			// COLOR, so this returns only `text-text-muted` and every heading using
			// cn() silently renders at body size.
			expect(cn('text-h1', 'text-text-muted')).toBe('text-h1 text-text-muted')
		})

		it('still lets one size override another', () => {
			expect(cn('text-h1', 'text-h2')).toBe('text-h2')
			expect(cn('text-mega', 'text-body')).toBe('text-body')
		})

		it('still lets one color override another', () => {
			expect(cn('text-text-muted', 'text-accent')).toBe('text-accent')
		})

		it('does not break standard Tailwind sizes', () => {
			expect(cn('text-sm', 'text-xs')).toBe('text-xs')
		})
	})

	describe('font family vs weight', () => {
		it('keeps family and weight together', () => {
			expect(cn('font-heading', 'font-medium')).toBe('font-heading font-medium')
		})

		it('lets one family override another', () => {
			expect(cn('font-heading', 'font-mono')).toBe('font-mono')
		})
	})

	describe('elevation', () => {
		it('lets one shadow token override another', () => {
			expect(cn('shadow-soft', 'shadow-overlay')).toBe('shadow-overlay')
		})

		it('keeps a shadow and an unrelated utility together', () => {
			expect(cn('shadow-glow-accent', 'rounded-lg')).toBe(
				'shadow-glow-accent rounded-lg',
			)
		})
	})

	describe('motion tokens', () => {
		it('lets one easing override another', () => {
			expect(cn('ease-out-quint', 'ease-in-out')).toBe('ease-in-out')
		})

		it('lets one leading override another', () => {
			expect(cn('leading-body', 'leading-mega')).toBe('leading-mega')
		})

		it('lets one tracking override another', () => {
			expect(cn('tracking-body', 'tracking-mega')).toBe('tracking-mega')
		})
	})

	describe('surface roles keep working', () => {
		it('merges background roles', () => {
			expect(cn('bg-surface', 'bg-surface-raised')).toBe('bg-surface-raised')
		})

		it('keeps background and border roles together', () => {
			expect(cn('bg-surface', 'border-border-strong')).toBe(
				'bg-surface border-border-strong',
			)
		})
	})
})
