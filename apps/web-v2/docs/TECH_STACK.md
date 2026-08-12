# TECH STACK

Every dependency needs a justification here before it enters `package.json`.
"Popular" is not a justification. The question each entry answers is: *what
breaks if this is removed, and what is the cheapest alternative?*

## 1. Versions

Pin **exact** versions (no `^`). Upgrades are deliberate, one dependency per PR,
so a regression is bisectable. Renovate/Dependabot may open PRs; it may not
group them.

| Concern | Choice | Version policy |
| --- | --- | --- |
| Runtime | Node.js 22 LTS | `.nvmrc` + `engines` + CI matrix pin |
| Package manager | pnpm 9+ | `packageManager` field; corepack in CI |
| Framework | Next.js 15 (App Router) | Exact pin; majors reviewed manually |
| UI | React 19 | Follows Next.js |
| Language | TypeScript 5.6+, `strict: true` | Exact pin |
| Styling | Tailwind CSS v4 | Exact pin |
| Components | shadcn/ui (copied, not installed) | N/A — vendored source |
| Class merging | `clsx` + `tailwind-merge` | Exact pin |
| Variants | `class-variance-authority` | Exact pin |
| Animation | Motion (`motion`) | Exact pin |
| Smooth scroll | Lenis | Exact pin |
| Timeline animation | GSAP + ScrollTrigger | Exact pin; scoped usage |
| 3D | React Three Fiber + drei | Only if §3 gate passes |
| Content | MDX via `@next/mdx` + `@mdx-js/loader` | Exact pin |
| Frontmatter | gray-matter | Exact pin |
| Highlighting | `rehype-pretty-code` + Shiki (build time) | Exact pin |
| Reading time | reading-time | Exact pin |
| Validation | Zod | Exact pin |
| Lint/format | Biome 2.x | Exact pin |
| Hooks | Husky + lint-staged | Exact pin |
| Tests | Vitest, Testing Library, Playwright | Exact pin |
| Test bundler | `vite` (Vitest's peer, pinned directly) | Exact pin; **not** the app's bundler |
| Automated a11y | `@axe-core/playwright` + `axe-core` | Exact pin |
| Performance gate | `@lhci/cli` (Lighthouse CI) | Exact pin |
| Byte budgets | `size-limit` + `@size-limit/file` | Exact pin |

## 2. Justifications

### Next.js 15, App Router
**Why:** the only mainstream React framework where "great static export" and
"great DX for a content site" are the same product. `generateStaticParams` +
Server Components let MDX parsing and syntax highlighting happen at build time,
which is the core of the performance budget.
**Alternatives considered:** *Astro* — arguably a better fit for a content site
and would ship less JS; rejected because the interaction layer (command palette,
motion-heavy sections, playground) is genuinely app-like, and islands
architecture makes shared client state awkward. *Vite + React Router* — rejected:
we would rebuild routing, metadata, sitemap, and MDX integration by hand.
*Plain HTML* — rejected: no content pipeline.
**Risk:** App Router majors move fast. Mitigated by exact pinning and by using
no experimental flags.

#### Why this is 15.5.23 and not 16.x

`15.1.6` was deprecated on npm for a security advisory (CVE-2025-66478), so
staying on it was not an option. The move went to **15.5.23** — the maintained
`backport` dist-tag — rather than 16.3.0, because 16 was tried, measured, and
**blocked on the performance budget**, which [PERFORMANCE.md](./PERFORMANCE.md)
§2 says may not be raised to make a gate pass.

Next 16 builds and exports this app correctly; four things stand in the way, and
only the third is a real objection:

1. **`next lint` is gone**, so `next.config.mjs`'s `eslint` key is rejected
   (`Unrecognized key(s) in object: 'eslint'`). Costless to drop — Biome lints
   this app and the build never ran ESLint here.
2. **Turbopack is the default builder and cannot load this MDX pipeline.** The
   `onVisitLine` callback in `src/lib/mdx/plugins.mjs` is a function, and
   Turbopack only accepts serialisable loader options. `next build --webpack`
   works today; the header of that file has the full account.
3. **Every route exceeds its 120 KB JS hard limit by 18–22 KB.** Next 16's
   baseline runtime is ~18 KB larger, measured: Home 103 KB → 140.27 KB, a case
   study 141.89 KB, the lightest route 138.06 KB. Nothing in this app's ~5 KB of
   client code changed. Adopting 16 therefore means either finding ~20 KB or
   raising the hard limit in PERFORMANCE.md §2 with a stated reason — an
   editorial decision, taken deliberately, not a side effect of an upgrade.
4. **The export gains 116 `__next.*.txt` files plus a `_not-found/` route.**
   These are the client router's segment-prefetch payloads, now unconditional
   (16.3.0 has no flag to disable them) — and useless here, because navigation is
   deliberately plain `<a>` and the client router never runs. They also trip
   `check-export.mjs`'s check 5, whose premise ("nothing in `out/` starts with an
   underscore except `_next/`") Next 16 makes untrue. `404.html` is still emitted
   correctly, so the real 404 is unaffected.

Items 1, 2 and 4 have known fixes. Item 3 needs a decision.

### React 19
**Why:** required by Next.js 15; Server Components are the mechanism the
architecture depends on.
**Note:** no use of `use()` for data fetching (no runtime data), no Suspense
streaming (static export renders everything).

### TypeScript, `strict`
**Why:** the content pipeline's safety guarantee (§ARCHITECTURE 8) is expressed
in types derived from Zod schemas. Without it, "add an MDX file" is not a safe
publishing workflow.
**Rules:** `strict: true`, `noUncheckedIndexedAccess: true`,
`verbatimModuleSyntax: true`. `any` is a review blocker; use `unknown` + a guard.

### Tailwind CSS v4
**Why:** v4's CSS-first config (`@theme` in a stylesheet) means design tokens
live in CSS custom properties and are readable by *both* Tailwind utilities and
raw CSS/JS (needed by GSAP and canvas code). One token source, no duplication —
this is the specific reason for v4 over v3's JS config.
**Alternatives:** *CSS Modules* — rejected: token discipline becomes manual.
*vanilla-extract* — rejected: build complexity, smaller ecosystem.
*Styled-components* — rejected: runtime cost and RSC friction.
**Trade-off:** class-string verbosity in markup. Mitigated with `cva` variants
and `cn()`, and by extracting any element with > ~12 utilities into a component.

### shadcn/ui
**Why:** it is not a dependency — it is source code copied into
`components/ui/`. That gives Radix's accessibility primitives (focus traps,
roving tabindex, correct ARIA) without a versioned UI library dictating design.
Every copied component is then restyled to the design system.
**Rule:** copy only what is used. A component sitting unused in `ui/` is deleted.
**Expected set:** button, dialog, dropdown-menu, tooltip, popover, tabs,
accordion, command, badge, separator, scroll-area, sheet, toast.

