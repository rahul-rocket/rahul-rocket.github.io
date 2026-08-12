import type { MetadataRoute } from 'next'

import { builtRoutes } from '@/config/nav'
import { absoluteUrl, site } from '@/config/site'
import { getPosts, getTagsInUse } from '@/lib/content/posts'
import { getCaseStudies } from '@/lib/content/projects'

/**
 * Q-03 — the sitemap. docs/WEBSITE_STRUCTURE.md §6, docs/SEO.md.
 *
 * DERIVED FROM THE ROUTE MANIFEST AND THE CONTENT, NEVER HAND-MAINTAINED. A
 * hand-written sitemap is wrong the first time a route is added and stays wrong
 * silently, because nothing renders it. Reading `builtRoutes` means flipping a
 * `built` flag adds the route to the nav, the footer, the E2E suite AND this
 * file in one edit — which is the property that flag exists for.
 *
 * `lastModified` IS A REAL DATE OR IT IS ABSENT. For content it is the post's
 * own `updatedAt` or `publishedAt`. For static routes it is omitted entirely
 * rather than set to the build date: a sitemap claiming every page changed
 * today, on every deploy, teaches a crawler to ignore the field — and the
 * field's only job is to be believed. Same rule `/now`'s `dateModified`
 * follows, for the same reason.
 *
 * `output: 'export'` renders this to `out/sitemap.xml` at build time. There is
 * no server involved and no revalidation.
 *
 * IT IS EMITTED EVEN WHILE THE SITE IS `noindex`, deliberately: `robots.ts`
 * disallows everything in that state, so nothing crawls it, and the file being
 * present and correct is what makes lifting the flag a one-line change rather
 * than a change plus a discovery.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const changeFrequency = (path: string): 'weekly' | 'monthly' | 'yearly' => {
		if (path.startsWith('/blog')) return 'weekly'
		if (path === '/uses/' || path === '/journey/') return 'yearly'
		return 'monthly'
	}

	const staticEntries: MetadataRoute.Sitemap = builtRoutes.map((route) => ({
		url: absoluteUrl(route.path),
		changeFrequency: changeFrequency(route.path),
		priority: route.priority,
	}))

	const postEntries: MetadataRoute.Sitemap = getPosts().map((post) => ({
		url: absoluteUrl(post.href),
		lastModified: post.frontmatter.updatedAt ?? post.frontmatter.publishedAt,
		changeFrequency: 'weekly',
		priority: 0.8,
	}))

	const caseStudyEntries: MetadataRoute.Sitemap = getCaseStudies().map(
		(study) => ({
			url: absoluteUrl(study.href),
			lastModified:
				study.frontmatter.updatedAt ?? study.frontmatter.publishedAt,
			changeFrequency: 'monthly',
			priority: 0.9,
		}),
	)

	// §6 puts tag archives at 0.3: they are navigational aids, and an archive
	// competing in search with the post it lists is a self-inflicted duplicate.
	const tagEntries: MetadataRoute.Sitemap = getTagsInUse().map(({ tag }) => ({
		url: absoluteUrl(`/blog/tags/${tag}/`),
		changeFrequency: 'weekly',
		priority: 0.3,
	}))

	// A guard rather than a filter: if the flag is off, nothing should be
	// advertising URLs at all, and an empty sitemap is the honest form of that.
	if (!site.indexable) return []

	return [...staticEntries, ...caseStudyEntries, ...postEntries, ...tagEntries]
}

/**
 * `output: 'export'` requires every route handler to declare itself static, and
 * Next's generated sitemap/robots routes are route handlers. Without this the
 * build fails at page-data collection with a message about `force-static` —
 * which is Next telling the truth: it cannot know that this function does not
 * read a request.
 */
export const dynamic = 'force-static'
