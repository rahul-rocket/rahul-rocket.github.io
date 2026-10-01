import { site } from "@/lib/site"

/**
 * FormSubmit (formsubmit.co) -- a form-to-email relay. The browser POSTs the
 * message there and it is emailed to `site.email`, so this static export still
 * has no server and no database of its own, and there is no account or API key
 * to manage: the endpoint is the address.
 *
 * The first message to a new address is held while FormSubmit emails the owner
 * a one-time activation link; until it is clicked, every submission is refused.
 */
export const FORM_RELAY_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(site.email)}`

/**
 * Did the relay actually accept the message? `response.ok` is not the answer:
 * FormSubmit replies 200 with `{ "success": "false" }` (a string) while the
 * form awaits activation, so reading the status alone would tell a visitor
 * their message was sent while it was being discarded.
 */
export function relayAccepted(ok: boolean, payload: unknown): boolean {
  if (!ok) return false
  // Only an EXPLICIT refusal counts as one. A custom Formspree-shaped endpoint
  // may answer 2xx with no `success` field, or with no JSON body at all.
  if (typeof payload !== "object" || payload === null) return true
  const success = (payload as { success?: unknown }).success
  return success !== false && success !== "false"
}
