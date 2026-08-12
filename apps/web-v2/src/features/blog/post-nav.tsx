import { ArrowRightIcon } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import type { Post } from '@/lib/content/schemas'

/**
 * B-03 — previous/next by publication date. docs/BLOG_SYSTEM.md §6.
 *
 * "Newer" and "older", not "previous" and "next". A blog is ordered by time and
 * a reader knows which direction they want; "next" on a reverse-chronological
 * list is genuinely ambiguous about whether it means the next one published or
 * the next one down the page.
 *
 * The direction word is a visually-hidden prefix inside the link, so the
 * accessible name is "Older: <title>" rather than a link list of bare
 * directions. Same shape and same reasoning as `CaseStudyNav`.
 */
export function PostNav({
	newer,
	older,
}: {
	newer: Post | null
	older: Post | null
}) {
	if (!newer && !older) return null

	return (
		<nav
			aria-label="More writing"
			className="grid grid-cols-1 gap-4 border-border border-t pt-8 sm:grid-cols-2"
		>
			{newer ? (
				<a
					href={newer.href}
					className="flex flex-col gap-2 rounded-lg border border-border p-5 no-underline transition-colors duration-fast hover:border-border-strong hover:bg-surface-hover"
				>
					<Text size="xs" tone="muted" caps className="font-mono">
						<ArrowRightIcon
							size="sm"
							className="mr-2 inline rotate-180 align-text-bottom"
						/>
						Newer
					</Text>
					<Text className="font-heading text-text leading-heading">
						{newer.frontmatter.title}
					</Text>
				</a>
			) : (
				<div aria-hidden="true" />
			)}

			{older ? (
				<a
					href={older.href}
					className="flex flex-col items-end gap-2 rounded-lg border border-border p-5 text-right no-underline transition-colors duration-fast hover:border-border-strong hover:bg-surface-hover sm:col-start-2"
				>
					<Text size="xs" tone="muted" caps className="font-mono">
						Older
						<ArrowRightIcon
							size="sm"
							className="ml-2 inline align-text-bottom"
						/>
					</Text>
					<Text className="font-heading text-text leading-heading">
						{older.frontmatter.title}
					</Text>
				</a>
			) : null}
		</nav>
	)
}
