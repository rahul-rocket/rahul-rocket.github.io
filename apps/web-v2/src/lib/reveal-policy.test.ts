import { describe, expect, it } from 'vitest'
import {
	REVEAL_LINE,
	STAGGER_STEP_MS,
	shouldArm,
	staggerDelayMs,
} from './reveal-policy'

describe('shouldArm', () => {
	const viewport = 800

	it('does not arm an element already on screen', () => {
		// The flash case: arming this would paint it, hide it, then animate it
		// back. It must simply be visible.
		expect(shouldArm(0, viewport)).toBe(false)
		expect(shouldArm(200, viewport)).toBe(false)
	})

	it('does not arm an element scrolled above the viewport', () => {
		expect(shouldArm(-500, viewport)).toBe(false)
	})

	it('arms an element below the reveal line', () => {
		expect(shouldArm(viewport, viewport)).toBe(true)
		expect(shouldArm(viewport * 2, viewport)).toBe(true)
	})

	it('puts the boundary at 85% of the viewport', () => {
		expect(shouldArm(viewport * REVEAL_LINE, viewport)).toBe(false)
		expect(shouldArm(viewport * REVEAL_LINE + 1, viewport)).toBe(true)
	})

	it('scales with viewport height rather than using a fixed pixel line', () => {
		// A fixed line would arm nothing on a short viewport and everything on a
		// tall one.
		expect(shouldArm(500, 400)).toBe(true)
		expect(shouldArm(500, 2000)).toBe(false)
	})
})

describe('staggerDelayMs', () => {
	it('gives the first child no delay', () => {
		expect(staggerDelayMs(0, 4)).toBe(0)
	})

	it('steps by 60ms while inside the budget', () => {
		expect(staggerDelayMs(1, 4)).toBe(STAGGER_STEP_MS)
		expect(staggerDelayMs(3, 4)).toBe(3 * STAGGER_STEP_MS)
	})

	it('never exceeds the budget, however many children', () => {
		// Law 2 caps an entrance at 400ms, and a stagger is ONE entrance. Twenty
		// children at 60ms would spend 1140ms on delay alone.
		for (const count of [8, 20, 50]) {
			expect(staggerDelayMs(count - 1, count)).toBeLessThanOrEqual(300)
		}
	})

	it('still orders children when the step is compressed', () => {
		const count = 20
		const delays = Array.from({ length: count }, (_, i) =>
			staggerDelayMs(i, count),
		)
		for (let i = 1; i < count; i++) {
			expect(delays[i] ?? 0).toBeGreaterThanOrEqual(delays[i - 1] ?? 0)
		}
	})

	it('handles degenerate groups', () => {
		expect(staggerDelayMs(0, 0)).toBe(0)
		expect(staggerDelayMs(0, 1)).toBe(0)
		expect(staggerDelayMs(5, 1)).toBe(0)
	})
})