### `clsx` + `tailwind-merge` (M2)
**Why:** `cn()` is the one utility every component uses. `clsx` resolves
conditionals and arrays; `tailwind-merge` resolves *conflicts*, so a parent can
override a child's `p-4` with `p-6` without both landing in the class attribute
and the cascade deciding by source order.
**Cost:** ~1.2 KB gz combined, on every route that renders a component.
**Configured, not default** — see the header of `src/lib/cn.ts`. tailwind-merge
classifies `text-*` as a font size only when the suffix is a t-shirt size, so our
type scale (`text-h1`, `text-mega`) is read as a *color* by the stock config, and
`cn('text-h1', 'text-text-muted')` silently drops the size. The same collision
exists for `shadow-*`, `font-*`, `ease-*`. `cn.test.ts` asserts both directions
of each.
**Alternative considered:** `clsx` alone — rejected, because conflict resolution
is the actual problem; without it every component needs defensive class ordering.
Hand-rolled `cn` — rejected: the conflict table is the whole value and
reimplementing it is a maintenance liability.

### `class-variance-authority` (M2)
**Why:** [UI_GUIDELINES.md](./UI_GUIDELINES.md) §1 mandates variants via `cva`
rather than boolean prop explosions, and mandates that all five interaction
states live in the base rather than being repeated per variant. This is the
library that document is written against.
**Cost:** ~0.6 KB gz.
**Alternative considered:** a hand-rolled variant map (`{ primary: '…' }[variant]`)
— viable and cheaper, but loses `VariantProps<typeof x>` type inference, which is
what stops a component's props and its styles drifting apart.

### Motion (`motion`, formerly Framer Motion) — **still not installed**
**Why it was planned:** declarative, React-native mental model; layout
animations and `whileInView` cover most of the site's motion needs; excellent
`useReducedMotion` support.
**Rule if it is ever added:** import from `motion/react`; use the
**LazyMotion + `domAnimation`** feature bundle so the full feature set is not
shipped. Never animate `width`, `height`, `top`, or `left` — transform and
opacity only.

