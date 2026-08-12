#!/usr/bin/env node
/*
 * H-09 / P-11 / B-08 / Q-02 — Open Graph card generation.
 * docs/SEO.md, docs/TASK_BACKLOG.md.
 *
 * ONE CARD PER PAGE, GENERATED FROM THE PAGE'S OWN METADATA, AT BUILD TIME.
 * The alternative every site reaches for first is a single static image, and it
 * is worse in a specific way: a link to a case study and a link to the contact
 * page then look identical in a Slack channel, so the preview stops carrying
 * information at exactly the moment it is doing the most work.
 *
 * SATORI + RESVG, WHICH IS WHAT THE TASK NAMED. Satori lays out a subset of
 * flexbox and renders SVG; resvg rasterises it to PNG. Both are
 * devDependencies — they run during the build and contribute ZERO bytes to any
 * route, which is the only reason a dependency of this weight is acceptable
 * here. docs/TECH_STACK.md §2 carries the entry and the cost.
 *
 * THE FONT IS INTER, COMMITTED VIA `@fontsource/inter` RATHER THAN FETCHED.
 * Satori needs real font data — it rasterises glyphs, so there is no system
 * fallback to lean on. A build step that downloads a typeface fails whenever
 * the network does and produces a different card when the font is updated
 * upstream; a package pinned in the lockfile does neither. Note that this does
 * NOT resolve DS-04: the site's own display face is still an open licensing
 * decision, and Inter here is a build-time asset for one 1200×630 image rather
 * than a typeface choice for the site.
 *
 * IT RUNS AFTER `next build` AND READS THE EXPORT, like the feed generator and
 * for the same reason: the built HTML already contains the validated title and
 * description, so the card cannot disagree with the page it represents. Pages
 * are discovered by walking `out/`, so a new route gets a card without an edit.
 *
 * Usage:  node scripts/generate-og.mjs
 * Exit:   0 cards written · 1 a page had no usable title
 */

import {
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const OG_DIR = join(OUT, 'og')

const SITE_NAME = 'Rahul Rocket'
const SITE_ROLE = 'Full Stack Software Engineer & Software Architect'

/*
 * The card's palette, resolved from the dark theme's tokens.
 *
 * DELIBERATELY LITERAL VALUES, WITH THE TOKEN NAMED BESIDE EACH. Satori has no
 * CSS engine and cannot resolve a `var()`, and OKLCH is outside what it parses,
 * so the token layer cannot reach this file. Writing the hex with its token
 * name is the honest form of that limit: a token change that should reach the
 * card is a visible one-line edit here rather than a silent divergence.
 */
const COLOR = {
	bg: '#0e1013', // --ui-bg
	surface: '#16191d', // --ui-surface
	text: '#f2f4f6', // --ui-text
	muted: '#9ba3ad', // --ui-text-muted
	accent: '#5fd4d8', // --ui-accent
	border: '#2a2f36', // --ui-border
}

function loadFont(weight) {
	const file = join(
		ROOT,
		'node_modules',
		'@fontsource',
		'inter',
		'files',
		`inter-latin-${weight}-normal.woff`,
	)
	return readFileSync(file)
}

const fonts = [
	{ name: 'Inter', data: loadFont(400), weight: 400, style: 'normal' },
	{ name: 'Inter', data: loadFont(600), weight: 600, style: 'normal' },
]

/** Every exported page, as a route path. */
function walkPages(dir, base = '') {
	const found = []
	for (const entry of readdirSync(dir)) {
		if (entry === '_next' || entry === 'og') continue
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) {
			found.push(...walkPages(full, `${base}/${entry}`))
		} else if (entry === 'index.html') {
			found.push({ route: `${base}/`, file: full })
		}
	}
	return found
}

function decodeEntities(value) {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;|&#39;|&apos;/g, "'")
		.replace(/&nbsp;/g, ' ')
}

function meta(html, property) {
	const pattern = new RegExp(
		`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`,
		'i',
	)
	const match = pattern.exec(html)
	return match?.[1] ? decodeEntities(match[1]) : null
}

/**
 * The card, as a Satori element tree.
 *
 * Written as `React.createElement`-shaped plain objects rather than JSX because
 * this file is `.mjs` — the gate scripts are deliberately transpiler-free, and
 * a build step that needs a compiler is a build step the compiler can break.
 */
