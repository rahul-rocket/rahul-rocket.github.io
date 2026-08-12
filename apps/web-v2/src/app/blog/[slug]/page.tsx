import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { TableOfContents } from '@/components/layout/table-of-contents'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { PostNav } from '@/features/blog'
import {
	getAdjacentPosts,
	getPost,
	getPostParams,
	shouldShowDraftBanner,
} from '@/lib/content/posts'
import { formatDate } from '@/lib/format-date'
import { pageMetadata } from '@/lib/seo/metadata'
import {
	articleSchema,
	breadcrumbSchema,
	graph,
} from '@/lib/seo/structured-data'

/**
 * `/blog/[slug]` — B-03, B-09. docs/BLOG_SYSTEM.md §6.
 *
 * NO ENTRANCE ANIMATION ON THE BODY COPY, and that is a rule rather than an
 * omission: text that fades in while it is being read is hostile
 * (ANIMATION_GUIDELINES §10). There is no `<Reveal>` anywhere on this route.
 *
 * The reading-progress rail is the shell's — it lives in the header and is a
 * CSS scroll-driven animation with zero JavaScript, so a post page adds
 * nothing to get it.
 *
 * Static export requires every dynamic route to be enumerable at build time
 * (ARCHITECTURE §7); `generateStaticParams` reads the same filtered list the
 * index does, so a draft cannot leave a reachable page behind in production.
 */

interface PageProps {
	params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
	return getPostParams()
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	try {
		const post = getPost(slug)
		return pageMetadata({
			title: post.frontmatter.title,
			// One field, three jobs — index hook, meta description, feed
			// description — so they cannot drift. docs/BLOG_SYSTEM.md §3.
			description: post.frontmatter.summary,
			path: post.href,
			type: 'article',
			image: post.frontmatter.ogImage,
			publishedTime: post.frontmatter.publishedAt,
			modifiedTime: post.frontmatter.updatedAt,
			tags: post.frontmatter.tags,
		})
	} catch {
		return {}
	}
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params

	let post: ReturnType<typeof getPost>
	try {
		post = getPost(slug)
	} catch {
		notFound()
	}

	const { newer, older } = getAdjacentPosts(slug)

	// The template literal makes webpack build a context over content/blog/*.mdx
	// and resolve this at build time. There is no runtime import — the compiled
	// component is part of the bundle graph, which is what keeps the MDX runtime
	// cost at zero.
	const { default: MDXContent } = await import(
		`../../../../content/blog/${slug}.mdx`
	)

	const crumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Writing', href: '/blog/' },
	]

	return (
		// This is one of the two route families WEBSITE_STRUCTURE §2 puts a
		// breadcrumb on, and the reason is visible here: the post's parent is
		// `/blog/`, which nothing else on this page links to above the fold. The
		// last crumb is the title with no `href` — `Breadcrumb` renders it as the
		// current page rather than as a link to where you already are.
		<PageContainer
			tone="writing"
			width="page"
			breadcrumb={[...crumbs, { label: post.frontmatter.title }]}
		>
			<JsonLdScript
				data={graph(
					articleSchema({
						type: 'BlogPosting',
						path: post.href,
						headline: post.frontmatter.title,
						description: post.frontmatter.summary,
						publishedAt: post.frontmatter.publishedAt,
						updatedAt: post.frontmatter.updatedAt,
						image: post.frontmatter.ogImage,
						keywords: post.frontmatter.tags,
					}),
					breadcrumbSchema([
						...crumbs,
						{ label: post.frontmatter.title, href: post.href },
					]),
				)}
			/>

			<article className="flex flex-col gap-10">
				{shouldShowDraftBanner(post) ? (
					// Dev only. A draft is absent from production entirely, so this
					// banner can never reach a reader — it exists so the author cannot
					// mistake a draft preview for the published page.
					<p role="status" className="text-warning">
						DRAFT — this post is not published and is absent from the production
						build.
					</p>
				) : null}

				<header className="flex flex-col gap-4">
					<Heading level={1} size="h1" className="max-w-[22ch]">
						{post.frontmatter.title}
					</Heading>

					<Text tone="muted" className="max-w-lede">
						{post.frontmatter.summary}
					</Text>

					<Text size="sm" tone="muted" className="font-mono">
						<time dateTime={post.frontmatter.publishedAt.toISOString()}>
							{formatDate(post.frontmatter.publishedAt)}
						</time>
						{post.frontmatter.updatedAt ? (
							<>
								{' · updated '}
								<time dateTime={post.frontmatter.updatedAt.toISOString()}>
									{formatDate(post.frontmatter.updatedAt)}
								</time>
							</>
						) : null}
						{' · '}
						{post.readingTimeMinutes} min read
					</Text>

					<ul className="flex list-none flex-wrap gap-2 p-0">
						{post.frontmatter.tags.map((tag) => (
							<li key={tag}>
								<a
									href={`/blog/tags/${tag}/`}
									className="rounded-full no-underline"
								>
									<Badge tone="neutral">{tag}</Badge>
								</a>
							</li>
						))}
					</ul>
				</header>

				<div className="flex flex-col gap-12 xl:flex-row xl:items-start xl:gap-16">
					{/*
					  `data-feed-content` is the anchor `scripts/generate-feeds.mjs`
					  extracts from after the build. B-07 requires full content in the
					  feeds, and the export already holds the post fully rendered — so
					  the feed content is the page content by construction rather than a
					  second rendering free to drift. An attribute rather than a class
					  name, because a class is a styling decision somebody will change.
					*/}
					<div data-feed-content="" className="prose min-w-0 flex-1">
						<MDXContent />
					</div>

					<aside className="hidden shrink-0 xl:sticky xl:top-[calc(var(--header-height)+2rem)] xl:block xl:w-56">
						<TableOfContents items={post.headings} />
					</aside>
				</div>

				<PostNav newer={newer} older={older} />
			</article>

			{/* §6: "a single, quiet contact CTA at the end — no popup, ever." */}
			<PageFooterCTA
				title="Working on something like this?"
				body="If this was useful or wrong, I would like to know which. Either is a good reason to write."
				actions={[
					{ label: 'Get in touch', href: '/contact/' },
					{ label: 'All writing', href: '/blog/' },
				]}
			/>
		</PageContainer>
	)
}
