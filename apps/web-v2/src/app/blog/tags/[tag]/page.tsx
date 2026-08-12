import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { PostList } from '@/features/blog'
import { getPostsByTag, getTagsInUse } from '@/lib/content/posts'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/blog/tags/[tag]` — B-05. docs/BLOG_SYSTEM.md, docs/WEBSITE_STRUCTURE.md §6.
 *
 * ENUMERATED FROM TAGS IN USE, NOT FROM THE VOCABULARY. `TAGS` in
 * `schemas.ts` is the closed list an author may choose from; this route exists
 * only for the ones a post actually carries. Generating the full vocabulary
 * would ship archive pages with nothing on them — a route that exists to
 * disappoint, and sitemap entries pointing at it.
 *
 * Sitemap priority 0.3 (§6): these are navigational aids, not destinations, and
 * an archive competing with the post it lists is a self-inflicted duplicate.
 */

interface PageProps {
	params: Promise<{ tag: string }>
}

export function generateStaticParams(): { tag: string }[] {
	return getTagsInUse().map(({ tag }) => ({ tag }))
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { tag } = await params
	const posts = getPostsByTag(tag)
	if (posts.length === 0) return {}

	return pageMetadata({
		title: `Writing tagged ${tag}`,
		description: `Every post about ${tag} — ${posts.length} ${
			posts.length === 1 ? 'entry' : 'entries'
		}, newest first.`,
		path: `/blog/tags/${tag}/`,
	})
}

export default async function TagArchivePage({ params }: PageProps) {
	const { tag } = await params
	const posts = getPostsByTag(tag)

	// An unknown tag is a 404 rather than an empty page. `generateStaticParams`
	// means this cannot happen in the export; it is here because the page's
	// correctness should not depend on that function staying in step with it.
	if (posts.length === 0) notFound()

	const description = `Every post about ${tag} — ${posts.length} ${
		posts.length === 1 ? 'entry' : 'entries'
	}, newest first.`

	return (
		<PageContainer
			tone="writing"
			width="reading"
			breadcrumb={[
				{ label: 'Home', href: '/' },
				{ label: 'Writing', href: '/blog/' },
				{ label: tag },
			]}
		>
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: `/blog/tags/${tag}/`,
						name: `Writing tagged ${tag}`,
						description,
					}),
					itemListSchema(
						posts.map((post) => ({
							name: post.frontmatter.title,
							href: post.href,
						})),
					),
				)}
			/>

			<PageHeader eyebrow="Tag" title={tag} lede={description} />

			{/* No filter on an archive: the archive IS the filter, and offering a
			    second one inside it is two controls for one job. */}
			<PostList posts={posts} headingId="tagged-posts" showFilter={false} />

			<PageFooterCTA
				title="Browse everything"
				body="Tags are a way in, not a boundary — the full index carries search and every other tag."
				actions={[
					{ label: 'All writing', href: '/blog/' },
					{ label: 'Case studies', href: '/projects/' },
				]}
			/>
		</PageContainer>
	)
}
