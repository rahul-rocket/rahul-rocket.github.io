import type { Metadata } from 'next'
import { BackToTop } from '@/components/layout/back-to-top'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { SkipLink } from '@/components/layout/skip-link'
import { PointerEffects } from '@/components/motion/pointer-effects'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { site } from '@/config/site'
import { assertContentIntegrity } from '@/lib/content/cross-reference'
import { enhancementScript } from '@/lib/progressive'
import { DEFAULT_THEME, THEME_ATTRIBUTE, themeScript } from '@/lib/theme'
import '@/styles/globals.css'

/**
 * Root layout — the shell every page composes. docs/WEBSITE_STRUCTURE.md §3.
 *
 * L-01 is PARTIALLY done here, and the missing half is named rather than
 * quietly skipped: fonts are not wired up. `next/font` needs a typeface to load,
 * and DS-04 — selecting, licensing, and subsetting the display/text/mono faces —
 * is still blocked on a licensing decision (docs/TASK_BACKLOG.md, Phase 2). The
 * type tokens resolve to metric-similar system fallbacks until it lands, which
 * is why headings render correctly proportioned but not yet in the final face.
 * Adding `next/font` before the decision would mean choosing the typeface by
 * accident, in this file, instead of on purpose in DS-04.
 *
 * The theme provider (F1-09) has landed. Note there is no React context: the
 * theme is a DOM attribute, the pre-paint script sets it, and the toggle mutates
 * it. A provider would mean a client boundary at the root, which is the single
 * most likely performance regression in this codebase (CLAUDE.md §5) — and it
 * would buy nothing, because CSS already reads the attribute. The same reasoning
 * is why the header below is a Server Component with three client leaves rather
 * than one client header.
 */

/**
 * Concatenated here rather than in the JSX so the <script> stays a single line —
 * a Biome suppression only applies to the line that follows it, and a multi-line
 * element would silently move the flagged prop out from under it.
 */
const bootScript = `${themeScript}\n${enhancementScript}`

/**
 * F1-07 — the cross-reference check, run once at module scope during the build.
 *
 * HERE RATHER THAN ONLY IN `content:validate` BECAUSE THIS FILE IS THE ONE
 * MODULE EVERY ROUTE LOADS. A reference from one content file into another —
 * a case study's `stack` id, a skill's `evidence` path, a role's case-study
 * slug — fails silently by default: the badge renders without a depth rating,
 * the link 404s, and nothing in the build says a word. Running it here means
 * the export cannot be produced with a broken reference even if somebody built
 * without running the check.
 *
 * It costs one pass over the corpus per build and nothing at runtime: module
 * scope in a Server Component executes during `next build` and never in a
 * browser.
 */
