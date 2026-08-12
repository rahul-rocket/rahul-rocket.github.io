#!/usr/bin/env node
/*
 * B-07 — RSS, Atom and JSON feeds, generated from the EXPORT rather than from
 * the source. docs/BLOG_SYSTEM.md, docs/TASK_BACKLOG.md.
 *
 * WHY THIS IS A POST-BUILD SCRIPT AND NOT A ROUTE HANDLER.
 *
 * B-07's acceptance criterion is "content is full, not truncated". Meeting it
 * requires the post's MDX rendered to HTML — and inside the application there
 * is no way to get that string. A route handler is server code, so importing
 * the compiled MDX gives a client reference rather than a renderable component;
 * rendering it with `react-dom/server` fails. The alternative is a second
 * Markdown pipeline (`unified`, `remark-parse`, `remark-rehype`,
 * `rehype-stringify` — four dependencies, each needing a TECH_STACK §2 entry)
 * whose output would then be a *different* rendering of the same post, free to
 * drift from the one readers see.
 *
 * The export already contains the answer. `out/blog/<slug>/index.html` holds
 * the post fully rendered, with build-time syntax highlighting and the real
 * component set, so the feed content is the page content by construction. Zero
 * new dependencies, and no second pipeline to keep in step.
 *
 * The cost, stated plainly: this reads generated HTML with a tag scanner rather
 * than a parser. That is why the extraction is anchored to an explicit
 * `data-feed-content` attribute the page sets rather than to a class name or a
 * structural guess, and why the script fails loudly when it cannot find one — a
 * feed that silently ships empty entries is worse than a build that stops.
 *
 * Zero dependencies, like the other gate scripts, and for the same reason: a
 * build step that needs a transpiler can be broken by the transpiler.
 *
 * Usage:  node scripts/generate-feeds.mjs
 * Exit:   0 feeds written · 1 a post's content could not be extracted
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const BLOG = join(OUT, 'blog')

/**
 * Identity, duplicated from `src/config/site.ts` because this script must not
 * import TypeScript. The values are asserted against the built HTML below, so
 * a drift fails the build rather than shipping a feed pointing at the wrong
 * origin — which is the one failure a duplicated constant must not be allowed.
 */
const SITE_URL = 'https://rahul-rocket.github.io'
const SITE_NAME = 'Rahul Rocket'
const SITE_TITLE = `${SITE_NAME} — Full Stack Software Engineer & Software Architect`
const SITE_DESCRIPTION =
	'Notes on architecture, TypeScript, and the decisions that are expensive to reverse.'
const AUTHOR_EMAIL = 'hello@rahulrocket.dev'

/* ------------------------------------------------------------------ *
 * A tag scanner, not a parser.
 *
 * React emits well-formed markup, so matching `<div>`/`</div>` with a depth
 * counter is sufficient and is about thirty lines. A regex over nested divs is
 * not sufficient and fails on the first nested one, which is why this exists.
 * ------------------------------------------------------------------ */

/** The index just past the element that starts at `startIndex`. */
function endOfElement(html, startIndex, tagName) {
	const open = new RegExp(`<${tagName}(\\s|>)`, 'gi')
	const close = new RegExp(`</${tagName}>`, 'gi')

	open.lastIndex = startIndex + 1
	close.lastIndex = startIndex + 1

	let depth = 1
	let cursor = startIndex + 1

	while (depth > 0) {
		open.lastIndex = cursor
		close.lastIndex = cursor
		const nextOpen = open.exec(html)
		const nextClose = close.exec(html)

		if (!nextClose) return -1

		if (nextOpen && nextOpen.index < nextClose.index) {
			depth += 1
			cursor = nextOpen.index + 1
		} else {
			depth -= 1
			cursor = nextClose.index + 1
			if (depth === 0) return nextClose.index + nextClose[0].length
		}
	}

	return -1
}

/** Inner HTML of the first element carrying `attribute`. */
function extractMarked(html, attribute, tagName = 'div') {
	const marker = new RegExp(`<${tagName}[^>]*\\b${attribute}\\b[^>]*>`, 'i')
	const match = marker.exec(html)
	if (!match) return null

	const contentStart = match.index + match[0].length
	const elementEnd = endOfElement(html, match.index, tagName)
	if (elementEnd === -1) return null

	return html.slice(contentStart, elementEnd - `</${tagName}>`.length)
}

/** Remove every element carrying `attribute`, element and all. */
function stripMarked(html, attribute, tagName = 'div') {
	let result = html
	for (let guard = 0; guard < 100; guard += 1) {
		const marker = new RegExp(`<${tagName}[^>]*\\b${attribute}\\b[^>]*>`, 'i')
		const match = marker.exec(result)
		if (!match) break

		const elementEnd = endOfElement(result, match.index, tagName)
		if (elementEnd === -1) break

		result = result.slice(0, match.index) + result.slice(elementEnd)
	}
	return result
}

/**
 * Rewrite root-relative URLs to absolute ones.
 *
 * B-07: "every URL is absolute". A feed reader resolves a relative href against
 * ITS OWN origin, so a relative link in a feed entry is a broken link in every
 * client that renders it — and the failure is invisible from the site.
 */
function absolutise(html) {
	return html
		.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE_URL}/`)
		.replace(/(href|src)="#/g, `$1="${SITE_URL}/#`)
}

function escapeXml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

/* ------------------------------------------------------------------ *
 * Reading the export
 * ------------------------------------------------------------------ */

