'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

/**
 * P-05 / A-04 / B-02 — URL-backed filtering over content already in the HTML.
 *
 * THE FULL LIST IS ALWAYS IN THE SERVED MARKUP AND FILTERING IS A DOM
 * OPERATION. There is no index to download, no request, and nothing to render
 * client-side — every item is present with JavaScript disabled, and this
 * component only *hides* items. That is what keeps a filtered page correct for
 * a reader without scripts (they see everything, which is the honest degraded
 * state) and what keeps the cost of the feature at a few hundred bytes.
 *
 * WHY IT DOES NOT USE `useSearchParams`. Next's hook requires a Suspense
 * boundary in a statically exported route and forces the consuming subtree
 * client-side. `window.location.search` plus `history.pushState` gives the same
 * shareable-and-back-button-correct behaviour with no framework coupling — and
 * `popstate` is what makes the back button restore a filter rather than leave a
 * stale one, which is the half most implementations skip.
 *
 * IT DOES NOT IMPORT `cn`. That would pull `tailwind-merge` — 8.7 KB gz — into
 * the shared client chunk of every route that renders a filter (CLAUDE.md §10).
 * Class strings here are written out for that reason and no other.
 *
 * ACCESSIBILITY, AND WHY IT IS SHAPED THIS WAY:
 *
 * - Facets are a real `<fieldset>` of `<input type="checkbox">` with a
 *   `<legend>`, not a row of toggle buttons. A-04's acceptance criterion names
 *   the fieldset specifically; a `aria-pressed` button group is announced
 *   differently and loses the group's name in several screen readers.
 * - The result count lives in ONE polite live region. It announces "8 of 12
 *   shown" after a change, so a keyboard user learns the effect of a checkbox
 *   they cannot see the result of.
 * - The controls are `data-js-only`, so they are absent from the tab order
 *   until the boot script confirms scripts ran — a filter that cannot filter is
 *   a dead control, and the unfiltered list is the documented fallback.
 */

export interface FilterFacet {
	/** The URL search parameter this facet writes to. */
	param: string
	legend: string
	options: readonly { value: string; label: string; count: number }[]
}

export interface ListFilterProps {
	/** Id of the container whose `[data-filter-item]` children are filtered. */
	targetId: string
	facets?: readonly FilterFacet[]
	/** Enables the text box, writing to this parameter. Omit for facets only. */
	searchParam?: string
	searchLabel?: string
	searchPlaceholder?: string
	/** Singular/plural noun for the live region — "post", "project". */
	noun: string
}

