import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { site } from '@/config/site'
import { PrintButton, ResumeDocument } from '@/features/experience'
import {
	experience,
	skillsByGroup,
	yearsOfExperience,
} from '@/lib/content/data'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, occupationSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/resume` — C-04, C-05. docs/WEBSITE_STRUCTURE.md §4.11.
 *
 * `noindex` IS NOT USED HERE, deliberately (§4.11). This is a legitimate
 * landing target for a name search and the HTML version is the primary
 * artifact — the PDF is the fallback. The site-wide `site.indexable` flag still
 * governs, because it governs everything.
 *
 * THERE IS NO GENERATED PDF ARTIFACT, AND THAT IS C-06 MET RATHER THAN SKIPPED.
 * The reader prints this page; `print.css` (C-05) is what makes the output a
 * clean single-column document. The full argument is in `print-button.tsx` —
 * briefly, a committed PDF has to be produced before `check:links` walks the
 * export or the page ships a dead link, and printing the live page removes the
 * artifact, the filename, and the drift all at once.
 */

const DESCRIPTION =
	'The same record as the experience page, rendered for a scan and for a printer — one source, three presentations.'

export const metadata: Metadata = pageMetadata({
	title: 'Résumé',
	description: DESCRIPTION,
	path: '/resume/',
})

export default function ResumePage() {
	const years = yearsOfExperience()

	return (
		<PageContainer tone="record" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						path: '/resume/',
						name: 'Résumé',
						description: DESCRIPTION,
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

			<Stack gap={6}>
				<PageHeader
					eyebrow="Résumé"
					title={site.name}
					lede={site.role}
					meta={
						<Text size="sm" tone="muted">
							{years} years · India · remote, with overlap into CET and ET
							mornings
						</Text>
					}
				/>

				{/*
				  `data-print-hide` rather than a `print:hidden` utility: the print
				  rules live in one readable stylesheet (print.css) instead of being
				  scattered across thirty class strings where nobody can review them
				  as a whole. This attribute is the only hook the markup provides.
				*/}
				<Stack direction="row" gap={3} wrap data-print-hide="">
					<PrintButton />
					<Button asChild size="lg" variant="ghost">
						<a href="/experience/">Full experience page</a>
					</Button>
				</Stack>
			</Stack>

			<ResumeDocument
				roles={experience}
				skillGroups={skillsByGroup()}
				summary={site.description}
			/>
		</PageContainer>
	)
}
