import { Logo } from '@/components/brand/logo'
import { footerNavGroups } from '@/config/nav'
import { site } from '@/config/site'
import { NavLink } from './nav-link'

const SITEMAP_HEADING_ID = 'footer-sitemap'

/**
 * L-06 — the footer, and the site's accessibility safety net.
 *
 * WEBSITE_STRUCTURE.md §2 gives this component a specific job: every route
 * reachable from every page, without JavaScript. That is why it renders as
 * server-side markup with no interactivity, and why it — rather than the header
 * — is the fallback when the mobile sheet's trigger is hidden for want of
 * JavaScript. It is the only navigation on the site with no conditions attached
 * to it.
 *
 * ONE `<nav>`, NOT THREE. Each group could be its own labelled landmark, and
 * that is a common pattern, but it puts three more entries in the landmark list
 * a screen-reader user pages through to find anything. A single labelled
 * landmark containing headed lists conveys the same structure and costs one
 * entry. Headings do the grouping; landmarks do the navigating.
 *
 * The groups themselves come pre-filtered to what the export contains — see the
 * long note on `footerNavGroups` in config/nav.ts for why the shell may not
 * link to a route that has not been built yet.
 */
export function SiteFooter() {
	return (
		// `bg-bg-subtle` — RESTORED, because DS-12 closed the hole that made it
		// unsafe.
		//
		// The history is worth keeping. The first version used this role and axe
		// failed it in the light theme: the GitHub link and the build line did not
		// clear 4.5:1 against it. The root cause was not the colour, it was the
		// gate — `scripts/check-contrast.mjs` verified text, muted text and accent
		// against `--ui-bg` and `--ui-surface` and had NO pair for
		// `--ui-bg-subtle`, so text on that role was unverified by construction and
		// `pnpm check:contrast` reported "all pass" about a palette that did not.
		// The footer moved to `bg-bg` as a workaround and the real fix went to the
		// backlog.
		//
		// That fix has landed: five pairs now assert this role in both themes and
		// all five tones, so it is verified exactly as `--ui-surface` is. The
		// workaround is no longer needed, and the footer gets back the tonal step
		// that separates it from the page — which the mesh alone cannot provide,
		// because the mesh is continuous and a boundary needs a discontinuity.
		//
		// `u-edge` puts the spectrum hairline along the top of it, so the seam
		// between page and footer is lit rather than ruled.
		// NO `mt-section`, AND ITS REMOVAL IS A FIX RATHER THAN A TIGHTENING.
		// Two elements owned the same gap: every page's last `<Section>` already
		// ends with `pb-section`, and this added a second `--space-section` on
		// top of it. At a desktop viewport that clamp is 9rem, so the real
		// distance between the last line of content and the footer rule was
		// 288px — a screenful of nothing on thirteen routes, which reads as a
		// page that failed to finish rendering rather than as breathing room.
		//
		// The page owns the gap now, which is also the rule everywhere else in
		// this codebase: vertical rhythm belongs to the section wrapper, never to
		// a margin on a neighbour (DESIGN_SYSTEM §5). The footer's own `py-16` is
		// its internal padding and is untouched.
		<footer
			id="site-footer"
			className="u-edge relative border-border border-t bg-bg-subtle"
		>
			<div className="mx-auto flex max-w-page flex-col gap-12 px-gutter py-16">
				<div className="flex flex-col gap-12 md:flex-row md:justify-between">
					<div className="flex flex-col gap-3">
						{/* A <p>, not a heading: the footer's wordmark is a signature, not
						    a section title, and giving it a level would put it in the
						    document outline of every page. The name stays visible at every
						    width here — unlike in the header, the footer has the room, and
						    a signature that is only a mark is not a signature. */}
						<p>
							<Logo />
						</p>
						<p className="max-w-lede text-sm text-text-muted">{site.role}</p>
					</div>

					<nav aria-labelledby={SITEMAP_HEADING_ID}>
						<h2 id={SITEMAP_HEADING_ID} className="sr-only">
							Site map
						</h2>
						<div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
							{footerNavGroups.map((group) => (
								<div key={group.title} className="flex flex-col gap-3">
									<h3 className="font-heading text-text text-xs uppercase tracking-caps">
										{group.title}
									</h3>
									<ul className="flex flex-col gap-2">
										{group.items.map((route) => (
											<li key={route.path}>
												<NavLink
													href={route.path}
													className="text-sm text-text-muted no-underline hover:text-text aria-[current=page]:text-text aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:underline-offset-4"
												>
													{route.label}
												</NavLink>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</nav>
				</div>

				{/* `text-text-muted`, not `text-text-subtle`. The subtle role is
				    contracted at 3:1, which is the LARGE-text bar; this line is 14px,
				    so 4.5:1 applies and only the muted role clears it. The token
				    comment calling subtle "meta only" is about prose, not about size. */}
				<div className="flex flex-col gap-4 border-border border-t pt-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
					{/*
					  NO BUILD DATE, BY DECISION, AND IT IS WORTH KNOWING WHAT WAS GIVEN
					  UP. This line used to read "Built <date> · <sha>", baked in at
					  `next build`, so that "is what I am looking at current?" and "did
					  the last deploy actually land?" were answerable from the page.

					  Both are still answerable — from the repository, and from the
					  `verify` job in `deploy-pages.yml`, which fails when the live site
					  is not serving the deployed commit (DEPLOYMENT.md §4). What the
					  line cost in exchange was a date on every page that goes stale the
					  moment the content does not change for a month, which reads as
					  abandonment rather than as freshness. The signature is dateless
					  instead.
					*/}
					<p>© {site.name}</p>

					<ul className="flex gap-6">
						<li>
							{/* rel="me" is what lets a profile verify this site back —
							    Mastodon and GitHub both consume it. */}
							<a href={site.social.github} rel="me">
								GitHub
							</a>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}
