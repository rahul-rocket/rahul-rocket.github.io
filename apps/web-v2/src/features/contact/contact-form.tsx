'use client'

import { useId, useRef, useState } from 'react'
import { mailtoHref } from '@/config/site'

/**
 * C-01/C-02/C-03 — the contact form. docs/WEBSITE_STRUCTURE.md §4.12,
 * docs/ARCHITECTURE.md §7.
 *
 * THERE IS NO BACKEND, AND THE FORM IS HONEST ABOUT IT. With an endpoint
 * configured, the `action` is that third-party endpoint and the method is a real
 * POST, so with JavaScript disabled the browser submits the form itself and the
 * reader lands on the provider's confirmation page.
 *
 * WITHOUT AN ENDPOINT THE FORM STILL RENDERS, AND THAT IS A CHANGE. It used not
 * to: the page fell back to a bare `mailto:` link, on the argument that a form
 * posting to nowhere silently discards a message. That argument is still right,
 * and this does not do it — the no-endpoint form is a COMPOSER. Validation runs
 * exactly as it does otherwise, and submitting hands the fields to the reader's
 * own mail client with a subject and body already filled in. Nothing is
 * transmitted by this page, nothing can be lost by it, and the reader keeps the
 * copy in their sent folder.
 *
 * The form says so, above the button, in words, and the submit button is
 * labelled "Compose this message" rather than "Send" — the mechanism is stated
 * rather than hidden. A reader who would rather not use a
 * mail client still has the direct address beside the button, which is the same
 * path the no-JavaScript reader takes: with no endpoint there is no `action` to
 * post to, so the submit button is `data-js-only` and the link is the whole
 * offer. That is the one honest arrangement — a dead submit button is exactly
 * the silent failure this comment has always been about.
 *
 * VALIDATION IS INLINE, ON BLUR, AND ANNOUNCED — never only on submit (§4.12).
 * Each error is associated with its field by `aria-describedby` and the field
 * carries `aria-invalid`; the submit status has its own polite live region and
 * receives focus after a submit, which is C-01's acceptance criterion.
 *
 * NEVER COLOUR ALONE. Errors are words under the field, not a red border. The
 * border colour is reinforcement.
 *
 * ANTI-SPAM IS A HONEYPOT PLUS A TIME-TO-SUBMIT FLOOR, AND NO CAPTCHA (§4.12).
 * A CAPTCHA is an accessibility tax charged to every reader for the author's
 * convenience. The honeypot is a field hidden from sighted users AND from
 * assistive technology — `aria-hidden` with `tabIndex={-1}`, so a screen-reader
 * user never meets a field they cannot see and must not fill.
 *
 * NO `cn` IMPORT (CLAUDE.md §10). Conditional classes are ternaries over two
 * complete strings.
 */

const MIN_SECONDS_BEFORE_SUBMIT = 3

interface Errors {
	name?: string
	email?: string
	message?: string
}

function validate(values: {
	name: string
	email: string
	message: string
}): Errors {
	const errors: Errors = {}

	if (values.name.trim().length < 2) {
		errors.name = 'Please enter your name.'
	}
	// Deliberately permissive. A strict address regex rejects valid addresses —
	// plus-addressing, new top-level domains, quoted locals — and the real
	// validation is that the reply arrives. This catches typos, not RFC 5322.
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
		errors.email = 'Please enter an email address I can reply to.'
	}
	if (values.message.trim().length < 20) {
		errors.message =
			'A sentence or two about the actual problem gets a much faster reply.'
	}

	return errors
}

