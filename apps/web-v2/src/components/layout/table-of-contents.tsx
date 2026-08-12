'use client'

import { useEffect, useState } from 'react'

/**
 * P-06 / B-03 — the sticky "On this page" rail.
 *
 * A CLIENT COMPONENT, AND ONLY FOR `aria-current`. The list, the links and the
 * sticky positioning are all static; the single thing that needs a browser is
 * knowing which section is on screen. Without JavaScript the rail renders in
 * full and every link works — it is a list of anchors — so the degraded state
 * is a table of contents that does not highlight, which is a table of contents.
 *
 * IT DOES NOT IMPORT `cn` (CLAUDE.md §10) and it holds NO scroll state in
 * React. ANIMATION_GUIDELINES bans React state driven by scroll; this is driven
 * by an `IntersectionObserver` callback that fires per section boundary — a
 * handful of times per page — rather than per frame.
 *
 * `aria-current="location"`, not `"page"`. The reader is on this page; they are
 * *at* this section. `page` on an in-page anchor is announced as "current page"
 * next to the real current-page marker in the site nav, which is confusing in
 * exactly the place a screen-reader user is trying to orient.
 *
 * The rail is `hidden xl:block` at its call sites: below 1280px there is no
 * column for it, and duplicating the headings above the article would push the
 * first paragraph off the screen.
 */

export interface TocItem {
	id: string
	text: string
}

export function TableOfContents({
	items,
	label = 'On this page',
}: {
	items: readonly TocItem[]
	label?: string
}) {
	const [activeId, setActiveId] = useState<string | null>(null)

	useEffect(() => {
		if (items.length === 0) return

		const elements = items
			.map((item) => document.getElementById(item.id))
			.filter((element): element is HTMLElement => element !== null)

		if (elements.length === 0) return

		// The observed band is the top third of the viewport. A section counts as
		// "current" once its heading has passed the header and before it has
		// scrolled far up — which is what makes the highlight track reading
		// position rather than jumping to whichever heading is merely visible.
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

				const first = visible[0]
				if (first) setActiveId(first.target.id)
			},
			{ rootMargin: '-20% 0px -66% 0px', threshold: 0 },
		)

		for (const element of elements) observer.observe(element)
		return () => observer.disconnect()
	}, [items])

	if (items.length === 0) return null

	return (
		<nav aria-label={label} className="flex flex-col gap-3">
			<p className="font-heading text-text text-xs uppercase tracking-caps">
				{label}
			</p>
			<ol className="flex list-none flex-col gap-2 border-border border-l pl-0">
				{items.map((item) => {
					const isActive = item.id === activeId
					return (
						<li key={item.id}>
							<a
								href={`#${item.id}`}
								aria-current={isActive ? 'location' : undefined}
								className={
									isActive
										? '-ml-px block border-accent border-l-2 py-1 pl-4 text-sm text-text no-underline'
										: '-ml-px block border-transparent border-l-2 py-1 pl-4 text-sm text-text-muted no-underline hover:text-text'
								}
							>
								{item.text}
							</a>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
