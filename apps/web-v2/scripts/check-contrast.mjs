#!/usr/bin/env node
/*
 * DS-09 — token contrast verification.
 * docs/ACCESSIBILITY.md §6, docs/DESIGN_SYSTEM.md §3
 *
 * Parses the token, theme and surface stylesheets, resolves var() indirection
 * per context, converts OKLCH to sRGB, and asserts every declared pair against
 * its required WCAG ratio.
 *
 * Why a custom script rather than axe: axe checks *rendered* pages, so it can
 * only find a contrast bug once a page exists that uses the pair. This checks
 * the token layer directly, which means a bad palette fails in Phase 2 instead
 * of surfacing in Phase 7 on one unlucky component.
 *
 * M1 added ALPHA COMPOSITING, and it is the reason this script now earns its
 * keep twice over. The surface layer (surfaces.css) puts translucent aurora,
 * glass and grain behind text. Every flat pair below stays correct in isolation
 * while the thing *behind* the text changes — so a check that only reads
 * themes.css keeps reporting green while the hero headline sits on an
 * unverified gradient. Glassmorphism, aurora and grain are the three most
 * common ways a beautiful portfolio quietly fails WCAG, and all three fail
 * invisibly: they look fine to a designer on a good display in a dark room.
 *
 * A context may therefore declare a `backdrop`, which flattens its translucent
 * layers onto a base and substitutes the result for the bound tokens — so every
 * assertion re-runs against the real composited surface with no new entries in
 * PAIRS. On its first run this caught two genuine failures in the light theme
 * (accent 4.13:1, warning 4.09:1, against a 4.5 floor).
 *
 * Zero dependencies — it runs before any package is installed.
 *
 * Usage:  node scripts/check-contrast.mjs [--verbose]
 * Exit:   0 all pairs pass · 1 one or more failures
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const VERBOSE = process.argv.includes('--verbose')

/* ------------------------------------------------------------------ *
 * CSS parsing — deliberately minimal. It understands exactly what our
 * stylesheets contain: selector blocks of custom-property declarations.
 * ------------------------------------------------------------------ */

function stripComments(css) {
	return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** → Map<selector, Map<prop, rawValue>> */
function parseBlocks(css) {
	const blocks = new Map()
	const source = stripComments(css)
	// Skip at-rules with nested blocks (@media) — they hold no tokens we test.
	const withoutAtRules = source.replace(
		/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,
		'',
	)

	for (const match of withoutAtRules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const body = match[2]
		const parsed = new Map()
		for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
			parsed.set(decl[1], decl[2].trim())
		}
		if (!parsed.size) continue

		// A selector list shares one block. Register the declarations under each
		// selector separately, or an exact-match lookup silently misses and the
		// context resolves against the wrong theme — which is exactly the failure
		// this script exists to catch, so it must not have it itself.
		for (const raw of match[1].split(',')) {
			const selector = raw.trim().replace(/\s+/g, ' ')
			if (!selector) continue
			const decls = blocks.get(selector) ?? new Map()
			for (const [k, v] of parsed) decls.set(k, v)
			blocks.set(selector, decls)
		}
	}
	return blocks
}

/**
 * Merge selector blocks in cascade order for a given context.
 * Later entries win, which mirrors how these single-class selectors resolve
 * in the browser (all are specificity 0,1,0 or 0,2,0 and ordered in-file).
 */
function buildContext(blockSets, selectors) {
	const resolved = new Map()
	for (const selector of selectors) {
		for (const blocks of blockSets) {
			const decls = blocks.get(selector)
			if (decls) for (const [k, v] of decls) resolved.set(k, v)
		}
	}
	return resolved
}

/** Resolve var(--x) chains to a literal color function. */
function resolveValue(value, ctx, seen = new Set()) {
	let current = value.trim()
	let guard = 0
	while (current.startsWith('var(')) {
		if (guard++ > 20) throw new Error(`var() cycle resolving ${value}`)
		const name = current.slice(4, current.indexOf(')')).split(',')[0].trim()
		if (seen.has(name)) throw new Error(`var() cycle at ${name}`)
		seen.add(name)
		const next = ctx.get(name)
		if (next === undefined) throw new Error(`undefined token ${name}`)
		current = next.trim()
	}
	return current
}

/* ------------------------------------------------------------------ *
 * Color — OKLCH → OKLab → linear sRGB → relative luminance
 * ------------------------------------------------------------------ */

