import type { Metadata } from 'next'
import { absoluteUrl, site } from '@/config/site'

/**
 * Q-01/Q-02 — the metadata builder every route uses. docs/SEO.md §2, §3.
 *
 * FOUR THINGS EVERY PAGE MUST HAVE, AND THREE OF THEM ARE INVISIBLE WHEN
 * MISSING: a title, a description, a canonical URL, and an OG image. A page
 * without a canonical competes with its own trailing-slash variant; a page
 * without an OG image gets a blank card on every platform that renders one.
 * Neither is visible in review, in the browser, or in a screenshot — which is
 * exactly why this is one function instead of an object literal per route.
 *
 * THE OG IMAGE IS ABSOLUTE, ALWAYS. Every major consumer — Slack, iMessage,
 * LinkedIn, WhatsApp — resolves `og:image` against its own host if it is
 * relative, so a relative one is a broken preview on every platform at once.
 * `absoluteUrl` is applied here rather than trusted to the caller.
 *
 * `robots` IS CENTRALISED ON `site.indexable`. Setting it per route is how one
 * page ends up indexed while the rest are not; reading it from one flag makes
 * lifting the block a single edit and makes an accidental exception impossible.
 */

/**
 * H-09 — where a route's generated card lives.
 *
 * MUST MATCH `slugForRoute` IN `scripts/generate-og.mjs`. That script writes one
 * card per exported page by walking `out/`; this computes the URL the metadata
 * points at. The two are separate because one runs inside the build and the
 * other after it, and they are kept in step by `scripts/check-export.mjs`,
 * which fails the build when a page references an `og:image` that is not in the
 * export (Q-02). A shared constant would not have caught a naming drift; a
 * check over the built output does.
 */
export function ogImageForPath(path: string): string {
	const trimmed = path.replace(/^\/|\/$/g, '')
	return `/og/${trimmed === '' ? 'default' : trimmed.replace(/\//g, '-')}.png`
}

export interface PageMetadataInput {
	/** Runs through the layout's `%s — Rahul Rocket` template. */
	title: string
	description: string
	/** Site-absolute, with the trailing slash. Becomes the canonical. */
	path: string
	/** Site-absolute path to a PNG. Defaults to this route's generated card. */
	image?: string
	/** `article` for posts and case studies; `website` for everything else. */
	type?: 'website' | 'article'
	publishedTime?: Date
	modifiedTime?: Date
	tags?: readonly string[]
}

export function pageMetadata({
	title,
	description,
	path,
	image,
	type = 'website',
	publishedTime,
	modifiedTime,
	tags,
}: PageMetadataInput): Metadata {
	const url = absoluteUrl(path)
	const imageUrl = absoluteUrl(image ?? ogImageForPath(path))

	return {
		title,
		description,
		alternates: { canonical: url },
		robots: site.indexable
			? { index: true, follow: true }
			: { index: false, follow: false },
		openGraph: {
			type,
			url,
			title,
			description,
			siteName: site.name,
			locale: site.locale.replace('-', '_'),
			images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
			...(type === 'article'
				? {
						publishedTime: publishedTime?.toISOString(),
						modifiedTime: (modifiedTime ?? publishedTime)?.toISOString(),
						authors: [absoluteUrl('/about/')],
						tags: tags ? [...tags] : undefined,
					}
				: {}),
		},
		twitter: {
			// `summary_large_image` rather than `summary`: a 1200×630 card in a
			// 120px thumbnail slot is unreadable, and the image is generated at
			// that ratio precisely so the large card is the right one.
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl],
		},
	}
}
