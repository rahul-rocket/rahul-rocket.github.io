# CLAUDE.md

Development guide for Claude Code sessions in this app. This is the
condensed, operational version of `docs/`. When this file and a `docs/` file
disagree, **`docs/` wins** — and fix this file in the same change.

---

## 0. This app was moved into a monorepo

Everything below was written while this app was its own repository,
`rahul-rocket/rahul-rocket.github.io`. It now lives at `apps/web-v2` inside the
`rahul-rocket-v2.github.io` Turborepo monorepo, alongside a second, unrelated
Next.js app at `apps/web`. **The original repository still exists and still
serves the live site; it was not modified.**

The app itself is unchanged — same source, same content, same configs, same
`src/`-rooted `@/*` and `@content/*` aliases. What the move changed:

- **"This repository" below means this directory.** Every relative path still
  resolves, because the whole app moved together. Repo-root concerns now belong
  to the monorepo root, two levels up.
- **`pnpm dev` and `pnpm start` serve on port 3001**, not 3000. `apps/web` holds
  3000. The E2E port (4319) is unchanged.
- **`@types/react` and `@types/react-dom` are pinned to 19.2.18/19.2.4**, up from
  19.0.7/19.0.3. Both apps must carry the same version or this one fails to
  typecheck against two copies of the React types — the reason is in the root
  `AGENTS.md`. React itself is still 19.0.0 here.
- **Husky, commitlint, lint-staged, `.npmrc`, `.nvmrc` and the lockfile did not
  come along.** They were repo-root tooling; the monorepo root does not use
  husky or commitlint. Section 12's commit-message rules are therefore no longer
  machine-enforced — follow them by hand. The looser root `.npmrc` also means
  peer-dependency conflicts no longer fail the install.
- **The GitHub Actions workflows did not come along, so nothing here runs in CI**
  — not the E2E suite, not Lighthouse, not the export gates. Run them locally.
  There is no Pages deployment from this repo, and `site.url` still points at
  `https://rahul-rocket.github.io`; whoever decides where this app deploys next
  must update it in the same change.
- **Biome is still the formatter and linter here**, and the monorepo's Prettier
  and ESLint are configured to leave this directory alone.

---

## 1. What this repository is

The personal website of **Rahul Rocket** — Full Stack Software Engineer and
Software Architect. A statically exported Next.js site on GitHub Pages at
`https://rahul-rocket.github.io`.

**The premise:** a portfolio for an engineer must itself be evidence of
engineering ability. Every rule below exists because a violation would contradict
the site's own argument.

**Current phase:** **Phases 5 through 9 are built, and every route in the
manifest ships** ([docs/ROADMAP.md](docs/ROADMAP.md)). The export is 30 pages:
Home with all seven sections, About, Projects and case studies, Experience,
Journey, Skills, Open Source, Uses, Résumé, Contact, Services, Now, Blog with
search and tag archives, and the 404. Phases 2 and 3 remain as they were.

**Phase 4's shell has since had one pass over it (M9 in
[docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md)):** a drawn brand mark replaced the
plain-text wordmark, the desktop nav moved to the centre of a three-column grid,
the footer's build line is gone, the layout container went 1200px → 1440px, the
command palette was re-treated as glass over a blurred backdrop, and the contact
form now renders whether or not a form endpoint is configured. Each of those has
an entry in the consequences list below, because five of the six read as bugs to
anyone holding the previous shape in their head.

`src/config/nav.ts` went from two `built: true` routes to thirteen in one
change. **The manifest and the route map have converged**, which is the end of
the `built` flag's usefulness for this list and the beginning of its usefulness
for the next one.

**Home has been recomposed, and the shared piece is `SectionIntro`.** Six
sections each hand-assembled the same eyebrow-and-heading pair with three
different gaps between them; that component is the one copy, and it carries the
index numeral that tells a reader the page is a finite ordered argument. Section
headings moved from the `h2` step to the `h1` step — which is what `Heading`
splitting size from level was for — and the hero now runs a full-container
headline over a two-column row rather than a headline inside one. The right
column is a status panel read from `content/experience.ts` and `content/skills.ts`
at build time, so it cannot disagree with the pages it summarises.

