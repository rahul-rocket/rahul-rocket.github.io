import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { cache } from 'react'
import readingTime from 'reading-time'
import { extractHeadings } from './headings'
import { type CaseStudy, caseStudyFrontmatterSchema } from './schemas'

/**
 * P-01/P-03 — case-study loaders. docs/PROJECT_CASE_STUDIES.md §2.
 *
 * Structurally identical to `posts.ts`, and deliberately a separate file rather
 * than a generic loader parameterised by directory and schema. The two differ in
 * ordering (posts are chronological, case studies are editorial), in filtering
 * (a case study has no future-dating case), and in what "next" means (date
 * order versus `order`). A shared abstraction would have to take four
 * parameters to express that, which is more surface than the duplication it
 * removes — CLAUDE.md §5, "duplication is cheaper than the wrong abstraction".
 */

const PROJECTS_DIR = join(process.cwd(), 'content', 'projects')

const isProduction = process.env.NODE_ENV === 'production'

function readSlugs(): string[] {
	try {
		return readdirSync(PROJECTS_DIR)
			.filter((file) => file.endsWith('.mdx'))
			.map((file) => file.replace(/\.mdx$/, ''))
	} catch {
		return []
	}
}

export const getCaseStudy = cache((slug: string): CaseStudy => {
	const raw = readFileSync(join(PROJECTS_DIR, `${slug}.mdx`), 'utf8')
	const { data, content } = matter(raw)

	const parsed = caseStudyFrontmatterSchema.safeParse(data)
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
			.join('\n')
		throw new Error(
			`Invalid frontmatter in content/projects/${slug}.mdx\n${issues}`,
		)
	}

	return {
		slug,
		frontmatter: parsed.data,
		readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
		href: `/projects/${slug}/`,
		headings: extractHeadings(content),
	}
})

/**
 * Every visible case study, in `order`.
 *
 * ORDER IS EDITORIAL, NOT CHRONOLOGICAL, which is the substantive difference
 * from the blog. `/projects` gives its first entry a wide feature row
 * (WEBSITE_STRUCTURE.md §4.6), so "which project should a stranger read first"
 * is a judgment the author makes rather than one the calendar makes.
 */
export const getCaseStudies = cache((): CaseStudy[] =>
	readSlugs()
		.map((slug) => getCaseStudy(slug))
		.filter((study) => !isProduction || !study.frontmatter.draft)
		.sort((a, b) => a.frontmatter.order - b.frontmatter.order),
)

export const getAllCaseStudiesUnfiltered = cache((): CaseStudy[] =>
	readSlugs().map((slug) => getCaseStudy(slug)),
)

/** H-03 — the three Home features, in `order`, `featured` first. */
export function getFeaturedCaseStudies(limit = 3): CaseStudy[] {
	const all = getCaseStudies()
	const featured = all.filter((study) => study.frontmatter.featured)
	// Falls back to the top of the index rather than rendering an empty section:
	// a Home section that disappears because nobody set a boolean is a bug that
	// looks like a design decision.
	return (featured.length > 0 ? featured : all).slice(0, limit)
}

export function getCaseStudyParams(): { slug: string }[] {
	return getCaseStudies().map((study) => ({ slug: study.slug }))
}

/**
 * P-13 — previous and next by `order`, not by date.
 *
 * Returns `null` at each end rather than wrapping. A "next" that loops back to
 * the first study tells a reader they have not finished when they have, and the
 * only signal that they are at the end is the one thing wrapping removes.
 */
export function getAdjacentCaseStudies(slug: string): {
	previous: CaseStudy | null
	next: CaseStudy | null
} {
	const all = getCaseStudies()
	const index = all.findIndex((study) => study.slug === slug)
	if (index === -1) return { previous: null, next: null }

	return {
		previous: all[index - 1] ?? null,
		next: all[index + 1] ?? null,
	}
}

/** P-05 — every skill id used by any case study, for the index filter. */
export function getCaseStudyStackIds(): string[] {
	const ids = new Set<string>()
	for (const study of getCaseStudies()) {
		for (const id of study.frontmatter.stack) ids.add(id)
	}
	return [...ids].sort()
}
