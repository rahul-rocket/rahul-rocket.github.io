import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { cache } from 'react'
import readingTime from 'reading-time'
import { extractHeadings } from './headings'
import { type Post, postFrontmatterSchema, type Tag } from './schemas'

/**
 * F1-04, F1-05 — blog content loaders.
 * docs/ARCHITECTURE.md §8, docs/BLOG_SYSTEM.md §2.
 *
 * Build-time only. These use `node:fs` directly, which is what makes them
 * unusable from a Client Component — deliberately. If a component needs a post
 * it receives it as props from a Server Component; there is no client fetching
 * and no reason for any.
 *
 * Wrapped in React `cache()` so the filesystem is touched once per file per
 * render pass rather than once per component that asks. With ~30 posts and four
 * consumers (index, post page, sitemap, feeds) that is the difference between
 * 30 and 120 file reads per build — not a crisis, but the cache is free and the
 * alternative is a habit that stops being free at 300 posts.
 */

const POSTS_DIR = join(process.cwd(), 'content', 'blog')

/**
 * Drafts and future-dated posts are visible in dev and absent from production.
 *
 * Keyed off NODE_ENV rather than a custom flag because it is the one value that
 * is already correct in every context: `next dev` sets it to development,
 * `next build` to production, and the nightly cron rebuild (DEPLOYMENT §6) is a
 * production build — which is exactly the mechanism that lets a future-dated
 * post publish itself without a push.
 */
const isProduction = process.env.NODE_ENV === 'production'

function readSlugs(): string[] {
	try {
		return readdirSync(POSTS_DIR)
			.filter((file) => file.endsWith('.mdx'))
			.map((file) => file.replace(/\.mdx$/, ''))
	} catch {
		// No content directory yet is a legitimate state during Phase 3, not an
		// error. A *malformed* post is an error; an absent corpus is not.
		return []
	}
}

/**
 * Read and validate one post. Throws on invalid frontmatter, which fails the
 * build — the entire point of the schema layer.
 */
export const getPost = cache((slug: string): Post => {
	const raw = readFileSync(join(POSTS_DIR, `${slug}.mdx`), 'utf8')
	const { data, content } = matter(raw)

	const parsed = postFrontmatterSchema.safeParse(data)
	if (!parsed.success) {
		// The default ZodError message does not say which file it came from, and
		// at build time that is the only thing the author needs to know.
		const issues = parsed.error.issues
			.map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
			.join('\n')
		throw new Error(
			`Invalid frontmatter in content/blog/${slug}.mdx\n${issues}`,
		)
	}

	return {
		slug,
		frontmatter: parsed.data,
		readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
		href: `/blog/${slug}/`,
		headings: extractHeadings(content),
	}
})

/** Every post that should be visible in this environment, newest first. */
export const getPosts = cache((): Post[] => {
	const now = Date.now()

	return readSlugs()
		.map((slug) => getPost(slug))
		.filter((post) => {
			if (!isProduction) return true
			if (post.frontmatter.draft) return false
			return post.frontmatter.publishedAt.getTime() <= now
		})
		.sort(
			(a, b) =>
				b.frontmatter.publishedAt.getTime() -
				a.frontmatter.publishedAt.getTime(),
		)
})

/**
 * Every post on disk, regardless of draft or date.
 *
 * Used only by `content:validate`, which must check content that production
 * hides — a draft with a broken schema is still broken, and finding out on the
 * day it is published is finding out too late.
 */
export const getAllPostsUnfiltered = cache((): Post[] =>
	readSlugs().map((slug) => getPost(slug)),
)

/**
 * Params for `generateStaticParams`. Static export requires every dynamic route
 * to be enumerable at build time (docs/ARCHITECTURE.md §7); this is that
 * enumeration, and it is derived from the same filtered list the index renders,
 * so a hidden post cannot leave a reachable page behind.
 */
export function getPostParams(): { slug: string }[] {
	return getPosts().map((post) => ({ slug: post.slug }))
}

/** Whether a draft banner should be shown. True only outside production. */
export function shouldShowDraftBanner(post: Post): boolean {
	return !isProduction && post.frontmatter.draft
}

/**
 * B-03 — adjacent posts, by publication date.
 *
 * `getPosts()` is already newest-first, so index−1 is the newer post and
 * index+1 the older one. Naming them `newer`/`older` rather than
 * `previous`/`next` is deliberate: on a reverse-chronological list "next" is
 * genuinely ambiguous, and the ambiguity lands in the link text a reader hears.
 */
export function getAdjacentPosts(slug: string): {
	newer: Post | null
	older: Post | null
} {
	const all = getPosts()
	const index = all.findIndex((post) => post.slug === slug)
	if (index === -1) return { newer: null, older: null }

	return { newer: all[index - 1] ?? null, older: all[index + 1] ?? null }
}

/** B-05 — every tag with at least one visible post, alphabetically. */
export function getTagsInUse(): { tag: Tag; count: number }[] {
	const counts = new Map<Tag, number>()
	for (const post of getPosts()) {
		for (const tag of post.frontmatter.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => a.tag.localeCompare(b.tag))
}

/**
 * B-05 — posts carrying a tag.
 *
 * `generateStaticParams` for `/blog/tags/[tag]` enumerates `getTagsInUse()`
 * rather than the whole `TAGS` vocabulary, so a tag nobody has used yet does
 * not produce an archive page with nothing on it — an empty archive is a route
 * that exists to disappoint.
 */
export function getPostsByTag(tag: string): Post[] {
	return getPosts().filter((post) =>
		(post.frontmatter.tags as readonly string[]).includes(tag),
	)
}
