import { absoluteUrl, contactEmail, site } from '@/config/site'
import { skills } from '@/lib/content/data'

/**
 * Q-05 / H-08 / P-12 / B-09 — JSON-LD builders. docs/SEO.md §5.
 *
 * WHY BUILDERS AND NOT LITERALS IN EACH PAGE. Structured data is the one part
 * of a page's metadata that nothing on the page reveals when it is wrong: a
 * malformed `Person` renders identically to a correct one, and the failure
 * surfaces months later as an absent rich result. Centralising it means the
 * shape is written once, unit-tested once, and every page's `@id` and URL
 * resolution goes through `absoluteUrl` rather than through a string somebody
 * typed.
 *
 * EVERY URL IS ABSOLUTE. A relative URL in JSON-LD resolves against the
 * consuming crawler rather than the site — the same rule `absoluteUrl` exists
 * for in the metadata layer.
 *
 * `@id` VALUES ARE STABLE AND SHARED. `Person` is declared once with
 * `#person` as its identity, and every other node references that id rather
 * than re-declaring the author inline. Re-declaring produces two Person
 * entities that a consumer may or may not merge; referencing produces one.
 */

/** The shape is `unknown`-typed at the edges; JSON-LD is not a fixed schema. */
export type JsonLd = Record<string, unknown>

export const PERSON_ID = absoluteUrl('/#person')
export const WEBSITE_ID = absoluteUrl('/#website')

/**
 * The author. Declared on Home and referenced everywhere else.
 *
 * `sameAs` is what links this site to the profiles that corroborate it, and it
 * is the single highest-value line here for a name search — it is how a search
 * engine decides that this Rahul Rocket and that GitHub account are one entity.
 * It is derived from `site.social` rather than written out again here, so adding
 * a profile is one edit in one file and the two lists cannot drift.
 *
 * `knowsAbout` IS DERIVED FROM `content/skills.ts`, NOT TYPED HERE. A
 * hand-written list would be a second, drifting statement of what this person
 * knows, contradicting `/skills` the first time either is edited. Only `primary`
 * depth qualifies: `knowsAbout` is a claim of expertise, and the depth ratings
 * on that page are the site's own definition of which ones it will defend.
 */
export function personSchema(): JsonLd {
	return {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: site.name,
		url: absoluteUrl('/'),
		jobTitle: site.role,
		description: site.description,
		email: `mailto:${contactEmail()}`,
		sameAs: Object.values(site.social),
		knowsAbout: skills
			.filter((skill) => skill.depth === 'primary')
			.map((skill) => skill.name),
	}
}

/**
 * `author` AND `publisher` ARE BOTH REFERENCES, NOT COPIES. Both point at the
 * `Person` node by `@id` rather than repeating its fields, which is what makes
 * the two objects one graph rather than two unrelated blobs that happen to
 * share a name.
 *
 * NO `SearchAction`. docs/SEO.md §5 qualifies it with "if search exists", and
 * this site has none — the command palette navigates a fixed route list, it does
 * not query an index. A `SearchAction` pointing at a URL template the site
 * cannot serve is structured data describing a feature that is not there, which
 * redesign/SEO_PLAN.md §5 lists under "schema markup for things that do not
 * exist". PL-06 (a real search index) is the gate.
 */
export function websiteSchema(): JsonLd {
	const person = { '@id': PERSON_ID }

	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: absoluteUrl('/'),
		name: `${site.name} — ${site.role}`,
		description: site.description,
		// BCP 47, the same value `<html lang>` carries — `site.locale` is the
		// `en-US` form used for `Intl` formatting, and the two must not be
		// confused: a page whose markup says `en` and whose schema says `en-US` is
		// two answers to one question.
		inLanguage: site.lang,
		author: person,
		publisher: person,
	}
}

/**
 * A generic page node. `type` narrows it — `AboutPage`, `ContactPage`,
 * `CollectionPage`, `WebPage` — because the specific types are what let a
 * consumer treat a contact page as a contact page.
 */
