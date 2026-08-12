import {
	aboutNarrative,
	learning,
	principles,
	quickFacts,
} from '@content/about'
import { experience as rawExperience } from '@content/experience'
import { journey as rawJourney } from '@content/journey'
import { now as rawNow } from '@content/now'
import {
	contributions as rawContributions,
	minorContributions as rawMinor,
	openSourceProjects as rawProjects,
} from '@content/open-source'
import { services as rawServices } from '@content/services'
import { skills as rawSkills } from '@content/skills'
import { usesGroups as rawUses } from '@content/uses'
import { z } from 'zod'
import {
	type Experience,
	experienceSchema,
	type Fact,
	factSchema,
	type Milestone,
	type MinorContribution,
	milestoneSchema,
	minorContributionSchema,
	type Now,
	nowSchema,
	type OpenSourceEntry,
	openSourceSchema,
	type Principle,
	principleSchema,
	type Service,
	SKILL_GROUPS,
	type Skill,
	type SkillDepth,
	type SkillGroup,
	serviceSchema,
	skillSchema,
	type UsesGroup,
	usesGroupSchema,
} from './records'

/**
 * A-01 — the record loaders. docs/ARCHITECTURE.md §8.
 *
 * EVERY PARSE BELOW RUNS AT MODULE SCOPE, WHICH IS THE WHOLE DESIGN. These
 * modules are imported by Server Components during `next build`, so a record
 * that violates its schema throws while the page is being generated and fails
 * the build. Validating lazily inside a component would move the failure to
 * whichever page happened to render first, and validating in a test would let a
 * bad record ship whenever the test was not run.
 *
 * There is no `cache()` here, unlike `posts.ts`. That wrapper exists because
 * the post loaders touch the filesystem; these are static imports the module
 * graph already deduplicates, so a cache would add indirection over nothing.
 *
 * Nothing in this file reads the network or the filesystem, so it is safe in a
 * Server Component and unusable from a Client Component only by convention —
 * which is why the pages pass records down as props rather than importing this
 * across a `'use client'` boundary.
 */

/**
 * Parse with a message that names the file. Zod's default says which *field*
 * failed; at build time the author also needs to know which of eight content
 * files it came from, and the stack trace points at this module rather than at
 * theirs.
 */
function parse<S extends z.ZodTypeAny>(
	schema: S,
	value: unknown,
	source: string,
	// `z.infer<S>` is the schema's OUTPUT type, which is the one that matters
	// here: a field with `.default([])` is optional going in and guaranteed
	// coming out, and typing this as `z.ZodType<T>` infers T from the input side
	// so every defaulted field stays `| undefined` for the rest of the codebase.
): z.infer<S> {
	const result = schema.safeParse(value)
	if (result.success) return result.data

	const issues = result.error.issues
		.map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
		.join('\n')
	throw new Error(`Invalid content in ${source}\n${issues}`)
}

/* ============================================================
 * Skills
 * ============================================================ */

export const skills: Skill[] = parse(
	z.array(skillSchema),
	rawSkills,
	'content/skills.ts',
)

/**
 * Ids must be unique, and Zod cannot express that over an array of objects
 * without a refine that reads worse than this does. A duplicate id is the
 * failure mode that matters: the cross-reference resolver would silently pick
 * the first match, so a case study's stack badge would render the wrong depth
 * rating forever and correctly.
 */
{
	const seen = new Set<string>()
	for (const skill of skills) {
		if (seen.has(skill.id)) {
			throw new Error(`Duplicate skill id in content/skills.ts: ${skill.id}`)
		}
		seen.add(skill.id)
	}
}

const skillById = new Map(skills.map((skill) => [skill.id, skill]))

export function getSkill(id: string): Skill | undefined {
	return skillById.get(id)
}

/**
 * Resolve a list of ids to skills, dropping nothing silently.
 *
 * An unknown id throws rather than being filtered out, because a filtered-out
 * id is a badge that quietly disappears from a case study — the exact class of
 * content bug the schema layer exists to convert into a build failure. F1-07's
 * whole-corpus check runs the same resolution ahead of render, so in practice
 * this throw is the second line of defence rather than the first.
 */