**What is NOT done is in [docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md)'s M7
note, and it is worth reading before assuming a gap is a bug.** Briefly: the
75 KB JS target is unmet (every route is inside its 120 KB hard limit; the gap
is Next's ~105 KB baseline, not this site's ~5 KB of client code); DS-04 and
DS-05 are still open, and DS-12 is now closed; and every remaining Phase 10–11
task requires a human — a screen reader, a real Android, six link-preview
platforms, five hallway readers.

**The site ships `noindex`, and lifting it is an editorial decision rather than
an engineering one.** `site.indexable` in `src/config/site.ts` drives the robots
meta tag, `robots.txt` and the sitemap from one flag. It is `false` because
`content/experience.ts`, `journey.ts`, `about.ts` and `uses.ts` are **drafted to
the documented standard and are not the author's verified record**, and two of
three case studies carry `needsReview: true` and say so on the page. Replace
those files, re-check the numbers, flip one boolean. Nothing else changes.

**The shell is finished** — root layout, skip link, sticky header with a desktop
nav, a `<dialog>`-based mobile sheet, the footer site map, the theme toggle, the
404 and the error boundary (L-01…L-07, L-10…L-12), the Lenis layer (L-08), the
manifest-driven E2E set (L-14), and L-13/L-15's command palette, scroll progress
rail, back-to-top, breadcrumb and `PageContainer`. Only the palette and the
copy button ship JavaScript among those; the rail and the button are CSS
scroll-driven animations gated on `@supports`, whose fallback is absence rather
than a frozen widget. The only thing still open against Phase 4 is L-01's fonts
half, blocked on DS-04.

**Two palettes were built, and this one won.** An earlier L-13 on `develop`
split into an always-mounted trigger plus a `lazy()`-loaded panel; that pair was
dropped at the merge in favour of the version here, which renders navigation
rows as real `<a>` elements (middle-click, ⌘-click, "copy link address") and
keeps its ranking in `lib/commands.ts` as a pure, unit-tested module —
CLAUDE.md §7's rule, applied to the one part of a palette that can be *silently*
wrong.

**Home's sections were built twice as well, and `develop`'s won.** This branch
and H-04…H-08 landed independent implementations of what I do, selected
writing, current focus and the contact CTA. The merge kept `develop`'s — one
file per section, copy in `config/home.ts`, destinations resolved through
`features/home/lib/actions.ts`, and unit tests behind both — and kept only what
this branch added on top: the proof strip (H-02) and featured projects (H-03),
which needed the record layer and `/projects/` to exist at all. The combined
file that carried the five superseded sections is gone.

**Structured data is one module, and the root layout emits none.** The two
branches also each built a JSON-LD layer; `lib/seo/structured-data.ts` survives
because fifteen routes need `article`, `breadcrumb`, `itemList` and
`occupation`, and `lib/schema/`'s narrower `Person`/`WebSite` pair folded into
it — taking with it `sameAs` derived from `site.social`, `inLanguage` from
`site.lang` rather than `site.locale`, and the argument for `knowsAbout`, which
now derives from the `primary` skills in `content/skills.ts`. **Each route emits
exactly one `<script type="application/ld+json">`**, carrying a `@graph`;
`WebSite` and `Person` are declared on `/` and referenced by `@id` everywhere
else. That is why the layout has no JSON-LD despite `WebSite` being site-wide: a
layout cannot add a node to the page's graph, so a tag there would be a second
block, and nodes in separate blocks cannot reference each other reliably.
`e2e/seo.spec.ts` asserts one block per page.

