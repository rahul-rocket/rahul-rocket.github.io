import { describe, expect, it } from 'vitest'
import { findCrossReferenceIssues } from './cross-reference'
import { experience, getSkill, skills } from './data'
import { getAllCaseStudiesUnfiltered } from './projects'

/**
 * F1-07 — the corpus, checked against itself.
 *
 * THIS TEST RUNS AGAINST THE REAL CONTENT, NOT A FIXTURE, and that is
 * deliberate. The failure it exists to catch is not "the resolver is wrong" —
 * it is "somebody renamed a skill id and three files still reference the old
 * one". A fixture cannot notice that; only the actual corpus can.
 *
 * It is included in `pnpm content:validate` by filename, so it runs in the
 * pre-commit hook and in CI on every content change.
 */
describe('content cross-references', () => {
	it('has no unresolved references anywhere in the corpus', () => {
		const issues = findCrossReferenceIssues()

		expect(issues.map((issue) => `${issue.source}: ${issue.message}`)).toEqual(
			[],
		)
	})

	it('resolves every skill id used by every case study', () => {
		// Stated separately from the sweep above because this is P-02's own
		// acceptance criterion, and a criterion that is only covered incidentally
		// by a broader assertion is one nobody can point at.
		for (const study of getAllCaseStudiesUnfiltered()) {
			for (const id of study.frontmatter.stack) {
				expect(getSkill(id), `${study.slug} → ${id}`).toBeDefined()
			}
		}
	})

	it('resolves every skill id used by every role', () => {
		for (const role of experience) {
			for (const id of role.stack) {
				expect(getSkill(id), `${role.id} → ${id}`).toBeDefined()
			}
		}
	})

	it('has no duplicate skill ids', () => {
		// A duplicate would not throw — the resolver picks the first match — so a
		// case study would render the wrong depth rating forever and correctly.
		const ids = skills.map((skill) => skill.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('gives every case study at least one metric with a measurement method', () => {
		// PROJECT_CASE_STUDIES §5: every number states its measurement. The schema
		// makes `method` required; this asserts the corpus actually has one, which
		// is the difference between a rule and a rule that is followed.
		for (const study of getAllCaseStudiesUnfiltered()) {
			expect(study.frontmatter.metrics.length).toBeGreaterThan(0)
			for (const metric of study.frontmatter.metrics) {
				expect(
					metric.method.length,
					`${study.slug}: ${metric.label}`,
				).toBeGreaterThan(19)
			}
		}
	})
})