export function resolveSkills(ids: readonly string[], source: string): Skill[] {
	return ids.map((id) => {
		const skill = skillById.get(id)
		if (!skill) {
			throw new Error(
				`Unknown skill id "${id}" referenced by ${source}. ` +
					'Ids must exist in content/skills.ts — docs/CONTENT_STRATEGY.md §3.3.',
			)
		}
		return skill
	})
}

/** Groups in the fixed display order, with empty groups dropped. */
export function skillsByGroup(): { group: SkillGroup; items: Skill[] }[] {
	return SKILL_GROUPS.map((group) => ({
		group,
		items: skills.filter((skill) => skill.group === group),
	})).filter((entry) => entry.items.length > 0)
}

export function skillCountByDepth(): Record<SkillDepth, number> {
	return {
		primary: skills.filter((s) => s.depth === 'primary').length,
		working: skills.filter((s) => s.depth === 'working').length,
		familiar: skills.filter((s) => s.depth === 'familiar').length,
	}
}

/* ============================================================
 * Experience
 * ============================================================ */

export const experience: Experience[] = parse(
	z.array(experienceSchema),
	rawExperience,
	'content/experience.ts',
)

/**
 * Total years, computed rather than written down.
 *
 * PERSONAL_BRAND.md §3 rule 2 is "numbers or nothing", and a hand-written
 * "11 years" is a number that is wrong for eleven months of every twelve. This
 * derives from the earliest role's start date, so the proof strip on Home and
 * the résumé header cannot disagree with the record beneath them, and neither
 * can go stale.
 *
 * Floored, not rounded: claiming the larger number is the one direction this
 * should never be wrong in.
 */
export function yearsOfExperience(asOf: Date = new Date()): number {
	const earliest = experience
		.map((role) => role.startedAt)
		.sort()
		.at(0)
	if (!earliest) return 0

	const [year, month] = earliest.split('-').map(Number)
	if (year === undefined || month === undefined) return 0

	const months =
		(asOf.getUTCFullYear() - year) * 12 + (asOf.getUTCMonth() + 1 - month)
	return Math.max(0, Math.floor(months / 12))
}

/** Present-tense roles. Absent `endedAt` is the single representation. */
export function currentRoles(): Experience[] {
	return experience.filter((role) => !role.endedAt)
}

/* ============================================================
 * Journey
 * ============================================================ */

export const journey: Milestone[] = parse(
	z.array(milestoneSchema),
	rawJourney,
	'content/journey.ts',
)

/* ============================================================
 * Open source
 * ============================================================ */

export const openSourceProjects: OpenSourceEntry[] = parse(
	z.array(openSourceSchema),
	rawProjects,
	'content/open-source.ts',
)

export const contributions: OpenSourceEntry[] = parse(
	z.array(openSourceSchema),
	rawContributions,
	'content/open-source.ts',
)

export const minorContributions: MinorContribution[] = parse(
	z.array(minorContributionSchema),
	rawMinor,
	'content/open-source.ts',
)

/* ============================================================
 * Uses, services, now, about
 * ============================================================ */

export const usesGroups: UsesGroup[] = parse(
	z.array(usesGroupSchema),
	rawUses,
	'content/uses.ts',
)

export const services: Service[] = parse(
	z.array(serviceSchema),
	rawServices,
	'content/services.ts',
)

export const now: Now = parse(nowSchema, rawNow, 'content/now.ts')

export const narrative: string[] = parse(
	z.array(z.string().min(80)),
	aboutNarrative,
	'content/about.ts',
)

export const principlesList: Principle[] = parse(
	z.array(principleSchema),
	principles,
	'content/about.ts',
)

export const facts: Fact[] = parse(
	z.array(factSchema),
	quickFacts,
	'content/about.ts',
)

export const learningList: string[] = parse(
	z.array(z.string().min(20)),
	learning,
	'content/about.ts',
)
