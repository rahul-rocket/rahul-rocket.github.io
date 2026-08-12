import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { PostList } from '@/features/blog'
import { getPosts } from '@/lib/content/posts'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/blog` — B-02. docs/BLOG_SYSTEM.md §5.
 *
 * The Phase 3 scaffolding this replaced was an `<ol>` of links, built so the
 * link checker and the axe job had real content to run against. What it grew
 * into is search and tag filtering over data already in the HTML, which is the
 * whole of §5's design: no index to download, no request, and every post
 * present with JavaScript disabled.
 */

const DESCRIPTION =
	'Notes on architecture, TypeScript, and the decisions that are expensive to reverse — written to show the reasoning rather than the result.'

export const metadata: Metadata = pageMetadata({
	title: 'Writing',
	description: DESCRIPTION,
	path: '/blog/',
})

export default function BlogIndexPage() {
	const posts = getPosts()

	return (
		<PageContainer tone="writing" width="reading">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: '/blog/',
						name: 'Writing',
						description: DESCRIPTION,
					}),
					itemListSchema(
						posts.map((post) => ({
							name: post.frontmatter.title,
							href: post.href,
						})),
					),
				)}
			/>

			<PageHeader
				title="Writing"
				lede={DESCRIPTION}
				meta={
					<p>
						{posts.length} {posts.length === 1 ? 'post' : 'posts'} ·{' '}
						<a href="/rss.xml">RSS</a> · <a href="/atom.xml">Atom</a> ·{' '}
						<a href="/feed.json">JSON</a>
					</p>
				}
			/>

			<PostList posts={posts} headingId="all-posts" />

			<PageFooterCTA
				title="Reading rather than skimming?"
				body="The case studies are the long form of the same argument: problem, options, decision, cost, measured outcome."
				actions={[
					{ label: 'Read the case studies', href: '/projects/' },
					{ label: 'Get in touch', href: '/contact/' },
				]}
			/>
		</PageContainer>
	)
}
