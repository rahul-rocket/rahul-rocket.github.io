import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Text } from '@/components/ui/text'
import { Timeline } from '@/features/journey'
import { journey } from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/journey` — A-05. docs/WEBSITE_STRUCTURE.md §4.3.
 *
 * The narrative counterpart to `/experience`: trajectory and inflection points
 * rather than a duty list. Sitemap priority 0.6 — it is a supporting page, and
 * `nav.ts` carries that number rather than this file.
 */

const DESCRIPTION =
	'The turns that changed how I work — eight of them, each with what it altered rather than what it was.'

export const metadata: Metadata = pageMetadata({
	title: 'Journey',
	description: DESCRIPTION,
	path: '/journey/',
})

export default function JourneyPage() {
	return (
		<PageContainer tone="record" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						path: '/journey/',
						name: 'Journey',
						description: DESCRIPTION,
					}),
				)}
			/>

			<PageHeader
				eyebrow="Journey"
				title="The through-line"
				lede={DESCRIPTION}
				meta={
					<Text size="sm" tone="muted" className="max-w-reading">
						Every entry here had to pass one test: something changed because of
						it. A milestone that reads "joined X as Y" is a duty-list entry and
						belongs on the experience page, which already has it.
					</Text>
				}
			/>

			<Timeline milestones={journey} />

			<PageFooterCTA
				title="What's next"
				body="The current version of all this is on the now page, and the verifiable record is on the experience page."
				actions={[
					{ label: 'What I am doing now', href: '/now/' },
					{ label: 'View experience', href: '/experience/' },
				]}
			/>
		</PageContainer>
	)
}