function parseOklch(value) {
	const m = value.match(
		/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/,
	)
	if (!m) throw new Error(`not an oklch() value: ${value}`)
	return {
		L: parseFloat(m[1]) / 100,
		C: parseFloat(m[2]),
		h: parseFloat(m[3]),
		// The surface layer is built from translucent tokens, so alpha is no
		// longer safe to discard: dropping it would measure the aurora as if it
		// were opaque and report a contrast ratio no reader ever sees.
		alpha: m[4] === undefined ? 1 : parseFloat(m[4]),
	}
}

/** OKLab → linear sRGB (Björn Ottosson's matrices). */
function oklchToLinearSrgb({ L, C, h }) {
	const hRad = (h * Math.PI) / 180
	const a = C * Math.cos(hRad)
	const b = C * Math.sin(hRad)

	const l_ = L + 0.3963377774 * a + 0.2158037573 * b
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b
	const s_ = L - 0.0894841775 * a - 1.291485548 * b

	const l = l_ ** 3
	const m = m_ ** 3
	const s = s_ ** 3

	return {
		r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	}
}

/**
 * WCAG relative luminance. Computed from linear-light sRGB, clamped to gamut.
 * Clamping is the honest choice: an out-of-gamut token is what the *browser*
 * will clip to anyway, so testing the unclipped value would pass ratios the
 * user never actually sees. Out-of-gamut tokens are reported separately.
 */
function luminance(lin) {
	const clamp = (x) => Math.min(1, Math.max(0, x))
	return 0.2126 * clamp(lin.r) + 0.7152 * clamp(lin.g) + 0.0722 * clamp(lin.b)
}

function isOutOfGamut(lin) {
	const eps = 0.001
	return [lin.r, lin.g, lin.b].some((c) => c < -eps || c > 1 + eps)
}

function contrastRatio(a, b) {
	const la = luminance(a)
	const lb = luminance(b)
	const [hi, lo] = la > lb ? [la, lb] : [lb, la]
	return (hi + 0.05) / (lo + 0.05)
}

