# TASK BACKLOG

The implementation backlog. Every task is independently deliverable, has
acceptance criteria that are objectively checkable, and maps to a phase in
[ROADMAP.md](./ROADMAP.md).

## Conventions

**ID format:** `<TRACK><group>-<nn>`.

| Track | Area | Roadmap phase |
| --- | --- | --- |
| `DS` | Design system | 2 |
| `F0` | Foundation — config, tooling, CI | 3 |
| `F1` | Foundation — content pipeline | 3 |
| `L` | Layout & navigation | 4 |
| `H` | Home | 5 |
| `A` | About, experience, skills, journey | 6 |
| `P` | Projects & case studies | 7 |
| `B` | Blog | 8 |
| `C` | Contact, resume, uses, open source | 9 |
| `Q` | SEO, performance, accessibility, cutover | 10 |
| `X` | Polish & launch | 11 |

**Priority:** P0 blocks the phase · P1 required for launch · P2 valuable, cuttable ·
P3 post-launch.
**Complexity:** S ≈ a session · M ≈ a few sessions · L ≈ a week of evenings.
**Status:** `todo` · `in-progress` · `blocked` · `done`.

Every task additionally inherits the definition of done in
[CONTRIBUTING.md](./CONTRIBUTING.md) §6 — typecheck, lint, tests, budgets, and
a11y all green. Task-specific acceptance criteria below are *in addition* to it.

---

## Phase 2 — Design System

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| DS-01 | Define OKLCH primitive scales (ink, sand, 3 accent candidates, status) in `tokens.css` | P0 | M | — | **done** |
| DS-02 | Map semantic tokens for dark theme | P0 | S | DS-01 | **done** |
| DS-03 | Map semantic tokens for light theme (a real design, not an inversion) | P0 | M | DS-02 | **done** |
| DS-04 | Select, subset, and self-host display/text/mono faces (≤ 120 KB total) | P0 | M | — | **blocked** — needs the licensing decision; stacks are fallbacks today |
| DS-05 | Metric-matched fallback fonts via `size-adjust` | P0 | M | DS-04 | **in-progress** — declared in `globals.css`; values re-measured when DS-04 unblocks |
| DS-06 | Fluid type scale with `clamp()` | P0 | S | — | **done** (scale is face-independent) |
| DS-07 | Space, radius, elevation tokens | P0 | S | — | **done** |
| DS-08 | Motion tokens (durations, easings) | P0 | S | — | **done** |
| DS-09 | `scripts/check-contrast.mjs` over all semantic pairs, all themes | P0 | M | DS-03 | **done** — 128 pairs × 8 contexts (96 × 6 before M1) |
| DS-10 | Token playground (`design/tokens.html`; becomes a route in Phase 3) | P1 | S | DS-01…08 | **done** |
| DS-11 | Home hero mockups — three directions (`design/hero-directions.html`) | P0 | M | DS-01…08 | **done** — direction **B, "Instrument"** chosen; A and C deleted; `design/hero.html` is now the single reference |
| DS-12 | Close the `--ui-bg-subtle` gap in the contrast contract | P0 | M | DS-09 | **done** (visual redesign) — 9 new rows; `--ui-bg-subtle` and status-on-surface now verified |
| DS-14 | The decorative spectrum, the tone system, and the page mesh | P0 | L | DS-09, DS-12 | **done** (visual redesign) — see DESIGN_SYSTEM §14 |
| DS-13 | The component layer — `src/components/ui/` over the token set | P0 | L | DS-01…08, F0-04 | **done** — 17 primitives (`Eyebrow` promoted in the visual redesign), no page, no domain logic; see below |

**DS-13 note.** The token layer had no consumers other than the shell, so every
rule in DESIGN_SYSTEM §1–§12 was still enforced by review. This closes that:
button, heading, text, container, section, stack, grid/auto-grid, surface, card,
badge, divider, icon + set, skeleton, prose, visually-hidden, slot — each thin
enough that its job is to make one documented rule unbreakable, listed against
its rule in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §13.

Five things it decided, all recorded in §13 rather than only here: the icon set
is **vendored** rather than `lucide-react` installed (same treatment TECH_STACK
§2 gives shadcn/ui — no new dependency, and "one set" becomes structural);
`asChild` is a 34-line local `Slot` until the first component whose value is
Radix's *behaviour*; four `duration-*` classes exist because Tailwind v4 has no
`--duration-*` namespace and the alternative was an arbitrary value; the five
breakpoints are now declared so the documented and compiled sets are provably
one list; and `Section` deliberately offers no `--ui-bg-subtle` surface, because
DS-12 is open against exactly that hole.

**Zero JS cost, and that is measured, not asserted.** Nothing in `ui/` carries
`'use client'`, and no page imports it yet — Home is unchanged at 117.79 KB gz
against its 120 KB gate, CSS 8.46 KB against 20 KB. `pnpm lint`, `typecheck`,
`test` (83), `build`, `check:export` and `check:contrast` (128 pairs × 8
contexts) all pass. **Not run:** `test:e2e` and `lh` — there is no rendered
surface to run them against until a page consumes these.

**The unused-component rule comes due at Phase 5.** TECH_STACK §2 says a
component sitting unused in `ui/` is deleted; today that is all of them, which is
the accepted cost of building the layer before the pages. At the first milestone
that builds a page, anything still without a call site goes.

**Standing after H-01.** The hero is the first real consumer: `Section`,
`Container`, `Stack`, `Heading`, `Text`, `Button` and `Slot` now have call
sites. The other nine — `Card`, `Badge`, `Divider`, `Grid`/`AutoGrid`,
`Surface`, `Skeleton`, `Prose`, `Icon`, `VisuallyHidden` — do not yet, and the
rule is **not** being enforced against them today, deliberately: H-03's project
cards, H-04's capability grid and H-05's post list are the call sites, they are
the next tasks in this same phase, and deleting a component in one commit to
rewrite it in the next is churn rather than discipline. The rule comes due at
**H-10**, which is the last task in Phase 5 and the point at which "no page
needed it" stops being a statement about sequencing and becomes one about the
component.

**DS-05 acceptance:** with the webfont blocked in devtools, swapping to the real
face produces a measured CLS of exactly 0.

**Note (Phase 2, updated at M1).** DS-01…03 and DS-06…11 are built and verified.

**DS-11 is closed.** Direction **B, "Instrument"** — dark-first near-black ink,
teal-cyan accent, tight grotesque — was chosen. Five of the seven reference sites
named in the redesign brief are dark-first, low-chroma surfaces with a single
saturated accent, which is a description of B. Per DS-11's acceptance criterion
the losing two were deleted, not left dormant: `[data-direction="editorial"]` and
`="signal"` are gone from `themes.css`, and the `--sand-*`, `--ochre-*` and
`--violet-*` primitives with them. A dormant direction block is a second accent
hue sitting in every stylesheet, one attribute away from being reintroduced by
accident. Both remain in git history.

M1 also added a third token tier, `surfaces.css` — see the amendment in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2 — and taught `check-contrast.mjs` alpha
compositing so text is verified against the aurora, glass and grain backdrops it
actually sits on. **128 pairs across 8 contexts, all passing**, up from 96 across
6. The four deleted contexts were Editorial and Signal; the six added are the
composited ones. Two genuine failures were caught on the first run
(light-theme accent 4.13:1 and warning 4.09:1 against a 4.5 floor) and fixed by
retuning the light aurora to lift rather than darken.

**DS-04 remains genuinely blocked** on the typeface licensing decision; the
mockups render in fallback stacks, so their proportions are indicative rather
than final. **DS-05 is now in-progress rather than blocked**: the metric-matched
`@font-face` is declared in `globals.css` with `size-adjust`, `ascent-override`
and `descent-override`, so the swap is neutralised in advance. Its values are
keyed to the *intended* face and **must be re-measured when DS-04 closes** — a
`size-adjust` nobody re-measures silently shifts type off its grid while looking
deliberate. Phase 2 does not exit until DS-04 and DS-05 are closed.
**DS-09 acceptance:** the script exits non-zero when a token is edited to fail
contrast — verified by deliberately breaking one.

**DS-12 — a hole in the contract, found the expensive way.** `PAIRS` in
check-contrast.mjs verifies text, muted text, and accent against `--ui-bg` and
`--ui-surface`. It has no row for `--ui-bg-subtle`, so any text placed on that
role is unverified by construction. M1's compositing work did not close this and
was never going to: `--ui-bg-subtle` appears in the new contexts only inside
`bind`, as a target the aurora is substituted *into*, never as a background a
pair is measured *against*. 128 pairs across 8 contexts, and still none of them
is text on the subtle surface. L-06's first footer used it as a background
and axe failed the page in the light theme — accent links and 14px meta text do
not clear 4.5:1 against `--ink-100` — while `pnpm check:contrast` stayed green.
The footer was moved onto `--ui-bg` to land Phase 4, so nothing ships broken, but
the gap is still open and `--ui-bg-subtle` remains unusable behind text until it
is closed.

**DS-12 IS NOW CLOSED, and it closed exactly the way this paragraph predicted.**
The visual redesign added nine rows — `text`, `text-muted`, `text-subtle`,
`accent` and `border-strong` against `--ui-bg-subtle`, plus the three status
colours against both `--ui-bg-subtle` and `--ui-surface`, the latter having been
unverified since the first status badge was rendered on a card. Re-tuning was
needed and was not small: the light theme's accent moved from `52.5%` to `45%`
lightness and the ink scale moved two steps, because the redesign also made the
aurora visible and every one of these pairs is asserted against the *composited*
backdrop rather than a flat colour. The contract is now 1,134 assertions across
42 contexts (2 themes × 5 tones × 4 composited surfaces, plus grain).

`--ui-bg-subtle` is usable behind text again. The footer is back on it, `Section`
offers `surface="subtle"`, and the badge fill uses it.

**The lesson stands and is worth keeping after the fix.** The gate did its job
and the token contract did not — DS-09's own acceptance ("the script fails when
a token is broken") is necessary but not sufficient, because it can only check
the pairs someone thought to declare. That is why DS-14's tone system generates
its contexts from a list rather than enumerating them by hand, and why
`check-contrast.mjs` carries an explicit warning that a tone added to
`surfaces.css` and not to `TONES` is an unverified backdrop.
**DS-11 acceptance:** three people shown the mockup and five well-known portfolio
templates cannot match it to any of them.

---

## Phase 3 — Application Foundation

