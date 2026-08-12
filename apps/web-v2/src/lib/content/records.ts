import { z } from 'zod'
import { slugSchema } from './schemas'

/**
 * A-01 — the schema layer for the *record* half of the content model.
 * docs/CONTENT_STRATEGY.md §2, §4.
 *
 * CONTENT_STRATEGY §2's rule is "prose is MDX, records are TypeScript". The MDX
 * half already validates at the boundary (`schemas.ts`); this is the same
 * guarantee for the half that is authored as typed arrays.
 *
 * WHY A ZOD SCHEMA WHEN TYPESCRIPT ALREADY TYPES THE ARRAY. `tsc` checks
 * shapes, not values. It cannot see that a `summary` is 12 characters and will
 * be a useless meta description, that a role's `endedAt` is before its
 * `startedAt`, or that two skills share an id — and every one of those is a
 * defect that renders perfectly and is wrong. The parse runs at module scope in
 * the loaders, which are imported by Server Components, so a violation fails
 * `next build` rather than a page.
 *
 * The bounds are the same SEO bounds `schemas.ts` documents: a length limit
 * here is a truncated SERP snippet caught at authoring time.
 */

/* ============================================================
 * Skills — docs/WEBSITE_STRUCTURE.md §4.4
 * ============================================================ */

/**
 * The seven groups, in the display order §4.4 fixes. A tuple rather than a
 * free string so a typo ("Backend " with a trailing space) becomes an eighth
 * group at build time instead of a silently duplicated heading.
 */
export const SKILL_GROUPS = [
	'Languages',
	'Frontend',
	'Backend',
	'Data',
	'Infrastructure & DevOps',
	'Architecture & Practices',
	'Tooling',
] as const

export type SkillGroup = (typeof SKILL_GROUPS)[number]

/**
 * THREE NAMED TIERS, AND NO PERCENTAGE BARS — §4.4's honesty rule, given a
 * type. A number would invite a bar chart, and an unfalsifiable "React 92%" is
 * a claim every reader in the target audience discounts on sight. Three tiers
 * with stated definitions are both honest and more useful, and keeping
 * `familiar` entries is itself a signal: knowing where one's knowledge stops is
 * the part a percentage cannot express.
 */
export const SKILL_DEPTHS = ['primary', 'working', 'familiar'] as const
export type SkillDepth = (typeof SKILL_DEPTHS)[number]

/** The definitions, rendered on `/skills` rather than left to the reader. */
export const SKILL_DEPTH_LABELS: Record<
	SkillDepth,
	{ label: string; definition: string }
> = {
	primary: {
		label: 'Primary',
		definition:
			'Used daily in production, and I have debugged it under load at 2am.',
	},
	working: {
		label: 'Working',
		definition:
			'Shipped real features with it and can be productive without a tutorial.',
	},
	familiar: {
		label: 'Familiar',
		definition:
			'Read the docs, built something small, and know where its edges are.',
	},
}

export const skillSchema = z
	.object({
		/**
		 * The cross-reference key. Case-study frontmatter carries `stack: ['id']`
		 * and F1-07 resolves it here, so this must be URL- and filename-safe for
		 * the same reason a slug is.
		 */
		id: slugSchema,
		name: z.string().min(1).max(40),
		group: z.enum(SKILL_GROUPS),
		depth: z.enum(SKILL_DEPTHS),
		/**
		 * Where on this site the claim is evidenced. Site-relative, checked by
		 * `check-links.mjs` against the export like any other href — which is what
		 * makes "every claim is checkable" (CONTENT_STRATEGY §6) enforceable
		 * rather than aspirational.
		 */
		evidence: z.string().startsWith('/').optional(),
		/** One clause on *how* it is used. Absent is better than filler. */
		note: z.string().min(10).max(120).optional(),
	})
	.strict()

export type Skill = z.infer<typeof skillSchema>

/* ============================================================
 * Experience — docs/WEBSITE_STRUCTURE.md §4.5
 * ============================================================ */

/**
 * `YYYY-MM`. Not a `Date`: a role started in a month, not on a day, and a
 * fabricated day-of-month is a false precision that then has to be formatted
 * away everywhere it is rendered.
 */
export const monthSchema = z
	.string()
	.regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must be YYYY-MM')

export const experienceSchema = z
	.object({
		id: slugSchema,
		company: z.string().min(2).max(60),
		title: z.string().min(2).max(80),
		location: z.string().min(2).max(60),
		mode: z.enum(['on-site', 'hybrid', 'remote']),
		startedAt: monthSchema,
		/** Absent means current. One representation, so "present" is not a string. */
		endedAt: monthSchema.optional(),
		/** One line: what this role was accountable for. */
		mandate: z.string().min(20).max(200),
		/**
		 * OUTCOME BULLETS, NOT DUTIES — §4.5's bullet rule. Three to five, because
		 * two reads as thin and six is a job description. The rule itself ("each
		 * with a number") cannot be checked by a schema without rejecting a
		 * legitimate qualitative outcome, so it stays a review rule; the count and
		 * the length are what the schema can honestly enforce.
		 */
		outcomes: z.array(z.string().min(30).max(240)).min(3).max(5),
		/** Skill ids. Cross-validated against `skills.ts` by F1-07. */
		stack: z.array(slugSchema).min(1).max(14),
		/** Case-study slugs this role produced. Also cross-validated. */
		caseStudies: z.array(slugSchema).max(4).default([]),
	})
	.strict()
	.refine((role) => !role.endedAt || role.endedAt >= role.startedAt, {
		message: 'endedAt cannot be earlier than startedAt',
		path: ['endedAt'],
	})

