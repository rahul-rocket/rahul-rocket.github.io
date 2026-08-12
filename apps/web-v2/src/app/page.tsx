import type { Metadata } from 'next'
import { PageBackdrop } from '@/components/layout/page-backdrop'
import { JsonLdScript } from '@/components/seo/json-ld'
import { site } from '@/config/site'
import {
	Capabilities,
	ContactCta,
	CurrentFocus,
	FeaturedProjects,
	Hero,
	type ProofPoint,
	ProofStrip,
	SelectedWriting,
} from '@/features/home'
import { skills, yearsOfExperience } from '@/lib/content/data'
import { getPosts } from '@/lib/content/posts'
import { getCaseStudies, getFeaturedCaseStudies } from '@/lib/content/projects'
import { pageMetadata } from '@/lib/seo/metadata'
import {
	graph,
	pageSchema,
	personSchema,
	websiteSchema,
} from '@/lib/seo/structured-data'

/**
 * Home — all seven sections of docs/WEBSITE_STRUCTURE.md §4.1 are here.
 *
 * | Section              | Task |
 * | -------------------- | ---- |
 * | Hero                 | H-01 |
 * | Proof strip          | H-02 |
 * | Featured projects    | H-03 |
 * | What I do            | H-04 |
 * | Selected writing     | H-05 |
 * | Current focus        | H-06 |
 * | Contact CTA          | H-07 |
 *
 * The order is §4.1's and is not a layout preference: hero, then proof, then
 * the work, then what I do, then writing, then current focus, then the contact
 * action. It is the order of a reader's questions — who is this, why should I
 * believe them, show me, how do they think, are they still doing this, how do I
 * reach them.
 *
 * H-02 AND H-03 WERE ABSENT UNTIL NOW, AND THAT WAS THE POINT. §4.1 requires
 * every proof metric to be "verifiable elsewhere on the site", and featured work
 * needs `/projects/` to send a reader to. Neither existed at H-04…H-08, and
 * redesign/IMPLEMENTATION_PLAN.md §7 refuses the one category of placeholder
 * that would have filled the gap: sample data that reads as a claim about a real
 * person. Both are unblocked by the content layer rather than by a layout
 * decision, which is why they arrive complete instead of scaffolded.
 *
 * EVERY SECTION IS A SERVER COMPONENT. The only client code on this route is the
 * shared reveal observer, one instance per section.
 *
 * `Person` AND `WebSite` ARE DECLARED HERE, NOT IN THE LAYOUT (H-08). Every
 * other page references both by `@id` rather than re-declaring them, which is
 * what makes a consumer see one entity instead of fifteen. The layout carries no
 * JSON-LD at all — see the comment there for why a second script tag would break
 * the references rather than add to them.
 *
 * The `<main id="main">` wrapper is the shell's, not this file's — a page that
 * added its own would give the document two main landmarks, which axe fails and
 * which makes "skip to content" ambiguous about where it lands.
 */

const DESCRIPTION =
	'Full stack software engineer and software architect. Case studies with the problem, the options, the decision, and what it cost.'

/**
 * Home overrides the layout's title template rather than running through it:
 * `%s — Rahul Rocket` would render "Rahul Rocket — Rahul Rocket" here. The
 * `absolute` form is the documented way to opt one route out of a template.
 */
export const metadata: Metadata = {
	...pageMetadata({
		title: `${site.name} — ${site.role}`,
		description: DESCRIPTION,
		path: '/',
	}),
	title: { absolute: `${site.name} — ${site.role}` },
}

export default function HomePage() {
	const studies = getCaseStudies()
	const posts = getPosts()
	const years = yearsOfExperience()

	/**
	 * DERIVED, NOT TYPED. Every figure below is computed from the same content
	 * the linked page renders, so the strip cannot disagree with its own
	 * evidence and cannot go stale on its own — which is the failure mode of a
	 * hand-written "11 years".
	 */
	const proof: ProofPoint[] = [
		{
			value: `${years}`,
			label: 'Years building production systems',
			href: '/experience/',
		},
		{
			value: `${studies.length}`,
			label: 'Case studies, with the trade-off named',
			href: '/projects/',
		},
		{
			value: `${skills.filter((skill) => skill.depth === 'primary').length}`,
			label: 'Technologies at primary depth',
			href: '/skills/',
		},
		{
			value: `${posts.length}`,
			label: 'Written pieces on how it was decided',
			href: '/blog/',
		},
	]

	return (
		<>
			<JsonLdScript
				data={graph(
					websiteSchema(),
					personSchema(),
					pageSchema({
						path: '/',
						name: 'Home',
						description: DESCRIPTION,
					}),
				)}
			/>

			{/*
			  Home does not use `PageContainer` — it is a stack of full-bleed sections
			  rather than a contained page — so it renders the ambient backdrop
			  itself. Untoned, which is the default (teal-led) arrangement and the
			  one the other identity routes share.
			*/}
			<PageBackdrop />

			<Hero />
			<ProofStrip points={proof} />
			<FeaturedProjects studies={getFeaturedCaseStudies(3)} />
			<Capabilities />
			<SelectedWriting />
			<CurrentFocus />
			<ContactCta />
		</>
	)
}