export function ContactForm({
	endpoint,
	fallbackHref,
	subject,
}: {
	/**
	 * The third-party POST target. Empty or absent puts the form in composer
	 * mode — see the header. `site.formspreeEndpoint` is the only caller.
	 */
	endpoint?: string
	/** The `mailto:` used when the endpoint fails. Built in `config/site.ts`. */
	fallbackHref: string
	/** Subject line for the composed message in mailto mode. */
	subject: string
}) {
	// One name for the branch, read in five places below. A bare `!endpoint`
	// scattered through the component is the kind of condition that acquires an
	// inconsistent sixth reading later.
	const isComposer = !endpoint

	const fieldId = useId()
	const [values, setValues] = useState({ name: '', email: '', message: '' })
	const [errors, setErrors] = useState<Errors>({})
	const [touched, setTouched] = useState<Record<string, boolean>>({})
	const [status, setStatus] = useState<
		'idle' | 'sending' | 'sent' | 'failed' | 'composed'
	>('idle')
	const statusRef = useRef<HTMLParagraphElement>(null)
	const mountedAt = useRef(Date.now())

	function fieldError(field: keyof Errors): string | undefined {
		return touched[field] ? errors[field] : undefined
	}

	function onBlur(field: keyof Errors) {
		setTouched((previous) => ({ ...previous, [field]: true }))
		setErrors(validate(values))
	}

	function onChange(field: keyof Errors, value: string) {
		const next = { ...values, [field]: value }
		setValues(next)
		// Re-validate only fields the reader has already left. Validating a field
		// while it is being typed into shows an error for an address that is
		// simply not finished yet, which reads as the form arguing with you.
		if (touched[field]) setErrors(validate(next))
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const found = validate(values)
		setErrors(found)
		setTouched({ name: true, email: true, message: true })

		if (Object.keys(found).length > 0) {
			// Focus the first invalid field, not the status message: the reader's
			// next action is to fix it, and moving focus to a summary makes them
			// find the field again themselves.
			const first = Object.keys(found)[0]
			document.getElementById(`${fieldId}-${first}`)?.focus()
			return
		}

		const form = event.currentTarget

		// COMPOSER MODE, AND IT SHORT-CIRCUITS BEFORE THE ANTI-SPAM CHECKS ON
		// PURPOSE. Both of those exist to protect an endpoint from automated
		// submissions; there is no endpoint here and nothing leaves the page, so
		// a honeypot hit would only mean silently refusing to open a human's mail
		// client. The composed message is handed to the reader, who sends it.
		if (isComposer) {
			window.location.href = mailtoHref(
				subject,
				[
					values.message.trim(),
					'',
					'—',
					`${values.name.trim()} · ${values.email.trim()}`,
				].join('\n'),
			)
			setStatus('composed')
			statusRef.current?.focus()
			return
		}

		const honeypot = new FormData(form).get('website')
		const elapsed = (Date.now() - mountedAt.current) / 1000

		// Both anti-spam checks report success to the submitter. Telling a bot
		// which check caught it is telling whoever wrote the bot how to pass.
		if (honeypot || elapsed < MIN_SECONDS_BEFORE_SUBMIT) {
			setStatus('sent')
			statusRef.current?.focus()
			return
		}

		setStatus('sending')

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { Accept: 'application/json' },
				body: new FormData(form),
			})
			setStatus(response.ok ? 'sent' : 'failed')
		} catch {
			setStatus('failed')
		}

		// Focus lands on the status after every submit — C-01's acceptance
		// criterion. `tabIndex={-1}` on the paragraph is what makes it focusable
		// without putting it in the tab order permanently.
		statusRef.current?.focus()
	}

	return (
		<form
			// A real action and method, so the no-JavaScript path is a genuine POST
			// rather than a button that does nothing. In composer mode there is
			// nothing to post to and the attributes are omitted entirely — a `<form>`
			// with no `action` submits to its own URL, which on a static export is a
			// page reload that eats what the reader typed.
			action={endpoint || undefined}
			method={endpoint ? 'post' : undefined}
			noValidate
			onSubmit={onSubmit}
			className="flex max-w-reading flex-col gap-6"
		>
			<Field
				id={`${fieldId}-name`}
				name="name"
				label="Your name"
				value={values.name}
				error={fieldError('name')}
				onChange={(value) => onChange('name', value)}
				onBlur={() => onBlur('name')}
				autoComplete="name"
			/>

			<Field
				id={`${fieldId}-email`}
				name="email"
				type="email"
				label="Email"
				value={values.email}
				error={fieldError('email')}
				onChange={(value) => onChange('email', value)}
				onBlur={() => onBlur('email')}
				autoComplete="email"
			/>

			<Field
				id={`${fieldId}-message`}
				name="message"
				label="What are you working on?"
				value={values.message}
				error={fieldError('message')}
				onChange={(value) => onChange('message', value)}
				onBlur={() => onBlur('message')}
				multiline
			/>

			{/*
			  The honeypot. Hidden from sight AND from the accessibility tree, and
			  out of the tab order — a screen-reader user must never meet a field
			  they are required to leave empty. `tabIndex={-1}` and `aria-hidden`
			  together are what make that true; either alone leaves it reachable.
			*/}
			<div
				aria-hidden="true"
				className="absolute left-[-9999px] h-px w-px overflow-hidden"
			>
				<label htmlFor={`${fieldId}-website`}>
					Leave this field empty
					<input
						id={`${fieldId}-website`}
						name="website"
						type="text"
						tabIndex={-1}
						autoComplete="off"
					/>
				</label>
			</div>

			{/*
			  The mechanism, stated before the button rather than discovered after
			  it. A reader who presses "Send message" and watches their mail client
			  open unannounced has been surprised by their own contact form, and the
			  surprise costs more trust than the convenience gained.
			*/}
			{isComposer ? (
				<p className="max-w-reading text-sm text-text-muted">
					There is no server behind this page, so nothing is submitted here:
					sending opens your own mail client with this message ready to go, and
					you keep the copy.
				</p>
			) : null}

			<div className="flex flex-wrap items-center gap-4">
				<button
					type="submit"
					disabled={status === 'sending'}
					// `data-js-only` in composer mode ONLY. With an endpoint the button
					// is a real submit and must survive without JavaScript; without one
					// its entire behaviour is the `window.location` assignment above, so
					// with scripting off it would be a control that does nothing — and
					// the direct link beside it is then the whole offer, which is what
					// the no-JavaScript reader saw before this form existed.
					data-js-only={isComposer ? '' : undefined}
					// The same treatment `Button variant="primary"` carries, written out
					// rather than imported: this is a Client Component, and `Button`
					// pulls `cn` — which pulls `tailwind-merge`, 8.7 KB gz, across the
					// boundary (CLAUDE.md §10, enforced by client-boundary.test.ts).
					// A literal string is the cheap half of that trade.
					className="u-press u-beam u-cta-fill relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 font-medium text-on-accent no-underline shadow-glow-accent transition-shadow duration-base hover:shadow-glow-brand disabled:pointer-events-none disabled:opacity-50"
				>
					{/* The label names what the control actually does. "Send message"
					    on a button that opens a compose window is a small lie, and it
					    is the one a reader catches immediately. */}
					{status === 'sending'
						? 'Sending…'
						: isComposer
							? 'Compose this message'
							: 'Send message'}
				</button>

				<a href={fallbackHref} className="text-sm">
					Or write to me directly
				</a>
			</div>

			{/*
			  ALWAYS IN THE DOM, empty when there is nothing to say. A live region
			  inserted at the moment it has content is frequently missed — screen
			  readers watch regions that already exist.
			*/}
			<p
				ref={statusRef}
				tabIndex={-1}
				role="status"
				aria-live="polite"
				className={
					status === 'failed'
						? 'text-danger text-sm'
						: 'text-sm text-text-muted'
				}
			>
				{status === 'sent'
					? 'Thank you — your message is on its way. I reply to everything that is not a template, usually within a few days.'
					: null}
				{/* A DIFFERENT SENTENCE FROM 'sent', because a different thing
				    happened: the message has been handed to a mail client and is not
				    on its way until the reader sends it. Telling them otherwise would
				    leave a draft sitting unsent behind a thank-you. */}
				{status === 'composed' ? (
					<>
						Your mail client should be opening with this message ready to send —
						it is not sent until you send it. If nothing opened,{' '}
						<a href={fallbackHref}>write to me directly</a>.
					</>
				) : null}
				{status === 'failed' ? (
					<>
						That did not send. Nothing was lost on your side — please{' '}
						<a href={fallbackHref}>send it by email instead</a>, and I will get
						it.
					</>
				) : null}
			</p>
		</form>
	)
}

