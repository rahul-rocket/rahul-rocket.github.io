import { builtRoutes } from '../src/config/nav'
import { THEMES } from '../src/lib/theme'

/**
 * The routes the E2E suite covers — now derived, not hand-maintained.
 *
 * F1-08 closed the placeholder this file used to be. Coverage comes from
 * `config/nav.ts`, the same manifest the header, footer, and sitemap read, so
 * adding a route puts it under the navigation and accessibility specs
 * automatically. Forgetting to test a new page is not possible without also
 * forgetting to add it to the site.
 *
 * `built: false` routes are excluded: the manifest is the complete *plan*, and
 * asserting against pages that do not exist yet would mean a permanently red
 * suite, which is the fastest way to teach people to ignore it. Flipping
 * `built` to `true` is the last step of building a page and the moment it comes
 * under the gate.
 *
 * Imports are relative rather than `@/`-aliased because Playwright compiles this
 * outside Next's module resolution.
 */

export interface Route {
	path: string
	/** Expected text of the page's single `<h1>`. */
	heading: string
}

export const routes: Route[] = builtRoutes.map((route) => ({
	path: route.path,
	heading: route.heading,
}))

/**
 * Dynamic routes are not in the manifest — they are enumerated from content at
 * build time. The fixture post is listed explicitly so the a11y and no-JS specs
 * cover a *content* page, whose markup (code blocks, tables, heading anchors,
 * external links) is far richer than any static page's and is where a11y
 * regressions actually appear.
 */
export const contentRoutes: Route[] = [
	{
		path: '/blog/static-export-content-pipeline/',
		heading: 'Validating content at the build boundary',
	},
]

export const allRoutes: Route[] = [...routes, ...contentRoutes]

/** Both themes, because a contrast regression can exist in exactly one of them. */
export const themes = THEMES