**Why the visual redesign did not install it, with the numbers.** The redesign
brief asked for hero entrance animations, staggered reveals, scroll-triggered
animation, card hover effects, animated gradients and a moving background. Every
one of those shipped. None of them needed this package.

| | Measured |
| --- | --- |
| Home JS before the redesign | 111.85 KB gz |
| Home JS after it | 111.89 KB gz |
| Headroom against the 120 KB hard limit | ~8 KB |
| `motion` with LazyMotion + `domAnimation` | ~16 KB gz |
| CSS before / after | 10.67 → 12.27 KB gz (limit 20 KB) |

The whole motion layer of the redesign — `u-enter`, `u-enter-backdrop`,
`u-drift`, `u-lift`, `u-beam`, `u-gradient-text`, `u-header-rule` — is CSS in
`src/styles/motion.css`, and it cost **0.04 KB of JavaScript and 1.6 KB of CSS**.
Installing a 16 KB animation runtime would have consumed twice the remaining
headroom on the site's most important route to produce effects that are seven
keyframe blocks, and it would have moved the reveal system from "cannot leave
content at `opacity: 0` when JavaScript fails" to "must be careful not to".

That last point is not a footnote. `e2e/no-js.spec.ts` walks every element of
every page with scripting disabled and rejects anything under 0.05 opacity, and
it caught the redesign's first hero entrance — a conventional fade-and-rise —
because `animation-fill-mode: both` holds the `from` state through the stagger
delay. The fix was to drop the fade and animate transform only. A JS-driven
entrance would have failed the same spec in a way that no CSS change could
repair.

**When to revisit:** a genuine shared-layout transition, or a gesture-driven
interaction. Neither exists on this site, and neither is on the roadmap.

### Lenis
**Why:** smooth scroll that is a *velocity smoothing* layer over native scroll —
it does not hijack scroll position, preserves find-in-page, keyboard scroll,
scrollbar dragging, and anchor links.
**Rules (non-negotiable):** disabled entirely under `prefers-reduced-motion`;
disabled on touch devices (native iOS scroll is better); must not break
`scroll-margin-top` for skip links. If any of these cannot be satisfied, Lenis
is removed — smoothness is not worth an accessibility regression.
**Cost (measured at L-08, `lenis@1.3.25`):** 5.34 KB gz, in a chunk no HTML
references — the import is inside the effect and behind the gates, so it is
fetched only by a reader who will actually get smoothing. The mount costs Home
**0.29 KB** gz (117.79 → 118.08). See `src/components/motion/smooth-scroll.tsx`
and `e2e/smooth-scroll.spec.ts`, which is where the three rules above are
enforced rather than merely stated.
**Alternative considered:** `scroll-behavior: smooth` alone — free, and already
in `globals.css` for anchor jumps, but it only eases programmatic jumps and does
nothing for wheel velocity, which is the whole effect. Rejected as insufficient,
not as wrong: it stays, and Lenis's one required CSS override is scoped so it
keeps working everywhere Lenis is not running.

### GSAP + ScrollTrigger — **still not installed, and both sanctioned uses are gone**
**Why it was planned:** long, pinned, precisely choreographed scroll timelines
with scrubbing. It had exactly two sanctioned uses: the case-study architecture
diagram draw-on (P-09) and the journey timeline spine (A-06).

**Both are built, and neither needed it.** CSS scroll-driven animations —
`animation-timeline: scroll()` and `view()` — do progress-linked animation
natively, behind an `@supports` gate whose fallback is a fully drawn line rather
than a frozen one. The result is **0 bytes on every route** instead of ~40 KB gz
code-split onto two of them, and it cannot be broken by a hydration failure
because there is no hydration involved.

The redesign added a third use of the same mechanism (`u-drift`, the parallax
backdrop) at the same cost. See `src/styles/motion.css`, where the reduced-motion
subtlety is documented: a scroll timeline resolves its duration from the scroll
range and therefore ignores the global `animation-duration: 0.01ms` backstop —
which protects the progress rail (kept under reduced motion, because it is
information) and means decorative scroll animation must be gated by the media
query explicitly (`u-drift` is).

**When to revisit:** a pinned, multi-stage, scrubbed sequence with more than
about three keyframes per element, where a scroll timeline's declarative form
genuinely stops scaling. Nothing on the site is close.

### React Three Fiber — *conditional*
**Gate:** admitted only if it renders information that cannot be conveyed in 2D
*and* costs < 60 KB gz on a route that is not Home *and* has a static image
fallback for reduced-motion and low-end devices. Current candidate: a single
playground demo. **Default answer is no.**

