'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRightIcon, SearchIcon } from '@/components/ui/icons'
import {
	type Command,
	type CommandAction,
	filterCommands,
	groupCommands,
} from '@/lib/commands'
import { toggleTheme } from '@/lib/theme'

/**
 * L-13 — the command palette. ⌘K / Ctrl+K, plus a visible trigger.
 *
 * IT IS A NATIVE `<dialog>`, FOR THE SAME REASONS THE MOBILE SHEET IS.
 *
 * `showModal()` supplies focus-in, focus trap, Escape-to-close, focus restore to
 * the trigger, and an inert background — including the cases hand-rolled traps
 * miss (shadow roots, find-in-page, screen-reader virtual cursors). L-05 already
 * took this trade and it paid: the ~4.5 KB budgeted for a vendored dialog was
 * 0 KB. Repeating it here means the palette's dialog behaviour is not code that
 * can regress.
 *
 * IT IS NOT DYNAMICALLY IMPORTED, WHICH DEPARTS FROM THE PERFORMANCE PLAN.
 *
 * docs/redesign/PERFORMANCE_PLAN.md §"Dynamic imports" budgets the palette at
 * ~4 KB loaded on first ⌘K. That number assumed a combobox library and a Motion
 * entrance. What is actually here is a `<dialog>`, one `useState`, and a string
 * matcher — small enough that a dynamic import would add a loader chunk, a
 * loading state, and a frame of latency on the keypress to defer less than it
 * costs. The measured whole-shell delta is reported in docs/TASK_BACKLOG.md; if
 * the palette later grows a search index (PL-06), splitting it becomes correct
 * and this comment is the marker for when to revisit.
 *
 * ROWS ARE LINKS AND BUTTONS, NOT `role="option"`.
 *
 * The combobox/listbox pattern needs `aria-activedescendant`, a roving virtual
 * cursor, and a lie: rows that navigate are announced as "option" rather than as
 * links, losing middle-click, ⌘-click, and "copy link address". Real anchors in
 * a real list get keyboard operation from the browser — Tab already moves
 * through them — and the arrow keys below are an accelerator on top of that
 * rather than the only way in. CLAUDE.md §7: semantic HTML before ARIA.
 *
 * IT REMAINS A PURE ENHANCEMENT. WEBSITE_STRUCTURE.md §2: "never the only path
 * to anything." Every route it offers is in the footer site map as plain HTML,
 * and the trigger is `data-js-only` because a button whose whole behaviour is
 * `showModal()` is a dead control without JavaScript.
 */
