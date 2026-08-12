/**
 * F1-08 — the route manifest. docs/WEBSITE_STRUCTURE.md §1, §2.
 *
 * One list, consumed by the header, the footer, the sitemap, and the E2E suite.
 * That last consumer is the reason this file is shaped as data rather than as
 * JSX in a nav component: `e2e/routes.ts` derives its coverage from
 * `staticRoutes`, so adding a route here automatically adds it to the
 * navigation, accessibility, and (from Q-01) SEO specs. Forgetting to test a new
 * page is therefore not possible — which is only true for as long as nobody
 * hardcodes a path somewhere else.
 *
 * Dynamic routes (`/blog/[slug]`, `/projects/[slug]`) are deliberately absent:
 * they are enumerated from content at build time by `generateStaticParams`, and
 * a second hand-maintained list of them would be a source of drift.
 */

/** A route that exists as a fixed path — no params to enumerate. */
export interface StaticRoute {
	/** Site-absolute, with the trailing slash `trailingSlash: true` requires. */
	path: string
	/** Nav and footer label. */
	label: string
	/** Expected `<h1>` text. Asserted by the E2E navigation spec. */
	heading: string
	/** Sitemap priority — docs/WEBSITE_STRUCTURE.md §6. */
	priority: number
	/**
	 * False while the route is not yet built. Keeps the manifest complete as a
	 * plan while the specs only assert what exists. Flipping this to `true` is
	 * the last step of building a page, and it is what puts the route under the
	 * gate.
	 */
	built: boolean
}

export const staticRoutes = [
	{
		path: '/',
		// H-01 moved the name to the hero's eyebrow and gave the <h1> to what this
		// person does. The name is still the wordmark, the <title> and the footer;
		// the heading a page carries should be its subject, and on Home that is the
		// role. `config/home.ts` composes this string and `home.test.ts` pins the
		// two together, so this literal cannot drift from the rendered heading.
		label: 'Home',
		heading: 'Full Stack Software Engineer & Software Architect',
		priority: 1.0,
		built: true,
	},
	{
		path: '/blog/',
		label: 'Blog',
		heading: 'Writing',
		priority: 0.8,
		built: true,
	},
	{
		path: '/about/',
		label: 'About',
		// The h1 is the page's argument rather than its filing label, the same
		// decision H-01 took on Home. `e2e/navigation.spec.ts` asserts this string
		// as the rendered heading, so the two cannot drift silently.
		heading:
			'Delivery and judgment are the same job seen from different distances',
		priority: 0.9,
		built: true,
	},
	{
		path: '/projects/',
		label: 'Projects',
		heading: 'Projects',
		priority: 0.9,
		built: true,
	},
	{
		path: '/experience/',
		label: 'Experience',
		heading: 'The record, with outcomes rather than duties',
		priority: 0.7,
		built: true,
	},
	{
		path: '/journey/',
		label: 'Journey',
		heading: 'The through-line',
		priority: 0.6,
		built: true,
	},
	{
		path: '/skills/',
		label: 'Skills',
		heading: 'What I would actually claim',
		priority: 0.7,
		built: true,
	},
	{
		path: '/open-source/',
		label: 'Open Source',
		heading: 'Work that is public in full',
		priority: 0.6,
		built: true,
	},
	{
		path: '/uses/',
		label: 'Uses',
		heading: 'What I work with',
		priority: 0.5,
		built: true,
	},
	{
		path: '/resume/',
		label: 'Résumé',
		// The résumé's h1 is the person, not the document type — it is the one
		// page whose subject genuinely is the name.
		heading: 'Rahul Rocket',
		priority: 0.7,
		built: true,
	},
	{
		path: '/contact/',
		label: 'Contact',
		heading: 'Get in touch',
		priority: 0.8,
		built: true,
	},
	{
		// Not in WEBSITE_STRUCTURE §1's original map. Added with the page, along
		// with the §1 and §4 entries describing it — a locked route decision
		// should land as a manifest entry the same day it is taken, which is the
		// process finding C-12 recorded when `/now` spent two milestones in three
		// planning documents and no manifest.
		path: '/services/',
		label: 'Services',
		heading: 'What working together looks like',
		priority: 0.7,
		built: true,
	},
	{
		path: '/now/',
		label: 'Now',
		heading: 'What I am doing at the moment',
		priority: 0.5,
		built: true,
	},
] as const satisfies readonly StaticRoute[]