export function ListFilter({
	targetId,
	facets = [],
	searchParam,
	searchLabel = 'Search',
	searchPlaceholder = 'Filter by keyword',
	noun,
}: ListFilterProps) {
	const searchId = useId()
	const [query, setQuery] = useState('')
	const [selected, setSelected] = useState<Record<string, string[]>>({})
	const [status, setStatus] = useState('')
	// The very first apply happens on mount, when it must NOT announce: a live
	// region that fires on page load talks over the page title.
	const hasInteracted = useRef(false)

	/**
	 * Apply state to the DOM and to the URL.
	 *
	 * `hidden` rather than `display: none` in a class: the attribute removes the
	 * element from the accessibility tree as well as from the layout, and it
	 * cannot be defeated by a more specific CSS rule elsewhere.
	 */
	const apply = useCallback(
		(nextQuery: string, nextSelected: Record<string, string[]>) => {
			const container = document.getElementById(targetId)
			if (!container) return

			const items =
				container.querySelectorAll<HTMLElement>('[data-filter-item]')
			const needle = nextQuery.trim().toLowerCase()
			let shown = 0

			for (const item of items) {
				const text = (item.dataset.filterText ?? '').toLowerCase()
				const tokens = (item.dataset.filterTokens ?? '').split(/\s+/)

				const matchesQuery = needle === '' || text.includes(needle)
				// AND across facets, OR within one: selecting two technologies means
				// "uses either", selecting a technology and a tag means "both".
				const matchesFacets = Object.values(nextSelected).every(
					(values) =>
						values.length === 0 ||
						values.some((value) => tokens.includes(value)),
				)

				const visible = matchesQuery && matchesFacets
				item.hidden = !visible
				if (visible) shown += 1
			}

			const empty = container.querySelector<HTMLElement>('[data-filter-empty]')
			if (empty) empty.hidden = shown > 0

			if (hasInteracted.current) {
				setStatus(
					shown === items.length
						? `Showing all ${items.length} ${plural(noun, items.length)}`
						: `${shown} of ${items.length} ${plural(noun, items.length)} shown`,
				)
			}

			const params = new URLSearchParams()
			if (searchParam && nextQuery.trim()) {
				params.set(searchParam, nextQuery.trim())
			}
			for (const [param, values] of Object.entries(nextSelected)) {
				if (values.length > 0) params.set(param, values.join(','))
			}

			const search = params.toString()
			const url = `${window.location.pathname}${search ? `?${search}` : ''}`
			if (url !== `${window.location.pathname}${window.location.search}`) {
				// `pushState`, not `replaceState`: each filter change is a step a
				// reader can walk back, which is what A-04's "back-button correct"
				// criterion asks for.
				window.history.pushState(null, '', url)
			}
		},
		[noun, searchParam, targetId],
	)

	/** Read the URL into state. Runs on mount and on every `popstate`. */
	const readUrl = useCallback(() => {
		const params = new URLSearchParams(window.location.search)
		const nextQuery = searchParam ? (params.get(searchParam) ?? '') : ''
		const nextSelected: Record<string, string[]> = {}

		for (const facet of facets) {
			const raw = params.get(facet.param)
			const valid = new Set(facet.options.map((option) => option.value))
			// Unknown values from a hand-edited URL are dropped rather than
			// producing an empty result set the reader cannot explain.
			nextSelected[facet.param] = raw
				? raw.split(',').filter((value) => valid.has(value))
				: []
		}

		setQuery(nextQuery)
		setSelected(nextSelected)
		apply(nextQuery, nextSelected)
	}, [apply, facets, searchParam])

	useEffect(() => {
		readUrl()
		window.addEventListener('popstate', readUrl)
		return () => window.removeEventListener('popstate', readUrl)
	}, [readUrl])

	function onSearch(value: string) {
		hasInteracted.current = true
		setQuery(value)
		apply(value, selected)
	}

	function onToggle(param: string, value: string, checked: boolean) {
		hasInteracted.current = true
		const current = selected[param] ?? []
		const next = checked
			? [...current, value]
			: current.filter((entry) => entry !== value)
		const nextSelected = { ...selected, [param]: next }
		setSelected(nextSelected)
		apply(query, nextSelected)
	}

	function onReset() {
		hasInteracted.current = true
		const cleared: Record<string, string[]> = {}
		for (const facet of facets) cleared[facet.param] = []
		setQuery('')
		setSelected(cleared)
		apply('', cleared)
	}

	const hasFilters =
		query.trim() !== '' ||
		Object.values(selected).some((values) => values.length > 0)

	return (
		<div
			data-js-only=""
			className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm"
		>
			{searchParam ? (
				<div className="flex flex-col gap-2">
					<label htmlFor={searchId} className="text-sm text-text-muted">
						{searchLabel}
					</label>
					<input
						id={searchId}
						type="search"
						value={query}
						onChange={(event) => onSearch(event.target.value)}
						placeholder={searchPlaceholder}
						// `min-h-11` is the 44px touch floor UI_GUIDELINES §6 sets, and it
						// applies to a text input as much as to a button.
						className="min-h-11 w-full max-w-md rounded-lg border border-border-strong bg-bg px-4 py-2 text-body text-text transition-colors duration-fast placeholder:text-text-subtle hover:border-accent-muted"
					/>
				</div>
			) : null}

			{facets.map((facet) => (
				<fieldset
					key={facet.param}
					className="flex flex-col gap-3 border-0 p-0"
				>
					<legend className="mb-1 font-heading text-text text-xs uppercase tracking-caps">
						{facet.legend}
					</legend>
					<div className="flex flex-wrap gap-2">
						{facet.options.map((option) => {
							const checked = (selected[facet.param] ?? []).includes(
								option.value,
							)
							return (
								/*
						  A CHIP THAT IS STILL A CHECKBOX.

						  The control was a native `<input type="checkbox">` beside a text
						  label — correct, and the single most default-looking element on
						  the site: a row of eight system checkboxes in the middle of a
						  designed page.

						  WHAT CHANGED IS ONLY THE PAINTING. The input is still a real
						  checkbox inside a real `<fieldset>` with a real `<legend>`,
						  because A-04's acceptance criterion names that structure and
						  because an `aria-pressed` button group is announced differently
						  and loses the group name in several screen readers. It is
						  `sr-only` rather than `hidden` or `appearance-none`, so it keeps
						  its place in the tab order, its role and its checked state —
						  everything an assistive technology reads is what it was.

						  The `peer` pattern paints the sibling `<span>` from that input's
						  state, and is used rather than `:has()` because it needs no
						  support query and no fallback branch.

						  `peer-focus-visible` IS NOT OPTIONAL, and is the thing this
						  pattern gets wrong when it is copied: the global `:focus-visible`
						  rule in themes.css lands on the input, which is invisible, so
						  without an explicit ring on the chip a keyboard user tabs through
						  eight controls with no indication of where they are. That is a
						  hard blocker (CLAUDE.md §8), which is why the ring below restates
						  the token rather than relying on the global rule.
						*/
								<label
									key={option.value}
									className="inline-flex cursor-pointer items-center"
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={(event) =>
											onToggle(facet.param, option.value, event.target.checked)
										}
										className="peer sr-only"
									/>
									{/*
						  `min-h-11` keeps the 44px touch floor (UI_GUIDELINES §6) now that
						  the hit area is the chip rather than the whole row.

						  The checked state is carried by fill, border AND text colour
						  together, never by colour alone (DESIGN_SYSTEM §3).
						  `accent-muted` as the fill rather than `accent`, because this is
						  a selected filter and not an action: the page's primary buttons
						  have to stay the strongest thing on it.
						*/}
									<span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 text-sm text-text-muted transition-colors duration-fast hover:border-border-strong hover:text-text peer-checked:border-accent peer-checked:bg-accent-muted peer-checked:text-text peer-focus-visible:outline-2 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2">
										{option.label}
										{/*
						  The count is inside the label, so it is part of the control's
						  accessible name — "TypeScript, 3" — rather than an adjacent
						  number a screen reader never reaches.

						  `text-text-muted`, not `text-text-subtle`. The subtle role is
						  contracted at 3:1 — the LARGE-text bar — and this is 14px, so
						  4.5:1 applies and only the muted role clears it. axe caught
						  exactly this on four routes in the light theme.
						*/}
										<span className="font-mono text-text-muted text-xs tabular-nums">
											{option.count}
										</span>
									</span>
								</label>
							)
						})}
					</div>
				</fieldset>
			))}

			<div className="flex items-center justify-between gap-4">
				{/*
				  ONE live region for the whole control. `aria-live="polite"` waits for
				  a pause rather than interrupting, which is right for a count that
				  changes on every keystroke. It is always in the DOM — a live region
				  added at the moment it has something to say is frequently missed by
				  screen readers, which watch regions that already exist.
				*/}
				<p aria-live="polite" className="text-sm text-text-muted">
					{status}
				</p>

				{hasFilters ? (
					<button
						type="button"
						onClick={onReset}
						className="min-h-11 rounded-full px-3 py-2 text-accent text-sm underline underline-offset-2 hover:text-accent-hover"
					>
						Clear filters
					</button>
				) : null}
			</div>
		</div>
	)
}

function plural(noun: string, count: number): string {
	return count === 1 ? noun : `${noun}s`
}
