import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { AboutContent } from '@/features/about'
import {
	facts,
	learningList,
	narrative,
	principlesList,
} from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, pageSchema, personSchema } from '@/lib/seo/structured-data'

/**
 * `/about` — A-02. docs/WEBSITE_STRUCTURE.md §4.2.
 *
 * `AboutPage` + `Person` structured data, because this is the primary target
 * for a name search (§4.2) and the `sameAs` links on the Person node are what
 * connect this site to the profiles that corroborate it.
 */

const DESCRIPTION =
	'How I work, what I am accountable for, and the principles behind it — each one with a concrete example rather than a slogan.'

export const metadata: Metadata = pageMetadata({
	title: 'About',
	description: DESCRIPTION,
	path: '/about/',
})

export default function AboutPage() {
	return (
		<PageContainer width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'AboutPage',
						path: '/about/',
						name: 'About',
						description: DESCRIPTION,
					}),
					personSchema(),
				)}
			/>

			<PageHeader
				eyebrow="About"
				title="Delivery and judgment are the same job seen from different distances"
				lede={DESCRIPTION}
			/>

			<AboutContent
				narrative={narrative}
				principles={principlesList}
				facts={facts}
				learning={learningList}
			/>

			<PageFooterCTA
				title="The record behind all of this"
				body="Experience has the roles and the outcomes, journey has the turns that changed how I work, and skills has the honest depth ratings."
				actions={[
					{ label: 'View experience', href: '/experience/' },
					{ label: 'Read the journey', href: '/journey/' },
				]}
			/>
		</PageContainer>
	)
}