**The design system's component layer** is `components/ui/`: 17 primitives over
the Phase 2 tokens, each one making a rule from
[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) unbreakable rather than
review-enforced (DS-13, §13 of that file). Nothing in it is a client component,
and a unit test now enforces that. Two deliberate deviations to know before
reaching for a package: the **icon set is vendored** (no `lucide-react`) and
`asChild` is a local `Slot` (no Radix).

Nineteen consequences that read as bugs if you do not know them:

- **Navigation is plain `<a>`, deliberately.** `next/link` was built and
  reverted: client routing costs +3.95 KB gz on every route.
  `e2e/route-change.spec.ts` asserts navigation is a document load, so
  reintroducing it fails the suite rather than silently removing the focus and
  announcement guarantees the browser currently provides for free.
- **`--ui-bg-subtle` is verified now, and DS-12 is closed.** It used to have no
  pair in the contrast contract, so `check:contrast` could not see a failure
  there — which cost four routes an axe failure in the light theme at M7. The
  visual redesign added nine rows (that role plus status-on-surface), re-tuned
  the light accent and the ink scale to make them pass, and the footer, `Section
  surface="subtle"` and the badge fill use it again. The separate trap is
  unchanged: `--ui-text-subtle` is contracted at the 3:1 **large-text** bar, so
  it is wrong on 14px text regardless of the surface — that is what `SubtleText`
  exists to prevent.
- **`lib/cn.ts` must not be imported by a Client Component.** It pulls
  `tailwind-merge` across the boundary: **9.37 KB gz**, against **0.27 KB** for
  a client component that does not. This was documented for three milestones as
  React's unavoidable hydration runtime; it is not. `src/lib/client-boundary.test.ts`
  now enforces it, because a rule already broken twice by people who knew it is
  a rule that needs a gate.
- **Neither GSAP nor Motion is installed, and the whole motion layer is CSS.**
  A-06/P-09 were GSAP's two sanctioned uses and both are `animation-timeline`
  behind an `@supports` gate whose fallback is a fully drawn line — 0 bytes on
  *every* route rather than 0 on all but one. The visual redesign's entrances,
  parallax, card lifts, button sheen and gradient type are seven keyframe blocks
  in `motion.css` and cost **0.04 KB of JS and 1.6 KB of CSS**; Motion with
  LazyMotion is ~16 KB gz against ~8 KB of headroom on Home. Full numbers in
  [docs/TECH_STACK.md](docs/TECH_STACK.md) §2.

- **One accent still, plus a decorative spectrum (DS-14).** Teal carries every
  meaning — links, focus, controls, current page. Indigo and violet exist only
  in gradients that carry none, and are deliberately **not bridged into
  Tailwind**, so `text-spectrum-2` does not exist. The reviewer's test: could a
  reader who sees this hue as grey miss something? Yes → it must be teal.

- **Each route sets a `tone`, and every tone is contrast-verified.** `work`,
  `writing`, `record`, `contact` rotate the page mesh's lead hue via
  `<PageBackdrop />`. `check-contrast.mjs` generates its 42 contexts from a
  `TONES` list — adding a tone to `surfaces.css` without adding it there is an
  unverified backdrop on a whole family of routes, and it fails silently.

- **The page backdrop is rendered by the page, never by the root layout.** A
  tone is a set of custom properties and properties inherit from *ancestors*; a
  backdrop mounted in the layout is a sibling of everything a page can annotate,
  so every route would render the default arrangement while the code read as
  though each had its own. `components/layout/page-backdrop.tsx` has the full
  account.

- **Entrance animations move `transform` only — never `opacity`.**
  `e2e/no-js.spec.ts` rejects any element under 0.05 opacity in the served page
  with scripting disabled, and it caught the redesign's first hero entrance: a
  conventional fade-and-rise, where `animation-fill-mode: both` holds the `from`
  state through the stagger delay and leaves four above-the-fold elements
  invisible at first paint. Dropping the fade fixed it at the source; the spec's
  `data-hover-reveal` opt-out would have been a lie.
