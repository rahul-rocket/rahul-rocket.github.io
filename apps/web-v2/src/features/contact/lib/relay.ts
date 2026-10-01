/**
 * Did the form relay actually accept the message?
 *
 * `response.ok` is not the answer. FormSubmit replies 200 with
 * `{ "success": "false", "message": "This form needs Activation…" }` until the
 * owner clicks the activation email, and with a string rather than a boolean
 * in general — so a check on the status code alone would tell a visitor their
 * message was sent while it was being discarded.
 */
export function relayAccepted(ok: boolean, payload: unknown): boolean {
	if (!ok || typeof payload !== 'object' || payload === null) return false
	const success = (payload as { success?: unknown }).success
	return success === true || success === 'true'
}
