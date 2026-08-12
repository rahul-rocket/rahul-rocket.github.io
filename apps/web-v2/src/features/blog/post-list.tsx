import { ListFilter } from '@/components/filter/list-filter'
import { Heading } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import type { Post } from '@/lib/content/schemas'
import { PostCard } from './post-card'

/**
 * B-02 — the `/blog` index. docs/BLOG_SYSTEM.md §5.
 *
 * SEARCH AND TAG FILTERING OVER DATA ALREADY IN THE HTML. Every post's title,
 * summary and tags are in the served markup, so filtering is a DOM operation
 * with no index to download and no request. §5 says this scales to a few
 * hundred posts, and names the next step when it stops: a build-generated JSON
 * index with a small matcher (PL-06). That is not built, deliberately — a
 * search index for eight posts is a download the reader pays for and does not
 * need.
 *
 * The filter is omitted below three posts. A search box over two entries is
 * furniture, and it costs the reader the client component that powers it.
 */

const LIST_ID = 'post-list'

export function PostList({
	posts,
	headingId,
	/** Hidden when the page already has a heading for this list. */
	heading = 'All posts',
	showFilter = true,
}: {
	posts: readonly Post[]
	headingId: string
	heading?: string
	showFilter?: boolean
}) {
	const counts = new Map<string, number>()
	for (const post of posts) {
		for (const tag of post.frontmatter.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
	}

	const options = [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([tag, count]) => ({ value: tag, label: tag, count }))

	return (
		<Stack gap={8}>
			<Heading id={headingId} level={2} className="sr-only">
				{heading}
			</Heading>

			{showFilter && posts.length >= 3 ? (
				<ListFilter
					targetId={LIST_ID}
					noun="post"
					searchParam="q"
					searchLabel="Search writing"
					searchPlaceholder="Title, summary, or tag"
					facets={[{ param: 'tag', legend: 'Tags', options }]}
				/>
			) : null}

			{posts.length === 0 ? (
				<Text tone="muted">No posts yet.</Text>
			) : (
				// A list of posts is a list — CLAUDE.md §7. The count comes free.
				// `gap-5`, not zero: the entries are cards now rather than rows
				// separated by rules, so the space between them is what does the
				// separating. See the note on `PostCard`.
				<ol id={LIST_ID} className="flex list-none flex-col gap-4 p-0">
					{posts.map((post) => (
						<li
							key={post.slug}
							data-filter-item=""
							data-filter-tokens={post.frontmatter.tags.join(' ')}
							data-filter-text={`${post.frontmatter.title} ${post.frontmatter.summary} ${post.frontmatter.tags.join(' ')}`}
						>
							<PostCard post={post} level={3} />
						</li>
					))}

					{/* X-03 — in the HTML from the start, hidden until it is needed. */}
					<li data-filter-empty="" hidden className="py-8">
						<Text tone="muted">
							Nothing matches those filters. Clear them to see all{' '}
							{posts.length}.
						</Text>
					</li>
				</ol>
			)}
		</Stack>
	)
}