- **The feeds and the OG cards are generated from `out/`, after the build.**
  `pnpm build` is `next build && generate-og && generate-feeds`. Both read the
  export rather than the source, so a feed entry is the page's own rendered
  content and a card carries the page's own validated title. Running `next build`
  alone leaves `check:export` failing on a missing `og:image`, which is the
  Q-02 assertion doing its job.
- **`content/` is reachable as `@content/*`**, a second path alias. The typed
  records live at the repository root beside the MDX (CONTENT_STRATEGY §2) and
  `src/` may not reach them with a relative escape (PROJECT_STRUCTURE §9).

- **`usePointerField` and `.u-spotlight` are wired now, and the wire is one
  component.** Both were written, documented and shipped with nothing calling
  either — two complete halves of an effect with no connection between them,
  which reads as finished in review. `components/motion/pointer-effects.tsx` is
  mounted once in the shell, renders nothing, and drives the spotlight and the
  magnetic lean for every route through `data-spotlight`, `data-magnetic` and
  `data-magnetic-field`. Elements that opt in stay Server Components. It tracks
  the pointed-at element by delegated `pointerover`, NOT by `elementFromPoint` —
  the latter forces a synchronous layout on every frame the pointer moves.
- **The spotlight paints between a panel's fill and its text, not behind both.**
  `.u-spotlight` sets `isolation: isolate`, and inside a stacking context a
  `z-index: -1` pseudo-element paints after the host's background and before its
  in-flow children. So it is a real backdrop for text, on hover, and neither
  `check:contrast` (which parses flat colours, not gradient stops) nor axe
  (which does not evaluate hover) could see it. `--ui-spotlight-peak` exists so
  the script can composite it; ten new contexts assert it.
- **The footer has no top margin, and that is the fix rather than the bug.**
  Every page's last `<Section>` already ends in `pb-section`; the footer used to
  add a second one, which at a desktop viewport is 288px of empty page on
  thirteen routes. Vertical rhythm belongs to the section wrapper
  (DESIGN_SYSTEM §5), and a page that starts with `spacing="none"` is the case
  to check if the footer ever looks tight.

- **The header wordmark is a drawn mark, and it lives outside the icon set.**
  `components/brand/logo.tsx` is the one file besides `components/ui/icons.tsx`
  that contains SVG geometry, deliberately: routing a brand mark through
  `createIcon` would give it the icon set's size steps and stroke weight, which
  is the one thing a mark must not inherit. In the header the *name* is
  `sr-only` below `sm` and the mark never is; the link keeps its accessible name
  at every width because the SVG is `aria-hidden`.
- **The header is a three-column grid, not a flex row.** The nav is centred on
  the container by construction (`1fr auto 1fr`), so it does not drift every
  time a control is added to the right-hand cluster. DOM order is still
  wordmark → nav → controls, which is both the visual and the tab order.
- **`--width-container` is 1440px and constrains layout, never measure.**
  Widening it widened the header, the footer site map and the card grids and
  left every reading column at `--width-prose`, because prose routes pass
  `width="reading"` to `PageContainer`. If a paragraph ever looks too long,
  the bug is a route asking for `page`, not this token.
- **The footer carries no build date.** It used to read "Built <date> · <sha>".
  Freshness is answered by the `verify` job in `deploy-pages.yml`, which fails
  when the live site is not serving the deployed commit — not by a line that
  reads as abandonment the first month nothing changes.
- **The contact form renders with no endpoint configured, and is a composer
  then.** `site.formspreeEndpoint` empty means submitting hands the finished
  message to the reader's own mail client rather than POSTing it: nothing is
  transmitted by the page, so nothing can be silently discarded by it. The
  button says "Compose this message" and is `data-js-only` in that mode only,
  because with scripting off there is no `action` to fall back to and the
  pre-filled `mailto:` beside it is the whole offer.

