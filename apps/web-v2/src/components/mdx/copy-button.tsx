'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from '@/components/ui/icons'

/**
 * B-04 — the code-block copy control. The ONLY client component in the MDX set.
 *
 * IT DOES NOT IMPORT `cn`. `lib/cn.ts` pulls `tailwind-merge` across the client
 * boundary — 8.7 KB gz, into the shared chunk of every route that renders one
 * of these (CLAUDE.md §10, and the L-13 finding that produced the rule). The
 * class strings below are written out for that reason and for no other; if this
 * component ever needs conditional classes, they go in a ternary over two
 * complete strings rather than through a merge.
 *
 * IT READS THE DOM RATHER THAN TAKING THE CODE AS A PROP. The alternative is
 * serialising every code block's text into the HTML twice — once as the
 * highlighted markup a reader sees, once as a string prop for this button — and
 * a post with eight code blocks would pay for the whole file a second time.
 * `textContent` off the sibling `<pre>` is the same text, already there.
 *
 * PROGRESSIVE ENHANCEMENT, HONESTLY. `data-js-only` (lib/progressive.ts) hides
 * it until the boot script confirms JavaScript ran, because a copy button that
 * cannot copy is a dead control in the tab order — and selecting the code is
 * the fallback everyone already knows.
 */
export function CopyButton({ label }: { label: string }) {
	const [copied, setCopied] = useState(false)

	async function copy(event: React.MouseEvent<HTMLButtonElement>) {
		const figure = event.currentTarget.closest('figure')
		const code = figure?.querySelector('pre')?.textContent
		if (!code) return

		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			// Reverts on its own. A button stuck on "Copied" is lying by the time
			// the reader looks back at it.
			window.setTimeout(() => setCopied(false), 2000)
		} catch {
			// A denied clipboard permission is not an error worth interrupting a
			// reader over — the code is still on screen and still selectable.
		}
	}

	return (
		<button
			type="button"
			onClick={copy}
			data-js-only=""
			className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-text-muted text-xs transition-colors duration-fast hover:bg-surface-hover hover:text-text"
		>
			{copied ? (
				<CheckIcon size="sm" className="text-success" />
			) : (
				<CopyIcon size="sm" />
			)}
			{/*
			  The word changes with the state and is announced, because an icon-only
			  state change is invisible to a screen reader. `aria-live="polite"` on
			  the label rather than `role="status"` on the button: the button's own
			  accessible name should stay stable, or a reader tabbing back hears a
			  control that appears to have been renamed.
			*/}
			<span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
			<span className="sr-only">{label}</span>
		</button>
	)
}
