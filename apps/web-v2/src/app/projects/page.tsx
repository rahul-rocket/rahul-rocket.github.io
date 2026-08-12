import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Text } from '@/components/ui/text'
import { ProjectsIndex } from '@/features/projects'
import { skills } from '@/lib/content/data'
import { getCaseStudies } from '@/lib/content/projects'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/projects` — docs/WEBSITE_STRUCTURE.md §4.6. P-04.
 *
 * A thin route: metadata, structured data, and composition. Every decision
 * about how an entry looks is in `features/projects`, which is the boundary
 * ARCHITECTURE §5 draws — this file should be readable in twenty seconds and
 * should say what the page *is*, not how it renders.
 */

const DESCRIPTION =
	'Case studies with the problem, the options, the decision, what it cost, and the measured outcome — not a feature list.'

export const metadata: Metadata = pageMetadata({
	title: 'Projects',
	description: DESCRIPTION,
	path: '/projects/',
})

export default function ProjectsPage() {
	const studies = getCaseStudies()

	return (
		<PageContainer tone="work" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: '/projects/',
						name: 'Projects',
						description: DESCRIPTION,
					}),
					itemListSchema(
						studies.map((study) => ({
							name: study.frontmatter.title,
							href: study.href,
						})),
					),
				)}
			/>

			<PageHeader
				title="Projects"
				lede={DESCRIPTION}
				meta={
					<Text size="sm" tone="muted">
						What counts as a featured project here: a real constraint existed, a
						genuine decision was made between at least two viable options, the
						outcome is measurable, and it can be published without breaking a
						confidence.
					</Text>
				}
			/>

			<ProjectsIndex studies={studies} skills={skills} />

			<PageFooterCTA
				title="Want the record behind these?"
				body="The experience page has the roles and the outcomes; the open-source page has the work that is public in full."
				actions={[
					{ label: 'View experience', href: '/experience/' },
					{ label: 'Open source', href: '/open-source/' },
				]}
			/>
		</PageContainer>
	)
}
