import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { ExperienceList } from '@/features/experience'
import { experience, skills, yearsOfExperience } from '@/lib/content/data'
import { getCaseStudies } from '@/lib/content/projects'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, occupationSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/experience` — A-03, A-07. docs/WEBSITE_STRUCTURE.md §4.5.
 *
 * The year count in the lede is DERIVED from the earliest role rather than
 * written down, so it cannot be wrong for eleven months of every twelve —
 * PERSONAL_BRAND §3's "numbers or nothing" applied to the one number that goes
 * stale on its own.
 */

export function generateMetadata(): Metadata {
	const years = yearsOfExperience()
	return pageMetadata({
		title: 'Experience',
		description: `${years} years of building and running production systems, with the outcome of each role rather than its duties.`,
		path: '/experience/',
	})
}

export default function ExperiencePage() {
	const years = yearsOfExperience()
	const skillsById = new Map(skills.map((skill) => [skill.id, skill]))
	const caseStudiesBySlug = new Map(
		getCaseStudies().map((study) => [study.slug, study]),
	)

	return (
		<PageContainer tone="record" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						path: '/experience/',
						name: 'Experience',
						description: `${years} years of building and running production systems.`,
					}),
					occupationSchema(
						experience.map((role) => ({
							title: role.title,
							company: role.company,
							startedAt: role.startedAt,
							endedAt: role.endedAt,
						})),
					),
				)}
			/>

			<PageHeader
				eyebrow="Experience"
				title="The record, with outcomes rather than duties"
				lede={`${years} years across commerce, payments and logistics. Every bullet below is something that changed, not something I was responsible for.`}
			/>

			<ExperienceList
				roles={experience}
				skillsById={skillsById}
				caseStudiesBySlug={caseStudiesBySlug}
			/>

			<PageFooterCTA
				title="Same data, two other shapes"
				body="The résumé is this record rendered for a scan and a print; the journey is the narrative of what changed and why."
				actions={[
					{ label: 'View résumé', href: '/resume/' },
					{ label: 'Read the journey', href: '/journey/' },
				]}
			/>
		</PageContainer>
	)
}
