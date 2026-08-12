import { SectionIntro } from '@/components/layout/section-intro'
import { Reveal } from '@/components/motion/reveal'
import { Container } from '@/components/ui/container'
import { Heading } from '@/components/ui/heading'
import { ArrowUpRightIcon } from '@/components/ui/icons'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { currentFocus, currentFocusUpdatedAt } from '@/config/home'
import { formatDate, toIsoDate } from '@/lib/format-date'
import { actionHref, actionLinkProps, isActionAvailable } from './lib/actions'

/**
 * H-06 — Current focus. docs/WEBSITE_STRUCTURE.md §4.1 section 6, which calls
 * this "the strongest signal that the site is maintained".
 *
 * THAT SIGNAL IS THE DATE, AND THE DATE IS HAND-AUTHORED. `currentFocusUpdatedAt`
 * is a constant in `config/home.ts`, not `new Date()` — a section that re-dates
 * itself on every deploy claims maintenance it has not done, which is exactly
 * the failure C-12's acceptance criterion names for `/now`'s `dateModified`.
 * A stale date here is the correct failure mode: it is true, and it is visible.
 *
 * `/now` (C-12) is this section with a URL of its own. When it lands, this data
 * moves to a content file and both read it — the date rule travels with it.
 *
 * Each item's destination is gated exactly like a hero action, so an item can
 * name work that has no page yet without linking a route that would 404.
 * `check-links.mjs` walks `out/` and fails the build on an internal href with
 * no file behind it; on GitHub Pages a 404 is terminal (ARCHITECTURE §7).
 */

const HEADING_ID = 'current-focus'

/* The second `subtle` band — see the note in `capabilities.tsx` for why the
   page alternates rather than relying on the continuous mesh alone. */

export function CurrentFocus() {
	return (
		<Section labelledBy={HEADING_ID} surface="subtle">
			<Container>
				<Reveal>
					<Stack gap={12}>
						<SectionIntro
							id={HEADING_ID}
							index={4}
							eyebrow="Right now"
							title="Current focus"
							action={
								/* `<time>` so the claim is machine-readable as well as
								   legible. Both halves format in UTC — see `format-date.ts`.
								   It sits in the `action` slot rather than under the heading
								   because it is the same kind of thing as a section's outbound
								   link: metadata about the block, not part of its argument. */
								<Text as="p" size="xs" tone="muted" caps className="font-mono">
									Updated{' '}
									<time dateTime={toIsoDate(currentFocusUpdatedAt)}>
										{formatDate(currentFocusUpdatedAt)}
									</time>
								</Text>
							}
						/>

						{/*
						  A list of things is a list (UI_GUIDELINES §4), and this one is
						  unordered: the three are concurrent, not sequenced.
						*/}
						<Stack as="ul" role="list" gap={8} className="max-w-reading">
							{currentFocus.map((item) => (
								<li
									key={item.title}
									// The vertical rule is the "Instrument" device the eyebrow
									// uses, turned on its side — and it is now a GRADIENT rule
									// rather than a flat border, so it fades out down the item
									// instead of stopping dead. `u-rule` is a background on a
									// `::before`, not a `border-left`, because a border cannot
									// carry a gradient; it is decoration the accessibility tree
									// never sees, so there is no `aria-hidden` to remember.
									className="u-rule relative pl-6"
								>
									<Stack gap={3} align="start">
										<Heading level={3} size="h3">
											{item.title}
										</Heading>

										<Text tone="muted">{item.body}</Text>

										{/*
										  Rendered only when the destination exists. An item with
										  no available action is still a complete item — it is a
										  statement of what is being worked on, and the link is
										  evidence where evidence happens to have a URL.
										*/}
										{item.action && isActionAvailable(item.action) ? (
											<a
												href={actionHref(item.action)}
												{...actionLinkProps(item.action)}
												className="inline-flex items-center gap-2 text-accent text-sm"
											>
												{item.action.label}
												<ArrowUpRightIcon size="sm" />
											</a>
										) : null}
									</Stack>
								</li>
							))}
						</Stack>
					</Stack>
				</Reveal>
			</Container>
		</Section>
	)
}
