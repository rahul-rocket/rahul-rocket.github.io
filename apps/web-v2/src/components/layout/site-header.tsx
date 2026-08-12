import { Logo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { builtRoutes, homeRoute, primaryNavRoutes } from '@/config/nav'
import { buildCommands } from '@/lib/commands'
import { getPosts } from '@/lib/content/posts'
import { CommandPalette } from './command-palette'
import { HeaderScrollState } from './header-scroll-state'
import { MobileNav } from './mobile-nav'
import { NavLink } from './nav-link'
import { ScrollProgress } from './scroll-progress'

/** Owned here, consumed by HeaderScrollState. Declared once, in the owner. */
const HEADER_ID = 'site-header'

/**
 * L-03/L-04/L-07 — the header. A Server Component; the three interactive parts
 * (scroll state, sheet, theme toggle) are client leaves, pushed as deep as they
 * go. CLAUDE.md §5.
 *
 * WHAT "CONDENSES ON SCROLL" MEANS HERE, AND WHY IT IS NOT A HEIGHT CHANGE.
 *
 * The obvious reading of the roadmap's "condenses on scroll" is that the header
 * gets shorter. It does not, and the reason is that a `position: sticky` element
 * occupies its space in normal flow: shrinking it reflows the document beneath
 * it and moves the content the reader is looking at. That is a layout animation
 * — the exact class ANIMATION_GUIDELINES.md §"cheap" rules out — and it spends
 * the CLS budget (0.02, PERFORMANCE.md §2) on decoration, on every route, above
 * the fold.
 *
 * So the condensation is expressed in surface instead of in size: a hairline
 * separating the header from the content fades in once the page has scrolled.
 * The header's height never changes, nothing reflows, and the only animated
 * property is `opacity` on a one-pixel pseudo-element.
 *
 * The header is opaque (`bg-bg`) in BOTH states, which is what makes the whole
 * feature safe to lose. Without JavaScript the attribute never arrives, the
 * hairline never appears — and content still never shows through the header,
 * because the opacity that matters was never the thing being animated.
 */
export function SiteHeader() {
	/*
	 * Read at BUILD time, in this Server Component, and handed to the palette as
	 * props. `getPosts` uses `node:fs`, so it is unreachable from a Client
	 * Component by construction (lib/content/posts.ts) — which is the intended
	 * shape: there is no client-side content fetching on this site, and the
	 * palette's corpus is baked into the HTML of every route.
	 *
	 * Only what the palette actually renders is projected, not whole `Post`
	 * objects. Everything handed across the boundary is serialized into the
	 * document, so the frontmatter, reading time, and tags of every post would be
	 * bytes on every page in service of a search box most readers never open.
	 */
	const commands = buildCommands(
		getPosts().map((post) => ({
			href: post.href,
			title: post.frontmatter.title,
			description: post.frontmatter.summary,
		})),
	)

	return (
		<>
			<HeaderScrollState headerId={HEADER_ID} />

			<header
				id={HEADER_ID}
				/*
				 * z-40 — see the stacking-order contract in globals.css.
				 *
				 * GLASS RATHER THAN OPAQUE, and the old comment above about the header
				 * being "opaque in BOTH states" no longer describes it. What made that
				 * property valuable was that losing the scroll attribute could never
				 * let content show through; that guarantee now comes from the glass
				 * fill's own alpha floor of 0.72 (surfaces.css) plus the
				 * `@supports not (backdrop-filter)` fallback to an opaque raised
				 * surface. Both are verified: `check:contrast` composites the header
				 * glass over the LIGHTEST backdrop the page can put behind it — the
				 * aurora peak — in every theme and every tone, and asserts the surface
				 * text pairs against the result.
				 *
				 * The header is the one element on the site that is over the mesh at
				 * every scroll position, so it is where glass actually earns its cost:
				 * it picks up the page's own tone instead of being given a colour, and
				 * the saturation lift in `--ui-glass-saturate` is what makes that read
				 * as material rather than as translucency.
				 */
				className="u-header-rule sticky top-0 z-40 h-header border-glass-border border-b bg-glass u-glass"
			>
				{/*
				  A THREE-COLUMN GRID, NOT A FLEX ROW WITH `justify-between`.
				  The nav is centred on the HEADER, which is only the same thing as
				  centring it between its neighbours when the wordmark and the control
				  cluster happen to be the same width — and they never are, so a flex
				  row puts the nav visibly off-centre and moves it every time a control
				  is added. `grid-cols-[1fr_auto_1fr]` makes the two outer cells share
				  the leftover space equally, so the middle cell is centred on the
				  container by construction and stays centred as the sides change.

				  DOM order is wordmark → nav → controls, which is both the visual
				  order and the tab order (CLAUDE.md §8: CSS may not reorder reading
				  sequence). The grid places, it does not reorder.
				*/}
				<div className="mx-auto grid h-full max-w-page grid-cols-[1fr_auto_1fr] items-center gap-6 px-gutter">
					{/*
					  The wordmark, not an <h1>. Every page has exactly one <h1> and it
					  belongs to that page's subject; a site name repeated in the header
					  of every route would make the heading outline meaningless and would
					  break the single-h1 assertion in the navigation spec.

					  It is a link to Home on every page including Home itself, because a
					  wordmark that is sometimes a link and sometimes not is a wordmark
					  readers stop trusting. `aria-current` is what distinguishes them.
					*/}
					<NavLink
						href={homeRoute?.path ?? '/'}
						// `whitespace-nowrap` because a wordmark that wraps is not a
						// wordmark. The header is a fixed `h-header`, so a second line has
						// nowhere to go — it is the first thing to break as controls are
						// added, and it breaks silently.
						className="justify-self-start whitespace-nowrap text-text no-underline transition-colors duration-fast hover:text-accent"
					>
						{/*
						  A LOGO, NOT THE NAME AS TEXT — and the name is still there.
						  The mark is what makes the header identifiable at a glance and
						  in a browser tab strip; the name is what makes it identifiable
						  to a screen reader and to anyone who has not seen the mark
						  before. Dropping the text would leave this link with no
						  accessible name at all, since the SVG is `aria-hidden`.

						  It is the NAME that hides below `sm`, never the mark: a fixed
						  `h-header` bar with a palette trigger, a theme toggle and a menu
						  button has no room for a full wordmark at 320px, and the mark
						  alone is still an identity. The `sr-only` fallback keeps the
						  link named at every width.
						*/}
						<Logo nameClassName="sr-only sm:not-sr-only" />
					</NavLink>

					{/*
					  The centred cell. `md:` and up only — below that the sheet is the
					  navigation, and an empty middle cell simply collapses to nothing,
					  which is what `auto` sizing does for free.
					*/}
					<nav aria-label="Primary" className="hidden md:block">
						<ul className="flex items-center gap-4 lg:gap-6">
							{primaryNavRoutes.map((route) => (
								<li key={route.path}>
									<NavLink
										href={route.path}
										// Current page is marked by an underline as well as by
										// colour — colour alone fails WCAG 1.4.1 (CLAUDE.md §8).
										//
										// `u-sweep` is the HOVER treatment and is deliberately a
										// different device from the current-page underline: it is
										// a spectrum rule that grows in from the left and
										// retreats to the left, sitting further from the baseline
										// than the solid accent underline above it. Using one
										// device for both would make "pointing at a link" and
										// "you are on this page" look the same for the duration
										// of the hover, which is the state a reader is in exactly
										// when they most need to tell them apart.
										className="u-sweep text-text-muted no-underline transition-colors duration-fast hover:text-text aria-[current=page]:text-text aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:underline-offset-4"
									>
										{route.label}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					{/* The third cell. `justify-self-end` keeps the cluster against the
					    gutter while the cell itself still claims its half of the
					    leftover space, which is what holds the nav on the centre line. */}
					<div className="flex items-center justify-self-end gap-2">
						{/*
						  L-13. Before the theme toggle so the tab order runs
						  nav → search → theme → menu, which is roughly descending order of
						  how often each is wanted. It carries its own `<dialog>`, which is
						  in the top layer and therefore unaffected by sitting inside a
						  `position: sticky` header.
						*/}
						<CommandPalette commands={commands} />
						<ThemeToggle />
						{/*
						  The sheet gets the FULL built route list, not the five primary
						  items. WEBSITE_STRUCTURE.md §2 caps the desktop nav at five
						  because a horizontal bar that requires reading has failed; a
						  vertical sheet has no such constraint, and on mobile it is the
						  only navigation above the fold. Under-filling it would push
						  readers to the footer for routes the desktop nav also omits.
						*/}
						<MobileNav items={builtRoutes} />
					</div>
				</div>

				{/* Last child, so it paints over the hairline rather than under it.
				    Inventory item 24 — zero JavaScript; see the component. */}
				<ScrollProgress />
			</header>
		</>
	)
}