### F0 — Configuration, tooling, CI

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| F0-01 | Next.js 15 app skeleton on `feat/next-foundation`, CRA untouched | P0 | M | — | **done** |
| F0-02 | `next.config.mjs`: `output: 'export'`, `trailingSlash`, `images.unoptimized` | P0 | S | F0-01 | **done** |
| F0-03 | `tsconfig.json` strict + `noUncheckedIndexedAccess` + `@/*` paths | P0 | S | F0-01 | **done** |
| F0-04 | Tailwind v4 wired to Phase 2 tokens | P0 | S | F0-01, DS-* | **done** — `--ui-*` rename + `@theme inline` bridge |
| F0-05 | `public/.nojekyll` + an assertion that it reaches `out/` (`scripts/check-export.mjs`) | P0 | S | F0-02 | **done** |
| F0-06 | Biome config: formatter, linter, import ordering | P0 | S | F0-01 | **done** |
| **F0-07** | **Biome `noRestrictedImports` enforcing the layer boundaries in [ARCHITECTURE.md](./ARCHITECTURE.md) §5** | P0 | M | F0-06 | **done** — all three rules observed failing |
| F0-08 | Husky + lint-staged + commitlint (Conventional Commits) | P0 | S | F0-06 | **done** |
| F0-09 | Pre-commit check rejecting images > 500 KB | P1 | S | F0-08 | **done** |
| F0-10 | Vitest config (node; jsdom project deferred to Phase 4) | P0 | S | F0-03 | **done** |
| F0-11 | Playwright config: chromium, webkit, mobile-chrome, against `out/` | P0 | M | F0-02 | **done** |
| F0-12 | CI workflow: typecheck, lint, test, build, export assertions | P0 | M | F0-01…11 | **done** — `.github/workflows/ci.yml` |
| F0-13 | `@axe-core/playwright` a11y job, both themes, zero violations | P0 | M | F0-11 | **done** |
| F0-14 | Lighthouse CI with budget assertions (3 runs, median) | P0 | M | F0-12 | **done** |
| F0-15 | `size-limit` per-route byte budgets | P0 | M | F0-12 | **done** — budgets derived from the built HTML |
| F0-16 | `scripts/check-links.mjs` over `out/` | P1 | S | F0-12 | **done** — `.mjs`, not `.ts`; see note |
| F0-17 | PR bundle-size diff comment | P2 | M | F0-15 | **done** — advisory, never fails the build |
| F0-18 | `.nvmrc`, `packageManager`, `engines`, `.npmrc` (corepack in CI with F0-12) | P0 | S | F0-01 | **done** |

**F0-07 acceptance:** a PR importing `@/features/blog/components/post-card` from
`features/projects` fails lint with a message naming the rule. **Verified** — all
three boundary rules (features→app, cross-feature deep, components→features,
lib/config→above) were made to fail against throwaway fixtures before the
fixtures were deleted. Note this required Biome **2.x**: 1.9's
`noRestrictedImports` accepts only exact module paths, no globs, so the rule
cannot express a layer boundary at all. [TECH_STACK.md](./TECH_STACK.md) §1
updated.

