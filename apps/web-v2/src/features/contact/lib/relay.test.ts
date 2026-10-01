import { describe, expect, it } from 'vitest'
import { relayAccepted } from './relay'

describe('relayAccepted', () => {
	it('accepts the relay success flag as a boolean or a string', () => {
		expect(relayAccepted(true, { success: true })).toBe(true)
		expect(relayAccepted(true, { success: 'true' })).toBe(true)
	})

	it('rejects a 200 whose body says it was not delivered', () => {
		// FormSubmit's reply before the owner has activated the form.
		expect(
			relayAccepted(true, {
				success: 'false',
				message: 'This form needs Activation.',
			}),
		).toBe(false)
	})

	it('rejects a non-2xx or an unreadable body', () => {
		expect(relayAccepted(false, { success: 'true' })).toBe(false)
		expect(relayAccepted(true, null)).toBe(false)
		expect(relayAccepted(true, 'ok')).toBe(false)
	})
})
