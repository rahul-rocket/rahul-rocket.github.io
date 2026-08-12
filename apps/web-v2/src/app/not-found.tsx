import type { Metadata } from 'next'
import { PageBackdrop } from '@/components/layout/page-backdrop'
import { builtRoutes } from '@/config/nav'
import { contactEmail, mailtoHref } from '@/config/site'

/**
 * L-10 — the 404. Exports to `out/404.html`, which is the exact filename
 * GitHub Pages serves for an unmatched path (docs/GITHUB_PAGES.md).
 *
 * THIS PAGE IS LOAD-BEARING IN A WAY MOST 404s ARE NOT.
 *
 * There is no server and no redirect table. Every dead link — a renamed slug, a
 * URL in someone's old bookmark, a typo in a talk's slide — lands here and
 * nowhere else. It is the only recovery mechanism the site has, so it does the
 * two things a recovery page must: say plainly what happened, and offer real
 * onward paths rather than a single "go home" and a shrug.
 *
 * The route list comes from the manifest, filtered to what exists and then to
 * the five highest-priority, so this page cannot rot into offering links that
 * 404 themselves — which would be a memorable way to fail — and cannot grow
 * into the footer site map, which is already one scroll below it.
 * WEBSITE_STRUCTURE §4.13 asks for five and a contact link, and the count is
 * the point: a recovery page that lists everything has not recovered anybody.
 *
 * WHAT IS DELIBERATELY ABSENT: a search box, and any attempt to guess what the
 * reader meant. Both need either a server or a client-side index of every route,
 * and a fuzzy match that guesses wrong is more annoying than a short list that
 * is honestly complete. When the blog is large enough for it to matter, B-02's
 * in-HTML search is the thing to link here.
 *
 * The focus requirement in the task ("focus to `<h1>`") is met by the shell
 * rather than here: `main#main` is a focus target and route-change focus
 * management is L-12. A hard navigation to a 404 — which is the only way to
 * reach this page on a static host — already starts the reader at the top of a
 * fresh document, so there is nothing to move.
 */

export const metadata: Metadata = {
	title: 'Page not found',
	// `noindex` on top of the layout default. A 404 that gets indexed is a 404
	// that shows up in results, which is the one outcome worse than the dead link
	// that led here.
	robots: { index: false, follow: false },
}

export default function NotFound() {
	return (
		<div className="relative isolate overflow-hidden px-gutter py-section">
			{/* The 404 does not use `PageContainer`, so it renders the ambient page
			    mesh itself — see `<PageBackdrop />` for why the root layout cannot
			    hold it. Untoned: a page that does not exist has no page identity. */}
			<PageBackdrop />

			<div className="u-backdrop u-drift" aria-hidden="true">
				<div className="u-grid" />
			</div>

			<div className="relative mx-auto flex max-w-reading flex-col gap-8">
				<div className="flex flex-col gap-4">
					{/*
					  The status code is a <p>, not part of the heading. "404" is
					  diagnostic detail for the small number of readers it means anything
					  to; the heading is the sentence everyone else needs. A heading that
					  reads "404" tells a screen-reader user nothing about the page.
					*/}
					<p className="font-mono text-sm text-text-subtle uppercase tracking-caps">
						Error 404
					</p>
					<h1 className="u-gradient-text font-heading text-display leading-display tracking-display">
						This page does not exist
					</h1>
					<p className="text-text-muted">
						The link that brought you here is wrong, or the page it pointed at
						has moved. Nothing on this site is deleted at its URL, so if this
						address once worked it has a redirect stub — and its absence is a
						bug worth reporting.
					</p>
				</div>

				<nav aria-labelledby="not-found-routes" className="flex flex-col gap-3">
					<h2
						id="not-found-routes"
						className="font-heading text-text text-xs uppercase tracking-caps"
					>
						Where to instead
					</h2>
					<ul className="flex flex-col gap-2">
						{/*
						  Sorted by the manifest's own sitemap priority, which is already
						  the site's judgment about which routes matter most — reusing it
						  means this list cannot disagree with that one, and a new
						  high-priority route joins it without an edit here.
						*/}
						{[...builtRoutes]
							.sort((a, b) => b.priority - a.priority)
							.slice(0, 5)
							.map((route) => (
								<li key={route.path}>
									<a href={route.path}>{route.label}</a>
								</li>
							))}
					</ul>

					<p className="text-sm text-text-muted">
						Every other page is in the site map at the foot of this one. If a
						link on someone else's site sent you here,{' '}
						<a href={mailtoHref('Broken link on rahul-rocket.github.io')}>
							tell me at {contactEmail()}
						</a>{' '}
						— a dead URL is a bug on my side, not yours.
					</p>
				</nav>
			</div>
		</div>
	)
}
