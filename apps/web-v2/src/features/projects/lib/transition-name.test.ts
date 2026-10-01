import { describe, expect, it } from 'vitest'
import { caseStudyTransitionName } from './transition-name'

describe('caseStudyTransitionName', () => {
	it('prefixes the slug so the result is a valid CSS custom-ident', () => {
		expect(caseStudyTransitionName('2024-rewrite')).toBe(
			'case-study-2024-rewrite',
		)
		expect(caseStudyTransitionName('2024-rewrite')).toMatch(/^[a-z][a-z0-9-]*$/)
	})

	it('is distinct per slug, since names must be unique on a page', () => {
		expect(caseStudyTransitionName('a')).not.toBe(caseStudyTransitionName('b'))
	})
})
