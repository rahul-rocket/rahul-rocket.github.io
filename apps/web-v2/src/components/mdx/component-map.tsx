import type { MDXComponents } from 'mdx/types'
import { Callout } from './callout'
import { CodeBlock, CodeGroup, CodeGroupItem } from './code-block'
import { Diagram } from './diagram'
import { Figure } from './figure'
import { Aside, Metric, Metrics, Step, Steps, TLDR } from './prose-blocks'

/**
 * The MDX component map — docs/BLOG_SYSTEM.md §2, §6.
 *
 * IT LIVES IN `components/`, NOT IN `lib/`. It was in `lib/mdx/` while it held
 * only the two pipeline overrides and imported nothing; B-06's component set
 * made it a consumer of `components/mdx/*`, and `lib/` is the bottom layer —
 * it may import `config/` and itself and nothing above (ARCHITECTURE §5).
 * Biome caught the move the moment the first import crossed the boundary,
 * which is the rule working rather than the rule being inconvenient.
 * `lib/mdx/plugins.mjs` stays where it is: it is build configuration and
 * imports nothing.
 *
 * Consumed by the root `mdx-components.tsx`, which Next calls during the server
 * render. No React context and no `@mdx-js/react` reach the client bundle — see
 * the note in that file.
 *
 * B-06 CLOSED THIS. The set below is the one BLOG_SYSTEM §6 calls "a closed set
 * — anything else is a component PR", and it is closed in the literal sense:
 * an MDX file may use these names and no others, because nothing else is in
 * scope during the compile. That is the enforcement mechanism, and it is why
 * the list is here rather than imported per file.
 *
 * `CodeGroup` diverges from the specification — it is an exclusive accordion
 * rather than a tab list, for reasons written out in `code-block.tsx`.
 *
 * Everything here is a Server Component except the code-block copy button, so
 * the whole component set costs the reader a few hundred bytes rather than a
 * component library.
 */
export const mdxComponents: MDXComponents = {
	Callout,
	Figure,
	Diagram,
	Aside,
	Steps,
	Step,
	Metric,
	Metrics,
	TLDR,
	CodeGroup,
	CodeGroupItem,

	/**
	 * B-04 — every fenced block becomes a labelled, focusable, copyable region.
	 * See `code-block.tsx` for the three keyboard failures a bare `<pre>` has.
	 */
	pre: CodeBlock,

	/**
	 * External links get `rel="noopener noreferrer"` and an accessible
	 * "opens in a new tab" affordance; internal links do not become new tabs at
	 * all. Opening a new tab silently is a WCAG 3.2.5 change-on-request problem
	 * and, more prosaically, it breaks the back button for the reader.
	 */
	a: ({ href, children, ...props }) => {
		const isExternal = typeof href === 'string' && /^https?:\/\//.test(href)
		if (!isExternal) {
			return (
				<a href={href} {...props}>
					{children}
				</a>
			)
		}
		return (
			<a href={href} rel="noopener noreferrer" target="_blank" {...props}>
				{children}
				<span className="sr-only"> (opens in a new tab)</span>
			</a>
		)
	},

	/**
	 * Every image gets explicit dimensions or the layout shifts, and CLS is a
	 * correctness bug here with a 0.02 budget (CLAUDE.md §7). Markdown syntax
	 * cannot express dimensions, so a bare `![]()` is a build-time error rather
	 * than a silent CLS regression. B-06's `<Figure>` is the supported path.
	 */
	img: ({ src, alt }) => {
		throw new Error(
			`Bare Markdown images are not supported (src: ${String(src)}, alt: ${String(alt)}). ` +
				'Use <Figure> so width, height, and a caption are explicit — ' +
				'an image without dimensions shifts the layout. docs/BLOG_SYSTEM.md §2.',
		)
	},
}
