import type { MetadataRoute } from 'next'

import { absoluteUrl, site } from '@/config/site'

/**
 * Q-03 — `robots.txt`, generated from the same flag the meta tag reads.
 *
 * ONE SOURCE FOR "IS THIS SITE INDEXABLE". `site.indexable` drives the robots
 * meta tag (via `lib/seo/metadata.ts`), the sitemap, and this file. The failure
 * mode that produces is impossible by construction: a `robots.txt` that allows
 * crawling while every page says `noindex` — or, worse, the reverse — is a
 * disagreement nothing surfaces until the site is already in an index.
 *
 * THE COMMITTED `public/robots.txt` IS REPLACED BY THIS. Next writes the
 * generated file into the export; a static file of the same name in `public/`
 * would win in some setups and lose in others, which is exactly the ambiguity
 * a build gate cannot see. It is deleted in the same change.
 *
 * `Disallow: /` while `noindex` — belt and braces, and neither is sufficient
 * alone: `robots.txt` stops a crawl but does not remove a URL already indexed,
 * and a `noindex` meta tag is only read if the page is crawled. The site needs
 * both until there is real, reviewed content behind every route.
 */
export default function robots(): MetadataRoute.Robots {
	if (!site.indexable) {
		return {
			rules: [{ userAgent: '*', disallow: '/' }],
		}
	}

	return {
		rules: [{ userAgent: '*', allow: '/' }],
		sitemap: absoluteUrl('/sitemap.xml'),
		host: site.url,
	}
}

/**
 * `output: 'export'` requires every route handler to declare itself static, and
 * Next's generated sitemap/robots routes are route handlers. Without this the
 * build fails at page-data collection with a message about `force-static` —
 * which is Next telling the truth: it cannot know that this function does not
 * read a request.
 */
export const dynamic = 'force-static'