The first six are explained at length in
[docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md); the redesign's five are in
[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) §14 and
[docs/TECH_STACK.md](docs/TECH_STACK.md) §2.

`src/` holds only the new application (`app/`, `components/`, `config/`, `lib/`,
`styles/`). **The legacy Create React App source has been deleted** — `App.js`,
`index.js`, `Pages/`, `App.css`, `index.css`, 100 lines in total, whose entire
rendered output was one `<h1>` and one `<p>`. Its quarantine went with it: the
`tsconfig.json` excludes and the five Biome ignore patterns are gone, so `src/`
is now typechecked and linted with no carve-outs. Full account:
[docs/redesign/MIGRATION_PLAN.md](docs/redesign/MIGRATION_PLAN.md).

`pageExtensions` stays. Its original job — stopping `src/Pages/*.js` becoming
real routes — is done, but it still guarantees a stray `.js` can never silently
become a published route, and F1-01's MDX routing needs it.

**The cutover has happened.** `master` holds the Next.js application, and
`master` is the deployed branch: every push to it publishes to
`https://rahul-rocket.github.io` via `.github/workflows/deploy-pages.yml`. The
legacy CRA `package.json`, `deploy.yml` and `yarn.lock` are gone. This ran ahead
of the Phase 10 schedule once it was clear the legacy pipeline it was sequenced
around had never produced a successful run — there was no working live site
being protected.

**`develop` is the default branch and still where work lands.** It runs the full
CI gate and publishes nothing. Pushing to `develop` does not change the live
site; promoting `develop` to `master` does. The export ships `robots: noindex`
until there is real content behind every route — the branch it deploys from is
not an argument that it is ready.
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) §1, §2, §4, §7.

---

## 2. Read before you build

| Working on | Read first |
| --- | --- |
| Anything | This file, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| A component | [docs/UI_GUIDELINES.md](docs/UI_GUIDELINES.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) |
| Animation | [docs/ANIMATION_GUIDELINES.md](docs/ANIMATION_GUIDELINES.md) |
| A page | [docs/WEBSITE_STRUCTURE.md](docs/WEBSITE_STRUCTURE.md) |
| Content or MDX | [docs/CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) |
| Blog | [docs/BLOG_SYSTEM.md](docs/BLOG_SYSTEM.md) |
| A case study | [docs/PROJECT_CASE_STUDIES.md](docs/PROJECT_CASE_STUDIES.md) |
| Metadata | [docs/SEO.md](docs/SEO.md) |
| Build, CI, deploy | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md) |
| Adding a dependency | [docs/TECH_STACK.md](docs/TECH_STACK.md) §2 |
| Why the rebuild is shaped this way | [docs/redesign/](docs/redesign/README.md) — eight plans, deltas on the above |

**On `docs/redesign/`:** those documents record *intent* and the reasoning behind
it. Where one states a measured number, a file name, or an API and the repository
says otherwise, **the repository is right and the document is stale** — the
authority order is a fresh `pnpm build && pnpm size`, then
[docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md), then `docs/`, then
`docs/redesign/`.

---

## 3. Stack

Next.js 15 (App Router, `output: 'export'`) · React 19 · TypeScript strict ·
Tailwind v4 · Motion · Lenis · GSAP (2 sanctioned uses) · shadcn/ui (copied
source) · MDX + Zod · Biome · Husky + lint-staged · Vitest + Playwright ·
pnpm 9 · Node 22.

**Not used, deliberately:** any state manager, any data-fetching library,
Contentlayer, Prism, Storybook, a UI kit, analytics. Reasons in
[docs/TECH_STACK.md](docs/TECH_STACK.md) §3 — do not reintroduce them.

---

## 4. The static export constraint

**Read this before designing any feature.** There is no server. No API routes, no
middleware, no server actions, no ISR, no runtime image optimization, no custom
headers, no server-side redirects.