/** Linear-light → gamma-encoded sRGB, clamped to gamut. */
function encodeChannel(c) {
	const x = Math.min(1, Math.max(0, c))
	return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** Gamma-encoded sRGB → linear-light. */
function decodeChannel(x) {
	return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

function toHex(lin) {
	const encode = (c) =>
		Math.round(encodeChannel(c) * 255)
			.toString(16)
			.padStart(2, '0')
	return `#${encode(lin.r)}${encode(lin.g)}${encode(lin.b)}`
}

/**
 * Source-over alpha compositing, performed in GAMMA-ENCODED sRGB.
 *
 * The space matters and it is easy to get wrong. Browsers composite a
 * translucent background layer over what is behind it in the device space —
 * gamma-encoded sRGB — not in linear light. Compositing linearly here would
 * produce a backdrop measurably darker than the one on screen and report
 * contrast ratios that are wrong in the *passing* direction, which is the worst
 * kind of wrong for a gate.
 *
 * Takes and returns linear-light, converting at the boundaries, so callers deal
 * only in the representation luminance() wants.
 */
function compositeOver(src, srcAlpha, dst) {
	const blend = (s, d) =>
		decodeChannel(
			encodeChannel(s) * srcAlpha + encodeChannel(d) * (1 - srcAlpha),
		)
	return {
		r: blend(src.r, dst.r),
		g: blend(src.g, dst.g),
		b: blend(src.b, dst.b),
	}
}

/* ------------------------------------------------------------------ *
 * The contract — every pair that must hold, and why.
 * Ratios from docs/ACCESSIBILITY.md §6.
 * ------------------------------------------------------------------ */

const PAIRS = [
	// Body text is AAA (7:1) — above the AA requirement, deliberately.
	['--ui-text', '--ui-bg', 7.0, 'body text on page background'],
	['--ui-text', '--ui-surface', 7.0, 'body text on card'],
	['--ui-text', '--ui-surface-raised', 7.0, 'body text on raised surface'],

	// Muted text still has a real floor. "Elegant low-contrast gray" is the
	// most common portfolio a11y failure and it is banned.
	['--ui-text-muted', '--ui-bg', 4.5, 'muted text on background'],
	['--ui-text-muted', '--ui-surface', 4.5, 'muted text on card'],

	// Meta-only. Never used for prose, so large-text AA is the correct bar.
	['--ui-text-subtle', '--ui-bg', 3.0, 'subtle meta text on background'],

	/*
	 * DS-12 — the hole that let a real axe failure through, now closed.
	 *
	 * `--ui-bg-subtle` had NO pair in this table. That is not a small omission:
	 * a role with no assertion is a role this script cannot fail on, so the
	 * footer shipped muted text on it, axe rejected the page in the light theme,
	 * and `pnpm check:contrast` stayed green throughout — reporting "all pass"
	 * about a palette that did not. Four routes carried the same failure at M7.
	 *
	 * The fix is these four rows, not a note in the backlog. The workaround
	 * documented in site-footer.tsx (avoid the role entirely, use the border for
	 * separation) was correct while the gate was blind and is no longer
	 * necessary — the role is now verified exactly as `--ui-bg` and
	 * `--ui-surface` are, which is what makes it safe to put text on.
	 */
	['--ui-text', '--ui-bg-subtle', 7.0, 'body text on subtle background'],
	['--ui-text-muted', '--ui-bg-subtle', 4.5, 'muted text on subtle background'],
	[
		'--ui-text-subtle',
		'--ui-bg-subtle',
		3.0,
		'subtle meta on subtle background',
	],
	['--ui-accent', '--ui-bg-subtle', 4.5, 'accent link on subtle background'],

	// Links and interactive emphasis.
	['--ui-accent', '--ui-bg', 4.5, 'accent link on background'],
	['--ui-accent', '--ui-surface', 4.5, 'accent link on card'],
	['--ui-accent-hover', '--ui-bg', 4.5, 'accent hover on background'],
	['--ui-on-accent', '--ui-accent', 4.5, 'text on accent fill'],

	// Non-text UI — WCAG 1.4.11.
	['--ui-border-strong', '--ui-bg', 3.0, 'emphasized border on background'],
	[
		'--ui-border-strong',
		'--ui-bg-subtle',
		3.0,
		'emphasized border on subtle background',
	],

	// Focus indicator — WCAG 2.4.11.
	//
	// The ring is drawn with `outline-offset: 2px`, so a 2px gap of the page or
	// card background always separates it from the element it outlines. Its
	// adjacent colors are therefore bg and surface — never the control's own
	// fill. That is why there is no focus-vs-accent assertion here: those two
	// colors are never in contact, and asserting the pair would force a ring
	// color chosen for a situation that cannot occur.
	//
	// This makes the offset load-bearing, not cosmetic. A component that sets
	// `outline-offset: 0` breaks the guarantee these two rows provide.
	['--ui-focus', '--ui-bg', 3.0, 'focus ring on background'],
	['--ui-focus', '--ui-surface', 3.0, 'focus ring on card'],

	/*
	 * Status colors carry meaning; they are always paired with text or an icon,
	 * but must still be perceivable.
	 *
	 * ALL THREE SURFACES, NOT JUST `--ui-bg`, AND THAT IS A GAP BEING CLOSED
	 * RATHER THAN A NEW REQUIREMENT. A status badge has always been able to
	 * appear on a card — `ProjectCard` renders "Draft — pending review" on
	 * `--ui-surface` today — and only the page-background pair was asserted. The
	 * badge's own defence was `bg-transparent`, which does not help: transparent
	 * means "whatever is behind it", and what is behind it is precisely the
	 * surface nobody was checking.
	 *
	 * With these six rows the badge can carry a real fill, because the fill is
	 * a colour the gate measures. The unit test in `variants.test.ts` asserts
	 * the same rule from the other side.
	 */
	['--ui-success', '--ui-bg', 4.5, 'success on background'],
	['--ui-warning', '--ui-bg', 4.5, 'warning on background'],
	['--ui-danger', '--ui-bg', 4.5, 'danger on background'],
	['--ui-success', '--ui-bg-subtle', 4.5, 'success on subtle background'],
	['--ui-warning', '--ui-bg-subtle', 4.5, 'warning on subtle background'],
	['--ui-danger', '--ui-bg-subtle', 4.5, 'danger on subtle background'],
	['--ui-success', '--ui-surface', 4.5, 'success on card'],
	['--ui-warning', '--ui-surface', 4.5, 'warning on card'],
	['--ui-danger', '--ui-surface', 4.5, 'danger on card'],
]

/*
 * Contexts.
 *
 * The four Editorial and Signal contexts were deleted with those directions
 * when DS-11 chose Instrument.
 *
 * In their place are the COMPOSITED contexts, and they are the reason this
 * script had to grow alpha support. Glassmorphism, aurora, and grain are the
 * three most common ways a beautiful portfolio quietly fails WCAG, and all
 * three fail *invisibly*: they look fine to a designer on a good display in a
 * dark room, and the flat-token check above keeps reporting green the whole
 * time, because every pair it knows about is still correct in isolation. What
 * changed is the thing behind the text.
 *
 * A `backdrop` flattens its translucent `layers` (bottom-first, src-over) onto
 * `base`, then substitutes the result for each token in `bind` — so every
 * existing assertion re-runs against the real composited surface without a
 * single new entry in PAIRS.
 */
/**
 * The five tones from surfaces.css. `null` is the default (untoned) arrangement.
 *
 * THIS LIST IS THE REASON THE TONE SYSTEM IS SAFE TO HAVE. A tone rebinds the
 * three aurora colours, which are exactly the layers every composited context
 * below flattens — so a single unchecked tone would be a whole family of routes
 * whose backdrop nobody verified, and it would look fine, because a contrast
 * failure caused by a background wash is invisible to the person who chose the
 * wash. Adding a tone to surfaces.css without adding it here is the one edit
 * that can silently reintroduce the class of bug this script exists to catch.
 */
const TONES = [null, 'work', 'writing', 'record', 'contact']

/** Selector chain for a theme/tone pair, in cascade order (later wins). */
function selectorsFor(theme, tone) {
	const chain = [':root']
	if (theme === 'light') chain.push('[data-theme="light"]')
	if (tone) {
		chain.push(`[data-tone="${tone}"]`)
		if (theme === 'light')
			chain.push(`[data-theme="light"] [data-tone="${tone}"]`)
	}
	return chain
}

/**
 * The composited contexts, generated per theme and per tone.
 *
 * `aurora peak` is the worst case for the hero and CTA backdrops: every radial
 * gradient at full stop-colour alpha, which happens where they overlap. The
 * page mesh is weaker than this by construction (`--ui-mesh-strength`), so a
 * palette that passes the peak passes the mesh — checking the peak is the
 * conservative direction and needs no second context.
 */
function compositedContexts(theme, tone) {
	const label = `Instrument · ${theme}${tone ? ` · ${tone}` : ''}`
	const selectors = selectorsFor(theme, tone)
	const aurora = [
		'--ui-aurora-lift',
		'--ui-aurora-3',
		'--ui-aurora-2',
		'--ui-aurora-1',
	]

	return [
		{ name: label, selectors },

		{
			name: `${label} · aurora peak`,
			selectors,
			backdrop: {
				base: '--ui-bg',
				layers: aurora,
				bind: ['--ui-bg', '--ui-bg-subtle'],
			},
		},

		// The header, command palette, and mobile sheet float over whatever is
		// behind them — and the lightest thing that can be behind them is the
		// aurora peak. Glass is bound to the surface roles because a glass panel
		// IS a surface as far as the pair table is concerned.
		{
			name: `${label} · glass over aurora`,
			selectors,
			backdrop: {
				base: '--ui-bg',
				layers: [...aurora, '--ui-glass-bg'],
				bind: ['--ui-surface', '--ui-surface-raised'],
			},
		},

		// The lighter panel glass — the proof tiles and the CTA panel, which sit
		// ON a section rather than over the document. Lower alpha than the header
		// glass, so it is a separate worst case rather than a subset of one.
		{
			name: `${label} · panel glass over aurora`,
			selectors,
			backdrop: {
				base: '--ui-bg',
				layers: [...aurora, '--ui-glass-panel-bg'],
				bind: ['--ui-surface', '--ui-surface-raised'],
			},
		},

		/*
		 * THE SPOTLIT PANEL, AND THIS CONTEXT EXISTS BECAUSE THE EFFECT SITS IN
		 * THE ONE PLACE NOTHING WAS LOOKING.
		 *
		 * `.u-spotlight` sets `isolation: isolate`, which makes its host a
		 * stacking context — and inside one, a `z-index: -1` pseudo-element paints
		 * after the host's own background and before the host's in-flow text. So
		 * the glow is not behind the panel, it is between the panel and the words
		 * on it, and it is therefore the real background of every text role there
		 * for as long as a pointer is over the surface.
		 *
		 * Nothing caught that. `check:contrast` reads flat colours, and the peak
		 * used to be a stop inside `--ui-spotlight`'s radial-gradient where no
		 * parser here would ever reach it; axe does not evaluate hover states at
		 * all. A hover-only contrast failure is invisible to every automated tool
		 * this project runs, which is exactly the kind this file exists to catch.
		 *
		 * Layered last, over the panel glass, because that is the stacking order
		 * on the page: aurora, then the panel's own translucent fill, then the
		 * glow.
		 */
		{
			name: `${label} · panel glass + spotlight`,
			selectors,
			backdrop: {
				base: '--ui-bg',
				layers: [...aurora, '--ui-glass-panel-bg', '--ui-spotlight-peak'],
				bind: ['--ui-surface', '--ui-surface-raised'],
			},
		},
	]
}

const CONTEXTS = [
	...['dark', 'light'].flatMap((theme) =>
		TONES.flatMap((tone) => compositedContexts(theme, tone)),
	),

	// Grain is modelled as its worst case: a pure white noise field at maximum
	// opacity. Real turbulence averages well below this, so the check is
	// conservative in the direction that cannot produce a false pass. It is
	// tone-independent — the noise field carries no hue.
	{
		name: 'Instrument · dark · grain',
		selectors: [':root'],
		backdrop: {
			base: '--ui-bg',
			layers: ['--ui-grain-peak'],
			bind: ['--ui-bg'],
		},
	},
	{
		name: 'Instrument · light · grain',
		selectors: [':root', '[data-theme="light"]'],
		backdrop: {
			base: '--ui-bg',
			layers: ['--ui-grain-peak'],
			bind: ['--ui-bg'],
		},
	},
]

/* ------------------------------------------------------------------ */

function main() {
	const tokens = parseBlocks(
		readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8'),
	)
	const themes = parseBlocks(
		readFileSync(join(ROOT, 'src/styles/themes.css'), 'utf8'),
	)
	const surfaces = parseBlocks(
		readFileSync(join(ROOT, 'src/styles/surfaces.css'), 'utf8'),
	)
	const sets = [tokens, themes, surfaces]

	let failures = 0
	let checks = 0
	const gamutWarnings = []

	for (const context of CONTEXTS) {
		const ctx = buildContext(sets, context.selectors)
		const rows = []

		/* Grain has no color token of its own — it is a white noise field whose
		   strength is an opacity. Model its worst case here rather than adding a
		   `--ui-grain-peak` to the stylesheet: a token that exists only to be
		   measured would be a lie in the design system. */
		const grainOpacity = ctx.get('--ui-grain-opacity')
		if (grainOpacity) {
			ctx.set('--ui-grain-peak', `oklch(100% 0 0 / ${grainOpacity.trim()})`)
		}

		/* Flatten the backdrop, then substitute it for the bound tokens so every
		   assertion in PAIRS re-runs against the real composited surface. */
		const overrides = new Map()
		if (context.backdrop) {
			const { base, layers, bind } = context.backdrop
			let acc = oklchToLinearSrgb(parseOklch(resolveValue(ctx.get(base), ctx)))
			for (const layerName of layers) {
				const layer = parseOklch(resolveValue(ctx.get(layerName), ctx))
				acc = compositeOver(oklchToLinearSrgb(layer), layer.alpha, acc)
			}
			for (const name of bind) overrides.set(name, acc)
		}

		const colorOf = (name) =>
			overrides.get(name) ??
			oklchToLinearSrgb(parseOklch(resolveValue(ctx.get(name), ctx)))

		for (const [fgName, bgName, required, label] of PAIRS) {
			if (!ctx.has(fgName) || !ctx.has(bgName)) continue
			checks++

			let ratio
			let fgHex
			let bgHex
			try {
				const fg = colorOf(fgName)
				const bg = colorOf(bgName)
				ratio = contrastRatio(fg, bg)
				fgHex = toHex(fg)
				bgHex = toHex(bg)
				if (isOutOfGamut(fg)) gamutWarnings.push(`${context.name}: ${fgName}`)
				if (isOutOfGamut(bg)) gamutWarnings.push(`${context.name}: ${bgName}`)
			} catch (error) {
				console.error(`  ERROR  ${context.name} · ${label}: ${error.message}`)
				failures++
				continue
			}

			const pass = ratio >= required
			if (!pass) failures++
			if (!pass || VERBOSE) {
				rows.push(
					`  ${pass ? 'pass' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)}:1 ` +
						`(need ${required.toFixed(1)})  ${label}\n` +
						`        ${fgName} ${fgHex} on ${bgName} ${bgHex}`,
				)
			}
		}

		if (rows.length) {
			console.log(`\n${context.name}`)
			console.log(rows.join('\n'))
		}
	}

	if (gamutWarnings.length) {
		console.log(
			'\nOut of sRGB gamut (browser will clip — ratios above use the clipped value):',
		)
		for (const w of [...new Set(gamutWarnings)]) console.log(`  ${w}`)
	}

	console.log(
		`\n${checks} pairs checked across ${CONTEXTS.length} contexts — ` +
			(failures ? `${failures} FAILED` : 'all pass'),
	)
	process.exit(failures ? 1 : 0)
}

main()