export function CommandPalette({ commands }: { commands: readonly Command[] }) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const [query, setQuery] = useState('')

	const results = filterCommands(commands, query)
	const groups = groupCommands(results)

	/**
	 * Whether closing must put focus on the trigger itself.
	 *
	 * DECIDED AT OPEN TIME, BECAUSE IT CANNOT BE DECIDED AT CLOSE TIME. The
	 * `close` event fires while the dialog's own input is still `activeElement`;
	 * the browser drops focus to <body> only afterwards. So "is focus nowhere?"
	 * is unanswerable from the close handler — measured, not assumed.
	 */
	const restoreToTrigger = useRef(false)

	// `useCallback` with no dependencies, so the ⌘K effect below binds its listener
	// once for the life of the page rather than tearing it down and rebinding on
	// every keystroke in the search box. Everything it touches — refs and a
	// setter — is already stable across renders.
	const open = useCallback(() => {
		// `showModal()` restores focus to whatever held it before opening. Pressed
		// as a shortcut, that is often <body> — and closing would then drop the
		// reader at the top of the document, so the next Tab walks the header
		// again. That is the failure e2e/keyboard.spec.ts guards for the sheet.
		const previous = document.activeElement
		restoreToTrigger.current = previous === null || previous === document.body

		// Cleared on open, not on close: a reader who reopens the palette expects a
		// fresh prompt, and clearing on close would visibly empty the list during
		// the closing frame.
		setQuery('')
		dialogRef.current?.showModal()
		inputRef.current?.focus()
	}, [])

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			// `event.key` rather than `keyCode`, and lowercased because ⌘K arrives as
			// "K" when Shift is involved or CapsLock is on.
			if (
				!(event.metaKey || event.ctrlKey) ||
				event.key.toLowerCase() !== 'k'
			) {
				return
			}

			const dialog = dialogRef.current
			if (!dialog) return

			// Ctrl+K is "delete to end of line" in every readline-style text field on
			// macOS, and browsers bind ⌘K to the address bar. Claiming it is the
			// convention this affordance is built on, so the preventDefault is
			// deliberate — but only once we know a dialog exists to open.
			event.preventDefault()

			if (dialog.open) dialog.close()
			else open()
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open])

	/**
	 * The focusable rows, read from the DOM rather than tracked in state.
	 *
	 * State would mean an index that has to be kept in step with a list that
	 * changes on every keystroke — the classic source of "the highlight is on a
	 * row that no longer exists". The DOM already holds the answer, and reading it
	 * on a key press costs nothing at this size.
	 */
	function rows(): HTMLElement[] {
		return Array.from(
			listRef.current?.querySelectorAll<HTMLElement>('[data-command]') ?? [],
		)
	}

	function move(delta: number) {
		const options = rows()
		if (options.length === 0) return

		const current = options.indexOf(document.activeElement as HTMLElement)
		// From the input (not in the list, so -1), Down enters at the top and Up
		// enters at the bottom. Otherwise wrap, which is what every palette does.
		const next =
			current === -1
				? delta > 0
					? 0
					: options.length - 1
				: (current + delta + options.length) % options.length

		options[next]?.focus()
	}

	function runAction(action: CommandAction) {
		if (action === 'toggle-theme') toggleTheme()
		// Closing restores focus to the trigger, so the reader lands back where
		// they started rather than on <body>.
		dialogRef.current?.close()
	}

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={open}
				aria-haspopup="dialog"
				// The visible text below is `aria-hidden`, so this is the whole
				// accessible name — and it matches the visible word at the widths where
				// there is one (WCAG 2.5.3, Label in Name).
				aria-label="Search"
				data-js-only
				data-testid="palette-trigger"
				className="flex min-h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-2 text-sm text-text-muted transition-colors duration-fast hover:border-accent-muted hover:bg-surface-hover hover:text-text lg:min-w-56 lg:justify-between"
			>
				{/* The icon and the word are one group so the ⌘K badge can be pushed
				    to the far edge of the widened trigger — a search field's shortcut
				    badge sits right, which is the shape readers already know. */}
				<span className="flex items-center gap-2">
					<SearchIcon size="sm" />
					{/*
				  Neither of these is `aria-hidden`, and neither needs to be: `aria-label`
				  on the button replaces its contents for naming purposes, so the word
				  and the shortcut are already excluded from the accessible name rather
				  than appended to it.

				  The glyph is always ⌘, never Ctrl, on every platform. Detecting the
				  platform means either a hydration mismatch or a post-hydration text
				  swap, and this sits in the header on every route — the theme toggle's
				  note explains what a swap in that position costs. ⌘K is the
				  near-universal notation for this affordance, the button works by click
				  regardless, and Ctrl+K is bound and documented in
				  docs/ACCESSIBILITY.md §4.
					*/}
					<span className="hidden lg:inline">Search</span>
				</span>
				<kbd className="hidden rounded-sm border border-border bg-bg-subtle px-1.5 py-0.5 font-mono text-text-muted text-xs lg:inline">
					⌘K
				</kbd>
			</button>

			{/* No `useKeyWithClickEvents` suppression here, unlike the mobile sheet:
			    this dialog carries a real `onKeyDown` for the arrow keys, so the rule
			    is satisfied rather than waived. The click handler is light-dismiss,
			    whose keyboard equivalent is Escape and is `showModal()`'s job. */}
			<dialog
				ref={dialogRef}
				aria-label="Command palette"
				data-testid="command-palette"
				// Only the "focus was nowhere" case is corrected. If the reader had
				// focus on a real element when they opened the palette, the browser has
				// already put it back and overriding that would lose their place.
				onClose={() => {
					if (restoreToTrigger.current) triggerRef.current?.focus()
				}}
				// The dialog fills the viewport and the panel inside it does not, so a
				// click that lands on the dialog itself came from the empty space
				// around the panel. The wrapper below is `pointer-events-none` so that
				// space really does reach this handler.
				onClick={(event) => {
					if (event.target === dialogRef.current) dialogRef.current.close()
				}}
				onKeyDown={(event) => {
					if (event.key === 'ArrowDown') {
						event.preventDefault()
						move(1)
					} else if (event.key === 'ArrowUp') {
						event.preventDefault()
						move(-1)
					} else if (event.key === 'Escape') {
						// ESCAPE IS HANDLED HERE BECAUSE WEBKIT DOES NOT HANDLE IT FOR US.
						//
						// `showModal()` closes on Escape in every engine — except that
						// Safari/WebKit gives a focused text field first refusal on the key
						// (its native "revert the value" behaviour) and the event never
						// reaches the dialog's cancel step. The palette focuses its search
						// box on open, so that is *always* the state Escape arrives in: the
						// palette was unclosable by keyboard in Safari, which is a real
						// keyboard trap for real readers, not a test artifact. Caught by
						// `command-palette.spec.ts` on CI's Linux WebKit.
						//
						// Deliberately NOT `preventDefault()`: closing is the same outcome
						// the browser was going to produce, so on Chromium and Firefox this
						// runs first and the native cancel then finds an already-closed
						// dialog and does nothing. Suppressing the default would instead
						// leave WebKit's field-revert as the only visible effect on engines
						// that were working correctly.
						dialogRef.current?.close()
					}
				}}
				// `backdrop-blur` on the ::backdrop, not just a wash: the palette
				// covers a page whose mesh is high-contrast in places, and a flat 70%
				// scrim over it still leaves shapes competing with the result rows.
				className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-text backdrop:bg-bg/70 backdrop:backdrop-blur-sm"
			>
				<div className="pointer-events-none mx-auto flex h-full w-full max-w-2xl flex-col px-gutter pt-16 pb-16 sm:pt-24">
					{/* `u-glass` and the glass panel role, so the palette is the same
					    material as the header it opens from rather than a second,
					    unrelated surface treatment. `shadow-overlay` is what separates
					    it from the blurred page behind. */}
					<div className="pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-xl border border-glass-border bg-glass-panel shadow-overlay u-glass">
						<div className="flex items-center gap-3 border-glass-border border-b px-4 py-3.5">
							<SearchIcon size="sm" className="text-text-muted" />
							<input
								ref={inputRef}
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								onKeyDown={(event) => {
									// Enter from the input activates the top result, which is what
									// "type three letters and hit Enter" means to anyone who has
									// used a palette before.
									if (event.key !== 'Enter') return
									event.preventDefault()
									rows()[0]?.click()
								}}
								placeholder="Search pages, posts and actions"
								aria-label="Search pages, posts and actions"
								autoComplete="off"
								spellCheck={false}
								data-testid="palette-input"
								// No `outline-none`. The focus ring is a hard blocker to remove
								// (CLAUDE.md §8) and this is the first focused element in the
								// dialog, so it is the one ring most likely to be needed.
								className="w-full bg-transparent text-text placeholder:text-text-muted"
							/>
						</div>

						{/*
						  The result count, announced politely on every keystroke. A
						  filtered list is a silent change to a sighted reader's benefit
						  only: without this, typing narrows 20 rows to 0 and a screen
						  reader says nothing at all.
						*/}
						<p aria-live="polite" className="sr-only">
							{results.length === 0
								? 'No results'
								: `${results.length} result${results.length === 1 ? '' : 's'}`}
						</p>

						{groups.length === 0 ? (
							/* The query is echoed back. "No matches." alone leaves the
							   reader unsure whether the box registered what they typed —
							   which is exactly the moment they are already unsure. */
							<p className="px-4 py-10 text-center text-sm text-text-muted">
								No matches for{' '}
								<span className="text-text">“{query.trim()}”</span>. Try a page
								name, a post title, or “theme”.
							</p>
						) : (
							/* The scroller is this middle child, not the panel: the panel is
							   a flex column whose search row and hint bar must stay put, and
							   `min-h-0` on it is what lets this one shrink and scroll rather
							   than pushing the bar off the bottom. No explicit max height —
							   the wrapper's `h-full` minus its padding already is the
							   available height, and hard-coding a `vh` would be a second,
							   competing answer to the same question. */
							<div ref={listRef} className="overflow-y-auto p-2">
								{groups.map(({ group, commands: rowsInGroup }) => (
									<div key={group}>
										{/*
										  A real heading, not a styled <div>. The dialog is
										  `display: none` when closed, so these never enter the
										  outline of the page behind it — and while it is open they
										  are how a screen-reader user jumps between sections of
										  the results.
										*/}
										<h2
											id={`palette-group-${group}`}
											// `text-text-muted`, not `text-text-subtle`: the subtle
											// role is contracted at 3:1, which is the LARGE-text bar,
											// and this is 12px. Same trap as the footer's build line.
											className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 font-heading text-text-muted text-xs uppercase tracking-caps"
										>
											{group}
											{/*
											  The count, and it is deliberately INSIDE the heading
											  rather than beside it. A screen-reader user navigating
											  by heading hears "Pages, 4" and knows how far the group
											  runs; a sibling <span> would be skipped by exactly that
											  navigation. The live region above still announces the
											  total, which is the other half of the same answer.
											*/}
											{/* `text-text-muted` again, for the same reason the heading
											    itself uses it — 12px is below the large-text bar the
											    subtle role is contracted at. */}
											<span className="tabular-nums">{rowsInGroup.length}</span>
										</h2>
										<ul
											aria-labelledby={`palette-group-${group}`}
											className="flex flex-col"
										>
											{rowsInGroup.map((command) => (
												<li key={command.id}>
													<CommandRow command={command} onAction={runAction} />
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						)}

						{/*
						  The keyboard legend. It is `aria-hidden` and that is the point:
						  every shortcut it names is either the browser's own behaviour on
						  a focused link (Enter) or documented in ACCESSIBILITY.md §4, and
						  a screen-reader user already gets Tab through real anchors. What
						  the bar is for is the sighted reader who opened the palette with
						  the mouse and does not know the arrow keys work — announcing it
						  would put four keycap glyphs in front of everyone else on every
						  open.
						*/}
						<div
							aria-hidden="true"
							className="flex items-center gap-4 border-glass-border border-t px-4 py-2.5 text-text-muted text-xs"
						>
							<span className="flex items-center gap-1.5">
								<Key>↑</Key>
								<Key>↓</Key>
								navigate
							</span>
							<span className="flex items-center gap-1.5">
								<Key>↵</Key>
								open
							</span>
							<span className="ml-auto flex items-center gap-1.5">
								<Key>esc</Key>
								close
							</span>
						</div>
					</div>
				</div>
			</dialog>
		</>
	)
}

/**
 * One keycap. Small enough to be a local component, and worth being one so the
 * legend below cannot drift into four slightly different chips.
 */
function Key({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="inline-flex min-w-5 items-center justify-center rounded-sm border border-border bg-bg-subtle px-1 py-0.5 font-mono text-xs leading-none">
			{children}
		</kbd>
	)
}

/**
 * `focus-visible:bg-surface-hover` IS NOT DECORATION HERE, IT IS THE FIX FOR A
 * REAL GAP. The rows previously carried a hover background and nothing else, so
 * arrowing down the list moved focus with only the browser's default ring to
 * show for it — against a translucent panel, on a row that spans the full
 * width, that is the weakest possible signal in the one interaction mode this
 * component exists to serve. The ring is still there (removing it is a hard
 * blocker, CLAUDE.md §8); this is a fill underneath it, so the keyboard and the
 * pointer now point at a row the same way.
 */
const ROW_CLASS =
	'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-text no-underline transition-colors duration-fast hover:bg-surface-hover focus-visible:bg-surface-hover'

/**
 * One row. A `<a>` when it navigates and a `<button>` when it acts — the
 * distinction is carried by the type (`lib/commands.ts`), so there is no branch
 * here that can render the wrong element for a command.
 */
function CommandRow({
	command,
	onAction,
}: {
	command: Command
	onAction: (action: CommandAction) => void
}) {
	const content = (
		<>
			<span className="flex min-w-0 flex-col">
				<span className="truncate">{command.label}</span>
				{command.hint ? (
					<span className="truncate text-sm text-text-muted">
						{command.hint}
					</span>
				) : null}
			</span>
			{command.kind === 'link' && command.external ? (
				<ArrowUpRightIcon size="sm" className="text-text-muted" />
			) : null}
		</>
	)

	if (command.kind === 'link') {
		return (
			<a href={command.href} data-command className={ROW_CLASS}>
				{content}
			</a>
		)
	}

	return (
		<button
			type="button"
			data-command
			onClick={() => onAction(command.action)}
			className={ROW_CLASS}
		>
			{content}
		</button>
	)
}