### MDX (`@next/mdx`)
**Why:** content is prose with occasional interactive components — exactly MDX's
domain. Compiled at build time; zero runtime MDX cost.
**Plugins:** `remark-gfm`, `remark-frontmatter`, `rehype-slug`,
`rehype-autolink-headings`, `rehype-pretty-code` (Shiki, build-time
highlighting — no Prism runtime).
**Alternative considered:** *Contentlayer* — rejected: effectively unmaintained
and adds a schema layer we already get from Zod. We use ~60 lines of custom
loader instead ([BLOG_SYSTEM.md](./BLOG_SYSTEM.md)).

### gray-matter (F1-03)
**Cost:** dev/build-time only, 0 bytes shipped. **Why:** frontmatter has to be
read as *data* — for the index, `generateStaticParams`, the sitemap, and feeds —
separately from the MDX compile that renders the body. `remark-frontmatter` only
tells the compiler to ignore the block; it does not hand it back. gray-matter is
the smallest thing that parses it.
**Rejected:** hand-rolling a `---` splitter plus a YAML parser (the YAML parser is
the dependency, so this saves nothing and adds edge cases); `front-matter`
(unmaintained); reading frontmatter through a remark plugin and threading it out
via `vfile.data` (works, but couples metadata reads to a full MDX compile — the
blog index would then compile every post to render a list of titles).

### reading-time (F1-04)
**Cost:** build-time only, 0 bytes shipped, ~2 KB installed. **Why:** BLOG_SYSTEM
§2 lists it in the pipeline and §5 puts the figure on the index. It is ~15 lines
of word counting, and the honest reason not to inline it is that the word-count
heuristics for code blocks and CJK are exactly the fiddly part.
**Rejected:** `remark-reading-time` — it is this package wrapped in a remark
plugin, which would tie the figure to the compile step for no benefit, since the
loader already has the raw body in hand.

### rehype-pretty-code + shiki (F1-02)
**Cost:** build-time only. **Zero bytes shipped** — the entire point.
**Why:** highlighting runs during `next build` and emits styled markup, so a post
page ships no highlighter at all (BLOG_SYSTEM §11). Shiki uses real TextMate
grammars, so the output matches VS Code rather than approximating it.
Both themes are emitted at once as `--shiki-light` / `--shiki-dark` custom
properties, which makes theme switching a CSS variable swap with no re-render —
the reason this survives the theme toggle for free.
**Rejected:** *Prism* and *highlight.js* (runtime highlighters, ~15–30 KB gz on
every post page, and they re-tokenize in the browser); *Shiki alone* without
`rehype-pretty-code` (workable, but line highlighting, word highlighting, and
titles would all be hand-built).

### `@mdx-js/react` — deliberately NOT installed
Worth recording because installing it looks obviously correct and breaks the
build. `@next/mdx` aliases `next-mdx-import-source-file` to the root
`mdx-components.tsx`, which Next calls directly during the server render — zero
client bytes. If `@mdx-js/react` is resolvable, the alias instead points at its
**context provider**, which calls `createContext` inside a Server Component and
fails the build with `createContext is not a function`. It was installed here
once, for exactly the reason it looks necessary, and removed.

### Zod
**Why:** the build-time contract for frontmatter. `z.infer` gives the types, so
schema and type cannot drift.
**Alternative:** *Valibot* — smaller, but Zod's ergonomics matter more than
bundle size for a build-time-only dependency (it ships zero bytes to the client).

