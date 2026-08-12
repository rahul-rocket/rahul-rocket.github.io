import type { MDXComponents } from 'mdx/types'
import { mdxComponents } from '@/components/mdx/component-map'

/**
 * Next's MDX component map. This file must be at the project root with this
 * exact name — `@next/mdx` aliases `next-mdx-import-source-file` to it, and the
 * build fails to resolve without it.
 *
 * It is a re-export, not the definitions themselves: the map belongs beside the
 * components it maps to, in `src/components/mdx/`, and root-level files should
 * be configuration rather than implementation (docs/PROJECT_STRUCTURE.md §1).
 * It moved there from `src/lib/mdx/` when B-06 gave it real imports — `lib/` is
 * the bottom layer and may not import `components/` (ARCHITECTURE §5).
 *
 * IMPORTANT — this is not React context. Next calls `useMDXComponents` directly
 * during the server render to build the map, so no provider, no `createContext`,
 * and **zero client bytes**. Installing `@mdx-js/react` changes that: the alias
 * then resolves to its context provider instead of this file, and the build
 * fails with `createContext is not a function` inside a Server Component. That
 * package is deliberately not a dependency here.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
	return { ...components, ...mdxComponents }
}