function card({ eyebrow, title, description }) {
	/*
	 * Every element gets `display: flex` by default.
	 *
	 * Satori implements a subset of CSS in which `display` has no `block`: it
	 * throws on any element with more than one child that does not declare
	 * `flex` or `none`. Defaulting it here rather than repeating it on nine
	 * elements is both shorter and the version that cannot be forgotten on the
	 * tenth — which is exactly how this failed the first time it ran.
	 */
	const node = (type, props, ...children) => ({
		type,
		props: {
			...props,
			style: { display: 'flex', ...props?.style },
			children: children.length === 1 ? children[0] : children,
		},
	})

	return node(
		'div',
		{
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				backgroundColor: COLOR.bg,
				padding: '72px',
				fontFamily: 'Inter',
			},
		},
		// The accent rule, top-left. The site's own eyebrow treatment, which is
		// what makes a card recognisable as this site's at thumbnail size.
		node(
			'div',
			{ style: { display: 'flex', flexDirection: 'column', gap: '28px' } },
			node(
				'div',
				{ style: { display: 'flex', alignItems: 'center', gap: '16px' } },
				node('div', {
					style: {
						width: '48px',
						height: '2px',
						backgroundColor: COLOR.accent,
					},
				}),
				node(
					'div',
					{
						style: {
							fontSize: '22px',
							letterSpacing: '0.12em',
							textTransform: 'uppercase',
							color: COLOR.accent,
						},
					},
					eyebrow,
				),
			),
			node(
				'div',
				{
					style: {
						fontSize: title.length > 48 ? '62px' : '76px',
						fontWeight: 600,
						lineHeight: 1.1,
						letterSpacing: '-0.03em',
						color: COLOR.text,
						// Satori has no `text-wrap: balance`; the width cap is what keeps
						// a long title from running edge to edge.
						maxWidth: '960px',
					},
				},
				title,
			),
			description
				? node(
						'div',
						{
							style: {
								fontSize: '28px',
								lineHeight: 1.4,
								color: COLOR.muted,
								maxWidth: '900px',
							},
						},
						description,
					)
				: node('div', { style: { display: 'flex' } }, ''),
		),
		node(
			'div',
			{
				style: {
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					borderTop: `1px solid ${COLOR.border}`,
					paddingTop: '28px',
				},
			},
			node(
				'div',
				{ style: { fontSize: '26px', fontWeight: 600, color: COLOR.text } },
				SITE_NAME,
			),
			node(
				'div',
				{ style: { fontSize: '22px', color: COLOR.muted } },
				SITE_ROLE,
			),
		),
	)
}

/** `/blog/foo/` → `blog-foo`; `/` → `default`. */
function slugForRoute(route) {
	const trimmed = route.replace(/^\/|\/$/g, '')
	return trimmed === '' ? 'default' : trimmed.replace(/\//g, '-')
}

/** Truncate on a word boundary — a card cut mid-word reads as a bug. */
function clamp(value, limit) {
	if (value.length <= limit) return value
	const cut = value.slice(0, limit)
	const lastSpace = cut.lastIndexOf(' ')
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}…`
}

async function main() {
	let pages
	try {
		pages = walkPages(OUT)
	} catch {
		console.error(
			'generate-og: out/ not found. Run `next build` first — the cards are ' +
				'generated from the export so they cannot disagree with the pages.',
		)
		process.exit(1)
	}

	mkdirSync(OG_DIR, { recursive: true })

	let written = 0

	for (const page of pages) {
		const html = readFileSync(page.file, 'utf8')

		const rawTitle =
			meta(html, 'og:title') ??
			/<title>([^<]*)<\/title>/i.exec(html)?.[1] ??
			null
		if (!rawTitle) {
			throw new Error(
				`generate-og: no title found for ${page.route}. Every page must set ` +
					'one — pageMetadata() in src/lib/seo/metadata.ts is the path.',
			)
		}

		const title = decodeEntities(rawTitle)
			// The layout's `%s — Rahul Rocket` template is noise on a card that
			// already carries the name in its footer.
			.replace(new RegExp(`\\s*[—-]\\s*${SITE_NAME}$`), '')
		const description = meta(html, 'og:description') ?? ''

		/*
		 * Home's card is the name over the role; every other card is the route
		 * over the page's own title. The route is rendered as a breadcrumb rather
		 * than as a raw path — `blog · tags · architecture` — because the card is
		 * read at thumbnail size in a chat client, where slashes are noise and the
		 * hierarchy is the useful part.
		 */
		const isHome = page.route === '/'
		const eyebrow = isHome
			? SITE_ROLE
			: page.route
					.replace(/^\/|\/$/g, '')
					.split('/')
					.join(' · ')

		const svg = await satori(
			card({
				eyebrow: clamp(eyebrow, 60),
				// Home's `<title>` is "Name — Role", and the role is already the
				// eyebrow and the footer on that card. Three copies of one string is
				// not a design.
				title: clamp(isHome ? SITE_NAME : title, 90),
				description: clamp(description, 140),
			}),
			{ width: 1200, height: 630, fonts },
		)

		const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
			.render()
			.asPng()

		writeFileSync(join(OG_DIR, `${slugForRoute(page.route)}.png`), png)
		written += 1
	}

	console.log(
		`generate-og: wrote ${written} card${written === 1 ? '' : 's'} to out/og/ ` +
			'(1200×630 PNG, one per exported page).',
	)
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
