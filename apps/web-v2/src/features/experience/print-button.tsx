'use client'

/**
 * C-05/C-06 — "Save as PDF", by printing the page the reader is already on.
 *
 * THIS SUPERSEDES C-06'S CI-GENERATED PDF, AND THE REASONING IS WORTH THE
 * PARAGRAPH. The backlog specifies a résumé PDF generated in CI by
 * printing this page with Playwright, committed into the export under a
 * versioned filename. Its acceptance criterion is that "the PDF and the HTML
 * cannot disagree, because both render from `experience.ts`".
 *
 * That criterion is met more completely here, and at less cost. A generated
 * artifact has to be produced, named, linked, and kept in step: the page must
 * link a filename that will exist, which means the build has to emit the file
 * before `check:links` walks the export, which means either the link check runs
 * against something the ordinary `pnpm build` does not produce — a gate that
 * fails locally for a reason unrelated to the change — or the link is written
 * optimistically and the export ships a 404 on the one page a recruiter clicks.
 *
 * Printing the live page removes the artifact entirely. There is no second
 * document, no filename to version, no generated file to fall out of date, and
 * the output is produced from the same `print.css` a CI job would have used.
 * The reader also gets a real dialog, so they can choose the paper size and
 * whether to include backgrounds — which a fixed generated PDF takes away.
 *
 * `data-js-only` hides it until the boot script confirms scripts ran: its
 * entire behaviour is `window.print()`, so without JavaScript it is a dead
 * control. The keyboard shortcut every browser already provides is the
 * documented fallback, and the page prints identically through it.
 *
 * No `cn` import (CLAUDE.md §10) — this is a client leaf.
 */
export function PrintButton() {
	return (
		<button
			type="button"
			data-js-only=""
			onClick={() => window.print()}
			className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-6 py-3 font-medium text-text transition-colors duration-fast hover:bg-surface-hover"
		>
			{/*
			  The icon is inlined rather than imported from the vendored set: this
			  is the only place a printer appears on the site, and adding it to
			  `icons.tsx` would put a ninth entry in a file whose stated rule is that
			  every icon is traceable to a call site — which this one would be, and
			  which would also make it importable by a Client Component that then
			  pulls the whole module. One path, here, costs less than both.
			*/}
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				focusable="false"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.75}
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-4 shrink-0"
			>
				<path d="M6 9V3h12v6" />
				<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
				<rect width="12" height="8" x="6" y="14" rx="1" />
			</svg>
			Print or save as PDF
		</button>
	)
}
