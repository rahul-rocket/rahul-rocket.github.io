import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { CopyButton } from './copy-button'

/**
 * B-04 — the `<pre>` override. docs/BLOG_SYSTEM.md §6.
 *
 * THREE THINGS A BARE `<pre>` GETS WRONG, ALL OF THEM KEYBOARD PROBLEMS.
 *
 * 1. A horizontally scrollable box that is not focusable cannot be scrolled by
 *    keyboard at all. WCAG 2.1.1. `tabIndex={0}` fixes it, and is the reason
 *    the element is in the tab order at all.
 * 2. A focusable element with no accessible name is announced as "group,
 *    blank". `role="region"` plus `aria-label` naming the language is what
 *    makes it "TypeScript code sample, region".
 * 3. Nothing tells a reader which language they are looking at. The label above
 *    is visible text, not only an ARIA string, because a sighted reader needs
 *    it too — and because a visible label is one that cannot silently drift
 *    from what the highlighter actually parsed.
 *
 * `data-language` comes from `rehype-pretty-code`, so the label is whatever the
 * highlighter used rather than whatever the author typed in the fence — if the
 * two disagree, the one that produced the colours is the true one.
 *
 * ZERO HIGHLIGHTER BYTES. Shiki ran at build time (F1-02); this component adds
 * a wrapper, a label, and one small client button, and no part of the
 * highlighting reaches the browser. B-04's acceptance criterion is exactly
 * that, and it holds because nothing here imports a highlighter.
 */

/** Language ids that read badly as a bare token in an announced label. */
const LANGUAGE_LABELS: Record<string, string> = {
	ts: 'TypeScript',
	tsx: 'TypeScript JSX',
	js: 'JavaScript',
	jsx: 'JavaScript JSX',
	mjs: 'JavaScript',
	css: 'CSS',
	html: 'HTML',
	json: 'JSON',
	yaml: 'YAML',
	yml: 'YAML',
	sh: 'Shell',
	bash: 'Shell',
	sql: 'SQL',
	mdx: 'MDX',
	md: 'Markdown',
	plaintext: 'Code',
	text: 'Code',
}

function languageLabel(raw: unknown): string {
	if (typeof raw !== 'string' || raw.length === 0) return 'Code'
	return LANGUAGE_LABELS[raw] ?? raw
}

export interface CodeBlockProps extends ComponentPropsWithoutRef<'pre'> {
	'data-language'?: string
	children?: ReactNode
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
	const label = languageLabel(props['data-language'])

	return (
		// `<figure>` rather than a `<div>`: the copy button is a caption-level
		// affordance for the code, and the button finds its `<pre>` by walking up
		// to this element. A div would work identically for the DOM query and
		// would be less honest about the relationship.
		<figure className="my-8 overflow-hidden rounded-lg border border-border bg-surface">
			{/*
			  `data-feed-strip`: the toolbar is a copy button and a language label —
			  page furniture that reads as two stray words in a feed reader.
			  `scripts/generate-feeds.mjs` removes it wholesale.
			*/}
			<div
				data-feed-strip=""
				className="flex items-center justify-between gap-4 border-border border-b py-1 pr-1 pl-4"
			>
				<span className="font-mono text-text-muted text-xs uppercase tracking-caps">
					{label}
				</span>
				<CopyButton label={`Copy the ${label} code sample`} />
			</div>

			{/* biome-ignore lint/a11y/useSemanticElements: no HTML element expresses "scrollable labelled region"; role="region" + aria-label is the documented WCAG pattern, and a <section> cannot be a <pre>. */}
			<pre
				// See the three notes above. All three are required together: any
				// two of them leaves a keyboard or screen-reader gap.
				//
				// Both suppressions are deliberate and neither is a workaround. Biome's
				// rules are right about the general case — a non-interactive element
				// should not be focusable, and a role should be an element where one
				// exists — and wrong about this one, which is the documented WCAG
				// technique for a scrollable region: there is no HTML element that is
				// "a scrollable labelled region", and without `tabIndex` a keyboard
				// user cannot scroll a wide code block at all (SC 2.1.1).
				// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be focusable or it cannot be scrolled by keyboard — WCAG 2.1.1.
				tabIndex={0}
				role="region"
				aria-label={`${label} code sample`}
				className={
					className
						? `${className} overflow-x-auto p-4 text-sm leading-body`
						: 'overflow-x-auto p-4 text-sm leading-body'
				}
				{...props}
			>
				{children}
			</pre>
		</figure>
	)
}

/**
 * B-06 — `CodeGroup`, as an exclusive accordion rather than a tab list.
 *
 * A DELIBERATE DIVERGENCE FROM BLOG_SYSTEM §6, WHICH SAYS "tabbed". A real
 * `role="tablist"` requires `aria-selected` and roving `tabindex` to be
 * maintained in response to arrow keys — that is JavaScript, on a content page,
 * for a control most readers never touch. The CSS-only radio-tab pattern that
 * avoids the JavaScript has the wrong semantics: a screen reader announces a
 * radio group, and the panels are not associated with their controls at all.
 *
 * `<details name="…">` gives exclusivity natively, is keyboard-operable and
 * announced correctly without a line of script, and degrades to "all panels
 * open" on an engine that does not support the grouping — which is a worse
 * layout and a complete one. Zero JavaScript, correct semantics, honest name.
 */
export function CodeGroup({
	label,
	children,
}: {
	/** Groups the `<details>` elements. Must be unique within a page. */
	label: string
	children: ReactNode
}) {
	return (
		// A `<section>` with an accessible name IS a region — no `role` attribute
		// needed, which is CLAUDE.md §7's "semantic HTML before ARIA" applied to
		// the case where the semantic element genuinely exists.
		<section
			className="my-8 flex flex-col gap-2"
			data-code-group={label}
			aria-label={label}
		>
			{children}
		</section>
	)
}

export function CodeGroupItem({
	group,
	title,
	defaultOpen = false,
	children,
}: {
	group: string
	title: string
	defaultOpen?: boolean
	children: ReactNode
}) {
	return (
		<details name={group} open={defaultOpen} className="group">
			<summary className="cursor-pointer rounded-md px-3 py-2 font-mono text-sm text-text-muted marker:text-text-muted hover:text-text">
				{title}
			</summary>
			{/* Negative top margin cancels the `<figure>`'s own `my-8` so the panel
			    sits against its summary. The figure keeps the margin because it is
			    correct everywhere else it appears. */}
			<div className="-mt-4">{children}</div>
		</details>
	)
}