/**
 * One field, with its label, its error, and the wiring between them.
 *
 * Extracted because the wiring is the part that is easy to get subtly wrong and
 * impossible to see: `aria-describedby` must point at the error element's id,
 * `aria-invalid` must be present only when invalid, and the label must be a
 * real `<label htmlFor>` rather than a placeholder. Writing it once means it is
 * right three times.
 */
function Field({
	id,
	name,
	label,
	value,
	error,
	onChange,
	onBlur,
	type = 'text',
	multiline = false,
	autoComplete,
}: {
	id: string
	name: string
	label: string
	value: string
	error?: string
	onChange: (value: string) => void
	onBlur: () => void
	type?: string
	multiline?: boolean
	autoComplete?: string
}) {
	const errorId = `${id}-error`
	const base =
		'w-full rounded-lg border bg-surface px-4 py-3 text-body text-text shadow-sm ' +
		'transition-colors duration-fast placeholder:text-text-subtle ' +
		// The border is `border-strong`, not `border`. A control boundary is
		// subject to WCAG 1.4.11 (3:1 against what is adjacent) and the decorative
		// hairline role carries no such floor — the strong role is the one
		// `check:contrast` asserts at 3:1, in both themes and all five tones.
		// The hover step is accent-tinted, which is emphasis on top of a boundary
		// that was already visible rather than the only thing making it visible.
		'hover:border-accent-muted'
	const className = error
		? `${base} min-h-12 border-danger`
		: `${base} min-h-12 border-border-strong`

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm text-text">
				{label}
			</label>

			{multiline ? (
				<textarea
					id={id}
					name={name}
					rows={6}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onBlur={onBlur}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? errorId : undefined}
					className={className}
				/>
			) : (
				<input
					id={id}
					name={name}
					type={type}
					value={value}
					autoComplete={autoComplete}
					onChange={(event) => onChange(event.target.value)}
					onBlur={onBlur}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? errorId : undefined}
					className={className}
				/>
			)}

			{/*
			  The error is text under the field — never colour alone, and never only
			  a border. It is always in the DOM so that `aria-describedby` has a
			  stable target and so the field does not shift when an error appears.
			*/}
			<p id={errorId} className="min-h-5 text-danger text-sm">
				{error}
			</p>
		</div>
	)
}
