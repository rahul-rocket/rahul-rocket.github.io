import createMDX from '@next/mdx'
import { rehypePlugins, remarkPlugins } from './src/lib/mdx/plugins.mjs'

/**
 * Next.js configuration — docs/ARCHITECTURE.md §7, docs/GITHUB_PAGES.md
 *
 * Every option here exists because there is no server. Changing any of them
 * changes what GitHub Pages is able to serve, so each carries its reason.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	// No server. Emits a fully static tree into out/.
	output: 'export',

	// GitHub Pages serves a directory as `dir/index.html` and has no server-side
	// redirect to add the trailing slash. Without this, every internal link
	// resolves one level shallower than the asset paths in the HTML it loads,
	// which presents as a page that renders with no styling at all.
	trailingSlash: true,

	// next/image's optimizer is a runtime service. It does not exist here, so
	// images must be pre-sized at authoring time.
	images: { unoptimized: true },

	// The site is served from the apex of a user Pages site
	// (rahul-rocket.github.io), so basePath is empty. A project Pages site would
	// need '/repo-name' here AND in every absolute URL the metadata builders
	// emit — see docs/GITHUB_PAGES.md before changing this.
	basePath: '',

	// A type or lint error must fail the build, not be silently shipped. These
	// default to false; they are stated explicitly so a future `ignoreDuringBuilds`
	// is a visible diff rather than an omission.
	typescript: { ignoreBuildErrors: false },
	eslint: { ignoreDuringBuilds: false },

	reactStrictMode: true,

	// Routes are TypeScript (and, from F1-01, MDX) only.
	//
	// This originally existed to stop Next's default extension list treating the
	// legacy CRA components in src/Pages/*.js as Pages Router routes — /Home and
	// /About appeared in the first build here. Those files are gone, but the
	// option stays: it is what guarantees a stray .js file can never silently
	// become a published route, and it is required by the MDX routing in F1-01.
	pageExtensions: ['ts', 'tsx', 'mdx'],

	// Only useful in dev; stripped from the export. Keeps the served HTML free of
	// build fingerprints.
	poweredByHeader: false,
}

/**
 * F1-01 — MDX. The plugin list lives in src/lib/mdx/plugins.mjs so it is not
 * trapped inside this config; see the comments there for why each is present
 * and why two of the orderings are load-bearing.
 *
 * The component map comes from `mdx-components.tsx` at the project root, which
 * @next/mdx aliases as `next-mdx-import-source-file`. Next calls its
 * `useMDXComponents` during the server render, so the map costs **zero client
 * bytes** — no provider, no context.
 *
 * `@mdx-js/react` is deliberately NOT installed. If it is present the alias
 * resolves to its context provider instead of the root file, and the build fails
 * with `createContext is not a function` inside a Server Component. It was
 * installed here once and removed for exactly that reason.
 */
const withMDX = createMDX({
	options: { remarkPlugins, rehypePlugins },
})

export default withMDX(nextConfig)