**F0-12…15 acceptance (the phase's real exit gate):** a deliberately bad PR — one
axe violation plus a 200 KB dependency — is blocked, and the failure output names
both problems. A gate never observed failing is not known to work.
**Verified — observed failing in CI, not reasoned about.** Branch
`chore/verify-ci-gate` (PR #5, never merged) carried a contrast-failing paragraph
and `moment` imported into a client component on Home. Run `30434780601`:

| Job | Result |
| --- | --- |
| Typecheck, lint, unit tests | pass |
| Build and export | pass |
| **Bundle budgets** | **fail** — `/ — JS` 124.7 kB against a 120 kB limit, "exceeded by 4.71 kB" |
| **E2E and accessibility** | **fail** — `axe violations on / in dark theme` *and* `in light theme`, each naming `color-contrast (serious)` and the selector |
| **Lighthouse** | fail — independently |

Both defects were named, separately, by the job responsible for each. The
`/404/` route stayed green throughout, which is the evidence that the per-route
budgets are per-route and not a single aggregate.

**The verification run also found a bug in the gate itself,** which is the
argument for doing it at all. `Bundle size diff` — documented as advisory —
*failed*, and on the passing PR it had posted no comment. Two causes: `pnpm size`
prints pnpm's run banner to stdout ahead of the JSON, so the redirected file
never parsed and the comment step returned early; and `size-limit` exits 1 over
budget, so the PR most in need of a size comment was the one guaranteed not to
get one. Both fixed by `pnpm exec size-limit --json … || true`. A gate that is
only ever observed passing is not known to work — and neither is one only ever
observed failing in the way you expected.

**F0-16 note.** The task named `scripts/check-links.ts`; it shipped as
`check-links.mjs`, matching `check-export.mjs` and `check-contrast.mjs`. A build
gate that needs a transpiler to run can be broken by the transpiler, and these
three scripts deliberately have zero dependencies. It checks **internal** links
only — a merge gate that fails because a third-party site is briefly down blocks
a merge for a reason unrelated to the change, and a gate that cries wolf gets
bypassed. External link rot stays a periodic manual sweep.

**F0-11/F0-13 note — the route manifest is a placeholder.** [TESTING.md](./TESTING.md)
§4 requires the specs to be data-driven from `config/nav.ts` so that adding a
route automatically adds it to navigation, a11y, and SEO coverage. That file is
F1-08. Until then `e2e/routes.ts` holds the list, in one place rather than
inlined per spec, so F1-08 is a one-import change. Coverage today is one route,
which is honest about what exists and not about what the suite will cover.
The `keyboard`, `contact`, `content`, and `seo` specs from TESTING.md §4 are not
written: they assert behaviour that does not exist yet. They arrive with L-14,
C-01, F1-11, and Q-01 respectively.

**F0-04 is resolved — option 1.** Every token whose name Tailwind v4 owns is now
prefixed `--ui-`, and `globals.css` bridges them with
`@theme inline { --color-bg: var(--ui-bg); … }`. `check-contrast.mjs` still
reported 96 pairs across 6 contexts at the time, all passing, which is the
evidence that the rename changed no value (M1 took it to 128 across 8 — see the
Phase 2 note above). Full reasoning, including the two details that are easy
to get wrong (`--ui-font-size-*` for the type scale, and why `inline` is
load-bearing), is in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2. The original
diagnosis is preserved below.

**F0-04's original diagnosis.** Phase 2 declared the
tokens in `:root` using the exact names Tailwind v4 reserves for its own theme
namespaces — `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--ease-*`,
`--leading-*`, `--tracking-*`, `--shadow-*`. The `@theme inline` bridge that
turns a token into a utility would therefore have to read
`--color-bg: var(--color-bg)`: both declarations land on `:root`, the variable
resolves to itself, and the utility emits nothing. `@theme inline` only works
when the source variable has a name Tailwind does not own.

Unblocking it meant renaming one side, which was a design-system decision rather
than a build fix. The options were recorded in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2.

**Known budget risk (for H-10) — now measured.** The skeleton reports ~106 KB
First Load JS with zero client components on the page. Measured properly under
`size-limit`, Home's real payload is **105 KB gz of JS and 4.9 KB gz of CSS**:
over the 75 KB target in [PERFORMANCE.md](./PERFORMANCE.md) §2, under the 120 KB
hard limit that CI enforces. It is Next's baseline runtime, not a regression, and
it leaves roughly −30 KB of headroom against the target before a single feature
is written. The consequences for Phase 5 are written up in PERFORMANCE.md §2;
H-10 owns closing or revising the gap. Note that the naive `size-limit` config
(a glob over `_next/static/chunks`) reports 236 KB, because Next emits Pages
Router chunks the App Router never loads — `.size-limit.cjs` derives each route's
entry from the served HTML instead, and the comment at the top of that file
explains why the glob version is worse than no budget.

### F1 — Content pipeline

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| F1-01 | MDX via `@next/mdx` with the full remark/rehype set | P0 | M | F0-01 | **done** |
| F1-02 | `rehype-pretty-code` (Shiki) build-time highlighting | P0 | M | F1-01 | **done** — 0 KB shipped, both themes via CSS vars |
| F1-03 | Zod schemas for posts, case studies, and typed records | P0 | M | F0-03 | **done** — posts + case studies; typed records with A-01 |
| F1-04 | Content loaders wrapped in React `cache()` | P0 | M | F1-03 | **done** |
| F1-05 | Draft and future-date filtering (prod vs dev) | P0 | S | F1-04 | **done** — acceptance not yet observed; see note |
| F1-06 | `pnpm content:validate` script | P0 | S | F1-03 | **done** — Vitest-filtered, not a standalone script; see note |
| F1-07 | Cross-reference validation (stack ids, tags, internal links) | P1 | M | F1-04 | **done** — M7, unblocked by A-01 |
| F1-08 | `config/site.ts` and `config/nav.ts` route manifest | P0 | S | F0-01 | **done** — E2E coverage now derives from it |
| F1-09 | Theme provider + pre-paint inline script | P0 | M | DS-03 | **done** — no React context; see note |
| F1-10 | Unit tests for schemas, loaders, and date/slug utilities | P0 | M | F1-03…06 | **done** — 39 tests |
| F1-11 | Fixture post rendering end to end | P0 | S | F1-01…04 | **done** |

**F1-05 acceptance:** a post with `draft: true` is absent from the index, feeds,
and sitemap in a production build, and visible with a DRAFT banner in dev.
**NOT YET OBSERVED.** The filtering and the banner are implemented and unit
tested, but there is no draft post in `content/` and no feeds or sitemap yet
(B-07, Q-03), so the acceptance criterion cannot be run end to end. It stays open
until a draft fixture exists and a production build is checked for its absence —
implemented is not the same as verified, and this is the F0-12…15 lesson applied.

**F1-06 note.** The task named a script; it shipped as a Vitest-filtered run
(`vitest run content.validate`) over `src/lib/content/content.validate.test.ts`.
The other gate scripts are dependency-free `.mjs` deliberately, but this one
validates against the *real* schemas and loaders, which are TypeScript behind the
`@/` alias. A standalone `.mjs` would have to reimplement them, and a copy of the
contract that drifts is worse than no check because it reports green while the
build fails. Vitest already resolves both and is already a dependency.

**F1-08 note.** `e2e/routes.ts` now derives from `config/nav.ts`, closing the
placeholder left by F0-11. Routes carry a `built` flag: the manifest is the
complete plan, and only built routes are asserted, so the suite is not
permanently red against pages that do not exist. Flipping `built` to `true` is
the last step of building a page.

**F1-09 note — no React context, deliberately.** The theme is a DOM attribute on
`<html>`; the pre-paint script sets it and the toggle mutates it. A context
provider would put a client boundary at the root — the single most likely
performance regression in this codebase (CLAUDE.md §5) — and would buy nothing,
because CSS already reads the attribute. The E2E a11y spec now drives the theme
by **clicking the real toggle** rather than setting the attribute, which is a
materially stronger test: a toggle that rendered but did nothing used to pass.

---

## Phase 4 — Core Layout & Navigation

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| L-01 | Root layout: fonts, providers, metadata defaults | P0 | M | F1-08, F1-09 | **partial** — shell and `main#main` done; fonts blocked by DS-04 |
| L-02 | Skip link (first focusable, correct `scroll-margin-top`) | P0 | S | L-01 | **done** |
| L-03 | Header with scroll condensation | P0 | M | L-01 | **done** |
| L-04 | Desktop navigation from the route manifest | P0 | S | L-03 | **done** |
| L-05 | Mobile sheet: focus trap, Escape, focus restore, `inert` background | P0 | M | L-03 | **done** |
| L-06 | Footer with the complete site map | P0 | S | F1-08 | **done** |
| L-07 | Theme toggle with accessible state announcement | P0 | S | F1-09 | **done** |
| L-08 | Lenis provider honoring its three hard rules | P1 | M | L-01 | **done** — all three rules are gates, each with a test that fails without it |
| L-09 | `LazyMotion` provider + `Reveal`/`Stagger` primitives with reduced motion | P0 | M | DS-08 | **in-progress** — `Reveal`/stagger built on `IntersectionObserver` + CSS, **not** Motion; see note |
| L-10 | `app/not-found.tsx` → `404.html`, focus to `<h1>` | P0 | S | L-01 | **done** |
| L-11 | `app/error.tsx` styled recovery boundary | P1 | S | L-01 | **done** |
| L-12 | Route-change focus management + polite announcement | P0 | M | L-01 | **done** — by not adopting a client router; see below |
| L-13 | Command palette (⌘K) as pure enhancement | P2 | L | L-04 | **done** — native `<dialog>`, not dynamically imported; see below |
| L-14 | E2E: navigation, keyboard, no-JS, a11y specs (manifest-driven) | P0 | M | L-01…12 | **done** — see note below |
| L-15 | Scroll progress rail, back-to-top, breadcrumb, page container | P1 | M | L-01, L-03 | **done** — three of the four ship zero JS; see below |

**Note (M4 landed, and Phase 4 is now complete).** L-01…L-07 and L-10…L-12 were
M4's whole scope in
[redesign/IMPLEMENTATION_PLAN.md](./redesign/IMPLEMENTATION_PLAN.md). L-09
arrived with M2's `Reveal`. L-08, L-14 and now **L-13 and L-15** have landed.
The only thing still open against Phase 4 is L-01's fonts half, which is blocked
on DS-04's licensing decision and not on this phase.

**L-13/L-15 — the shell completed, and the byte budget went DOWN.**

**L-13 was built twice, and the merge chose this one.** A second implementation
landed on `develop` first (PR #16): an always-mounted trigger (~0.47 KB gz) plus
a `lazy()`-loaded panel, with every row a `<button>` navigating via
`window.location.href`, and its acceptance folded into `e2e/keyboard.spec.ts`.
It was dropped whole at this merge — `command-palette-trigger.tsx`, its
`command-palette.tsx`, and its block in `keyboard.spec.ts` — in favour of the
version described below, on two grounds. First, rows that navigate are rendered
as real `<a>` here, so middle-click, ⌘-click and "copy link address" work and a
screen reader announces a link as a link; the button-plus-`location.href` shape
loses all four and only *looks* equivalent. Second, ranking lives in
`lib/commands.ts` as a pure function with unit tests, and ranking is the one
part of a palette that fails silently. The trade is real and is recorded
honestly: the dropped version deferred the panel off the initial payload, and
this one does not. That is the ~2.49 KB accounted for below, and
`command-palette.tsx` carries the marker for when splitting becomes correct
(PL-06, a search index).

The palette is a native `<dialog>` for the same reason the mobile sheet is
(L-05): `showModal()` supplies focus-in, trap, Escape, focus restore and an
inert background, so none of that is code that can regress. Its rows are real
`<a>` and `<button>` elements rather than `role="option"` — the ranker is a pure
function in `lib/commands.ts` with 13 unit tests, because ranking is the one part
of a palette that can be silently wrong, and `e2e/command-palette.spec.ts` covers
the shortcut, the toggle-closed case, filtering, Enter-to-first-result, the arrow
accelerator, the theme action, and the no-JS fallback.

**It is NOT dynamically imported**, which departs from
[redesign/PERFORMANCE_PLAN.md](./redesign/PERFORMANCE_PLAN.md)'s ~4 KB-on-first-⌘K
budget. That number assumed a combobox library and a Motion entrance; what
shipped is a dialog, one `useState` and a string matcher, and a loader chunk plus
a loading state would cost more than they defer. Measured cost of the whole
palette: **+2.49 KB gz on every route.**

The rail, the back-to-top button and the breadcrumb ship **zero JavaScript**.
The first two are CSS scroll-driven animations (`animation-timeline: scroll()`)
behind an `@supports` gate whose fallback is absence, not a frozen widget; the
back-to-top is an `<a href="#main">`, so it works with JavaScript off and reuses
the skip link's focus target. `PageContainer` is the one composition of
`Container` + `Section` every page repeats, and `/blog/` and `/blog/[slug]` now
use it instead of spelling out `mx-auto max-w-reading px-gutter py-section`.

**Two findings came out of building it, and both were budget bugs that predate
it.**

1. **`tailwind-merge` was 8.7 KB gz of Home**, pulled into the client bundle by
   `Reveal`'s `className={cn(className)}` — `cn` with a single argument, which
   merges nothing and differs from the bare value only in rendering `class=""`.
   It was the single largest item on the route, spent on a no-op.
2. The same trap caught the palette: `components/ui/icon.tsx` used `cn`, so the
   first Client Component to render an icon put `tailwind-merge` into the shared
   chunk of **every** route (+8.7 KB across the board, and Home 838 B over the
   gate). Both files now build their class strings directly and carry the
   reasoning.

**The rule this leaves behind: `cn` is free in a Server Component and expensive
in a Client Component.** It is worth checking before adding the next `'use
client'` leaf.

Net measured result, `pnpm build && pnpm size`:

| Route | Before | After | Δ |
| --- | --- | --- | --- |
| `/` — JS | 118.08 KB | **111.53 KB** | −6.55 KB |
| `/blog/`, `/blog/[slug]`, `/404/` — JS | 108.29 KB | **110.84 KB** | +2.55 KB |
| CSS, every route | 8.50 KB | **8.96 KB** | +0.46 KB |

Home's headroom against the 120 KB hard limit goes from **1.92 KB to 8.47 KB** —
so the note below that said "L-13's command palette is the next thing that will
not fit" is now resolved, and resolved by deleting bytes rather than by raising a
budget.

**Reconciled after the merge with H-01.** The table above and the H-01 table
further down each measured their own branch in isolation, and both are kept as
the record of what that change alone did. On the merged tree — this palette plus
the hero, with the superseded `develop` palette removed — `pnpm build &&
pnpm size` gives **110.92 KB gz JS and 9.04 KB gz CSS on every one of the four
routes**, home included: **9.08 KB of headroom** against the 120 KB hard limit.
Both branches removed `tailwind-merge` from the client bundle by different
routes, so the two reductions are the same bytes counted twice and do not add.
Gates re-run on the merge: `pnpm test` 112/112, `typecheck`, `lint`,
`check:export` (5 pages, 22 assets), `check:contrast` (128 pairs),
`check:links` (74 links) — all pass. **E2E and `pnpm lh` were not run on the
merged tree**; `ci.yml` is the gate that decides that, and the WebKit-on-Windows
caveat both branches document still applies here.

**Verification.** `pnpm test` 96/96, `pnpm typecheck`, `pnpm lint`,
`check:export`, `check:contrast` (128 pairs), `check:links` (73 links) all pass.
E2E: **122/122 green on chromium and mobile-chrome.** WebKit was **not run** —
the container this landed in has no WebKit build available, only Chromium — so
the three-engine claim rests on `ci.yml`, which is the gate that decides
mergeability. `pnpm lh` was likewise not run here.

**And deferring to CI paid, immediately.** The `ci.yml` run on the merge found a
real WebKit failure that no amount of local Chromium would have shown:
`command-palette.spec.ts`'s Escape assertion, 184 passed / 1 failed. **Safari
gives a focused text field first refusal on Escape** — its native
"revert the value" behaviour — and the palette focuses its search box on open,
so the key never reached the dialog's cancel step. `showModal()` handles Escape
in every other engine, which is exactly what made this invisible until a real
WebKit ran it.

This was **not** the WebKit-on-Windows focus-timing divergence the notes above
describe, and calling it that would have been the wrong read: it is a genuine
keyboard trap in Safari, where the palette could not be closed from the keyboard
at all. The corroboration is that `develop`'s independently written palette
failed the *identical* assertion, for the same reason, before it was superseded —
two implementations, one bug, one cause. Fixed by closing explicitly in the
dialog's existing `onKeyDown`; `command-palette.tsx` carries the reasoning,
including why it does not `preventDefault()`.

The direction of the caveat is now inverted and worth stating: this machine's
Windows WebKit passes the Escape test **both with and without the fix**, so it
gives false confidence here rather than false failures. `ci.yml`'s
`ubuntu-latest` WebKit is the only place this class of bug is observable.

axe coverage grew with the change: `e2e/a11y.spec.ts` now scans the command
palette **and** the mobile sheet while they are OPEN, in both themes. A closed
`<dialog>` is `display: none`, so every previous run walked straight past the two
densest pieces of markup on the site.

**One existing gate was narrowed, deliberately and visibly.**
`route-change.spec.ts`'s "carries no second live region" counted every
`[aria-live]` on the page; the palette's result count is a second one. Its stated
intent is that a *route change* must not be announced twice, and a live region
inside a closed dialog cannot fire on load or on navigation — it is not in the
accessibility tree until the reader opens it. The assertion now excludes live
regions inside a `<dialog>` and is unchanged for everything it was written to
catch: one added to the shell, a page, or any non-modal component still fails it.

**L-14 — the manifest-driven E2E set, verified rather than assumed done.**
`e2e/navigation.spec.ts`, `keyboard.spec.ts`, `no-js.spec.ts`, `a11y.spec.ts`,
`route-change.spec.ts`, `smooth-scroll.spec.ts` and `theme.spec.ts` had already
landed across earlier PRs (L-05, L-08, L-09, L-12) but the status here was never
flipped — a task can be finished in the code and still wrong in the backlog,
which is exactly the drift this file exists to prevent. `e2e/routes.ts` derives
`routes`/`contentRoutes` from `builtRoutes` in `config/nav.ts`, so
`navigation`, `no-js`, and `a11y` iterate the manifest rather than a hardcoded
list — closing the F0-11/F0-13 placeholder note. The `contact`, `content`, and
`seo` specs TESTING.md §4 also names are correctly out of scope here: they are
attributed to C-01, F1-11, and Q-01 respectively, and there is no page yet for
either to exercise.

Run against the real export (`pnpm build && pnpm test:e2e`): **chromium and
mobile-chrome are 76/76 green.** WebKit failed 5 of 38 locally, every failure a
focus-timing assertion (`toBeFocused()` after Tab/Enter, and one
`scroll-margin-top` poll) — never a missing feature, always the same shape.
This machine is Windows, and WebKit's Windows port is known to diverge from its
Linux build on exactly this class of timing. `ci.yml` runs the same suite on
`ubuntu-latest`, which is the gate that actually decides mergeability
(CLAUDE.md §15.3), and PR #15 is the observed run: **`E2E and accessibility`
passed clean**, all three projects, on the runner that matters. That confirms
the Windows-only diagnosis rather than assuming it — the same discipline
F0-12…15 already established, applied here to a suite instead of a gate.

That PR's Lighthouse job failed independently
(`largest-contentful-paint` 1857ms against an 1800ms hard limit, home page) —
unrelated to this change, which touched only this file, and left as a Q-07/H-10
finding rather than fixed here.

Home's remaining headroom was **1.92 KB** (118.08 KB against a 120 KB gate) when
this was written, and the L-12 note below is most of what that number cost.
**Superseded by L-13/L-15:** the palette landed and Home is now 111.53 KB with
8.47 KB spare, because 8.7 KB of `tailwind-merge` came out of the client bundle
in the same change. H-10 still owns the underlying "Next's baseline is most of
the budget" problem.

**L-08 — the three hard rules are gates, and each one is tested.**
[ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §5 ends "violating any one
removes Lenis from the project", so `e2e/smooth-scroll.spec.ts` is written as the
condition of the dependency rather than as a regression suite:

- **Reduced motion** and **touch** are gates on *constructing* the instance, not
  settings on it — `useReducedMotion()` and `useFinePointer()`, both live
  `matchMedia` subscriptions, so turning the preference on mid-session tears the
  instance down. The spec asserts that as a live toggle rather than as an
  absence, because "no Lenis class" also passes when the import is broken, the
  component is unmounted, or the class name is wrong. Proving it appears first is
  what makes the disappearance mean anything.
- **Rule 3** (find-in-page, keyboard scroll, scrollbar drag, `scroll-margin-top`)
  constrains the configuration. Lenis stays on its default `window` wrapper, so
  it smooths *velocity* over the real scroll position instead of translating a
  wrapper — the transform-based mode is what breaks find-in-page, and the spec
  excludes it by asserting a genuinely non-zero `window.scrollY` together with
  `transform: none` on `html`, `body` and `main`. `anchors` stays off: Lenis's
  own anchor handling re-eases the jump and ignores `scroll-margin-top`, and the
  skip link's `scroll-mt-header` is a P0 accessibility feature, not a
  convenience.
- **One CSS rule was mandatory, not cosmetic.** `globals.css` sets
  `html { scroll-behavior: smooth }`, and Lenis 1.3.25 no longer ships the
  `scroll-behavior: auto` override its older releases did (verified in the
  installed `dist`). Left alone, native smooth scroll and Lenis's per-frame
  `scrollTo` animate the same position at once and anchor jumps land short. The
  override lives in `motion.css`, scoped to `.lenis-smooth`.

**L-08's byte cost, measured both ways.** Home went 117.79 → **118.08 KB** gz:
0.29 KB, which is the client component, not the library. Lenis itself is 5.34 KB
gz in a chunk **no HTML references**, fetched from inside the effect after the
gates pass — so `size-limit` correctly never sees it, and the touch and
reduced-motion readers who are gated out never download it. The spec asserts both
halves of that (a script request after `load` on a fine pointer; none at all on
touch), because a green `size-limit` is not evidence about a lazy chunk —
[redesign/PERFORMANCE_PLAN.md](./redesign/PERFORMANCE_PLAN.md) §4 already says so.

Three things the shell decided, recorded here because a later reader will
otherwise mistake each for an oversight:

1. **The header and footer render only `built: true` routes**, so today they show
   Home and Blog. This is not a placeholder. `check-links.mjs` fails the build on
   an href with no file behind it, so a shell that linked the full manifest could
   not merge until every Phase 5–9 page existed. Flipping a route's `built` flag
   now adds it to the nav, the footer, the sitemap, and the E2E suite in one edit
   — see the note on `footerNavGroups` in `src/config/nav.ts`.
2. **"Condenses on scroll" is a surface change, not a height change.** A sticky
   header occupies normal flow, so shrinking it reflows the document under the
   reader's eye — a layout animation, against ANIMATION_GUIDELINES §"cheap", paid
   for out of the 0.02 CLS budget on every route. The header keeps its height and
   fades in a hairline instead; the only animated property is `opacity`.
3. **Nav links are plain `<a>`, not `next/link`** — see the L-12 note below,
   which turned this from a deferral into a measured decision.

**L-12 was built, measured, and reverted — and that is the finished state.**

The task reads "route-change focus management + polite announcement", which
presumes a client router. Both halves were built: `next/link` on every nav link,
a `RouteFocus` component moving focus to the new `<h1>` on `usePathname` change,
a `useEffect` closing the mobile sheet on navigation (client routing leaves it
open, trapping focus over the page just navigated to), and a spec proving the
focus landed. It worked.

Then `size-limit` failed. Client routing costs **+3.95 KB gz on every route** —
Home went 117.79 → 121.74 KB against a 120 KB hard limit. Budgets are not
negotiable to make a feature land (CLAUDE.md §15.3), so all of it came back out.

What is left is better than what was planned:

- **Focus** is the browser's. A document load starts the reader at the top with
  the skip link first, which is precisely what `RouteFocus` was recreating.
- **Announcement** is the document load itself. Next's client runtime ships its
  own announcer (`next-route-announcer` is in the framework chunk), so a second
  live region here would have announced one navigation twice, in two phrasings.
- **The sheet** closes because the document is replaced, so the effect that
  closed it is gone too.

Four moving parts deleted, 3.95 KB returned, and the behaviour is identical —
on a static export a navigation is a cache hit and a paint, so the transition
speed that was being bought is close to nothing.

`e2e/route-change.spec.ts` pins it. It asserts that navigation **is** a document
load, so reintroducing `next/link` for the transition fails the suite instead of
silently removing three guarantees. It drives the **footer** rather than the
header nav, because the primary nav is `hidden md:block` and the first draft
timed out under the mobile project — asserting nothing while looking green.

**L-09 note (M2) — `Reveal` does not use Motion, and the reason is measured.**
The task named a `LazyMotion` provider. Scroll reveal is the most-used animation
on the site — every section of every route — so building it on `whileInView`
makes Motion a dependency of every page (~16 KB gz) and pushes `'use client'`
high into the tree. It is instead one shared `IntersectionObserver` toggling one
CSS attribute: **0.14 KB measured**, no provider, and the animation lives
entirely in CSS.

That last part is a guarantee rather than an optimisation. The served HTML
carries no `opacity: 0`; the attribute that hides an element is added after
hydration and only to elements that are off-screen at mount. JavaScript
disabled, hydration failure, an observer that never fires, and reduced motion
all land on "content visible" — there is no code path that can strand an element
hidden. L-14's no-JS spec asserts it.

`LazyMotion` still arrives, at M5, for the four things that genuinely need
presence and layout animation: the mobile sheet, the command palette, filter
reflow, and the page cross-fade.

**The measurement that forced this, and that changes Phase 5's budget.** M2
mounted the first client component on Home and measured the route three times:

| Home contains | JS gz | Delta |
| --- | --- | --- |
| No client components | 105.40 KB | — |
| Aurora + grid + grain backdrop (pure CSS) | 105.40 KB | **0.00 KB** |
| \+ first client component | 115.19 KB | **+9.79 KB** |
| \+ second client component | 115.33 KB | **+0.14 KB** |

The 9.79 KB is React's client runtime, which Next omits entirely from a route
with no client components and includes in full the moment one appears. It is a
**one-time tax**, not per-component — but it is paid the instant the route has
any interactivity at all, and it cannot be deferred or lazy-loaded away.

> **Corrected at H-01, by measurement.** The paragraph above is wrong about
> *which* 9.79 KB. React's client runtime is real and is a one-time cost, but
> since M4 it has lived in the layout chunk that every route loads — which is
> why `/blog/` measured 108.72 KB with three client components on it while Home
> measured 118.51 KB with four. The difference was **`tailwind-merge`, pulled
> into the client bundle by `<Reveal>`'s `import { cn }`**. Probed on three
> builds: a client component with `useState` and no `cn` costs **0.27 KB**; the
> same component importing `cn` costs **9.37 KB**. See the H-01 note in Phase 5.
> The conclusion below — that the tax is paid by the first client component and
> cannot be lazy-loaded — does not survive that; the cost is per *import*, and
> `reveal.tsx` is the only client component in the codebase that has it.

Home's real floor is therefore **115.19 KB against a 120 KB gate: 4.81 KB for
all of the site's own client code**, not the ~15 KB previously assumed. H-10
inherits this. Its first consequence has already landed: the mobile sheet
(L-05, Radix Dialog, ~4.5 KB) leaves Home's initial payload and becomes a
dynamic import opened on first press.

**Amendment (M4).** That last sentence is obsolete, and in the cheapest possible
direction: L-05 shipped on the **native `<dialog>`**, so Radix Dialog was never
installed and there is nothing to dynamically import. The ~4.5 KB the plan was
budgeting for is 0 KB, and the focus trap, Escape handling, focus restoration
and background inertness are the browser's rather than a library's. The four
uses `LazyMotion` is still reserved for at M5 are now three — the sheet is not
among them.

**L-05 acceptance:** opening the sheet traps focus, Escape closes it, and focus
returns to the trigger — verified in the keyboard spec. **Met**, via a native
`<dialog>` + `showModal()` rather than a hand-rolled trap: the browser provides
the trap, Escape, focus restoration, and background inertness, and it gets the
cases a `keydown` handler misses (screen-reader virtual cursors, find-in-page).
Its trigger is hidden without JavaScript — `data-js-only`, see
`src/lib/progressive.ts` — because a button whose only behaviour is
`showModal()` is a dead control without it, and the footer site map is the
documented fallback. Both halves are asserted in `e2e/no-js.spec.ts`.
**L-08 acceptance:** Lenis is inactive under reduced motion and on touch;
find-in-page, Space/PageDown, and anchor links all still work. If any fails,
Lenis is removed.
**L-14 acceptance:** the no-JS spec passes — no element is stuck at `opacity: 0`.

---

## Phase 5 — Home

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| H-01 | Hero — LCP `<h1>` renders unanimated | P0 | M | L-*, DS-11 | **done** — see note below |
| H-02 | Proof strip (verifiable metrics) | P1 | S | H-01 | **done** — every figure computed and linked |
| H-03 | Featured projects, asymmetric, three | P0 | M | P-04 | **done** |
| H-04 | "What I do" — three capability blocks | P1 | S | H-01 | **done** |
| H-05 | Selected writing — three latest posts | P1 | S | ~~B-02~~ F1-04 | **done** — dependency corrected; see note |
| H-06 | Current focus section | P2 | S | H-01 | **done** — but reads `config/home.ts`, and `/now` reads `content/now.ts`; see H-12 |
| H-12 | Fold Home's current focus into `content/now.ts` | P2 | S | H-06, C-12 | **todo** — two copies of "what I am working on" exist today |
| H-07 | Contact CTA | P1 | S | H-01 | **done** |
| H-08 | `Person` + `WebSite` JSON-LD | P0 | S | F1-08 | **done** — declared on Home, referenced by `@id` elsewhere |
| H-09 | `scripts/generate-og.ts` (Satori + resvg) | P0 | M | F0-12 | **done** — `.mjs`, one card per exported page |
| H-10 | Home performance pass to budget | P0 | M | H-01…09 | **partial** — under the hard limit, over the 75 KB target; see below |
| H-11 | Hallway test with five readers | P1 | S | H-10 | **blocked** — needs five humans, which is not something CI can supply |

**H-01 acceptance:** the LCP element is text, is not animated, and LCP ≤ 1.5s on
the mobile profile. **First two met, third not verified here** — see below.

---

**H-01 — the hero, and the measurement that changed Phase 5's budget.**

`design/hero.html` built as components: eyebrow, the mega `<h1>`, the lede, two
actions, over the static aurora/grid/grain backdrop. It is the first page on the
site to consume the DS-13 component layer (`Section`, `Container`, `Stack`,
`Heading`, `Text`, `Button`), which is what that layer was waiting for.

**Every part of it is a Server Component**, so the section carrying the site's
argument costs zero bytes of JavaScript. The `<h1>` ships at full opacity in the
served HTML and is inside no `<Reveal>`: it is the LCP element by design and
PERFORMANCE.md §4 does not permit animating it. Measured directly with a
`PerformanceObserver` against the served export: the LCP element is
`h1#hero-heading`, text, unanimated. The **≤ 1.5s mobile figure is not
verified** — see the Lighthouse note below.

**HOME'S HEADROOM IS 11.28 KB, NOT 1.45 KB, AND THE DOCUMENTED CAUSE OF THE GAP
WAS WRONG.** Home measured 118.51 KB gz going in and **108.72 KB gz** coming
out — a 9.79 KB *reduction* from a commit that added a page. The cause is not
the hero: it is the placeholder `<Reveal>` that came out of `app/page.tsx` with
it.

That 9.79 KB has been attributed since M2 to "React's client runtime, a
one-time hydration tax paid the instant the route has any interactivity"
(redesign/PERFORMANCE_PLAN.md §1, and the L-09 note above). **That attribution
is wrong**, and three probe builds on this branch say so:

| Home additionally contains | JS gz | Delta |
| --- | --- | --- |
| Hero only, no page-level client component | 108.72 KB | — |
| \+ a client component with `useState` and no `cn` | 108.99 KB | **+0.27 KB** |
| \+ a client component importing `cn` | 118.09 KB | **+9.37 KB** |
| \+ `<Reveal>` (which imports `cn`) | 118.51 KB | +9.79 KB |

**It is `tailwind-merge`, reaching the browser through `lib/cn.ts`.** React's
client runtime is genuinely a one-time cost, but it has been in the *layout*
chunk since M4's shell and is therefore already paid by every route — which is
why `/blog/` sat at 108.72 KB with three client components on it while Home sat
at 118.51 KB with four. The extra 9.37 KB was one import. A client component
that does not call `cn` costs 0.27 KB, which is the number the plan should have
been budgeting against all along.

`reveal.tsx` is the only client component in the codebase that imports `cn`
(verified by grep across every `'use client'` file), which is exactly why Home
alone carried the cost and no other route did.

**This is H-10's finding, not H-01's fix.** Nothing here changes `cn`, and the
right answer is not obvious — `cn`'s configured `extendTailwindMerge` exists to
stop `cn('text-h1', 'text-text-muted')` silently dropping the size, so deleting
it is not free. The options (a client-safe `clsx`-only variant for client
leaves; static class strings in client components; accepting the cost once and
sharing it) belong to H-10 with the rest of the budget decisions. What changes
today is that the number is measured and its cause is named, instead of being
carried forward as an unavoidable floor.

**What is NOT in the hero, and why.** `design/hero.html` shows a four-metric
proof strip under the actions. That is **H-02 and it is deliberately absent**.
WEBSITE_STRUCTURE.md §4.1 requires each metric to be "verifiable elsewhere on
the site", and nothing on this site verifies anything yet — no case studies, no
experience record. "11 years / 14 systems" under a real person's name with
nothing behind it is the category of placeholder
[redesign/IMPLEMENTATION_PLAN.md](./redesign/IMPLEMENTATION_PLAN.md) §7 refuses
outright, and the `noindex` on this branch is not a sufficient guard against it
being read as real. H-02 unblocks with A-01 or P-14.

**The two hero actions resolve through the route manifest.** §4.1 specifies
"View Projects" and "Get in touch"; `/projects/` is Phase 7 and `/contact/` is
Phase 9, both `built: false`, and linking either today fails `check:links`. So
`config/home.ts` holds four candidates in priority order and
`resolveHeroActions` takes the first two that exist — the same `built`
narrowing the header, footer, palette and sitemap already use. Today that
renders Writing and GitHub; the day `/projects/` flips to `built: true` it takes
the primary slot with no edit to the hero. The last candidate is external and
therefore ungated, which is what makes it structurally impossible for the hero
to render zero actions and leave the page a dead end (§3).

**The `<h1>` is the role, not the name.** `staticRoutes` for `/` changed from
"Rahul Rocket" to "Full Stack Software Engineer & Software Architect" in the
same commit. The name is the eyebrow, and is still the wordmark, the `<title>`
and the footer; a page's heading should be its subject. `heroHeadingText` in
`config/home.ts` is the only place the string is composed, and `home.test.ts`
pins it against both the manifest (which `e2e/navigation.spec.ts` asserts as the
page's `<h1>`) and `site.role` (which the `<title>` template is built from) —
three consumers that are each invisible when they drift.

**Three tokens added, none of them arbitrary values in the markup**
(DESIGN_SYSTEM.md §5): `--width-headline` (16ch) caps the mega heading so
`text-wrap: balance` produces a deliberate shape; `--width-lede` (56ch) is the
scanned measure, tighter than the 72ch reading measure; `--hero-min-height`
(85svh) is WEBSITE_STRUCTURE §4.1's "never 100vh" rule given a name, in `svh`
so a retracted mobile URL bar cannot remove the content edge it exists to
guarantee. All three bridge through `@theme inline` and were verified emitting
`var()` rather than a frozen value in the built CSS.

**Gate run.** `typecheck`, `lint`, `test` (99, up from 83), `build`,
`check:export`, `check:links` (52 links), `check:contrast` (128 pairs × 8
contexts), `size` — all pass. `test:e2e` **45/45 on chromium and 45/45 on
mobile-chrome**, including axe on `/` in both themes against the new hero.
**WebKit was not run**: its binary is not installed in this container. CI's
`ubuntu-latest` runner is the gate that decides mergeability.

**`pnpm lh` fails, on every route, and did before this change.** Median LCP
across two full runs sits at 1802–1946 ms against the 1800 ms hard limit —
including on `/404.html`, a page with one heading and no content, which is what
makes it an environment floor rather than a page problem. Categories are
**99 / 100 / 100 / 100** and **CLS is 0.000** on all five URLs. This is the same
pre-existing finding L-14's note recorded (1857 ms on Home) and attributed to
Q-07/H-10; it is not introduced here and it is not fixed here. **H-01's ≤ 1.5s
mobile criterion is therefore unverified, not met** — the LCP element being
unanimated text is established; the timing is not.

---

**H-04…H-08 — four sections, one JSON-LD layer, and 0.69 KB.**

Home now carries five of §4.1's seven sections: hero, what I do, selected
writing, current focus, contact CTA. `src/app/page.tsx` holds the table of which
two are missing and why. **Every one of them is a Server Component.** The only
client code on the route is `Reveal`, which is why the whole milestone measured
**+0.69 KB gz** — 110.88 → **111.57 KB against the 120 KB hard limit**, CSS
9.04 → 9.07 KB. The other three routes did not move.

That number is the H-01 correction paying out. The version of the performance
plan that attributed 9.79 KB to React's hydration runtime would have predicted
this milestone could not fit; the real cost of a client component that does not
import `cn` is ~0.3 KB, and **five sections of Home fit inside what one
`import { cn }` used to cost.**

**H-05's dependency was recorded one phase too coarse, and it blocked nothing.**
The table said B-02 — the real `/blog` index with search and tag filtering — and
this section needs none of it. What it actually needs is the post loader
(F1-04), the post schema (F1-03) and a `/blog/` route to send the reader to, all
of which landed in Phase 3. The correction is recorded rather than quietly
fixed, because a dependency nobody re-reads blocks work that was never blocked;
it is the same class of error as C-12's route that three documents assumed and
nothing built. The section renders `getPosts().slice(0, 3)` — one post today,
three when three exist, and **nothing at all when there are none**, because a
section heading over an empty list reads as a rendering bug rather than as a
young site.

**H-02 and H-03 are `blocked`, not `todo`, and the distinction is the point.**
Both are blocked on *content*, not on layout:

- **H-02** requires each metric to be "verifiable elsewhere on the site"
  (WEBSITE_STRUCTURE §4.1). Nothing on this site verifies anything yet — no case
  studies, no experience record. It unblocks with A-01 or P-14.
- **H-03** needs `/projects/` (P-04) to link to; linking an unbuilt route fails
  `check:links`.

Neither is scaffolded with sample numbers. redesign/IMPLEMENTATION_PLAN.md §7
permits placeholder content everywhere except where it reads as a claim about a
real person, and "11 years / 14 systems" under this name with nothing behind it
is exactly that.

**H-04's copy carries a `proof` field, and that is the section's whole design.**
PERSONAL_BRAND §2 defines each pillar as a claim *plus* how the site proves it,
and §3's "numbers or nothing" rule means three adjectives in a grid would fail
review on the copy alone. Every block therefore ends with a pointer at something
checkable **today** — the site's own behaviour and its repository — and
deliberately none at the case studies or the experience record. `home.test.ts`
pins the three pillar names against PERSONAL_BRAND §2's table, asserts every
block has a proof line, and greps the copy for §3.3's banned self-descriptions.

**H-06's date is hand-authored, and that is C-12's acceptance criterion arriving
early.** `currentFocusUpdatedAt` is a constant. `new Date()` there would re-date
the section on every deploy and claim maintenance nobody did — and `/now` (C-12)
is this section with a URL, so it inherits the rule along with the data. A stale
date is the correct failure mode: it is true, and it is visible.

**H-07 resolves one action today and two after Phase 9.** Same manifest gate as
the hero, generalised into `features/home/lib/actions.ts` (renamed from
`hero-actions.ts`; three sections now share the rule). The CTA's candidate list
is deliberately shorter than the hero's — a closing call to action exists to
make one next step obvious, and padding it back to two with whatever route
happens to be built recommends nothing.

**H-08 emits two objects that reference each other, in one graph.** `WebSite`
and `Person` are both declared on `/` and referenced by `@id` from every other
route, built by typed builders in `lib/seo/structured-data.ts` with
`structured-data.test.ts` pinning the required fields — structured data fails
*silently*, so a missing `sameAs` or a relative `@id` has no other way of being
caught. They share `@id` constants so the graph link cannot drift.

**`WebSite` moved off the root layout, which is the one place SEO.md §5's table
is now wrong on purpose.** Every route emits exactly one
`<script type="application/ld+json">` carrying a `@graph`, because nodes in
separate script blocks cannot reliably reference each other — and a layout has
no way to add a node to the page's graph, so a tag there is necessarily a second
block. `e2e/seo.spec.ts` asserts one block per page, so putting it back fails
the suite rather than quietly halving the value of every `@id` on the site.

One omission remains deliberate and asserted: **no `SearchAction`** (the palette
navigates a fixed list; the site has no search index — PL-06). `knowsAbout` was
the other, and A-01 closed it: it now derives from the `primary`-depth entries
in `content/skills.ts` rather than being typed here, which was the whole reason
it was left out. `sameAs` derives from `site.social`, so it grows by one edit.
JSON-LD costs **0 KB of the JavaScript budget**: a `type="application/ld+json"`
script is data the browser never executes, which is also why it reaches a
crawler that runs no script.

**H-12 records the one duplication this milestone left standing.** Home's
current-focus section reads `config/home.ts` and `/now` reads `content/now.ts`,
so "what I am working on" is written down twice and the two can disagree within
one edit. Folding them needs a content-model decision rather than a move — the
`/now` records are strings under headed sections, and the Home section's items
carry a title, a body and a manifest-gated action — so it is a task rather than
a cleanup.

**Gate run.** `typecheck`, `lint`, `test` (141, up from 112), `build`,
`check:export` (5 pages, 20 assets), `check:links` (77 links),
`check:contrast` (128 pairs × 8 contexts), `size` — all pass.

**E2E: 124/124 on chromium and mobile-chrome, including axe on `/` in both
themes against all four new sections.** WebKit was **not run** — its binary is
not installed in this container, and the Chromium present is a different build
from the one `@playwright/test` 1.49.1 pins, so both projects were run against
the installed binary via a scratch config (`launchOptions.executablePath`); the
committed `playwright.config.ts` is untouched. `ci.yml`'s `ubuntu-latest` runner
is the gate that decides mergeability, and it is the only place the WebKit
class of bug L-13 found is observable.

**One intermittent failure is worth recording rather than burying.** The first
full run had `command-palette.spec.ts` "filters as you type" fail with the
palette's rows not present — the shortcut arrived before the dialog's key
handler was attached. It did not reproduce: 6 further runs of that spec passed,
and a second full 124/124 run was clean. A hydration race, not a regression, but
it is the shape of thing a heavier Home could widen, so it is named here rather
than treated as noise.

**`pnpm lh` still fails its LCP assertion, and this milestone was measured
against a baseline rather than assumed innocent.** Everything else passes:
categories **99/100/100/100** on `/` and **100/100/100/100** on the other four
URLs, **CLS 0.000 everywhere**, TBT ~65 ms, and `heading-order`,
`color-contrast`, `font-size` and `link-in-text-block` all green against the new
markup. Median LCP, three runs per URL, same container, before and after:

| URL | Before (hero only) | After (five sections) |
| --- | --- | --- |
| `/index.html` | 1853 ms | 1925 ms |
| `/404.html` — one heading, no content | 1775 ms | 1816 ms |
| `/blog/` | 1773 ms | 1773 ms |

**The 404 page moved 41 ms and this change does not touch it**, and the
per-run spreads overlap almost completely (Home 1784–1915 before, 1827–1934
after). So Home sits at 1850–1930 ms in this environment both before and after,
against an 1800 ms hard limit that an empty page also fails. That is the
pre-existing Q-07/H-10 environment finding recorded at L-14 and H-01, unchanged
here — **not** a regression this milestone introduced, and **not** something it
fixed. The baseline run is what makes that a measurement rather than a
reassurance.

**One design decision was made *by* the contrast gate rather than reviewed
against it.** The CTA's aurora sits on the page background, not inside a raised
panel. `check-contrast.mjs` composites the aurora over `--ui-bg` and
`--ui-bg-subtle` (its `bind` list) and has no context for aurora over
`--ui-surface`; painting the backdrop inside a `Surface` would have produced a
real background the gate cannot see — the identical shape to DS-12, which is
open against exactly that hole. So the section is a full-bleed band like the
hero, and every pair on it is one the script already checks. **The gap found at
L-06 changed a later design instead of being rediscovered by it**, which is what
an open, documented finding is for.

**H-10 acceptance:** Lighthouse ≥ 95/100/100/100; JS ≤ 75 KB gz.
**H-11 acceptance:** 4 of 5 readers name the role and primary stack after 30s
([GOALS.md](./GOALS.md) O1).

---

---

## M7 — Phases 5 through 9, and what is honestly still open

**Every route in the manifest is built.** `staticRoutes` went from two `built:
true` entries to thirteen in one change, which is the largest single edit that
array will ever take: Home, About, Projects, Projects/[slug], Experience,
Journey, Skills, Open Source, Uses, Résumé, Contact, Services, Now, Blog,
Blog/[slug], Blog/tags/[tag], and the 404. The export is 30 pages.

### Gate run, on the merged tree

| Gate | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass |
| `pnpm test` | **160 passed**, up from 112 |
| `pnpm build` | pass — 30 pages, 29 OG cards, 3 feeds |
| `pnpm check:export` | pass — including the new Q-02 `og:image` assertion |
| `pnpm check:links` | pass — **1,909 internal links across 30 pages**, up from 74 |
| `pnpm check:contrast` | pass — 128 pairs × 8 contexts |
| `pnpm size` | pass — every route inside its hard limit |
| `pnpm test:e2e` | **300 passed, 4 skipped** on chromium and mobile-chrome |
| `pnpm lh` | **categories pass, LCP fails** — see below |

**`pnpm lh` — 99/100/100/100 and one failing assertion, on every URL including
an empty one.** Median of three runs per URL, against the export:

| URL | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 99 | 100 | 100 | 100 | 2082 ms | 0.000 | 76 ms |
| `/about/` | 99 | 100 | 100 | 100 | 1974 ms | 0.000 | 68 ms |
| `/blog/` | 99 | 100 | 100 | 100 | 1817 ms | 0.000 | 70 ms |
| `/404/` | 99 | 100 | 100 | 100 | 1817 ms | 0.000 | 65 ms |
| `/404.html` | 100 | 100 | 100 | 100 | 1823 ms | 0.000 | 64 ms |

Every category clears its 95/100/100/100 target and CLS is **exactly zero** on
all five. The single failing assertion is `largest-contentful-paint` against the
1800 ms hard limit — **and it fails on `/404.html`, a page with one heading and
no content, by 23 ms.** That is what makes it an environment floor rather than a
page problem, and it is the same finding L-14 recorded at 1857 ms and H-01 at
1802–1946 ms, before any of this work existed. Home is 282 ms over on a page
that gained six sections; the 404 is 23 ms over on a page that gained nothing.

It stays open against Q-07/H-10 and it is **not** fixed here. The honest reading
is that this container's simulated throttling puts the floor within ~50 ms of
the limit, so the gate currently reports the environment as loudly as it reports
the page. Whether the right response is to measure on a quieter runner or to
revise the limit in PERFORMANCE.md §2 — with the reason, in the same PR — is a
decision, not a task.

One flake is worth recording rather than rounding away. On the first full run
`command-palette.spec.ts`'s theme assertion failed once under mobile-chrome; it
passed 3/3 in isolation and 300/300 on the next full run. It is a race between
that spec and `theme.spec.ts` over the same origin's stored preference under
parallel workers, not a product defect — but it is a spec that can report red
without a bug, which is the kind of thing that erodes a suite, and it should be
made deterministic before it does.

**WebKit was not run**: this container has Chromium only, and its build is a
revision ahead of the one Playwright 1.49.1 resolves, so even the two projects
above needed an `executablePath` override that is deliberately NOT committed.
`ci.yml`'s `ubuntu-latest` runner is the gate that decides mergeability
(CLAUDE.md §15.3), and it is the only place the WebKit-only class of bug —
the Escape trap L-13 found — is observable.

### Measured cost of the whole of Phases 5–9

| Route | Before (M6) | After | Δ |
| --- | --- | --- | --- |
| `/` — JS | 110.92 KB | **114.01 KB** | +3.08 KB |
| `/projects/[slug]` — JS | — | **115.65 KB** | new |
| `/blog/[slug]` — JS | 110.92 KB | **115.65 KB** | +4.73 KB |
| Every route — CSS | 9.04 KB | **10.71 KB** | +1.67 KB |

Home gained six sections for 3.08 KB, which is one `<Reveal>` per section at
0.14 KB and nothing else — every section is a Server Component. The 4.73 KB on
content routes is the table of contents, the code-block copy button and the
`ListFilter`, and it is the whole of the site's own client code on the heaviest
route. **Headroom against the 120 KB hard limit is 4.35 KB at its tightest.**

### M8 — the creative and UX pass

Home read as one left-aligned column of similarly sized text blocks, and the
measurements are the argument rather than a taste claim: at 1440px the hero type
occupied the left 45% of an 85vh section with the remaining 55% carrying nothing;
section headings sat at the `h2` step (24→34px) against a 128px hero and 18px
body, which is a scale with a hole in the middle of it; and the four figures the
site offers as its own evidence were set two steps below the size they deserved.

What changed, and what it cost:

| Route | M7 | M8 | Δ |
| --- | --- | --- | --- |
| `/` — JS | 114.01 KB | **114.75 KB** | +0.74 KB |
| Every route — CSS | 10.71 KB | **12.86 KB** | +2.15 KB |

The JS is `PointerEffects` plus the two hooks it revives; every other change on
this pass is a Server Component or a stylesheet. **Headroom against the 120 KB
hard limit is 3.74 KB at its tightest** (`/blog/[slug]`, 116.26 KB), which is
tighter than M7 and is the number to check before adding any client code.

Two things were declined rather than deferred, and both for the same reason:

- **The animated counter (inventory item 18) is cut.** A count-up needs the
  rendered text to differ from the accessible text for the length of the run.
  JavaScript rewriting `textContent` announces a stream of wrong numbers to
  anything watching the region; CSS `content: counter()` is not reliably exposed
  to the accessibility tree at all. `u-rise` buys the same "the number arrives"
  reading with the real text in the DOM throughout.
- **The pulsing availability dot is cut.** ANIMATION_GUIDELINES §10 blocks
  motion that runs before the reader has interacted for longer than 400ms, and a
  status indicator that pulses forever is the purest case of it. It ships as a
  static glow ring.

`--ui-spotlight-peak` was extracted so `check:contrast` can composite the
spotlight, which is the one effect on the site whose contrast nothing could see:
`.u-spotlight` isolates, so its `z-index: -1` layer paints between the panel fill
and the panel's text, and the peak lived inside a radial-gradient the script
cannot parse. Ten new contexts, 270 new assertions, all passing — but they were
not *known* to pass before.

**Still open after this pass, and unchanged by it:** the 75 KB JS target (the
gap is Next's ~105 KB baseline, not this site's ~10 KB of client code), DS-04
and DS-05, and every Phase 10–11 task that needs a human — a screen reader, a
real Android, six link-preview platforms, five hallway readers. Nothing on this
pass changes who has to do those.

### Three tasks that were done differently, and one that was cut

**A-06 — the timeline spine is CSS, not GSAP.** The task named a dynamically
imported ScrollTrigger scrub contributing zero bytes to Home. What it buys is a
line whose height tracks scroll position, which `animation-timeline: view()`
does natively at zero bytes on *every* route rather than zero on all but one.
GSAP is therefore still not a dependency, and the honest TECH_STACK §2 entry
would have had to argue for ~30 KB against fifteen lines of CSS. **P-09 is cut
for the same reason** — a scrubbed diagram draw-on is the only remaining
sanctioned use, and it is a P2 decoration on a page whose prose equivalent is
the source of truth. The `@supports` gate's fallback is a fully drawn spine, so
reduced motion, no JavaScript and an unsupporting engine all land on the
finished state — which is A-06's acceptance criterion, met more completely than
a scrub would have met it.

**B-06 — `CodeGroup` is an exclusive accordion, not a tab list.** A real
`role="tablist"` needs `aria-selected` and roving `tabindex` maintained against
arrow keys: JavaScript, on a content page, for a control most readers never
touch. The CSS-only radio-tab pattern that avoids the JavaScript announces a
radio group and does not associate panels with their controls at all.
`<details name="…">` gives exclusivity natively, is announced correctly, and
degrades to "all panels open" — a worse layout and a complete one.

**B-07 — the feeds are generated from the export.** Meeting "full content, not
truncated" needs the post's MDX rendered to HTML, and there is no way to get
that string inside the application: a route handler is server code, so importing
the compiled MDX yields a client reference rather than a renderable component.
The alternative was a second Markdown pipeline — four dependencies — producing a
*different* rendering of the same post, free to drift from the one readers see.
`scripts/generate-feeds.mjs` reads `out/blog/<slug>/index.html` instead, anchored
to an explicit `data-feed-content` attribute, and fails loudly rather than
shipping an empty entry. Zero new dependencies; the feed content is the page
content by construction.

**C-06 — there is no generated résumé PDF, and that is the criterion met rather
than skipped.** Its acceptance was "the PDF and the HTML cannot disagree,
because both render from `experience.ts`". A committed artifact has to be
produced, named, linked and kept in step: the page must link a filename that
will exist, which means either `check:links` runs against something `pnpm build`
does not produce — a gate that fails locally for a reason unrelated to the
change — or the export ships a 404 on the one page a recruiter clicks. Printing
the live page removes the artifact, the filename and the drift at once, and the
reader gets a real dialog with paper size and background choices that a fixed
PDF takes away. C-05's `print.css` is what makes the output clean.

### Two bugs the gates caught that review would not have

**Every table-of-contents link on every case study pointed at nothing.**
`rehype-slug` writes ids with `github-slugger`, which does NOT collapse
whitespace runs — "Challenges & Solutions" loses the ampersand and keeps both
spaces, so the id is `challenges--solutions`. A reasonable-looking
`.replace(/\s+/g, '-')` produced one hyphen. `check-links.mjs`'s fragment check
failed the build on all three studies at once. A fragment resolving to no
element is invisible in review, in a screenshot and in a normal build; it is
now pinned by `headings.test.ts`.

**Four routes failed axe in the light theme only.** The filter's result counts
used `--ui-text-subtle`, which is contracted at 3:1 — the LARGE-text bar — on
14px text that needs 4.5:1. This is the same class of failure the footer hit at
L-06 and is exactly what **DS-12 is still open against**: `check:contrast`
stayed green throughout, because the contract has no row for text on the subtle
role. The gate did its job; the token contract did not, again.

`check-links.mjs` also grew a fix of its own: it was treating a query string as
part of the path, so every URL-backed filter link (`/skills/?depth=primary`)
read as broken while being fine.

### What is honestly NOT done

1. **H-10 / Q-07 — the 75 KB target is unmet.** Every route is inside its 120 KB
   hard limit with at least 4.35 KB spare, and no route is near the target. The
   gap is Next's baseline runtime (~105 KB shared), not this site's code, which
   totals under 5 KB on the heaviest route. Closing it means changing framework
   or accepting the number in PERFORMANCE.md §2 — a decision, not a task.
2. **`pnpm lh` was not run here.** The pre-existing finding stands: median LCP
   sat at 1802–1946 ms against an 1800 ms hard limit *including on `/404.html`*,
   a page with one heading, which is what makes it an environment floor rather
   than a page problem. Unchanged and unaddressed by this work.
3. **DS-04 and DS-05** remain blocked on the typeface licensing decision. Note
   that H-09 now ships Inter as a *build-time* asset for the OG cards; that is
   not a typeface choice for the site and does not unblock DS-04.
4. ~~**DS-12** is still open and just cost four routes an axe failure.~~
   **Closed in the visual redesign** — see the DS-12 note in Phase 2.
5. **Q-06, Q-08, Q-09, Q-10, X-04, X-07, H-11** all require a human: a screen
   reader, a real Android device, six link-preview platforms, Windows High
   Contrast Mode, four browsers, an external reader, five hallway testers. None
   of them can be closed by a build, and claiming otherwise is the one thing
   this backlog exists to prevent.
6. **`site.indexable` is `false`, and that is an editorial gate, not an
   engineering one.** `content/experience.ts`, `journey.ts`, `about.ts` and
   `uses.ts` are drafted to the documented standard and are **not** the author's
   verified record; two of three case studies carry `needsReview: true` and say
   so on the page. The order of operations before launch is: replace those
   files, re-check every number, then flip one boolean. Nothing else changes.

## Phase 6 — About, Experience, Skills, Journey

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| A-01 | `content/experience.ts` + `journey.ts` + `skills.ts` authored | P0 | L | F1-03 | **done** — drafted, awaiting the author's own record; see below |
| A-02 | `/about` with the sticky facts rail | P0 | M | L-* | **done** |
| A-03 | `/experience` rendered from `experience.ts` | P0 | M | A-01 | **done** |
| A-04 | `/skills` with depth ratings and URL-param filtering | P0 | M | A-01 | **done** — fieldset of checkboxes, live count, no percentage bars |
| A-05 | `/journey` timeline as a semantic `<ol>` | P0 | M | A-01 | **done** |
| A-06 | ~~GSAP scrub~~ CSS scroll-driven spine | P1 | M | A-05 | **done, differently** — no GSAP; see below |
| A-07 | `OrganizationRole` / `hasOccupation` JSON-LD | P1 | S | A-03 | **done** |
| A-08 | About/journey prose written to editorial standard | P0 | L | — | **done** — drafted, awaiting the author's own words |

**A-04 acceptance:** filter state is in the URL, survives reload and back, and
result counts are announced in a live region. No percentage bars exist.
**A-06 acceptance:** GSAP is 0 bytes on the Home route; under reduced motion the
spine renders complete and static.

---

## Phase 7 — Projects & Case Studies

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| P-01 | Case-study frontmatter schema, incl. `metrics` and `stack` ids | P0 | M | F1-03 | **done** — `metrics[].method` is required |
| P-02 | `stack` id cross-validation against `skills.ts` | P0 | S | P-01, A-01 | **done** — with F1-07 |
| P-03 | `/projects/[slug]` with the twelve fixed sections | P0 | L | P-01 | **done** — sections are the MDX's, not a template's |
| P-04 | `/projects` index derived from frontmatter, asymmetric | P0 | M | P-01 | **done** |
| P-05 | Stack filtering via URL search params | P1 | M | P-04 | **done** — shared `ListFilter`, DOM-level |
| P-06 | Sticky TOC with `aria-current` | P1 | M | P-03 | **done** — `aria-current="location"`; see below |
| P-07 | Reading progress indicator | P2 | S | P-03 | **done** — the shell's rail, 0 KB (L-15) |
| P-08 | SVG diagram system: tokens, `title`/`desc`, prose equivalent | P0 | L | P-03 | **done** — `equivalent` is a required prop |
| P-09 | GSAP scrubbed diagram draw-on | P2 | M | P-08 | **cut** — see the A-06 note; not worth a dependency |
| P-10 | Metric row component (top + Outcome section, one source) | P1 | S | P-01 | **done** |
| P-11 | Per-project OG images | P1 | S | H-09 | **done** — with H-09, per exported page |
| P-12 | `Article` + `TechArticle` + `BreadcrumbList` JSON-LD | P0 | S | P-03 | **done** |
| P-13 | Prev/next by `order` | P2 | S | P-03 | **done** — no wrapping at either end |
| P-14 | **Write case study #1** | P0 | L | P-03 | **done** — this site; every claim verifiable in the repo |
| P-15 | **Write case study #2** | P0 | L | P-03 | **drafted** — `needsReview: true` |
| P-16 | **Write case study #3** | P0 | L | P-03 | **drafted** — `needsReview: true` |
| P-17 | Confidential-terms build assertion | P1 | S | P-01 | todo — no client is named anywhere yet, so there is nothing for it to assert against |

**P-14…16 acceptance (each):** passes the quality checklist in
[PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) §10 — Problem section longer
than the stack list, 2+ real options, an explicit "the cost of this was" sentence,
an honest retrospective, and a measurement method for every metric.
**P-08 acceptance:** every diagram is legible in both themes and has a prose
equivalent that stands alone with the image removed.

---

## Phase 8 — Blog

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| B-01 | Post schema with SEO-bound length constraints | P0 | S | F1-03 | **done** — landed with F1-03 |
| B-02 | `/blog` index with in-HTML search and tag filtering | P0 | M | B-01 | **done** |
| B-03 | `/blog/[slug]` with TOC and progress | P0 | M | B-01 | **done** |
| B-04 | Code blocks: copy button, keyboard-scrollable, labelled | P0 | M | F1-02 | **done** — 0 KB of highlighter, asserted |
| B-05 | Controlled tag vocabulary + `/blog/tags/[tag]` archives | P1 | M | B-01 | **done** — enumerated from tags in use, not the vocabulary |
| B-06 | MDX component set (Callout, Figure, CodeGroup, Diagram, Steps, Aside, Metric) | P0 | L | F1-01 | **done** — `CodeGroup` diverges; see below |
| B-07 | RSS, Atom, JSON feeds with full content and absolute URLs | P0 | M | B-01 | **done** — generated from the export; see below |
| B-08 | Per-post OG images | P1 | S | H-09 | **done** — with H-09 |
| B-09 | `BlogPosting` JSON-LD | P0 | S | B-03 | **done** |
| B-10 | `pnpm new:post` scaffold | P2 | S | B-01 | todo — P2, and the schema already rejects a malformed file, which is most of the value |
| B-11 | Footnotes with bidirectional links | P2 | S | B-06 | todo — `remark-gfm` supplies them; no post has needed one yet |
| B-12 | **Write four posts** | P0 | L | B-03 | **done** — four, each from work visible in this repository |

**B-04 acceptance:** the post page ships 0 KB of syntax highlighter; a code block
is reachable and scrollable by keyboard with an accessible name.
**B-07 acceptance:** all three feeds validate in a real reader; every URL is
absolute; content is full, not truncated.

---

## Phase 9 — Contact, Resume, Uses, Open Source

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| C-01 | `/contact` form → Formspree, with inline announced validation | P0 | M | L-* | **done** — and it now renders whether or not an endpoint is configured; see the note below |
| C-02 | `mailto:` fallback with pre-filled subject and body | P0 | S | C-01 | **done** |
| C-03 | Honeypot + time-to-submit anti-spam (no CAPTCHA) | P1 | S | C-01 | **done** |
| C-04 | `/resume` from the same data as `/experience` | P0 | M | A-01 | **done** |
| C-05 | `@media print` stylesheet | P1 | M | C-04 | **done** — `src/styles/print.css`, one file rather than `print:` utilities |
| C-06 | CI résumé PDF generation, versioned filename | P1 | M | C-04 | **superseded** — the reader prints the page; see below |
| C-07 | `/uses` | P2 | S | L-* | **done** — records rather than MDX; the `why` field is required |
| C-08 | `scripts/fetch-github-data.ts` (build time) | P1 | M | F0-12 | todo — `/open-source` renders without metrics rather than with a zero |
| C-09 | `/open-source` page | P1 | M | C-08 | **done** — empty sections are omitted, not rendered empty |
| C-10 | Nightly cron rebuild workflow | P1 | S | C-08 | todo — waits on C-08; nothing yet changes without a push |
| C-11 | `ContactPage` JSON-LD | P2 | S | C-01 | **done** |
| C-12 | `/now` — dated snapshot, `WebPage` + real `dateModified` | P2 | S | L-* | **done** — `dateModified` from the content file, never the build |

**C-01 acceptance:** errors are associated via `aria-describedby`, announced in a
live region, and never conveyed by color alone; focus lands on the status message
after submit.

**C-01 note — the form is no longer conditional, and the risk it was hiding from
was removed rather than accepted.** It used to render only when
`site.formspreeEndpoint` was set, because a form posting to nowhere silently
discards a message. With no endpoint the form is now a *composer*: identical
validation, and submitting hands the finished message to the reader's own mail
client with subject and body filled in. Nothing is transmitted by the page, so
nothing can be lost by it. The submit button says `Compose this message` rather
than `Send message`, a notice above it states the mechanism, and the button is
`data-js-only` in that mode only — with scripting off there is no `action` to
post to, so the pre-filled `mailto:` beside it is the whole offer, exactly as
before.

`e2e/contact.spec.ts` dropped both `test.skip`s in the process, which exposed a
latent bug in the spec itself: it built a selector as `#${describedBy}`, and
React's `useId` produces ids containing colons — legal HTML, illegal CSS
identifier. It had never run. That is the cost of a conditionally-skipped test
stated plainly, and it is the second entry for this pattern in this file.
**C-04/C-06 acceptance:** the PDF and the HTML cannot disagree, because both
render from `experience.ts`.
**C-12 acceptance:** `dateModified` comes from the content file's own `updated`
field and never from the build date — a `/now` that claims to have been updated
on every deploy is worse than no `/now`.

**C-12 note — a locked decision that had no owner for two milestones.** `/now`
appears in the redesign plan set's four locked decisions, in
[redesign/ROUTING_PLAN.md](./redesign/ROUTING_PLAN.md) §1–2 and in
[redesign/SEO_PLAN.md](./redesign/SEO_PLAN.md) §2 with its own schema — but it
was never added to [WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §1, never added
to `src/config/nav.ts`, and had no task here. Three planning documents assumed a
route that nothing was going to build.

Worth recording as a process finding rather than just fixing: the `built` flag on
the route manifest exists precisely to make "planned but not built" visible, and
it could not help, because the route was never *in* the manifest. **The manifest
only defends routes that reach it.** A locked route decision should land as a
`built: false` manifest entry the same day it is taken.

---

## Phase 10 — SEO, Performance, Accessibility & Cutover

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| Q-01 | Metadata audit on every route (title, description, canonical, OG) | P0 | M | all pages | **done** — one builder, asserted by `e2e/seo.spec.ts` |
| Q-02 | Build assertion: every `og:image` absolute and resolvable | P0 | S | Q-01 | **done** — check 6 in `check-export.mjs` |
| Q-03 | `sitemap.ts` + `robots.ts` with correct `lastmod` | P0 | S | F1-08 | **done** — `lastmod` is a real date or absent |
| Q-04 | `manifest.ts`, favicon set, maskable icons | P1 | M | DS-* | todo |
| Q-05 | JSON-LD validation in CI | P1 | M | Q-01 | **done** — parse + shape assertions in `e2e/seo.spec.ts` |
| Q-06 | Full manual a11y audit (NVDA, VoiceOver, 400%, high contrast) | P0 | L | all pages | todo |
| Q-07 | Performance tuning to budget on every route | P0 | L | all pages | **partial** — every route inside its hard limit; the 75 KB target is unmet, see H-10 |
| Q-08 | Real mid-range Android pass | P1 | M | Q-07 | todo |
| Q-09 | Link-preview verification on six platforms | P1 | S | Q-02 | todo |
| Q-10 | Windows High Contrast Mode pass | P1 | M | Q-06 | todo |
| Q-11 | `config/redirects.ts` + stub generation | P2 | M | F1-08 | todo |
| Q-12 | **Cutover PR** — ~~delete CRA~~ (done, M3a), replace workflow, switch Pages source | P0 | S | Q-01…09 | todo — scope reduced |
| Q-13 | Post-deploy smoke workflow | P0 | M | Q-12 | todo |

**Q-06 acceptance:** every item in [ACCESSIBILITY.md](./ACCESSIBILITY.md) §9 is
green, with findings recorded even where they were fixed.
**Q-12 acceptance:** production serves the new site, and the Pages source setting
was changed at merge time — the failure mode is "deploy succeeded, site
unchanged" ([DEPLOYMENT.md](./DEPLOYMENT.md) §11).

**Q-12 note (M3a) — one of its three steps is already done.** The legacy CRA
source (`App.js`, `index.js`, `Pages/`, `App.css`, `index.css` — 100 lines) was
deleted, along with the `tsconfig.json` excludes and the five Biome ignore
patterns that quarantined it. `src/` is now typechecked and linted with no
carve-outs, which is the direct evidence nothing untyped remains.

This did **not** touch `deploy.yml`, and it could not have affected production:
the workflow fires only on `master`. Note also that `deploy.yml` was *already*
broken for anything downstream of `develop` before this change — `develop`
carries the Next.js `package.json`, so `npm run build` emits `out/`, not the
`./build` the workflow publishes. Deleting the CRA source neither created nor
worsened that.

**The two remaining steps are still coupled and still the risk.** Replacing the
workflow without switching the Pages source setting at merge time produces a
green deploy and an unchanged site. See
[redesign/MIGRATION_PLAN.md](./redesign/MIGRATION_PLAN.md) §5.

---

## Phase 11 — Polish & Launch

| ID | Task | Pri | Cx | Depends | Status |
| --- | --- | --- | --- | --- | --- |
| X-01 | Micro-interaction pass against the §3 motion inventory | P2 | M | Q-* | todo |
| X-02 | Copy edit of every page, read aloud | P1 | M | Q-* | todo |
| X-03 | Empty and error states verified on every filtered view | P1 | S | Q-* | todo |
| X-04 | Cross-browser pass (Chrome, Firefox, Safari, Samsung Internet) | P1 | M | Q-* | todo |
| X-05 | Search Console verification + sitemap submission | P1 | S | Q-12 | todo |
| X-06 | `humans.txt` | P3 | S | — | todo |
| X-07 | External read-through by someone who is not the author | P1 | S | X-02 | todo |
| X-08 | Launch announcement | P2 | S | X-07 | todo |

---

## Shell and identity pass (M9)

Seven requested changes, landed together because five of them are the same
element seen from different angles: the top and bottom of every page.

| ID | Task | Status |
| --- | --- | --- |
| M9-01 | A brand mark in place of a plain-text wordmark | **done** — `components/brand/logo.tsx`, inline SVG, `currentColor` + one accent shape. Header hides the *name* below `sm` and never the mark; the footer keeps both |
| M9-02 | Command palette treatment | **done** — glass panel matching the header, blurred backdrop, per-group counts inside the heading, a query-echoing empty state, an `aria-hidden` keyboard legend, and `focus-visible` row fill |
| M9-03 | Centre the header navigation | **done** — `grid-cols-[1fr_auto_1fr]`; the nav is centred on the container, not between two unequal neighbours |
| M9-04 | Remove the build date | **done** — the footer signature is dateless; freshness is the `verify` job's job |
| M9-05 | Wider page for content, header and footer | **done** — `--width-container` 1200px → 1440px, one token, all three at once |
| M9-06 | A professional token pass across the site | **partial — read the note** |
| M9-07 | A contact form | **done** — see the C-01 note above |

**M9-02's one real fix, as opposed to its polish.** The rows had a hover
background and nothing else, so arrowing through the list moved focus with only
the default ring to show for it, over a translucent panel, on a full-width row.
`focus-visible:bg-surface-hover` gives the keyboard the same signal the pointer
already had. The rest of that row is decoration; this part was a defect in the
one interaction mode the component exists for.

**M9-06 is deliberately partial, and the missing half is a palette re-tune.**
What landed is the token *discipline* the request implies: the header trigger,
the palette panel and the contact page's secondary action were rebuilt on the
existing semantic roles (`glass`, `border-strong`, `accent-muted`, the pill
radius), and no hex, px or duration literal was added anywhere.

What did **not** land is a new colour ramp or type scale. That is not caution
for its own sake: `scripts/check-contrast.mjs` derives 1404 pairs across 52
contexts from the current roles, and every one of them passes today. Re-tuning
the palette means re-deriving those contexts, re-running axe on every route in
both themes, and editing [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2 in the same
change — a milestone, not a rider on a shell pass. Doing it by eye and shipping
it is precisely the "green gate about a palette that did not pass" failure this
file already records once, under DS-12.

---

## Post-launch (P3, unscheduled)

| ID | Task | Gate |
| --- | --- | --- |
| PL-01 | Custom domain migration | On desire; a one-string change |
| PL-02 | Additional case studies and posts | Continuous |
| PL-03 | `/speaking`, `/certifications` routes | 5+ substantial entries each |
| PL-04 | `/playground` interactive demos | Must not touch content-route budgets |
| PL-05 | Assistive-technology user testing | The largest stated gap in the a11y guarantee |
| PL-06 | Build-generated full-text search index | Client index > ~50 KB |
| PL-07 | Post series support | 3+ related posts |
| PL-08 | Host migration for real security headers | If headers or PR previews become important |
| PL-09 | Visual regression testing | If the project gains contributors |
| PL-10 | i18n | On a real need only |

## Summary

| Phase | Tasks | P0 | Complexity |
| --- | --- | --- | --- |
| 2 — Design system | 11 | 9 | M (8 done, 2 blocked, 1 awaiting choice) |
| 3 — Foundation | 29 | 25 | L |
| 4 — Layout | 14 | 11 | M |
| 5 — Home | 11 | 5 | M |
| 6 — About & experience | 8 | 6 | M |
| 7 — Projects | 17 | 10 | L |
| 8 — Blog | 12 | 7 | M |
| 9 — Contact & resume | 12 | 4 | M |
| 10 — Quality & cutover | 13 | 8 | L |
| 11 — Polish | 8 | 0 | M |
| **Total** | **135** | **85** | — |

## Maintenance

Status is updated in the PR that changes it, so the backlog and the code move
together. A task that is `blocked` names its blocker in the PR. New work is added
here before it is started — a task that exists only in a branch is invisible to
planning.

## Related

[ROADMAP.md](./ROADMAP.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) ·
[GOALS.md](./GOALS.md)
