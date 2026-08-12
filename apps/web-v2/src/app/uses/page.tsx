import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Heading } from '@/components/ui/heading'
import { usesGroups } from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/uses` — C-07. docs/WEBSITE_STRUCTURE.md §4.10.
 *
 * A `<dl>` PER GROUP, WHICH IS THE WHOLE LAYOUT. §4.10 asks for
 * "definition-list style; dense, scannable" and every entry carries a line on
 * *why* — the only part worth reading. The schema requires that line, so a page
 * of bare product names cannot be authored here even in a hurry.
 *
 * No animation beyond hover (§4.10), so there is no `<Reveal>` on this route
 * and it ships zero client JavaScript of its own.
 */

const DESCRIPTION =
	'Hardware, editor, and daily software — with one line on why each earns its place, which is the only part of a uses page worth reading.'

export const metadata: Metadata = pageMetadata({
	title: 'Uses',
	description: DESCRIPTION,
	path: '/uses/',
})

function groupId(title: string): string {
	return `uses-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export default function UsesPage() {
	return (
		<PageContainer tone="writing" width="reading">
			<JsonLdScript
				data={graph(
					pageSchema({
						path: '/uses/',
						name: 'Uses',
						description: DESCRIPTION,
					}),
				)}
			/>

			<PageHeader eyebrow="Uses" title="What I work with" lede={DESCRIPTION} />

			<div className="flex flex-col gap-16">
				{usesGroups.map((group) => (
					<section
						key={group.title}
						aria-labelledby={groupId(group.title)}
						className="flex flex-col gap-5"
					>
						<Heading
							id={groupId(group.title)}
							level={2}
							size="h3"
							className="border-border border-b pb-3"
						>
							{group.title}
						</Heading>

						<dl className="flex flex-col gap-5">
							{group.items.map((item) => (
								<div key={item.name} className="flex flex-col gap-1">
									<dt className="text-text">
										{item.url ? (
											<a
												href={item.url}
												rel="noopener noreferrer"
												target="_blank"
											>
												{item.name}
												<span className="sr-only"> (opens in a new tab)</span>
											</a>
										) : (
											item.name
										)}
									</dt>
									<dd className="text-sm text-text-muted">{item.why}</dd>
								</div>
							))}
						</dl>
					</section>
				))}
			</div>

			<PageFooterCTA
				title="The tools are the least interesting part"
				body="What they are used for is on the projects page, and how the site itself is built is a case study of its own."
				actions={[
					{ label: 'Read the case studies', href: '/projects/' },
					{ label: 'What I am doing now', href: '/now/' },
				]}
			/>
		</PageContainer>
	)
}
