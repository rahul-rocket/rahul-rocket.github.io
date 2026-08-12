import { ChevronRightIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

/**
 * A trail. `href` absent means "this is where you are" — the last crumb, which
 * is rendered as text rather than as a link to the page you are already on.
 */
export interface Crumb {
	label: string
	/** Site-absolute with a trailing slash, matching the route manifest. */
	href?: string
}

/**
 * Breadcrumbs, for the two nested route families that have a parent worth
 * offering: `/blog/[slug]` and `/projects/[slug]`.
 * docs/WEBSITE_STRUCTURE.md §2.
 *
 * NOT ON TOP-LEVEL PAGES, and that is a rule rather than an oversight. A
 * breadcrumb on `/about/` would read "Home › About", which is one link the
 * header already offers and one label the `<h1>` already states. Breadcrumbs
 * earn their place when the parent is *not* otherwise reachable from the page —
 * here, the blog index from a post.
 *
 * THE MARKUP IS THE ACCESSIBILITY. `<nav aria-label="Breadcrumb">` wrapping an
 * `<ol>` is the WAI-ARIA Authoring Practices pattern verbatim: the landmark
 * makes it findable, the ordered list conveys depth and position, and
 * `aria-current="page"` marks the end. The separators are `aria-hidden`
 * decoration — the list structure already says "child of", and a screen reader
 * reading "chevron" between every crumb is the characteristic failure of
 * breadcrumbs built from `<div>`s and text.
 *
 * The last crumb is not a link because linking the current page is a WCAG 2.4.4
 * smell and, more practically, a control that appears to do something and does
 * nothing.
 *
 * `BreadcrumbList` JSON-LD is deliberately NOT here. It is P-12 in the backlog,
 * alongside `Article` and `TechArticle`, and it belongs with the rest of a
 * page's structured data rather than emitted per component — two JSON-LD blocks
 * describing one page from two files is how a graph acquires contradictions.
 * This component's `items` are the intended input to it.
 *
 * `flex-wrap` is not decoration either: a deep trail at 320px would otherwise
 * scroll the page horizontally, which UI_GUIDELINES §5 bans outright.
 */
export function Breadcrumb({
	items,
	className,
}: {
	items: readonly Crumb[]
	className?: string
}) {
	if (items.length === 0) return null

	return (
		<nav aria-label="Breadcrumb" className={className}>
			<ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
				{items.map((crumb, index) => {
					const isLast = index === items.length - 1

					return (
						<li
							key={crumb.href ?? crumb.label}
							className="flex items-center gap-x-2"
						>
							{index > 0 ? (
								<ChevronRightIcon size="sm" className="text-text-subtle" />
							) : null}

							{crumb.href && !isLast ? (
								<a
									href={crumb.href}
									className="text-text-muted no-underline hover:text-text hover:underline"
								>
									{crumb.label}
								</a>
							) : (
								// `aria-current="page"` only on the real terminus. A trail whose
								// last item is a link to somewhere else is a broken trail, so
								// the two conditions are deliberately the same branch.
								<span
									aria-current={isLast ? 'page' : undefined}
									className={cn(isLast && 'text-text')}
								>
									{crumb.label}
								</span>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