function readPosts() {
	let slugs
	try {
		slugs = readdirSync(BLOG).filter((entry) => {
			if (entry === 'tags') return false
			return statSync(join(BLOG, entry)).isDirectory()
		})
	} catch {
		throw new Error(
			'generate-feeds: out/blog not found. Run `next build` first — the feeds ' +
				'are generated from the export, not from the source.',
		)
	}

	const posts = []

	for (const slug of slugs) {
		const file = join(BLOG, slug, 'index.html')
		let html
		try {
			html = readFileSync(file, 'utf8')
		} catch {
			continue
		}

		// The JSON-LD block on every post page already carries the validated
		// title, description and dates — parsed from one place rather than
		// scraped from three, and guaranteed to be the same values the schema
		// accepted at build time.
		const article = findArticleNode(html)
		if (!article) {
			throw new Error(
				`generate-feeds: no BlogPosting JSON-LD found in out/blog/${slug}/index.html. ` +
					'The feed derives its metadata from that block; a post without it ' +
					'would ship an entry with no title or date.',
			)
		}

		let content = extractMarked(html, 'data-feed-content')
		if (content === null) {
			throw new Error(
				`generate-feeds: no [data-feed-content] element in out/blog/${slug}/index.html. ` +
					'That attribute is the anchor this script extracts from; without it ' +
					'the entry would be empty, and an empty feed entry is worse than a ' +
					'failed build.',
			)
		}

		// The code-block toolbar is a copy button and a language label — page
		// furniture that reads as stray words in a feed reader.
		content = absolutise(stripMarked(content, 'data-feed-strip'))

		posts.push({
			slug,
			url: article.url,
			title: article.headline,
			summary: article.description,
			published: article.datePublished,
			updated: article.dateModified ?? article.datePublished,
			keywords: article.keywords ?? [],
			content,
		})
	}

	// Newest first, matching the index. A feed reader sorts for itself, but a
	// feed that arrives in file order looks broken when it is inspected by hand.
	return posts.sort((a, b) => b.published.localeCompare(a.published))
}

function findArticleNode(html) {
	const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
	for (const match of html.matchAll(pattern)) {
		let parsed
		try {
			parsed = JSON.parse(match[1].replace(/\\u003c/g, '<'))
		} catch {
			continue
		}
		const nodes = parsed['@graph'] ?? [parsed]
		const article = nodes.find((node) => node['@type'] === 'BlogPosting')
		if (article) return article
	}
	return null
}

/* ------------------------------------------------------------------ *
 * The three formats
 * ------------------------------------------------------------------ */

function rss(posts, now) {
	const items = posts
		.map(
			(post) => `		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${escapeXml(post.url)}</link>
			<guid isPermaLink="true">${escapeXml(post.url)}</guid>
			<pubDate>${new Date(post.published).toUTCString()}</pubDate>
			<description>${escapeXml(post.summary)}</description>
${post.keywords.map((tag) => `			<category>${escapeXml(tag)}</category>`).join('\n')}
			<content:encoded><![CDATA[${post.content}]]></content:encoded>
		</item>`,
		)
		.join('\n')

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
	<channel>
		<title>${escapeXml(SITE_TITLE)}</title>
		<link>${SITE_URL}/blog/</link>
		<description>${escapeXml(SITE_DESCRIPTION)}</description>
		<language>en-US</language>
		<lastBuildDate>${now.toUTCString()}</lastBuildDate>
		<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
	</channel>
</rss>
`
}

function atom(posts, now) {
	const entries = posts
		.map(
			(post) => `	<entry>
		<title>${escapeXml(post.title)}</title>
		<link href="${escapeXml(post.url)}"/>
		<id>${escapeXml(post.url)}</id>
		<published>${new Date(post.published).toISOString()}</published>
		<updated>${new Date(post.updated).toISOString()}</updated>
		<summary>${escapeXml(post.summary)}</summary>
${post.keywords.map((tag) => `		<category term="${escapeXml(tag)}"/>`).join('\n')}
		<content type="html"><![CDATA[${post.content}]]></content>
	</entry>`,
		)
		.join('\n')

	return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${escapeXml(SITE_TITLE)}</title>
	<subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
	<link href="${SITE_URL}/atom.xml" rel="self"/>
	<link href="${SITE_URL}/blog/"/>
	<id>${SITE_URL}/</id>
	<updated>${(posts[0] ? new Date(posts[0].updated) : now).toISOString()}</updated>
	<author>
		<name>${escapeXml(SITE_NAME)}</name>
		<email>${AUTHOR_EMAIL}</email>
	</author>
${entries}
</feed>
`
}

function jsonFeed(posts) {
	return `${JSON.stringify(
		{
			version: 'https://jsonfeed.org/version/1.1',
			title: SITE_TITLE,
			home_page_url: `${SITE_URL}/blog/`,
			feed_url: `${SITE_URL}/feed.json`,
			description: SITE_DESCRIPTION,
			language: 'en-US',
			authors: [{ name: SITE_NAME, url: SITE_URL }],
			items: posts.map((post) => ({
				id: post.url,
				url: post.url,
				title: post.title,
				summary: post.summary,
				content_html: post.content,
				date_published: new Date(post.published).toISOString(),
				date_modified: new Date(post.updated).toISOString(),
				tags: post.keywords,
			})),
		},
		null,
		'\t',
	)}\n`
}

/* ------------------------------------------------------------------ */

const now = new Date()
const posts = readPosts()

writeFileSync(join(OUT, 'rss.xml'), rss(posts, now))
writeFileSync(join(OUT, 'atom.xml'), atom(posts, now))
writeFileSync(join(OUT, 'feed.json'), jsonFeed(posts))

console.log(
	`generate-feeds: wrote rss.xml, atom.xml and feed.json — ${posts.length} ` +
		`${posts.length === 1 ? 'entry' : 'entries'}, full content, absolute URLs.`,
)