### Biome
**Why:** one Rust binary replacing ESLint + Prettier + their plugin trees.
Sub-second on this codebase; removes ~15 transitive dev dependencies and the
perennial eslint-config-prettier conflict.
**Trade-off:** fewer specialized rules than the ESLint ecosystem (notably the
a11y plugin's depth). Mitigated by making axe in E2E the real a11y gate — which
is a better check than lint rules anyway.
**Version floor is 2.x, not a preference.** `noRestrictedImports` in Biome 1.9
accepts only exact module specifiers — no globs — so it cannot express
"`components/` may not import `@/features/**`" at all. The layer boundaries in
[ARCHITECTURE.md](./ARCHITECTURE.md) §5 are enforced by the `patterns` option
that 2.x added. Without it, F0-07 is not implementable and the boundaries revert
to good intentions.

### serve
**Why:** `pnpm start` must serve the built `out/` directory, because
`next start` does not exist under `output: 'export'` and the dev server hides
`basePath`, trailing-slash behaviour, and the real 404 — the three things that
break on GitHub Pages. **Cost:** dev-only, zero bytes shipped.
**Alternative:** `python -m http.server`, rejected because it does not implement
the `dir/` → `dir/index.html` resolution that Pages does, so the preview would
be unfaithful in exactly the way the script exists to prevent.

### Husky + lint-staged
**Why:** fast local feedback. `pre-commit` runs Biome on staged files;
`commit-msg` validates Conventional Commits. CI re-runs everything — hooks are
a convenience, never the authority, and `--no-verify` is not a workflow.

### Vitest + Testing Library + Playwright
See [TESTING.md](./TESTING.md) for scope. Vitest for content-pipeline and utility
logic; Playwright for a small set of user-journey and accessibility checks.

### `vite` — a pinned peer, not a bundler choice
**Cost:** dev-only, 0 bytes shipped. Next builds the app; Vite never touches it.
**Why it is listed explicitly rather than left transitive:** Vitest declares Vite
as a *peer*, and this root's `.npmrc` sets loose peer resolution (see the root
`AGENTS.md`). On the Vitest 2 → 4 upgrade pnpm therefore satisfied that peer with
the Vite 5 already in the store, which Vitest 4 cannot use — the suite died at
startup with `Package subpath './module-runner' is not defined`, an error that
names neither package. Pinning it here makes the resolution a decision in the
diff instead of a property of the store.
**Version:** 7.3.6, deliberately not 8.x. Vite 8 parses with Rolldown, which
rejects the JSX in `components/ui/badge.tsx` (`Unexpected JSX expression`) and
fails one suite. Revisit when Rolldown handles `.tsx` as esbuild did.
**Rejected:** letting the peer resolve itself (that is the bug above); pinning
Vitest at 2 (leaves the runner two majors behind for no gain).

### `@axe-core/playwright` + `axe-core` (F0-13)
**Cost:** dev-only, 0 bytes shipped. **Why:** the accessibility commitment in
[ACCESSIBILITY.md](./ACCESSIBILITY.md) is the site's strongest claim, and an
unverified claim is a liability rather than an asset. axe is the engine behind
Lighthouse's a11y category, so running it directly buys per-route, per-theme
results with named rules and selectors instead of one aggregate score.
**Rejected:** `jest-axe` (needs jsdom, which cannot compute contrast or
visibility — the two rule families that matter most here); `pa11y` (a second
browser stack alongside Playwright's); relying on Lighthouse alone (one score
per page, no theme switching, no selector in the failure).

### `@lhci/cli` (F0-14)
**Cost:** dev-only, 0 bytes shipped. **Why:** [PERFORMANCE.md](./PERFORMANCE.md)
§2 states numeric budgets, and a budget that is not asserted is an intention.
LHCI runs Lighthouse N times and asserts the median, which is the minimum needed
to make a CI performance gate stable enough not to be ignored.
**Rejected:** `treosh/lighthouse-ci-action` (a wrapper around this, with the
config in YAML where it cannot be run locally — `pnpm lh` must reproduce CI
exactly); WebPageTest (external service, API key, not a merge gate);
`unlighthouse` (crawls, aimed at auditing rather than gating).

### `size-limit` + `@size-limit/file` (F0-15)
**Cost:** dev-only, 0 bytes shipped. **Why:** Lighthouse tells you a page is
slow; `size-limit` tells you which route grew and by how much, in seconds rather
than minutes. The byte budgets in PERFORMANCE.md §2 are per route, and this is
the only tool here that expresses them that way. Config is `.size-limit.cjs`
rather than JSON because the entries are *derived from the built HTML* — see the
comment at the top of that file for why a static glob measures the wrong bytes.
**Rejected:** `@next/bundle-analyzer` (a visualization, not an assertion — it
cannot fail a build); `bundlewatch` (needs a hosted service for base comparison);
`@size-limit/preset-app` (runs a headless browser to estimate execution time;
we already have Lighthouse for that, and it would double CI time).

