import { SectionIntro } from '@/components/layout/section-intro'
import { Reveal } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Heading } from '@/components/ui/heading'
import { ArrowRightIcon } from '@/components/ui/icons'
import { Section } from '@/components/ui/section'
import { Stack, stackVariants } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { SELECTED_WRITING_LIMIT } from '@/config/home'
import { getPosts } from '@/lib/content/posts'
import { formatDate, toIsoDate } from '@/lib/format-date'

/**
 * H-05 — Selected writing. docs/WEBSITE_STRUCTURE.md §4.1 section 5.
 *
 * THE BACKLOG LISTS THIS AS DEPENDING ON B-02, AND IT DOES NOT. B-02 is the
 * real `/blog` index — in-HTML search, tag filtering, URL-param filter state —
 * and nothing here needs any of it. What this section actually needs is the
 * post loader (F1-04, done), the post schema (F1-03, done) and a `/blog/` route
 * to send the reader on to (`built: true` since Phase 3). The dependency was
 * recorded one phase too coarse; the correction is in docs/TASK_BACKLOG.md
 * rather than only here, because a dependency nobody re-checks blocks work that
 * was never blocked.
 *
 * A SERVER COMPONENT THAT READS CONTENT DIRECTLY. `getPosts` uses `node:fs`, so
 * it cannot cross a client boundary even by accident (ARCHITECTURE §8), and it
 * is wrapped in React `cache()` — the index, the post page and this section all
 * read the same corpus once per build.
 *
 * IT RENDERS WHAT EXISTS, NOT THREE. §4.1 says "three most recent posts", and
 * `getPosts` returns them newest-first, so the cap is a `slice`. With one post
 * on the site today it renders one, which is the honest state; with none it
 * renders nothing at all rather than an empty heading, because a section
 * heading over an empty list reads as a rendering bug rather than as a young
 * site — the same reasoning `footerNavGroups` applies to an empty nav group.
 */

const HEADING_ID = 'selected-writing'

export function SelectedWriting() {
	const posts = getPosts().slice(0, SELECTED_WRITING_LIMIT)

	if (posts.length === 0) return null

	return (
		<Section labelledBy={HEADING_ID}>
			<Container>
				<Stack gap={12}>
					<Reveal>
						<SectionIntro
							id={HEADING_ID}
							index={3}
							eyebrow="Writing"
							title="Selected writing"
							lede="Decisions from this build and from production work, written up while the reasoning was still available."
							action={
								/*
								  A real link styled as a button — UI_GUIDELINES §4. `ghost` so
								  it does not compete with the section heading beside it; the
								  page's one primary button belongs to the CTA at the bottom.
								*/
								<Button asChild variant="ghost" size="sm">
									<a href="/blog/">
										All writing
										{/* Decorative: the link text already says where it goes,
										    so the icon is `aria-hidden` by default. */}
										<ArrowRightIcon />
									</a>
								</Button>
							}
						/>
					</Reveal>

					{/*
					  An `<ol>`: these are ordered, by recency, and that ordering is
					  information. Same shape as the blog index. `Reveal` is the list
					  element for the same reason as the capability grid — `data-stagger`
					  delays the direct children of the armed node.
					*/}
					{/*
					  CARDS SEPARATED BY SPACE, NOT ROWS SEPARATED BY RULES.

					  This was `gap: 0` with a `border-t` on every item — a stack of
					  horizontal lines, which is the layout of a changelog rather than of
					  a set of things a reader is choosing between. The entries are
					  objects now, and the gap does the separating the rules used to.

					  `u-lift`/`u-hairline` are honest here: each row contains a title
					  link, and `u-lift` responds to `:focus-within` as well as `:hover`
					  so a keyboard user gets the same affordance. No `overflow-hidden` —
					  it would clip the lift glow, which paints outside the box.
					*/}
					<Reveal
						as="ol"
						stagger
						role="list"
						className={stackVariants({ gap: 4 })}
					>
						{posts.map((post) => (
							<li key={post.slug}>
								<article className="u-lift u-hairline flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors duration-base ease-out-quint hover:border-border-strong hover:bg-surface-hover md:flex-row md:gap-12">
									{/*
									  The date rail. `<time datetime>` is the machine-readable
									  half — ACCESSIBILITY and SEO both want it, and the visible
									  string is the reader's. `toIsoDate` and `formatDate` both
									  format in UTC, so a build machine west of UTC cannot
									  render a post as the previous day.
									*/}
									<Text
										as="p"
										size="xs"
										tone="muted"
										caps
										className="font-mono md:w-40 md:shrink-0"
									>
										<time dateTime={toIsoDate(post.frontmatter.publishedAt)}>
											{formatDate(post.frontmatter.publishedAt)}
										</time>
									</Text>

									<Stack gap={3} align="start">
										<Heading level={3} size="h3">
											{/*
											  The title is the link, not the row. A stretched
											  `::after` over the whole card is the pattern that
											  keeps a card clickable without nesting interactive
											  elements, and it is wrong here: the tag list below is
											  a sibling that a later task (B-05) turns into links,
											  and a stretched link swallows them.
											*/}
											<a href={post.href}>{post.frontmatter.title}</a>
										</Heading>

										<Text tone="muted">{post.frontmatter.summary}</Text>

										{/*
										  A list of tags is a list. Not links yet — the tag archives
										  are B-05, and a badge that looks clickable and is not is
										  worse than a badge that does not.

										  `Stack as="ul"` rather than a bare `<ul>` so `role="list"`
										  arrives through a spread. Safari drops list semantics from a
										  `list-style: none` ul — which Preflight applies to every one
										  — so the role is load-bearing, but Biome's `noRedundantRoles`
										  reads the JSX literally and rejects it on the element itself.
										  `Grid` resolves the same conflict the same way; the
										  alternative is suppressing an accessibility rule in order to
										  keep an accessibility fix.
										*/}
										<Stack
											as="ul"
											role="list"
											direction="row"
											wrap
											gap={2}
											align="center"
										>
											{post.frontmatter.tags.map((tag) => (
												<Badge as="li" key={tag}>
													{tag}
												</Badge>
											))}
										</Stack>

										<Text as="p" size="sm" tone="muted">
											{post.readingTimeMinutes} min read
										</Text>
									</Stack>
								</article>
							</li>
						))}
					</Reveal>
				</Stack>
			</Container>
		</Section>
	)
}
