'use client'

import { useRef } from 'react'
import type { StaticRoute } from '@/config/nav'
import { NavLink } from './nav-link'

/**
 * L-05 — the mobile sheet.
 *
 * IT IS A NATIVE `<dialog>`, AND THAT IS THE WHOLE IMPLEMENTATION.
 *
 * The task asks for four behaviours: focus moves in and is trapped, Escape
 * closes, focus returns to the trigger, and the background is `inert`.
 * `showModal()` provides all four, in the browser, correctly, including the
 * cases hand-rolled traps get wrong — shadow roots, iframes, the browser's own
 * find-in-page, and screen-reader virtual cursors, which `inert` suppresses but
 * a `keydown` Tab trap does not. CLAUDE.md §7: semantic HTML before ARIA. A
 * `<div role="dialog">` with a `useFocusTrap` hook would be a hundred lines of
 * client JavaScript reimplementing this less well.
 *
 * It also means the component holds no state. There is no `isOpen`: the dialog
 * knows whether it is open, and nothing in React's tree needs to. `aria-expanded`
 * is deliberately absent — it belongs to disclosure widgets, not to modal
 * triggers, and `aria-haspopup="dialog"` is the correct announcement here.
 *
 * WHAT IT COSTS. The sheet has no entrance animation. One could be added with
 * `@starting-style` and `transition-behavior: allow-discrete`, but that is
 * uneven across the support matrix, and the alternative — animating from
 * `opacity: 0` — would put a transparent element in the served HTML, which the
 * no-JS spec fails by design. An instant sheet is within the ≤150ms feedback law
 * either way. It is on the L-09 list to revisit once the motion primitives and
 * their reduced-motion paths exist.
 *
 * WITHOUT JAVASCRIPT the trigger is hidden (`data-js-only`, see lib/progressive.ts)
 * and the footer site map is the navigation. That is the honest fallback: the
 * footer already carries every route, so nothing is unreachable.
 */
export function MobileNav({ items }: { items: readonly StaticRoute[] }) {
	const dialogRef = useRef<HTMLDialogElement>(null)

	// No "close on navigate" effect, because there is nothing to close: every nav
	// link is a real document load (see nav-link.tsx), so following one takes the
	// sheet with it. That effect existed for exactly as long as `next/link` did,
	// and went with it — `e2e/route-change.spec.ts` asserts the property it was
	// there to protect.

	return (
		<>
			<button
				type="button"
				onClick={() => dialogRef.current?.showModal()}
				aria-haspopup="dialog"
				// The word is dropped below `sm`, so the accessible name has to come
				// from here rather than from the content — the icon is `aria-hidden`,
				// and a button whose only child is a hidden icon announces as "button".
				// It matches the visible word at the widths that have one (WCAG 2.5.3).
				aria-label="Menu"
				data-js-only
				data-testid="menu-trigger"
				className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm md:hidden"
			>
				<MenuIcon />
				{/*
				  Hidden below `sm` for room, not for taste. At 320px the header carries
				  the wordmark plus three controls, and with this word present they do
				  not fit: the wordmark wrapped onto a second line — which no
				  overflow assertion catches, because wrapping is how the browser
				  AVOIDS overflowing. It was found by looking at a screenshot, and
				  `e2e/shell.spec.ts` now pins the wordmark to one line.
				*/}
				<span className="hidden sm:inline">Menu</span>
			</button>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the click handler below is
			    light-dismiss on the backdrop. Its keyboard equivalent is Escape, which
			    `showModal()` already handles natively — adding a key handler here would
			    either duplicate that or bind a second, undiscoverable key to it. */}
			<dialog
				ref={dialogRef}
				aria-label="Site menu"
				data-testid="menu-sheet"
				// A click whose target is the dialog itself came from the backdrop —
				// every click on the contents targets a descendant, which is why the
				// dialog carries no padding of its own and the panel below does.
				onClick={(event) => {
					if (event.target === dialogRef.current) dialogRef.current.close()
				}}
				className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-4/5 max-w-xs border-border border-l bg-surface p-0 text-text backdrop:bg-bg/70"
			>
				{/* `data-testid` on the PANEL, not only on the dialog. The keyboard
				    spec needs a click target that is inside the sheet and is
				    definitively not a link — its padding. Before this it clicked the
				    centre of the <nav>, which stopped being empty space the moment the
				    route manifest grew past a handful of entries, and the test then
				    failed by navigating rather than by finding a bug. */}
				<div
					data-testid="menu-panel"
					className="flex h-full flex-col gap-8 p-6"
				>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => dialogRef.current?.close()}
							className="rounded-md border border-border px-3 py-2 text-sm"
						>
							Close
						</button>
					</div>

					{/* Unlabelled on purpose. The dialog around it is already named "Site
					    menu", and a nav landmark inside a named dialog inherits that
					    context — labelling it too makes a screen reader announce the same
					    two words twice on entry. */}
					<nav>
						<ul className="flex flex-col gap-1">
							{items.map((route) => (
								<li key={route.path}>
									<NavLink
										href={route.path}
										className="block rounded-md px-3 py-3 font-heading text-text no-underline hover:bg-surface-hover aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:underline-offset-4"
									>
										{route.label}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</dialog>
		</>
	)
}

/**
 * Decorative: the button's own text is the accessible name, so the icon is
 * hidden rather than given a redundant one. `currentColor` and `1em` sizing mean
 * it tracks the text it sits beside through both themes and every type scale
 * step, with no colour token of its own to keep in sync.
 */
function MenuIcon() {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		>
			<path d="M4 7h16M4 12h16M4 17h16" />
		</svg>
	)
}
