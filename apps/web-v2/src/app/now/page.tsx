import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Heading } from '@/components/ui/heading'
import { Surface } from '@/components/ui/surface'
import { Text } from '@/components/ui/text'
import { now } from '@/lib/content/data'
import { formatDate } from '@/lib/format-date'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/now` — C-12. docs/WEBSITE_STRUCTURE.md §1.
 *
 * `dateModified` COMES FROM THE CONTENT FILE AND NEVER FROM THE BUILD. That is
 * C-12's acceptance criterion and the reason this page is worth having at all:
 * a `/now` that claims to have been updated on every deploy has converted its
 * one honest signal into noise. If the date below is old, that is information.
 *
 * The date is also rendered visibly, not only in the structured data — a reader
 * deciding whether this site is maintained should not have to view source.
 */

const DESCRIPTION =
	'A dated snapshot of what I am building, working on, reading, and available for. Updated by hand.'

export const metadata: Metadata = pageMetadata({
	title: 'Now',
	description: DESCRIPTION,
	path: '/now/',
})

function sectionId(title: string): string {
	return `now-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export default function NowPage() {
	return (
		<PageContainer tone="record" width="reading">
			<JsonLdScript
				data={graph(
					pageSchema({
						path: '/now/',
						name: 'Now',
						description: DESCRIPTION,
						dateModified: now.updated.toISOString(),
					}),
				)}
			/>

			<PageHeader
				eyebrow="Now"
				title="What I am doing at the moment"
				lede={now.intro}
				meta={
					<p>
						Last updated{' '}
						<time dateTime={now.updated.toISOString()}>
							{formatDate(now.updated)}
						</time>
						. This page is edited by hand — the date is when I last touched it,
						not when the site was last deployed.
					</p>
				}
			/>

			<div className="flex flex-col gap-12">
				{now.sections.map((section) => (
					<section
						key={section.title}
						aria-labelledby={sectionId(section.title)}
						className="flex flex-col gap-4"
					>
						<Heading id={sectionId(section.title)} level={2} size="h3">
							{section.title}
						</Heading>
						<ul className="flex list-disc flex-col gap-3 pl-5">
							{section.items.map((item) => (
								<li key={item.slice(0, 40)} className="text-text-muted">
									{item}
								</li>
							))}
						</ul>
					</section>
				))}

				<Surface level="raised" radius="lg" className="p-6" as="section">
					<Heading level={2} size="h3" className="mb-3">
						Availability
					</Heading>
					<Text tone="muted">{now.availability}</Text>
				</Surface>
			</div>

			<PageFooterCTA
				title="Sound like a fit?"
				body="Tell me the actual problem in a paragraph — that is enough for me to say whether I am the right person for it."
				actions={[
					{ label: 'Get in touch', href: '/contact/' },
					{ label: 'How I work with clients', href: '/services/' },
				]}
			/>
		</PageContainer>
	)
}
