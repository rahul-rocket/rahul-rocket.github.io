import { describe, expect, it } from 'vitest'
import { caseStudyTransitionName, postTransitionName } from './view-transition'

const ident = /^[a-z][a-z0-9-]*$/

describe('view-transition names', () => {
	it('are valid CSS custom-idents even for a slug starting with a digit', () => {
		expect(caseStudyTransitionName('2024-rewrite')).toMatch(ident)
		expect(postTransitionName('2024-rewrite')).toMatch(ident)
	})

	it('are distinct per slug, since names must be unique on a page', () => {
		expect(caseStudyTransitionName('a')).not.toBe(caseStudyTransitionName('b'))
		expect(postTransitionName('a')).not.toBe(postTransitionName('b'))
	})

	it('do not collide between a case study and a post with the same slug', () => {
		expect(caseStudyTransitionName('x')).not.toBe(postTransitionName('x'))
	})
})
