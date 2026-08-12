/**
 * Identity — the single source. docs/PROJECT_STRUCTURE.md §4.
 *
 * Nothing else in the codebase may hardcode the name, the URL, or a social
 * handle. A string that appears here and nowhere else is the point: a rename or
 * a domain migration is one edit, not a find-and-replace with a long tail of
 * missed spots in metadata, JSON-LD, and feeds.
 */
export const site = {
	name: 'Rahul Rocket',
	role: 'Full Stack Software Engineer & Software Architect',

	/**
	 * One sentence, used as the default meta description and as the `Person`
	 * JSON-LD `description`. Bounded by the same 60–180 the content schemas use,
	 * because it is the same SERP snippet.
	 */
	description:
		'I design and deliver production systems end to end, and I can walk you through every decision inside them.',

	/** Absolute, no trailing slash. Feeds, canonicals, and OG tags build on it. */
	url: 'https://rahul-rocket.github.io',

	locale: 'en-US',
	/** BCP 47, for the `lang` attribute. */
	lang: 'en',

	/**
	 * THE ONE SWITCH THAT LIFTS `noindex`, AND IT IS DELIBERATELY NOT A BUILD
	 * FLAG. docs/DEPLOYMENT.md §7, docs/TASK_BACKLOG.md Q-12.
	 *
	 * The export is continuously published to the real URL, so a crawler can
	 * reach it. Parts of the content layer are drafted rather than verified —
	 * `content/experience.ts` and `content/journey.ts` carry the notice, and two
	 * of the three case studies are marked `needsReview` — and a drafted record
	 * indexed under a real person's name outlives the deployment that produced
	 * it.
	 *
	 * Flipping this to `true` is an editorial decision, not an engineering one:
	 * it asserts that every claim on the site is one its author can stand behind.
	 * Everything downstream — the robots meta, `robots.txt`, and the sitemap —
	 * reads it from here, so it is one edit.
	 */
	indexable: false,

	/**
	 * Obfuscated at rest, assembled at render. Not a security measure — the
	 * address is in the HTML either way — but it does defeat the naive scrapers
	 * that regex for `mailto:` in source, which is the entire realistic threat
	 * model for a personal site. `contactEmail()` below is the only reader.
	 */
	emailUser: 'hello',
	emailDomain: 'rahulrocket.dev',

	/**
	 * This site's own source, which is a different destination from the profile
	 * below and is cited as evidence rather than as a social link — H-04's proof
	 * lines and H-06's current focus both point a reader at the repository to
	 * check a claim, and `social.github` would send them to a profile page
	 * instead. Absolute and no trailing slash, like `url`.
	 */
	repository: 'https://github.com/rahul-rocket/rahul-rocket.github.io',

	social: {
		github: 'https://github.com/rahul-rocket',
	},

	/**
	 * C-01 — the form endpoint. Empty until the author creates one, and the
	 * contact form falls back to `mailto:` when it is, which is the same path a
	 * reader without JavaScript takes. See `features/contact`.
	 */
	formspreeEndpoint: '',
} as const

export type Site = typeof site

/**
 * Absolute URL for a site-relative path.
 *
 * Everything that leaves the page — canonical, `og:image`, feed entries,
 * JSON-LD — must be absolute; relative URLs in those positions resolve against
 * the consuming client, not the site, and silently break link previews.
 */
export function absoluteUrl(path: string): string {
	return new URL(path, `${site.url}/`).toString()
}

/**
 * The contact address, assembled at render.
 *
 * One function, so the two halves above are joined in exactly one place and a
 * `mailto:` typed by hand somewhere else is a review catch rather than a
 * silently divergent address.
 */
export function contactEmail(): string {
	return `${site.emailUser}@${site.emailDomain}`
}

/**
 * A `mailto:` with a pre-filled subject and body — C-02.
 *
 * This is the fallback the contact form degrades to with JavaScript disabled or
 * with no endpoint configured, and it is also the primary path offered to
 * anyone who would rather use their own mail client. Both halves are encoded,
 * because an unencoded newline or ampersand truncates the body silently.
 */
export function mailtoHref(subject: string, body?: string): string {
	const params = new URLSearchParams({ subject })
	if (body) params.set('body', body)
	return `mailto:${contactEmail()}?${params.toString()}`
}
