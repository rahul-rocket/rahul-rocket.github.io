import { staticRoutes } from '@/config/nav'
import { experience, getSkill, skills } from './data'
import { getAllPostsUnfiltered } from './posts'
import { getAllCaseStudiesUnfiltered } from './projects'
import { TAGS } from './schemas'

/**
 * F1-07 — cross-reference validation. Open since Phase 3, blocked on A-01.
 * docs/CONTENT_STRATEGY.md §3.3, docs/TASK_BACKLOG.md.
 *
 * THE FAILURE THIS EXISTS TO CATCH IS THE ONE THAT RENDERS FINE. Every check
 * below is a reference from one content file into another, and every one of
 * them fails silently by default: a case study whose `stack` names a skill id
 * that does not exist renders a badge with no depth rating; an `evidence` link
 * to a route nobody built is a 404 on a page whose whole argument is that its
 * claims are checkable; a `caseStudies` entry pointing at a deleted slug is a
 * dead link on the résumé. None of them throws, none of them looks wrong in
 * review, and all of them are found by a reader.
 *
 * Run in two places, deliberately:
 *
 *   1. `pnpm content:validate` (F1-06), which is fast and runs in the
 *      pre-commit hook and in CI.
 *   2. `assertContentIntegrity()` at build time from `app/layout.tsx`, so the
 *      export cannot be produced with a broken reference even if somebody ran
 *      the build without the check.
 *
 * It reads the UNFILTERED corpora on purpose. A draft with a broken reference
 * is still broken, and finding out on the day it is published is finding out
 * too late — the same argument `getAllPostsUnfiltered` already carries.
 */

export interface CrossReferenceIssue {
	source: string
	message: string
}

/**
 * Every internal path the export will contain, as far as the manifests know.
 *
 * Content-derived routes are included from the corpora rather than assumed, so
 * this stays correct as posts and case studies are added. `check-links.mjs`
 * is the belt to this file's braces: it walks the built `out/` and is the
 * authority on what exists. This check runs *before* a build and catches the
 * same class of error early, with a message that names the content file rather
 * than the rendered href.
 */
function knownPaths(): Set<string> {
	const paths = new Set<string>(['/'])

	for (const route of staticRoutes) {
		if (route.built) paths.add(route.path)
	}
	for (const post of getAllPostsUnfiltered()) paths.add(post.href)
	for (const study of getAllCaseStudiesUnfiltered()) paths.add(study.href)
	for (const tag of TAGS) paths.add(`/blog/tags/${tag}/`)

	return paths
}

export function findCrossReferenceIssues(): CrossReferenceIssue[] {
	const issues: CrossReferenceIssue[] = []
	const paths = knownPaths()
	const caseStudySlugs = new Set(
		getAllCaseStudiesUnfiltered().map((study) => study.slug),
	)

	const report = (source: string, message: string) =>
		issues.push({ source, message })

	/* --- skills.ts: evidence links resolve ------------------------------- */
	for (const skill of skills) {
		if (skill.evidence && !paths.has(skill.evidence)) {
			report(
				'content/skills.ts',
				`skill "${skill.id}" cites evidence at ${skill.evidence}, which is not a built route. ` +
					'Either build it, flip its `built` flag in src/config/nav.ts, or drop the citation.',
			)
		}
	}

	/* --- experience.ts: stack ids and case-study slugs -------------------- */
	for (const role of experience) {
		for (const id of role.stack) {
			if (!getSkill(id)) {
				report(
					'content/experience.ts',
					`role "${role.id}" lists stack id "${id}", which is not in content/skills.ts.`,
				)
			}
		}
		for (const slug of role.caseStudies) {
			if (!caseStudySlugs.has(slug)) {
				report(
					'content/experience.ts',
					`role "${role.id}" links case study "${slug}", which has no file in content/projects/.`,
				)
			}
		}
	}

	/* --- case studies: stack ids ----------------------------------------- */
	for (const study of getAllCaseStudiesUnfiltered()) {
		for (const id of study.frontmatter.stack) {
			if (!getSkill(id)) {
				report(
					`content/projects/${study.slug}.mdx`,
					`stack id "${id}" is not in content/skills.ts. ` +
						'This is P-02: the ids are the cross-reference key, not free text.',
				)
			}
		}
	}

	/* --- posts: tags are already an enum, so only ordering can be wrong --- */
	for (const post of getAllPostsUnfiltered()) {
		const seen = new Set<string>()
		for (const tag of post.frontmatter.tags) {
			if (seen.has(tag)) {
				report(`content/blog/${post.slug}.mdx`, `tag "${tag}" is listed twice.`)
			}
			seen.add(tag)
		}
	}

	/* --- open source is validated by shape; its urls are external -------- */

	return issues
}

/**
 * Throws with every issue at once, not the first.
 *
 * A validator that reports one problem per run turns a content sweep into as
 * many build cycles as there are mistakes, which is how a check stops being run
 * before it stops being useful.
 */
export function assertContentIntegrity(): void {
	const issues = findCrossReferenceIssues()
	if (issues.length === 0) return

	const detail = issues
		.map((issue) => `  ${issue.source}: ${issue.message}`)
		.join('\n')

	throw new Error(
		`Content cross-reference check failed (${issues.length} issue${
			issues.length === 1 ? '' : 's'
		}) — F1-07:\n${detail}`,
	)
}
