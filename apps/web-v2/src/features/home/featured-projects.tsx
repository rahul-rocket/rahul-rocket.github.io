import { SectionIntro } from '@/components/layout/section-intro'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Grid } from '@/components/ui/grid'
import { ArrowRightIcon } from '@/components/ui/icons'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { ProjectCard } from '@/features/projects'
import type { CaseStudy } from '@/lib/content/schemas'

/**
 * H-03 — Featured projects. docs/WEBSITE_STRUCTURE.md §4.1 section 3.
 *
 * BLOCKED UNTIL NOW, NOT SKIPPED. This section was the one Home deliberately
 * left out at H-04…H-08 because it needs `/projects/` to send a reader to and
 * real case studies to feature, and redesign/IMPLEMENTATION_PLAN.md §7 refuses
 * sample data that would read as a claim about a real person. Both arrived with
 * the content layer, so it is here rather than scaffolded.
 *
 * ASYMMETRIC, NOT A THREE-UP GRID (§4.1: "so it does not read as a card grid").
 * The first study takes a wide feature row and the other two share the row
 * below it. The asymmetry is the editorial signal — a uniform grid says the
 * three are interchangeable, and the ordering in `content/projects/` says they
 * are not.
 *
 * A SERVER COMPONENT, like every other section on this page. The only client
 * code is the shared reveal observer, and the reveal is on the section rather
 * than on each card: `useReveal` only arms elements that are off-screen at
 * mount, so a reveal per card is several inert client components decorating a
 * first paint that already showed them.
 */

const HEADING_ID = 'featured-projects'

export function FeaturedProjects({
	studies,
}: {
	studies: readonly CaseStudy[]
}) {
	// Nothing rather than an empty heading. A section header over no content
	// reads as a rendering bug, which is the same reasoning `SelectedWriting`
	// and `footerNavGroups` apply.
	if (studies.length === 0) return null

	const [feature, ...rest] = studies

	return (
		<Section labelledBy={HEADING_ID}>
			<Container>
				<Stack gap={12}>
					<Reveal>
						<SectionIntro
							id={HEADING_ID}
							index={1}
							eyebrow="Selected work"
							title="What was hard, and what it cost"
							lede="Three systems, written up as the problem, the options on the table, the decision, and the number it moved."
							action={
								/* A real link styled as a button — UI_GUIDELINES §4. `ghost` so
								   it does not compete with the heading beside it; the page's
								   one primary button belongs to the CTA at the bottom. */
								<Button asChild variant="ghost" size="sm">
									<a href="/projects/">
										All case studies
										{/* Decorative — the link text already says where it goes,
										    so `createIcon` marks it `aria-hidden`. */}
										<ArrowRightIcon />
									</a>
								</Button>
							}
						/>
					</Reveal>

					{/*
					  A list of things is a list (UI_GUIDELINES §4). `Stack as="ul"` and
					  `Grid as="ul"` rather than bare elements so `role="list"` arrives
					  through a spread: Safari drops list semantics from a
					  `list-style: none` ul — which Preflight applies to every one — but
					  Biome's `noRedundantRoles` reads the JSX literally and rejects the
					  role written on the element. `SelectedWriting` resolves the same
					  conflict the same way; the alternative is suppressing an
					  accessibility rule in order to keep an accessibility fix.
					*/}
					<Stack as="ul" role="list" gap={8}>
						{feature ? (
							<li>
								<ProjectCard study={feature} level={3} featured />
							</li>
						) : null}

						{rest.length > 0 ? (
							// `contents` so the nested grid's items participate in the row
							// below without this wrapper becoming a box of its own — the
							// list structure is what carries the semantics, the grid only
							// carries the layout.
							<li className="contents">
								<Grid as="ul" cols={2} gap={8}>
									{rest.map((study) => (
										<li key={study.slug} className="flex">
											<ProjectCard study={study} level={3} className="flex-1" />
										</li>
									))}
								</Grid>
							</li>
						) : null}
					</Stack>
				</Stack>
			</Container>
		</Section>
	)
}
