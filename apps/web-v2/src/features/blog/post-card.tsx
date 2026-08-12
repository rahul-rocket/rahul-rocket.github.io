import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/cn'
import type { Post } from '@/lib/content/schemas'
import { formatDate } from '@/lib/format-date'

/**
 * B-02 — a post entry on `/blog`, `/blog/tags/[tag]` and Home.
 *
 * The title is the link and a `::after` overlay is the click target — the same
 * pattern and the same reason as `ProjectCard`: wrapping the whole entry in an
 * `<a>` would give the link an accessible name containing the date, the reading
 * time and every tag, and would make the tag links nested interactive elements.
 *
 * Tags render as `<a>` here rather than as decoration, so `/blog/tags/[tag]`
 * is reachable from anywhere a post appears. They sit above the overlay via
 * `relative`, which is the one thing the overlay pattern needs a caller to
 * remember.
 */
export function PostCard({
	post,
	level = 3,
	className,
}: {
	post: Post
	level?: 2 | 3 | 4
	className?: string
}) {
	const { frontmatter } = post

	return (
		// A CARD, NOT A ROW BETWEEN RULES.
		//
		// This was `border-b py-8` — a stack of horizontal rules, which is the
		// layout of a changelog. A post index is a set of things a reader chooses
		// between, and things you choose between should look like objects.
		//
		// `u-lift`/`u-hairline` are the interactive pair, and they are honest here
		// for the same reason as on `ProjectCard`: the title's `::after` overlay
		// makes the whole surface activate, and `:focus-within` gives keyboard
		// users the same signal. No `overflow-hidden` — it would clip the lift's
		// glow, which is drawn outside the box.
		<article
			className={cn(
				'group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-sm',
				'u-lift u-hairline transition-colors duration-base ease-out-quint',
				'hover:border-border-strong hover:bg-surface-hover',
				className,
			)}
		>
			<Text size="xs" tone="muted" className="font-mono">
				<time dateTime={frontmatter.publishedAt.toISOString()}>
					{formatDate(frontmatter.publishedAt)}
				</time>
				{' · '}
				{post.readingTimeMinutes} min read
			</Text>

			<Heading level={level} size="h3">
				<a
					href={post.href}
					className="text-text no-underline after:absolute after:inset-0 after:content-[''] hover:text-accent"
				>
					{frontmatter.title}
				</a>
			</Heading>

			<Text tone="muted">{frontmatter.summary}</Text>

			<ul className="relative flex list-none flex-wrap gap-2 p-0">
				{frontmatter.tags.map((tag) => (
					<li key={tag}>
						<a
							href={`/blog/tags/${tag}/`}
							className="rounded-full no-underline"
						>
							<Badge tone="neutral">{tag}</Badge>
						</a>
					</li>
				))}
			</ul>
		</article>
	)
}