assertContentIntegrity()

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: `${site.name} — ${site.role}`,
		template: `%s — ${site.name}`,
	},
	description:
		'Personal site of Rahul Rocket, a full stack software engineer and software architect.',
	// Nothing here is indexed until the Phase 10 cutover.
	//
	// This matters more now than when it was written, not less: the export is
	// continuously published to the real URL (.github/workflows/deploy-pages.yml),
	// so a crawler can reach it. Every page it would find today is a placeholder,
	// and placeholders indexed under the canonical URLs would outlive the
	// deployment that produced them. Lifting this is a Phase 10 step, gated on
	// there being real content behind every route in the manifest.
	robots: { index: false, follow: false },
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		// The served default is dark. The pre-paint script below corrects it before
		// first paint when the reader has chosen otherwise. The attribute belongs
		// on <html> rather than <body> so `color-scheme` reaches the scrollbar and
		// the form controls.
		<html lang={site.lang} {...{ [THEME_ATTRIBUTE]: DEFAULT_THEME }}>
			<head>
				{/*
				  Must be here, inline, and blocking — see the long note on
				  `themeScript`. Moving it into <body>, deferring it, or replacing it
				  with an effect reintroduces the flash of wrong theme on every
				  navigation. `suppressHydrationWarning` because this script mutates
				  the very attribute React rendered, which is the intent.

				  The enhancement flag rides in the same tag: two constants, because
				  they are two concerns with two reasons to change, but one <script>,
				  because two blocking tags would be two parser stops for ~90 bytes.
				*/}
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: a build-time constant with no interpolated input; see lib/theme.ts */}
				<script dangerouslySetInnerHTML={{ __html: bootScript }} />

				{/*
				  NO JSON-LD HERE, DELIBERATELY. `WebSite` is site-wide and this file is
				  the site-wide element, so the layout is the obvious home for it — and
				  it is the wrong one, because the layout cannot contribute a node to
				  the page's `@graph`. Emitting it here would put a second
				  `<script type="application/ld+json">` on every route, and two blocks
				  cannot reference each other by `@id`: consumers differ on whether they
				  merge nodes across scripts, so a `BreadcrumbList` in one block
				  pointing at a `WebPage` in another is a link that may or may not
				  exist.

				  Instead each route emits ONE graph (`lib/seo/structured-data.ts`),
				  `WebSite` and `Person` are declared on `/`, and every other page
				  references them by the shared `@id` constants — the same cross-page
				  reference pattern the `Person` node already relies on. The one-block
				  rule is asserted in `e2e/seo.spec.ts`, so restoring a tag here fails
				  the suite rather than silently duplicating an entity. docs/SEO.md §5.
				*/}
			</head>
			<body suppressHydrationWarning>
				{/*
				  NO PAGE BACKDROP HERE, AND THE REASON IS INHERITANCE.

				  The ambient mesh behind every route is `<PageBackdrop />`, and this
				  file is the obvious place for it — one element, every page, never
				  forgotten. It was written here first and it was wrong: a tone is a
				  set of custom properties, properties reach an element by inheriting
				  from its ANCESTORS, and a backdrop mounted in the layout is a sibling
				  of everything a page can annotate. Every route would have rendered
				  the default arrangement while the code read as though each had its
				  own, with no error anywhere.

				  So the page renders it — `PageContainer` for the thirteen routes that
				  use it, and Home, the 404 and the error boundary explicitly. See the
				  component for the alternatives that were rejected.
				*/}

				{/* First in the DOM, therefore first in the tab order. That ordering is
				    the entire feature — ACCESSIBILITY.md §"Skip link first". */}
				<SkipLink />
				<SiteHeader />

				{/*
				  `<main>` lives in the shell, not in each page, so the skip link's
				  target cannot go missing on a route somebody wrote in a hurry — a
				  broken `#main` is invisible to everyone who does not navigate by
				  keyboard.

				  `scroll-mt-header` is the non-obvious half. Jumping to `#main` scrolls
				  it to the viewport top, where the sticky header is already sitting, so
				  without a scroll margin the skip link lands the reader *underneath*
				  the header with the first paragraph hidden. ACCESSIBILITY.md
				  §"Never scroll focus off-screen"; the margin is the header's own
				  height token, so the two cannot drift.

				  `tabIndex={-1}` makes it a focus target: without it, following the
				  skip link moves the scroll position but leaves focus where it was, so
				  the next Tab goes straight back into the nav the reader just skipped.
				*/}
				<main id="main" tabIndex={-1} className="scroll-mt-header">
					{children}
				</main>

				<SiteFooter />

				{/*
				  After the footer in the DOM, which is where a keyboard user should
				  meet it: it is a shortcut back to the top, so its natural place in
				  the reading order is at the end. DOM order matches visual order in
				  the sense that matters — it is the last thing on the page — and
				  putting it earlier would insert a floating control into the middle of
				  the tab sequence. CLAUDE.md §8.

				  Zero JavaScript: it is an `<a href="#main">` revealed by a CSS
				  scroll-driven animation. See the component.
				*/}
				<BackToTop />

				{/*
				  L-08. Renders nothing, and is last so that its position in the DOM
				  cannot be mistaken for a layout concern. It is mounted in the shell
				  rather than per page because scroll smoothing is a property of the
				  document, and a page that forgot it would be the one page that
				  scrolls differently for no reason a reader could name.
				*/}
				<SmoothScroll />

				{/*
				  Renders nothing, like `SmoothScroll` above it, and mounted in the
				  shell for the same reason: the pointer field is a property of the
				  document, and one subscriber for the whole page is what makes the
				  per-frame cost a function of how many elements react rather than of
				  how many components were decorated. Every element it drives opts in
				  with a `data-` attribute and stays a Server Component.
				*/}
				<PointerEffects />
			</body>
		</html>
	)
}
