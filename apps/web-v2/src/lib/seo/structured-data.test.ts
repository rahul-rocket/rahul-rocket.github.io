import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { skills } from '@/lib/content/data'
import {
	graph,
	PERSON_ID,
	personSchema,
	WEBSITE_ID,
	websiteSchema,
} from './structured-data'

/**
 * Structured data fails silently by design: a malformed or under-specified
 * object is simply ignored by every consumer, and nothing on the page looks
 * wrong. redesign/SEO_PLAN.md §2 requires each builder to be "unit-tested for
 * required fields" for exactly that reason — these assertions are the only
 * place a missing `sameAs` or a relative `@id` can be caught before Search
 * Console notices months later.
 */

/** Every URL that leaves the page must be absolute — docs/SEO.md §4. */
function expectAbsolute(value: unknown) {
	expect(typeof value, `${String(value)} is not a string`).toBe('string')
	expect(value, `${String(value)} is not an absolute URL`).toMatch(
		/^https:\/\//,
	)
}

function ref(value: unknown): string {
	// The builders are `Record<string, unknown>` on purpose — JSON-LD is not a
	// fixed schema — so a reference has to be narrowed before it can be compared.
	expect(value).toMatchObject({ '@id': expect.any(String) })
	return (value as { '@id': string })['@id']
}

describe('personSchema', () => {
	const person = personSchema()

	it('carries the fields docs/SEO.md §5 requires', () => {
		expect(person['@type']).toBe('Person')
		expect(person.name).toBe(site.name)
		expect(person.jobTitle).toBe(site.role)
		expect(person.description).toBe(site.description)
	})

	it('emits only absolute URLs', () => {
		expectAbsolute(person['@id'])
		expectAbsolute(person.url)
		for (const profile of person.sameAs as string[]) expectAbsolute(profile)
	})

	it('has a non-empty sameAs, which is the point of the entity', () => {
		// §5: the sameAs array is "what connects the site to the name across
		// Google's entity graph". A Person with none is a Person nothing links to.
		expect((person.sameAs as string[]).length).toBeGreaterThan(0)
	})

	it('derives sameAs from site.social rather than a second list', () => {
		expect(person.sameAs).toEqual(Object.values(site.social))
	})

	it('derives knowsAbout from content/skills.ts rather than a second list', () => {
		// The field was deliberately omitted until A-01 landed the record layer,
		// precisely so it would never be a hand-typed claim. This is the assertion
		// that keeps it derived.
		expect(person.knowsAbout).toEqual(
			skills.filter((skill) => skill.depth === 'primary').map((s) => s.name),
		)
		expect((person.knowsAbout as string[]).length).toBeGreaterThan(0)
	})
})

describe('websiteSchema', () => {
	const website = websiteSchema()

	it('carries the fields docs/SEO.md §5 requires', () => {
		expect(website['@type']).toBe('WebSite')
		expect(website.inLanguage).toBe(site.lang)
	})

	it('emits only absolute URLs', () => {
		expectAbsolute(website['@id'])
		expectAbsolute(website.url)
		expectAbsolute(ref(website.author))
	})

	it('references the Person node instead of copying it', () => {
		// The graph link. If these two ids drift apart both objects still validate
		// and the entity connection silently stops happening — which is why the
		// fragments live in one constant and this asserts they resolve to it.
		expect(ref(website.author)).toBe(PERSON_ID)
		expect(ref(website.publisher)).toBe(PERSON_ID)
	})

	it('declares no SearchAction, because the site has no search', () => {
		// redesign/SEO_PLAN.md §5: schema for a feature that does not exist is
		// structured-data spam. The command palette navigates a fixed list.
		expect(website).not.toHaveProperty('potentialAction')
	})

	it('keeps the two node ids distinct', () => {
		expect(PERSON_ID).not.toBe(WEBSITE_ID)
		expect(website['@id']).not.toBe(personSchema()['@id'])
	})
})

describe('graph', () => {
	it('carries the context once, at the top, and not on each node', () => {
		// One `@context` for the document is what makes the nodes one graph; a
		// context per node produces objects that cannot reference each other.
		const document = graph(websiteSchema(), personSchema())

		expect(document['@context']).toBe('https://schema.org')
		for (const node of document['@graph'] as Record<string, unknown>[]) {
			expect(node).not.toHaveProperty('@context')
		}
	})
})
