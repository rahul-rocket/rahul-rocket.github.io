/**
 * F1-01, F1-02 — the remark/rehype set. docs/BLOG_SYSTEM.md §2.
 *
 * `.mjs`, not `.ts`, because `next.config.mjs` imports it and Next's config is
 * loaded before any TypeScript pipeline exists. Keeping it here rather than
 * inline in the config is what lets the same plugin list be used by
 * `content:validate` and by any future standalone compile without being copied.
 *
 * Every entry earns its place; the ordering matters where noted.
 */

import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

/**
 * Shiki, at build time. This is the single most important performance decision
 * in the content pipeline: the highlighter runs during `next build` and emits
 * plain styled markup, so a post page ships **0 KB** of syntax highlighter
 * (BLOG_SYSTEM §11). Prism and highlight.js were rejected for exactly this.
 *
 * Two themes, selected by CSS rather than by JavaScript. rehype-pretty-code
 * emits both as `--shiki-light` / `--shiki-dark` custom properties on each
 * token, and `typography.css` picks one per `[data-theme]`. A JS-switched
 * highlighter would have to re-render every code block on a theme toggle.
 */
const prettyCodeOptions = {
	theme: { light: 'github-light', dark: 'github-dark-dimmed' },
	keepBackground: false, // the surface colour is a design token, not Shiki's
	defaultLang: 'plaintext',
	onVisitLine(node) {
		// An empty line collapses to zero height and breaks line numbering and
		// line-highlight ranges. A single empty text child keeps it selectable.
		if (node.children.length === 0) {
			node.children = [{ type: 'text', value: ' ' }]
		}
	},
}

/**
 * `behavior: 'append'` with visually-hidden text, not `'wrap'`.
 *
 * `'wrap'` turns the entire heading into a link, so a screen reader announces
 * every heading as "link", and the heading text stops being selectable by
 * click-drag. Appending a labelled anchor keeps the heading a heading and gives
 * the link an accessible name that is not "#".
 */
const autolinkOptions = {
	behavior: 'append',
	properties: {
		className: ['heading-anchor'],
		'aria-label': 'Permalink to this section',
		// Declares "this element is hidden by CSS until hover or focus, and that
		// is the finished state" to the no-JS spec. Without it the spec flags the
		// anchor as content stranded at opacity 0 — which it is not: no JavaScript
		// is involved in revealing it, and it is reachable and visible by keyboard.
		// An explicit, greppable opt-out beats teaching the spec a heuristic about
		// which invisible elements are acceptable.
		'data-hover-reveal': 'true',
	},
	content: {
		type: 'element',
		tagName: 'span',
		properties: { 'aria-hidden': 'true' },
		children: [{ type: 'text', value: '#' }],
	},
}

export const remarkPlugins = [
	// Must come first: it turns the `---` block into a node the compiler ignores,
	// so the frontmatter never renders as a table or a horizontal rule. gray-matter
	// reads the same block separately for the *metadata*; this one only hides it.
	remarkFrontmatter,
	remarkGfm,
]

export const rehypePlugins = [
	// rehypeSlug before rehypeAutolinkHeadings — the latter links to ids the
	// former creates. Reversed, every anchor points at nothing.
	rehypeSlug,
	[rehypeAutolinkHeadings, autolinkOptions],
	[rehypePrettyCode, prettyCodeOptions],
]
