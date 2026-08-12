'use client'

import { useEffect } from 'react'

/**
 * L-11 — the recovery boundary.
 *
 * `'use client'` is not a choice here: React error boundaries are a client-only
 * mechanism, and Next requires this file to be one. It is the only component in
 * the tree that is client-marked for a reason other than interaction.
 *
 * WHAT CAN ACTUALLY REACH THIS PAGE, WHICH IS NARROWER THAN IT LOOKS.
 *
 * There is no server, so there is no server error. Every route is pre-rendered
 * HTML that has already been produced successfully — if a page could throw
 * during render, `next build` would have failed and nothing would have shipped.
 * What is left is the client: a throw during hydration, or in an effect. That is
 * a small target, and it is exactly why this boundary is worth having rather
 * than not: the failures it catches are the ones that survive a green build.
 *
 * The reader still sees the shell around this — header, footer, working
 * navigation — because a route-level boundary replaces only the route. That is
 * the point of putting it here rather than at `global-error.tsx`: a reader who
 * hits this keeps every way out of it.
 *
 * `reset()` re-renders the segment. It genuinely helps for a transient failure
 * and genuinely does not for a deterministic one, which is why the copy offers
 * reloading as the second option rather than promising the button will work.
 */
// Named `RouteError`, not `Error`: Next only cares that this file's DEFAULT
// export is the boundary, and calling it `Error` shadows the global inside its
// own module — where `error.digest` is typed against that very global.
export default function RouteError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// The only telemetry this site has. There is no analytics and no error
		// service (TECH_STACK §3), so the console is where a failure becomes
		// visible at all — to the reader who thinks to open it, and to anyone
		// reproducing a report. Swallowing it entirely would make a hydration bug
		// undiagnosable from the outside.
		console.error('Route error boundary caught:', error)
	}, [error])

	return (
		<div className="px-gutter py-section">
			<div className="mx-auto flex max-w-reading flex-col gap-8">
				<div className="flex flex-col gap-4">
					<p className="font-mono text-sm text-text-subtle uppercase tracking-caps">
						Something broke
					</p>
					{/*
					  Still exactly one <h1>: this replaces the route's content, so the
					  page's own heading is gone by the time this renders.
					*/}
					<h1 className="u-gradient-text font-heading text-display leading-display tracking-display">
						This page failed to load
					</h1>
					<p className="text-text-muted">
						The error is on this end, not yours. The rest of the site still
						works — the navigation above and below this message is unaffected.
					</p>
				</div>

				<div className="flex flex-wrap gap-4">
					<button
						type="button"
						onClick={reset}
						className="u-press rounded-full border border-border-strong px-5 py-2 text-text transition-colors duration-fast hover:border-accent-muted hover:bg-surface-hover"
					>
						Try again
					</button>
					<a href="/" className="self-center">
						Go to the home page
					</a>
				</div>

				{/*
				  `digest` is the only identifier that survives into production — the
				  message and stack are stripped by React in a production build, so
				  without this a bug report says "it broke". Rendered only when present,
				  so it never shows an empty label in development.
				*/}
				{error.digest ? (
					<p className="text-sm text-text-muted">
						Reference: <code>{error.digest}</code>
					</p>
				) : null}
			</div>
		</div>
	)
}
