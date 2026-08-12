import { ArrowRightIcon } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import type { CaseStudy } from '@/lib/content/schemas'

/**
 * P-13 — previous/next, by `order`. docs/PROJECT_CASE_STUDIES.md §3, section 12.
 *
 * A `<nav>` with its own label, because a page can carry several navigations
 * and "Navigation" repeated three times in a landmarks list helps nobody.
 *
 * Each link's accessible name is the study's *title*, not "Previous" — the
 * direction word is a visually-hidden prefix, so a screen-reader user hears
 * "Previous: Reconciliation that stopped needing a human" rather than a link
 * list of "Previous, Next" with no destinations in it.
 *
 * At either end the corresponding side is simply absent. An "end of the list"
 * placeholder is a control that looks disabled and reads as broken.
 */
export function CaseStudyNav({
	previous,
	next,
}: {
	previous: CaseStudy | null
	next: CaseStudy | null
}) {
	if (!previous && !next) return null

	return (
		<nav
			aria-label="More case studies"
			className="grid grid-cols-1 gap-4 border-border border-t pt-8 sm:grid-cols-2"
		>
			{previous ? (
				<a
					href={previous.href}
					className="group flex flex-col gap-2 rounded-lg border border-border p-5 no-underline transition-colors duration-fast hover:border-border-strong hover:bg-surface-hover"
				>
					<Text size="xs" tone="muted" caps className="font-mono">
						<ArrowRightIcon
							size="sm"
							className="mr-2 inline rotate-180 align-text-bottom"
						/>
						Previous
					</Text>
					<Text className="font-heading text-text leading-heading">
						{previous.frontmatter.title}
					</Text>
				</a>
			) : (
				// An empty cell keeps `next` in the right-hand column when there is no
				// previous, so the direction of travel stays legible.
				<div aria-hidden="true" />
			)}

			{next ? (
				<a
					href={next.href}
					className="group flex flex-col items-end gap-2 rounded-lg border border-border p-5 text-right no-underline transition-colors duration-fast hover:border-border-strong hover:bg-surface-hover sm:col-start-2"
				>
					<Text size="xs" tone="muted" caps className="font-mono">
						Next
						<ArrowRightIcon
							size="sm"
							className="ml-2 inline align-text-bottom"
						/>
					</Text>
					<Text className="font-heading text-text leading-heading">
						{next.frontmatter.title}
					</Text>
				</a>
			) : null}
		</nav>
	)
}
