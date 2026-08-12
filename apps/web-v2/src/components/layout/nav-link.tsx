'use client'

import { usePathname } from 'next/navigation'

/**
 * A navigation link that knows whether it is the current page.
 *
 * WHY THIS IS A CLIENT COMPONENT.
 *
 * `aria-current="page"` needs the current route, and in a static export the root
 * layout cannot know it: the layout is rendered once per page at build time as a
 * shared shell, with no access to the route's path. There is no server-side
 * `usePathname`. The alternatives were to thread the path down from every page
 * — invasive, and every new page can forget it — or to drop the indication. This
 * is neither.
 *
 * The cost is that the indication is a progressive enhancement: without
 * JavaScript the links work and are correct, they simply do not mark which one
 * you are on. That is a WCAG 2.4.8 (AAA) affordance, not a failure.
 *
 * THE STYLE IS NOT COLOUR ALONE. `aria-current` also drives an underline, so the
 * current page is distinguishable without perceiving hue — CLAUDE.md §8.
 *
 * A PLAIN `<a>`, NOT `next/link`, AND THAT IS NOW A MEASURED DECISION RATHER
 * THAN A DEFERRAL.
 *
 * L-12 was written as "adopt `next/link` once route-change focus management
 * exists", and both halves were built: `next/link` here, a `RouteFocus`
 * component moving focus to the new `<h1>`, and a spec proving it. Then
 * size-limit failed. Client-side routing costs **+3.95 KB gz on every route**
 * (117.79 → 121.74 KB on Home), and Home's hard limit is 120 KB with 2.21 KB
 * spare. It does not fit, and the budget is not negotiable to make a feature
 * land (CLAUDE.md §15.3).
 *
 * Reverting cost nothing real, which is the part worth recording. On a static
 * export every page is a small pre-rendered document; a full navigation is a
 * cache hit and a paint. What client routing would have bought is a fractionally
 * faster transition. What it would have cost is 3.95 KB, a focus manager, a
 * live-region collision to avoid, and a modal sheet that no longer closes
 * itself — four moving parts to restore behaviour the browser already gets
 * right for free.
 *
 * `e2e/route-change.spec.ts` pins this: it asserts navigation IS a document
 * load, so reintroducing `next/link` without also reintroducing focus
 * management fails the suite rather than quietly regressing.
 */
export function NavLink({
	href,
	children,
	className,
}: {
	href: string
	children: React.ReactNode
	className?: string
}) {
	const pathname = usePathname()
	const isCurrent = normalize(pathname) === normalize(href)

	return (
		<a
			href={href}
			// Only ever "page" or absent. `aria-current="false"` is a string, which is
			// truthy to some assistive tech — every link would announce as current.
			aria-current={isCurrent ? 'page' : undefined}
			className={className}
		>
			{children}
		</a>
	)
}

/**
 * `trailingSlash: true` means the manifest stores '/blog/' and the browser is on
 * '/blog/', so these agree today. Normalizing anyway costs nothing and means a
 * future change to that config downgrades this to "no current marker" rather
 * than to "every link is marked current", which is the worse failure.
 */
function normalize(path: string | null): string {
	if (!path) return '/'
	return path.endsWith('/') ? path : `${path}/`
}