### `satori` + `@resvg/resvg-js` + `@fontsource/inter` (H-09)
**Cost:** dev-only, **0 bytes shipped**. They run in `scripts/generate-og.mjs`
after `next build` and never enter a route's module graph — which is the only
reason a dependency of this weight is acceptable at all. **Why:** Open Graph
cards have to be raster images at 1200×630, and generating one per page is what
stops a link to a case study and a link to the contact page looking identical in
a Slack channel. Satori lays out a subset of flexbox and emits SVG; resvg
rasterises it; Inter is the font data satori needs, because it draws glyphs and
has no system fallback to lean on. **Note this does not resolve DS-04** — the
site's own display face is still an open licensing decision, and Inter here is a
build-time asset for one image rather than a typeface choice for the site.
**Rejected:** a single static card (a preview that carries no information is a
preview doing no work); a headless browser screenshotting each page (minutes of
CI per build, and a second browser to keep in step with Playwright's);
downloading the font at build time (fails whenever the network does, and
produces a different card when the font is updated upstream).

## 3. Deliberately excluded

| Not used | Why |
| --- | --- |
| Redux / Zustand / Jotai | No global state exists ([ARCHITECTURE.md](./ARCHITECTURE.md) §9) |
| SWR / React Query | No runtime data fetching |
| Contentlayer | Unmaintained; replaced by ~60 lines |
| Framer Motion v11 legacy import path | Superseded by `motion` |
| Prism / highlight.js | Shiki at build time ships 0 KB |
| Lodash / date-fns | Native `Intl` and a 10-line `formatDate` suffice |
| A UI kit (MUI, Chakra, Mantine) | Would dictate the design language |
| Storybook | Cost exceeds value for one maintainer; ad-hoc `/playground` routes serve the same purpose |
| Sentry / LogRocket | No runtime to observe |
| Google Analytics | Cookie banner + privacy cost; see [SEO.md](./SEO.md) |
| GSAP | **Still not installed.** A-06 and P-09 were its two sanctioned uses; both are CSS scroll-driven animations behind an `@supports` gate instead, at 0 bytes on every route rather than 0 bytes on all but one. See `features/journey/timeline-spine.tsx`. |
| A markdown pipeline for the feeds (`unified`, `remark-parse`, `rehype-stringify`) | The export already holds each post fully rendered; `scripts/generate-feeds.mjs` reads that instead, so the feed content is the page content by construction rather than a second rendering free to drift |

## 4. Configuration files (created in Phase 3 — see [ROADMAP.md](./ROADMAP.md))

```
next.config.mjs        output:'export', images.unoptimized, basePath, MDX
tsconfig.json          strict, paths: { "@/*": ["./src/*"] }
biome.json             formatter + linter + import boundaries
postcss.config.mjs     @tailwindcss/postcss
src/styles/globals.css @import "tailwindcss"; @theme inline { --color-*: var(--ui-*) }
.gitattributes         eol=lf — Biome formats to LF; see the file for why
.size-limit.cjs        per-route byte budgets, derived from the built HTML
.nvmrc                 22
.npmrc                 strict-peer-dependencies=true
package.json           packageManager, engines, scripts
.husky/pre-commit      pnpm lint-staged
.husky/commit-msg      commitlint
lighthouserc.json      budget assertions
playwright.config.ts   projects: chromium, webkit, mobile-chrome
vitest.config.ts       environment: node (+ jsdom project for components)
```

## 5. Scripts contract

| Script | Does |
| --- | --- |
| `pnpm dev` | Next dev server |
| `pnpm build` | Static export to `out/` |
| `pnpm start` | Serve `out/` locally (`serve out`) — the only faithful preview |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `lint:fix` | Biome check |
| `pnpm test` / `test:e2e` | Vitest / Playwright |
| `pnpm start:test` | Serve `out/` on port 4319 for Playwright — a dedicated port so the suite can never bind to an unrelated dev server |
| `pnpm lh` | Lighthouse CI against a local `out/` |
| `pnpm size` | `size-limit` per-route byte budgets against `out/` |
| `pnpm check:links` | Internal link resolution over `out/` |
| `pnpm content:validate` | Run Zod schemas over all content without a full build (Vitest, filtered — see the note in content.validate.test.ts) |
| `pnpm og:generate` | Render one Open Graph card per exported page into `out/og/` (runs inside `pnpm build`) |
| `pnpm feeds` | Generate RSS, Atom and JSON feeds from the export (runs inside `pnpm build`) |
| `pnpm check:export` | Export assertions over `out/`, including that every `og:image` is absolute and resolves (Q-02) |
| `pnpm check:contrast` | Every semantic colour pair, every theme, every composited backdrop |

`pnpm start` serving `out/` rather than `next start` is deliberate: `next start`
does not exist for static export, and previewing the dev server hides
`basePath`, trailing-slash, and 404 behavior — the three things that break on
GitHub Pages.