Consequences: every dynamic route must be enumerable at build time via
`generateStaticParams`; the contact form posts to a third-party endpoint with a
`mailto:` fallback; live data is fetched **at build time** by the workflow;
`trailingSlash: true` and `public/.nojekyll` are mandatory (their absence causes
a silent, total styling failure).

Check any feature idea against
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §7 *before* implementing it.

---

## 5. Architecture rules

**Layers, dependencies point downward only:**

```
app/         routes — thin: metadata, params, composition
features/    domain logic + domain UI — thick
components/  cross-domain UI (ui/, layout/, motion/, mdx/, seo/)
lib/ config/ primitives and constants — stable
```

| From | May import | Must not import |
| --- | --- | --- |
| `app/**` | anything | — |
| `features/x/**` | `components/`, `lib/`, `config/`, own files | another feature's internals, `app/` |
| `components/**` | `components/`, `lib/`, `config/` | `features/`, `app/` |
| `lib/`, `config/` | each other | everything above |

Cross-feature imports go through the feature's barrel (`@/features/projects`),
never a deep path. Enforced by Biome, not by good intentions.

**Feature-first, not type-first.** A change touches one directory. Duplication is
cheaper than the wrong abstraction — a component is promoted to
`components/ui/` only when it is used by 2+ features, has no domain vocabulary in
its props, and has a stable API.

**Server Components by default.** `'use client'` only for interaction state,
browser APIs, animation hooks, or providers — and pushed as **deep** as possible.
A client-marked layout pulling the tree into the bundle is the most likely
performance regression in this codebase.

---

## 6. Coding standards

