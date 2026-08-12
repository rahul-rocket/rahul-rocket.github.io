import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { TableOfContents } from '@/components/layout/table-of-contents'
import { Callout } from '@/components/mdx/callout'
import { JsonLdScript } from '@/components/seo/json-ld'
import { CaseStudyHeader, CaseStudyNav } from '@/features/projects'
import { resolveSkills } from '@/lib/content/data'
import {
	getAdjacentCaseStudies,
	getCaseStudy,
	getCaseStudyParams,
} from '@/lib/content/projects'
import { pageMetadata } from '@/lib/seo/metadata'
import {
	articleSchema,
	breadcrumbSchema,
	graph,
} from '@/lib/seo/structured-data'

/**
 * `/projects/[slug]` — P-03, P-06, P-12, P-13.
 * docs/PROJECT_CASE_STUDIES.md, docs/WEBSITE_STRUCTURE.md §4.7.
 *
 * The twelve fixed sections are the MDX file's structure, not this file's. That
 * is deliberate: the section order is an editorial contract
 * (PROJECT_CASE_STUDIES §3) and a template that emitted the headings would let
 * a study omit "What I'd Do Differently" by leaving a prop undefined. Written
 * as prose, a missing section is visible in the diff and in the table of
 * contents that this page derives from the headings.
 *
 * Static export requires every dynamic route to be enumerable at build time
 * (ARCHITECTURE §7) — `generateStaticParams` is that enumeration, over the same
 * filtered list the index renders.
 */

interface PageProps {
	params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
	return getCaseStudyParams()
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	try {
		const study = getCaseStudy(slug)
		return pageMetadata({
			title: study.frontmatter.title,
			description: study.frontmatter.summary,
			path: study.href,
			type: 'article',
			image: study.frontmatter.ogImage,
			publishedTime: study.frontmatter.publishedAt,
			modifiedTime: study.frontmatter.updatedAt,
			tags: study.frontmatter.stack,
		})
	} catch {
		return {}
	}
}

export default async function CaseStudyPage({ params }: PageProps) {
	const { slug } = await params

	let study: ReturnType<typeof getCaseStudy>
	try {
		study = getCaseStudy(slug)
	} catch {
		notFound()
	}

	const { previous, next } = getAdjacentCaseStudies(slug)
	const stack = resolveSkills(
		study.frontmatter.stack,
		`content/projects/${slug}.mdx`,
	)

	// Resolved at build time by webpack's context over content/projects/*.mdx.
	// There is no runtime import — the compiled component is part of the bundle
	// graph, which is what keeps the MDX runtime cost at zero.
	const { default: MDXContent } = await import(
		`../../../../content/projects/${slug}.mdx`
	)

	const crumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Projects', href: '/projects/' },
	]

	return (
		<PageContainer
			tone="work"
			width="page"
			breadcrumb={[...crumbs, { label: study.frontmatter.title }]}
		>
			<JsonLdScript
				data={graph(
					articleSchema({
						type: 'TechArticle',
						path: study.href,
						headline: study.frontmatter.title,
						description: study.frontmatter.summary,
						publishedAt: study.frontmatter.publishedAt,
						updatedAt: study.frontmatter.updatedAt,
						image: study.frontmatter.ogImage,
						keywords: study.frontmatter.stack,
					}),
					breadcrumbSchema([
						...crumbs,
						{ label: study.frontmatter.title, href: study.href },
					]),
				)}
			/>

			<article className="flex flex-col gap-12">
				<CaseStudyHeader study={study} stack={stack} />

				{study.frontmatter.needsReview ? (
					<Callout variant="warning" title="Drafted, pending review">
						<p>
							This case study is written to the site's documented standard but
							has not yet been checked against the author's own records. Treat
							its numbers as illustrative.
						</p>
					</Callout>
				) : null}

				{/*
				  The sticky rail is a sibling of the prose, not a floating overlay:
				  at ≥1280px it takes a real column, and below that it is absent
				  rather than collapsed above the article, where it would push the
				  first paragraph off the screen (BLOG_SYSTEM §6).
				*/}
				<div className="flex flex-col gap-12 xl:flex-row xl:items-start xl:gap-16">
					<div className="prose min-w-0 flex-1">
						<MDXContent />
					</div>

					<aside className="hidden shrink-0 xl:sticky xl:top-[calc(var(--header-height)+2rem)] xl:block xl:w-56">
						<TableOfContents items={study.headings} />
					</aside>
				</div>

				<CaseStudyNav previous={previous} next={next} />
			</article>

			<PageFooterCTA
				title="Have a system with this shape?"
				body="If any of the above resembles the problem in front of you, the fastest route to something useful is a paragraph about the actual constraint."
				actions={[
					{ label: 'Get in touch', href: '/contact/' },
					{ label: 'All projects', href: '/projects/' },
				]}
			/>
		</PageContainer>
	)
}