export type RoutePath = (typeof staticRoutes)[number]['path']

/** Routes that actually exist in the export today. */
export const builtRoutes: readonly StaticRoute[] = staticRoutes.filter(
	(route) => route.built,
)

/**
 * Primary navigation — five items, hard limit.
 * docs/WEBSITE_STRUCTURE.md §2: "a nav that requires reading is a nav that
 * failed". Experience, Journey, Skills, Open Source and Resume are destinations
 * reached from About and the footer, not entry points.
 */
export const primaryNav: readonly RoutePath[] = [
	'/about/',
	'/projects/',
	'/blog/',
	'/uses/',
	'/contact/',
]

/**
 * Footer groups — the complete site map. The footer is the accessibility safety
 * net: every route is reachable from every page without JavaScript, so this must
 * stay exhaustive over `staticRoutes`. `footerCoversEveryRoute` in the test
 * suite is what keeps it honest.
 */
export const footerGroups: readonly {
	title: string
	items: readonly RoutePath[]
}[] = [
	{
		title: 'Work',
		items: ['/projects/', '/experience/', '/open-source/', '/services/'],
	},
	{ title: 'About', items: ['/about/', '/journey/', '/skills/', '/resume/'] },
	{ title: 'More', items: ['/blog/', '/uses/', '/now/', '/contact/'] },
]

export function routeByPath(path: string): StaticRoute | undefined {
	return staticRoutes.find((route) => route.path === path)
}

/**
 * WHAT THE SHELL IS ALLOWED TO LINK TO — the `built` filter, applied once.
 *
 * The two lists above are the *plan*: every route the site will have. The header
 * and the footer render the *export*: the routes that exist today. Conflating
 * the two ships a nav full of 404s, and on GitHub Pages a 404 is terminal —
 * there is no server-side redirect to catch it (ARCHITECTURE.md §7).
 *
 * `check-links.mjs` would in fact catch it: it walks out/ and fails the build on
 * any internal href with no file behind it. So the choice was never "link to
 * unbuilt routes or not" — it was "filter here, or have the merge gate fail
 * until every page in Phase 4's manifest is written". Filtering is the honest
 * form: the shell is complete and correct, and it is visibly small because the
 * site is visibly small right now.
 *
 * The consequence is deliberate and is the point of the `built` flag: flipping
 * one to `true` is the last step of building a page, and it is the single edit
 * that puts the route into the nav, the footer, the sitemap, and the E2E suite
 * at once. Nobody has to remember to add it in four places, so nobody can forget.
 *
 * Rendered from these, the shell is currently Home + Blog. That is not a
 * placeholder to be filled in later by hand — it fills itself as Phases 5–9 land.
 */

function isBuilt(route: StaticRoute | undefined): route is StaticRoute {
	return route?.built === true
}

/** Home. The header wordmark links here; it is never a nav item. */
export const homeRoute: StaticRoute | undefined = routeByPath('/')

/** Primary nav, resolved to routes and narrowed to what the export contains. */
export const primaryNavRoutes: readonly StaticRoute[] = primaryNav
	.map(routeByPath)
	.filter(isBuilt)

export interface FooterGroup {
	title: string
	items: readonly StaticRoute[]
}

/**
 * Footer site map, same narrowing — and a group with nothing built in it is
 * dropped rather than rendered as a heading over an empty list, which reads as
 * a rendering bug rather than as a young site.
 */
export const footerNavGroups: readonly FooterGroup[] = footerGroups
	.map((group) => ({
		title: group.title,
		items: group.items.map(routeByPath).filter(isBuilt),
	}))
	.filter((group) => group.items.length > 0)
