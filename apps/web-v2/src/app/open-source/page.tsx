import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageFooterCTA } from '@/components/layout/page-cta'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { ExternalLinkIcon } from '@/components/ui/icons'
import { Surface } from '@/components/ui/surface'
import { Text } from '@/components/ui/text'
import {
	contributions,
	minorContributions,
	openSourceProjects,
	skills,
} from '@/lib/content/data'
import type { OpenSourceEntry } from '@/lib/content/records'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, itemListSchema, pageSchema } from '@/lib/seo/structured-data'

/**
 * `/open-source` — C-09. docs/WEBSITE_STRUCTURE.md §4.8.
 *
 * SECTIONS WITH NOTHING IN THEM ARE OMITTED, NOT RENDERED EMPTY. A heading over
 * an empty list reads as a rendering bug rather than as a young page, and the
 * same narrowing the header and footer apply to unbuilt routes applies here:
 * the data is the plan, what renders is the state.
 *
 * Contributions to other people's projects are currently empty on purpose —
 * each one is a checkable claim that a specific pull request exists and was
 * merged, so none are drafted. `content/open-source.ts` carries the reasoning.
 *
 * Live repository metrics (stars, last push) are C-08's job and are fetched at
 * BUILD time into `content/generated/repos.json`, never client-side
 * (ARCHITECTURE §7). An entry with no generated data renders without metrics
 * rather than with a zero — a zero is a claim and an absence is not.
 */

const DESCRIPTION =
	'Work that is public in full — the site you are reading, and the tools that came out of building it.'

export const metadata: Metadata = pageMetadata({
	title: 'Open Source',
	description: DESCRIPTION,
	path: '/open-source/',
})

export default function OpenSourcePage() {
	const skillName = new Map(skills.map((skill) => [skill.id, skill.name]))

	return (
		<PageContainer tone="work" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'CollectionPage',
						path: '/open-source/',
						name: 'Open Source',
						description: DESCRIPTION,
					}),
					itemListSchema(
						[...openSourceProjects, ...contributions].map((entry) => ({
							name: entry.name,
							href: entry.url,
						})),
					),
				)}
			/>

			<PageHeader
				eyebrow="Open source"
				title="Work that is public in full"
				lede={DESCRIPTION}
				meta={
					<Text size="sm" tone="muted" className="max-w-reading">
						A merged one-line typo fix is not a contribution worth a card. An
						entry here needs a sentence of substance behind it, which is why
						this list is short and why the compact list exists.
					</Text>
				}
			/>

			<EntrySection
				id="own-projects"
				title="Own projects"
				entries={openSourceProjects}
				skillName={skillName}
			/>

			{contributions.length > 0 ? (
				<EntrySection
					id="contributions"
					title="Contributions to other projects"
					entries={contributions}
					skillName={skillName}
				/>
			) : null}

			{minorContributions.length > 0 ? (
				<section aria-labelledby="minor" className="flex flex-col gap-4">
					<Heading id="minor" level={2} size="h3">
						Smaller contributions
					</Heading>
					<ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-text-muted">
						{minorContributions.map((entry) => (
							<li key={entry.url}>
								<a href={entry.url} rel="noopener noreferrer" target="_blank">
									{entry.project}
									<span className="sr-only"> (opens in a new tab)</span>
								</a>{' '}
								— {entry.what}
							</li>
						))}
					</ul>
				</section>
			) : null}

			<PageFooterCTA
				title="How to collaborate"
				body="Issues and pull requests on any of the above are welcome. For anything larger, a paragraph about the problem is a better start than a pull request."
				actions={[
					{ label: 'Get in touch', href: '/contact/' },
					{ label: 'Read the case studies', href: '/projects/' },
				]}
			/>
		</PageContainer>
	)
}

function EntrySection({
	id,
	title,
	entries,
	skillName,
}: {
	id: string
	title: string
	entries: readonly OpenSourceEntry[]
	skillName: ReadonlyMap<string, string>
}) {
	return (
		<section aria-labelledby={id} className="flex flex-col gap-6">
			<Heading id={id} level={2} size="h3">
				{title}
			</Heading>

			<ul className="grid list-none grid-cols-1 gap-6 p-0 lg:grid-cols-2">
				{entries.map((entry) => (
					<li key={entry.id} className="flex">
						<Surface
							as="article"
							level="raised"
							radius="lg"
							className="flex flex-1 flex-col gap-4 p-6"
						>
							<Heading level={3} size="h3">
								<a
									href={entry.url}
									rel="noopener noreferrer"
									target="_blank"
									className="inline-flex items-center gap-2 text-text no-underline hover:text-accent"
								>
									{entry.name}
									<ExternalLinkIcon size="sm" />
									<span className="sr-only"> (opens in a new tab)</span>
								</a>
							</Heading>

							<Text tone="muted" size="sm">
								{entry.summary}
							</Text>

							{entry.stack.length > 0 ? (
								<ul className="mt-auto flex list-none flex-wrap gap-2 p-0">
									{entry.stack.map((skillId) => (
										<li key={skillId}>
											<Badge>{skillName.get(skillId) ?? skillId}</Badge>
										</li>
									))}
								</ul>
							) : null}
						</Surface>
					</li>
				))}
			</ul>
		</section>
	)
}
