import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Heading } from '@/components/ui/heading'
import { Surface } from '@/components/ui/surface'
import { Text } from '@/components/ui/text'
import { services } from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/services` — how an engagement is shaped.
 *
 * NOT IN THE ORIGINAL INFORMATION ARCHITECTURE. docs/WEBSITE_STRUCTURE.md §1's
 * route-count discipline says a route exists only when it has enough content to
 * justify a page a reader would not regret opening; this one earns it by
 * answering a question no other page answers. `/contact` says how to reach me
 * and `/about` says how I work — neither says what a piece of work looks like
 * or when it is the wrong fit. §1 and §4 were updated in the same change that
 * added it.
 *
 * NO RATES AND NO AVAILABILITY CLAIMS. Pricing belongs in a conversation about
 * scope, and a stale availability line is worse than none — `/now` carries
 * availability, where the date makes it honest.
 *
 * `bestFor` reads as a qualifier because it is one. Telling a reader that this
 * is the wrong engagement for them is the cheapest credibility on the page.
 */

const DESCRIPTION =
	'Four shapes of engagement — architecture review, delivery, incremental migration, and performance and accessibility remediation — with what each produces and who it is wrong for.'

export const metadata: Metadata = pageMetadata({
	title: 'Services',
	description: DESCRIPTION,
	path: '/services/',
})

export default function ServicesPage() {
	return (
		<PageContainer tone="work" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: '/services/',
						name: 'Services',
						description: DESCRIPTION,
					}),
					itemListSchema(
						services.map((service) => ({
							name: service.title,
							href: '/services/',
						})),
					),
				)}
			/>

			<PageHeader
				eyebrow="Services"
				title="What working together looks like"
				lede={DESCRIPTION}
				meta={
					<Text size="sm" tone="muted" className="max-w-reading">
						No rates on this page, deliberately: what something costs depends on
						what it is, and a number here would be either meaningless or wrong.
						Availability lives on the now page, where it carries a date.
					</Text>
				}
			/>

			<ul className="grid list-none grid-cols-1 gap-8 p-0 lg:grid-cols-2">
				{services.map((service) => (
					<li key={service.id} className="flex">
						<Surface
							as="article"
							level="raised"
							radius="lg"
							className="flex flex-1 flex-col gap-5 p-6"
						>
							<Heading level={2} size="h3">
								{service.title}
							</Heading>

							<Text tone="muted">{service.summary}</Text>

							<div className="flex flex-col gap-2">
								<Text size="xs" tone="muted" caps className="font-mono">
									What you get
								</Text>
								<ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-text-muted">
									{service.deliverables.map((item) => (
										<li key={item.slice(0, 40)}>{item}</li>
									))}
								</ul>
							</div>

							<div className="mt-auto flex flex-col gap-2 border-border border-t pt-4">
								<Text size="xs" tone="muted" caps className="font-mono">
									Best for
								</Text>
								<Text size="sm">{service.bestFor}</Text>
							</div>
						</Surface>
					</li>
				))}
			</ul>

			<PageFooterCTA
				title="Not sure which of these it is?"
				body="Most engagements start as one and turn out to be another. Describe the problem and I will tell you which — including if the answer is neither."
				actions={[
					{ label: 'Get in touch', href: '/contact/' },
					{ label: 'See the work', href: '/projects/' },
				]}
			/>
		</PageContainer>
	)
}
