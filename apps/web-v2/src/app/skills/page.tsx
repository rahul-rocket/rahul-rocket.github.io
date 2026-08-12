import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { SkillGroups } from '@/features/skills'
import { skillCountByDepth, skills, skillsByGroup } from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/skills` — A-04. docs/WEBSITE_STRUCTURE.md §4.4.
 *
 * `ItemList` structured data over the whole table: this page is the site's
 * densest keyword surface, and the list is the honest machine-readable form of
 * it. The depth ratings are not in the structured data, because there is no
 * schema.org vocabulary that expresses "I have debugged this at 2am" and
 * inventing one would be a claim in a format nobody can check.
 */

const DESCRIPTION =
	'Every technology I would claim, with an honest depth rating and its definition — three named tiers, no percentage bars.'

export const metadata: Metadata = pageMetadata({
	title: 'Skills',
	description: DESCRIPTION,
	path: '/skills/',
})

export default function SkillsPage() {
	const groups = skillsByGroup()
	const counts = skillCountByDepth()

	return (
		<PageContainer tone="record" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: '/skills/',
						name: 'Skills',
						description: DESCRIPTION,
					}),
					itemListSchema(
						skills.map((skill) => ({
							name: skill.name,
							href: skill.evidence ?? '/skills/',
						})),
					),
				)}
			/>

			<PageHeader
				eyebrow="Skills"
				title="What I would actually claim"
				lede={DESCRIPTION}
			/>

			<SkillGroups groups={groups} counts={counts} />

			<PageFooterCTA
				title="Claims are cheap; the work is not"
				body="Every rating above is meant to be checkable against the case studies and the writing. If one looks generous, tell me."
				actions={[
					{ label: 'Read the case studies', href: '/projects/' },
					{ label: 'Get in touch', href: '/contact/' },
				]}
			/>
		</PageContainer>
	)
}