**TypeScript.** `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
`any` is a blocker — use `unknown` plus a guard. Types derive from Zod schemas via
`z.infer` so schema and type cannot drift. No non-null assertions (`!`) without a
comment justifying them.

**Naming.**

| Thing | Convention |
| --- | --- |
| Files | `kebab-case.tsx` (case-insensitive filesystems; this is a Windows dev machine) |
| Components | `PascalCase` |
| Hooks | `use-kebab.ts` → `useCamel` |
| Types | `PascalCase`, no `I` prefix |
| Booleans | `is` / `has` / `can` |
| Handlers | `on` + event |
| CSS vars | `--ui-kebab-case`, semantic (`--ui-surface-raised`, not `--gray-800`). The `--ui-` prefix is required for any name Tailwind v4 owns — `--color-*` `--font-*` `--text-*` `--leading-*` `--tracking-*` `--radius-*` `--ease-*` `--shadow-*` — because `@theme inline` cannot bridge a variable to itself ([docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) §2) |

**Components.** Variants via `cva`, never boolean prop explosions. Props extend
the underlying element's props so `aria-*`, `data-*`, and `ref` pass through.
`asChild` (Radix `Slot`) for polymorphism. All five states defined: default,
hover, focus-visible, active, disabled.

**Imports.** `@/*` → `src/*`. Relative imports only within a directory. Order:
builtins → external → `@/` → relative → styles → types.

**Comments.** Explain *why*, never *what*. A comment restating the code is noise;
a comment naming the constraint that forced an odd choice is the most valuable
line in the file.

---

## 7. Design and UI

**Tokens only.** A hex code, a px value, or a duration written in a component is
a blocker. `text-[#3ab]` and `mt-[37px]` are blockers. If no token fits, the
token set is wrong — fix the token set.

**Semantic HTML before ARIA.** The first rule of ARIA is not to use ARIA. Links
navigate, buttons act, lists are lists (including card grids and timelines),
headings mean level and not size. `<div onClick>` is a blocker.

**Spacing is the parent's job.** Children carry no outer margins; parents use
`gap`. No fixed heights on text containers.

**Reserve space for everything.** Every image and embed has explicit dimensions
or `aspect-ratio`. Layout shift is a correctness bug — the CLS budget is 0.02.

---

## 8. Accessibility — non-negotiable

Target WCAG 2.2 AA, AAA for text contrast. Lighthouse a11y = 100 and zero axe
violations are merge gates.

- Every action is keyboard-operable; focus is always visible; `outline: none`
  without an equally visible replacement is a **hard blocker**.
- DOM order matches visual order. CSS reordering that changes reading sequence is
  a blocker.
- Skip link first in tab order on every page.
- Dialogs: focus in, trapped, restored to the trigger on close, background
  `inert`.
- Route change: focus to `<h1>`, announced politely.
- Body text ≥ 7:1 contrast, verified in **both** themes; never color alone.
- Everything works with JavaScript disabled. Reveal animations must never leave
  content at `opacity: 0` in the served HTML.

Automated tools catch ~30–40% of real issues. The manual checklist in
[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) §9 is where the guarantee comes
from — never present a green axe run as the whole story.

---

## 9. Animation

Four laws: it must **survive removal** (reduced motion shows the *finished*
state), be **fast** (≤ 150ms feedback, ≤ 400ms entrance), be **cheap**
(`transform`/`opacity` only), and run **once** (`viewport={{ once: true }}`).

- Every animation is on the inventory in
  [docs/ANIMATION_GUIDELINES.md](docs/ANIMATION_GUIDELINES.md) §3, or justified
  in the PR.
- `initial={reduced ? false : {…}}` — do not merely shorten the duration.
- Never animate the LCP element. The hero `<h1>` starts visible.
- No React state driven by scroll — use refs and CSS variables.
- GSAP: dynamically imported, 2 sanctioned uses, 0 bytes on Home.
- Banned: scroll-jacking, parallax on text, custom cursors, preloaders,
  typewriter headlines, logo marquees, animating body copy while it is read.

---

## 10. Performance budgets

| Metric | Target | Hard limit |
| --- | --- | --- |
| Lighthouse Perf / A11y / BP / SEO | 95 / 100 / 100 / 100 | Same — CI fails below |
| LCP (mobile, throttled 4G) | ≤ 1.5s | 1.8s |
| CLS | ≤ 0.01 | 0.02 |
| INP | ≤ 100ms | 200ms |
| JS gz — Home / blog / case study | 75 / 85 / 95 KB | 120 KB |
| Fonts total | ≤ 120 KB, 4 files | 120 KB |

**Never weaken a budget to make CI pass.** Raising one requires editing
[docs/PERFORMANCE.md](docs/PERFORMANCE.md) §2 in the same PR, with the reason.

**`cn` is free in a Server Component and expensive in a Client Component.** It is
clsx + `tailwind-merge`, and `tailwind-merge` is **8.7 KB gz** — it carries a
table of every conflicting Tailwind utility group. Importing it from anything
under `'use client'` puts it in the shared chunk of every route. This is not
hypothetical: it was the single largest item on Home, arriving through
`Reveal`'s `className={cn(className)}` — `cn` with one argument, which merges
nothing. `components/motion/reveal.tsx` and `components/ui/icon.tsx` now build
their class strings directly and both carry the reasoning. Check before reaching
for `cn` in a client leaf, and measure with `pnpm build && pnpm size` rather than
guessing.

---

## 11. Content

- Prose → MDX in `content/`. Records → TypeScript in `content/`. Never hardcoded
  in components.
- Everything passes a Zod schema at build time. Malformed content fails the
  **build**, not the page.
- Frontmatter length bounds are the SEO limits — that is deliberate.
- `stack` ids resolve against `skills.ts`; tags come from a controlled
  vocabulary. Unknown values fail the build.
- Identity lives only in `config/site.ts`.
- **Nothing is deleted at its URL.** Slugs are permanent; a rename needs a
  redirect stub.
- Never publish a confidential client detail. When in doubt, leave it out.

---

## 12. Git workflow

Conventional Commits, enforced by commitlint. Types: `feat` `fix` `content`
`docs` `style` `refactor` `perf` `a11y` `test` `build` `ci` `chore`.

Subject: imperative, lowercase, no period, ≤ 72 chars. **The body explains why.**
One logical change per commit. Squash merge; no direct pushes except prose typo
fixes and broken-deploy fixes.

**Two long-lived branches, and it matters which one you branch from.**

| Branch | Role |
| --- | --- |
| `master` | **Production, and the only branch that deploys.** Reached by merging `develop`, never by committing to it directly. Every commit on it reaches the live site. |
| `develop` | **Default branch and mainline.** Branch from it, PR into it. Runs the full CI gate; publishes nothing. |

Branch from `develop`, PR into `develop`. Publishing is the separate, deliberate
act of merging `develop` into `master` — which is the whole point of the split:
clearing the merge gate and deciding the result is worth serving are two
different decisions, and only `develop` lets them be separate.

**A change that is merged is not a change that is live.** If you have merged to
`develop` and the site has not changed, that is the system working as designed —
see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) §2.

Every commit message ends with the co-author trailer when authored in a Claude
Code session.

---

## 13. Commands

Available now:

```bash
pnpm dev               # dev server
pnpm build             # static export to out/
pnpm start             # serve out/ — the ONLY faithful preview
pnpm typecheck
pnpm lint / lint:fix
pnpm test
pnpm check:export      # assertions over out/ — run after build
pnpm check:contrast    # every semantic pair, every theme
pnpm check:links       # internal links AND in-page fragments over out/
pnpm size              # per-route gzip budgets over out/
```

Also available: `pnpm test:e2e` · `pnpm lh` · `pnpm content:validate` ·
`pnpm og:generate` · `pnpm feeds` · `pnpm size` · `pnpm check:links`.

**`pnpm build` is three steps, and the second two matter.** `next build`
produces the pages; `generate-og.mjs` writes one 1200×630 card per exported page
into `out/og/`; `generate-feeds.mjs` writes RSS, Atom and JSON from the rendered
posts. Running `next build` on its own leaves `check:export` failing on a
missing `og:image` — correctly.

**Always verify against `pnpm build && pnpm start`, never the dev server.** The
dev server hides `basePath`, trailing-slash behavior, the real 404, and
production bundling — precisely the four things that break on GitHub Pages.

---

## 14. Definition of done

Works on mobile and desktop · keyboard-operable with visible focus · correct
under reduced motion · works with JavaScript disabled · within budget · axe
clean · tested where [docs/TESTING.md](docs/TESTING.md) §1 warrants it · docs
updated if a decision changed · backlog status updated.

Full PR checklist: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) §5.

---

## 15. Rules for agent sessions

1. **Read the relevant `docs/` file before implementing in that area.** They
   contain the reasoning; this file contains only the conclusions.
2. **When a rule blocks the implementation, say so — do not route around it.** A
   silently violated constraint is discovered much later, usually by a reader
   rather than by CI. Pausing to raise it is always cheaper.
3. **Never weaken a gate to go green.** Not a budget, not an a11y rule, not a
   skipped test. A skipped test is a lie in the suite.
4. **No dependency without a [docs/TECH_STACK.md](docs/TECH_STACK.md) §2 entry**
   stating its justification, the rejected alternatives, and its byte cost.
5. **Deployment is `deploy-pages.yml`, and it is live.** Every push to `master`
   builds and publishes to `https://rahul-rocket.github.io`, `noindex`, with a
   `verify` job that fails if the live site is not serving the deployed commit.
   `develop` does not publish. Before changing anything in it, read
   [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) §4 and §7: the Pages **source
   setting** is a manual repository setting the workflow cannot set for itself,
   and a mismatch presents as "deploy succeeded, site unchanged" (§11).
6. **Update docs and the backlog in the same change** as the decision they
   describe.
7. **Prefer deleting to adding.** The most valuable contribution to this codebase
   is usually a removal.
8. **Report honestly.** If something is untested, say it is untested. If a check
   was skipped, say which. The site's entire argument is about engineering
   integrity; a session that overstates its own results undermines it directly.