export type Experience = z.infer<typeof experienceSchema>

/* ============================================================
 * Journey — docs/WEBSITE_STRUCTURE.md §4.3
 * ============================================================ */

export const milestoneSchema = z
	.object({
		id: slugSchema,
		year: z.number().int().min(1990).max(2100),
		title: z.string().min(4).max(80),
		/**
		 * ONE PARAGRAPH, AND THE MINIMUM IS THE POINT. §4.3 asks for trajectory
		 * and inflection points, "not a duty list" — a 60-character milestone is a
		 * duty list entry wearing a story's clothes.
		 */
		story: z.string().min(120).max(700),
		/** What changed as a result. The half that makes it an inflection. */
		changed: z.string().min(20).max(220),
	})
	.strict()

export type Milestone = z.infer<typeof milestoneSchema>

/* ============================================================
 * Open source — docs/WEBSITE_STRUCTURE.md §4.8
 * ============================================================ */

export const openSourceSchema = z
	.object({
		id: slugSchema,
		name: z.string().min(2).max(60),
		url: z.string().url(),
		kind: z.enum(['own', 'contribution']),
		/**
		 * §4.8's honesty rule, enforced by a floor: "a merged one-line typo fix is
		 * not a contribution worth a card". An entry that cannot support 80
		 * characters of substance belongs in the compact list, which is what
		 * `minor` below is for.
		 */
		summary: z.string().min(80).max(400),
		stack: z.array(slugSchema).max(8).default([]),
	})
	.strict()

export type OpenSourceEntry = z.infer<typeof openSourceSchema>

/** The compact list. Deliberately a different shape so it cannot grow a card. */
export const minorContributionSchema = z
	.object({
		project: z.string().min(2).max(60),
		url: z.string().url(),
		what: z.string().min(10).max(120),
	})
	.strict()

export type MinorContribution = z.infer<typeof minorContributionSchema>

/* ============================================================
 * Uses — docs/WEBSITE_STRUCTURE.md §4.10
 * ============================================================ */

export const usesEntrySchema = z
	.object({
		name: z.string().min(2).max(60),
		/**
		 * §4.10: "Each entry gets one line on *why*, which is the only part worth
		 * reading." Required, not optional — an entry without it is a list of
		 * product names, which is the genre's failure mode.
		 */
		why: z.string().min(15).max(200),
		url: z.string().url().optional(),
	})
	.strict()

export const usesGroupSchema = z
	.object({
		title: z.string().min(2).max(40),
		items: z.array(usesEntrySchema).min(1),
	})
	.strict()

export type UsesGroup = z.infer<typeof usesGroupSchema>

/* ============================================================
 * Services — /services
 * ============================================================ */

export const serviceSchema = z
	.object({
		id: slugSchema,
		title: z.string().min(4).max(60),
		summary: z.string().min(60).max(300),
		/** What is actually delivered. Concrete artifacts, not adjectives. */
		deliverables: z.array(z.string().min(10).max(140)).min(3).max(6),
		/** Who it is for. Naming the wrong fit is more useful than the right one. */
		bestFor: z.string().min(20).max(200),
	})
	.strict()

export type Service = z.infer<typeof serviceSchema>

/* ============================================================
 * Now — docs/WEBSITE_STRUCTURE.md §1, C-12
 * ============================================================ */

export const nowSchema = z
	.object({
		/**
		 * C-12's acceptance criterion, as a field. The page's `dateModified` comes
		 * from here and NEVER from the build date: a `/now` that claims to have
		 * been updated on every deploy is worse than no `/now`, because it
		 * converts the one honest signal the page carries into noise.
		 */
		updated: z.coerce.date(),
		intro: z.string().min(60).max(400),
		sections: z
			.array(
				z
					.object({
						title: z.string().min(2).max(40),
						items: z.array(z.string().min(10).max(240)).min(1).max(6),
					})
					.strict(),
			)
			.min(2)
			.max(6),
		availability: z.string().min(20).max(280),
	})
	.strict()

export type Now = z.infer<typeof nowSchema>

/* ============================================================
 * About — the quick-facts rail, docs/WEBSITE_STRUCTURE.md §4.2
 * ============================================================ */

export const factSchema = z
	.object({
		label: z.string().min(2).max(30),
		value: z.string().min(1).max(80),
	})
	.strict()

export type Fact = z.infer<typeof factSchema>

export const principleSchema = z
	.object({
		title: z.string().min(4).max(70),
		/**
		 * §4.2: "principles with a concrete example each". The example is required
		 * because a principle without one is a slogan, and the page's whole job is
		 * to be the opposite of a slogan.
		 */
		body: z.string().min(100).max(600),
	})
	.strict()

export type Principle = z.infer<typeof principleSchema>