export function pageSchema({
	type = 'WebPage',
	path,
	name,
	description,
	dateModified,
}: {
	type?: string
	path: string
	name: string
	description: string
	/**
	 * ISO date. Supplied ONLY where the site genuinely knows it — `/now` reads
	 * it from its content file. It is never the build date: a `dateModified`
	 * that advances on every deploy is noise a consumer learns to ignore.
	 */
	dateModified?: string
}): JsonLd {
	return {
		'@type': type,
		'@id': absoluteUrl(`${path}#page`),
		url: absoluteUrl(path),
		name,
		description,
		inLanguage: site.lang,
		isPartOf: { '@id': WEBSITE_ID },
		about: { '@id': PERSON_ID },
		...(dateModified ? { dateModified } : {}),
	}
}

/**
 * P-12 / B-09 — an article. Used for both case studies and posts, with `type`
 * distinguishing them (`TechArticle` carries the same fields and is more
 * specific, which is the whole reason to use it).
 */
export function articleSchema({
	type = 'BlogPosting',
	path,
	headline,
	description,
	publishedAt,
	updatedAt,
	image,
	keywords,
}: {
	type?: 'BlogPosting' | 'TechArticle' | 'Article'
	path: string
	headline: string
	description: string
	publishedAt: Date
	updatedAt?: Date
	image?: string
	keywords?: readonly string[]
}): JsonLd {
	return {
		'@type': type,
		'@id': absoluteUrl(`${path}#article`),
		url: absoluteUrl(path),
		headline,
		description,
		datePublished: publishedAt.toISOString(),
		// Falls back to the publication date rather than to today. An article
		// that claims to have been modified on every deploy is the same lie
		// `dateModified` on a page would be.
		dateModified: (updatedAt ?? publishedAt).toISOString(),
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		inLanguage: site.lang,
		mainEntityOfPage: absoluteUrl(path),
		...(image ? { image: absoluteUrl(image) } : {}),
		...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
	}
}

/**
 * WEBSITE_STRUCTURE.md §2 — breadcrumbs exist on `/projects/[slug]` and
 * `/blog/[slug]` only, and this is the structured-data half of the same trail.
 * The positions are 1-based; a 0-based list is silently ignored.
 */
export function breadcrumbSchema(
	items: readonly { label: string; href: string }[],
): JsonLd {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			item: absoluteUrl(item.href),
		})),
	}
}

/** `/projects`, `/blog`, `/skills` — an ordered list of things. */
export function itemListSchema(
	items: readonly { name: string; href: string }[],
): JsonLd {
	return {
		'@type': 'ItemList',
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: absoluteUrl(item.href),
		})),
	}
}

/**
 * A-07 — `hasOccupation`, one entry per role.
 *
 * Attached to the Person node on `/experience` rather than declared as loose
 * `OrganizationRole` nodes, because an occupation with no person attached is
 * not information a consumer can use.
 */
export function occupationSchema(
	roles: readonly {
		title: string
		company: string
		startedAt: string
		endedAt?: string
	}[],
): JsonLd {
	return {
		'@type': 'Person',
		'@id': PERSON_ID,
		hasOccupation: roles.map((role) => ({
			'@type': 'OrganizationRole',
			roleName: role.title,
			startDate: role.startedAt,
			...(role.endedAt ? { endDate: role.endedAt } : {}),
			worksFor: { '@type': 'Organization', name: role.company },
		})),
	}
}

/**
 * Wrap nodes into one graph.
 *
 * ONE `<script>` PER PAGE, NOT ONE PER NODE. `@graph` is what lets nodes
 * reference each other by `@id` across the page — a `BreadcrumbList` in its own
 * script tag cannot point at a `WebPage` in another one, and consumers differ
 * on whether they try.
 */
export function graph(...nodes: JsonLd[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@graph': nodes,
	}
}
