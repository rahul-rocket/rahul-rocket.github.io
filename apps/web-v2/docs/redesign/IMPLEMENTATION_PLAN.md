# IMPLEMENTATION PLAN

The build order for the premium rebuild. Fifteen milestones, each one commit,
each independently green.

---

## 1. What this actually is

**It is not a redesign.** The pre-rebuild `master` carries a legacy Create React
App site whose entire content was `<h1>Welcome to My Personal Website!</h1>` and
a one-line paragraph. That source is deleted (M3a); `develop` is a Next.js 15
static export, and since the deploy workflow was brought forward it is what
`https://rahul-rocket.github.io` actually serves, `noindex`, on every push.

So this plan is [ROADMAP.md](../ROADMAP.md) **Phases 4 through 9, built to a
higher visual specification than the original documents assumed.** Sized as the
roadmap sizes them, that is one **M** and four **L** phases — a substantial body
of work, not a single sitting. The milestones below are ordered so that the site
is deployable and green at every one of them, which is roadmap principle 1.

> **Written at Phase 3, read at Phase 4.** The paragraph above originally said
> the branch had "no `components/`, `features/`, `lib/`, or `content/`
> directories at all". Three of those four now exist. The milestone table in §3
> carries a status column for the same reason — a plan with no status is read as
> a description of the present, and this one stopped being that at M1.

### What is already built, and is good

Worth stating so none of it is rebuilt by accident:

- **The token layer.** OKLCH primitives, dark and light as separate designs, 128
  contrast pairs across 8 contexts verified green by `scripts/check-contrast.mjs`
  (96 across 6 before M1 — see §3's M1 entry for the arithmetic).
- **The Tailwind v4 bridge.** `@theme inline { --color-bg: var(--ui-bg) }`. The
  `--ui-` prefix is load-bearing — [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) §2
  explains the self-referencing-variable failure it exists to avoid.
- **A CI merge gate that has been observed failing.** PR #5 carried a deliberate
  contrast violation and a 200 KB dependency; `size-limit` named the route and
  the overage, axe named the rule and the selector, in both themes. That is a
  real gate.
- **Import boundaries enforced by Biome** (F0-07), all three rules observed
  failing before the fixtures were deleted.
- **Export assertions** for the four silent GitHub Pages failure modes.

---

## 2. The four locked decisions

Recorded in [README.md](./README.md) and not revisited:

1. Direction **B — "Instrument"** wins DS-11.
2. The animation guidelines are **honored, not weakened**. Three.js, typewriter
   headline, custom cursor, and animated blob field are **cut**, each with a
   named replacement.
3. Routes map onto the documented map; `/speaking`, `/achievements`, `/services`
   deferred; `/now` added.
4. Content is **placeholder and flagged as placeholder**.

---

## 3. Milestones

Each is one commit with a Conventional Commits subject. Each runs the gate in §5
before it is committed. `M` = a session, `L` = several.

| # | Milestone | Backlog IDs | Size | Status |
| --- | --- | --- | --- | --- |
| **M7** | Content pipeline: MDX, Zod, loaders, `content:validate` | F1-01…F1-06, F1-10, F1-11 | L | **landed** — before M1; F1-07 still open |
| **M1** | Design system: lock direction B, premium surface layer | DS-11, DS-05 | M | **landed** — DS-05 partial, DS-12 open |
| **M2** | Primitives: `cn`, hooks, reveal, pointer field | L-09 | M | **landed** |
| **M3** | Config: `nav.ts` manifest, theme provider, pre-paint script | F1-08, F1-09 | M | **landed** |
| **M3a** | Delete the legacy CRA source and its quarantine | Q-12 (part) | S | **landed** |
| **M4** | Layout shell: header, nav, sheet, footer, skip link, 404, error | L-01…L-07, L-10…L-12 | L | **landed** — L-08, L-13, L-14 still open |
| **M5** | Motion layer: magnetic, spotlight, counter, parallax | L-09 (ext), L-08 | M | **deferred into M6** — L-08 landed; see below |
| **M6** | **Home page** | H-01…H-08 | L | **in progress** — H-01, H-04…H-08 landed; H-02 and H-03 blocked on content |
| **M8** | Projects index + case studies | P-01…P-13 | L | todo |
| **M9** | Blog: index, post, tags, feeds, MDX components | B-01…B-11 | L | todo |
| **M10** | About, journey, skills, experience | A-01…A-07 | L | todo |
| **M11** | Open source, uses, now, resume, contact | C-01…C-12 | L | todo |
| **M12** | Command palette + search | L-13 | M | todo |
| **M13** | SEO: metadata, JSON-LD, sitemap, feeds, OG, `check-seo` | Q-01…Q-05 | M | todo |
| **M14** | Performance + accessibility pass to budget | Q-06, Q-07, H-10 | L | todo |
| **M15** | E2E expansion, manifest-driven, both themes | L-14 | M | todo |

**M5 is dissolved into M6 rather than run before it, and that is a dependency
correction, not a schedule slip.** L-08 (Lenis) landed with Phase 4. What
remained of M5 was four client components — magnetic, spotlight, counter,
parallax — and every one of them exists only to be used by a Home section.
Building them first would mean writing four components with no call site, in
violation of TECH_STACK §2's "a component sitting unused in `ui/` is deleted",
and spending Home's remaining JavaScript budget on them *before* knowing which
sections survive H-10's cut.
[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §8 already says the
choice "should be made at M6, not discovered by a red build" — so each of the
four now arrives with the section that needs it, or does not arrive.

**M7 is listed first because that is where it ran, and the original order was
wrong.** It was written as milestone seven, after Home. But M7's backlog IDs are
all `F1-*` — Phase 3 content-pipeline work — and M6's Home depends on them
directly: H-05 ("Selected writing — three latest posts") cannot exist without the
post loader, and `/blog` cannot exist without the MDX route. The ordering in the
first draft would have blocked on itself at M6. It shipped in dependency order
instead, and the table now records that rather than the intent.

The remaining numbers are kept as originally assigned rather than renumbered:
they are cited by ID in the backlog, in commit bodies, and in four other
documents in this directory, and renumbering to make a table look tidy would
invalidate all of it.

**Not in scope, deliberately:** Q-12, the cutover PR. That is the one step that
replaces the live site, it depends on real content existing, and it requires a
GitHub Pages source setting to change at merge time — [DEPLOYMENT.md](../DEPLOYMENT.md)
§11 names "deploy succeeded, site unchanged" as the failure mode. It stays a
separate, deliberate PR.

### M1 — Design system

Lock direction B. Delete `[data-direction="editorial"]` and `="signal"` from
`themes.css` and the `--sand-*` / `--ochre-*` / `--violet-*` primitives from
`tokens.css`. Add `src/styles/surfaces.css` — glass, aurora, grain, glow,
gradient hairline, spotlight. Add `--ui-font-size-mega` and `--ui-tracking-mega`.
Add the `size-adjust` fallback face. Extend `check-contrast.mjs` with alpha
compositing and the three new contexts.

**Exit:** `pnpm check:contrast` passes with every semantic pair verified against
the composited backdrops, including text on aurora peak and on glass over aurora.

**Met — 128 pairs across 8 contexts, all passing.** The exit criterion originally
read "≥ 99 pairs across 9 contexts", and both numbers were arithmetic errors
worth keeping visible because they are the easy ones to make here. Contexts are
declared **per theme**, so the three new composited backdrops are six context
entries, not three; and locking direction B *deleted* four contexts (Editorial
and Signal, dark and light). 6 − 4 + 6 = 8. Pair count rose with them, 96 → 128.
A "≥" on a count that a deletion can legitimately lower is the wrong shape of
assertion in any case — the script's own pass/fail is the gate, not its total.

### M2 — Primitives

`lib/cn.ts`, `use-reduced-motion`, `use-media-query`, `use-pointer-field`,
`use-reveal`, and `components/motion/reveal.tsx` + `stagger.tsx`. Dependencies
added: `clsx`, `tailwind-merge`, `class-variance-authority` — each gets a
[TECH_STACK.md](../TECH_STACK.md) §2 entry with its byte cost, per
[CLAUDE.md](../../CLAUDE.md) §15.4.

**Exit:** a page using `<Reveal>` renders its content visible with JavaScript
disabled; unit tests cover `cn` and the hooks' gating logic.

### M3 — Config and theme

`config/nav.ts` (F1-08) with all 16 routes. `e2e/routes.ts` becomes a re-export
of it, closing the placeholder note in the backlog. Theme provider (~50 lines,
no `next-themes`) plus the pre-paint inline script — the one sanctioned
render-blocking inline script on the site.

**Exit:** no theme flash on a hard reload in either theme; `data-theme` resolves
before first paint; E2E covers all 16 routes automatically.

### M4 — Layout shell

The floating glass header, five-item primary nav, mobile sheet with focus trap,
footer sitemap, skip link, theme toggle, back-to-top, route announcer,
`not-found.tsx` → `404.html`, `error.tsx`.

**Exit:** keyboard-only navigation of the shell is complete; axe clean in both
themes on a served `out/`; the 404 works on the real export; content present with
JavaScript disabled.

### M6 — Home

The one that carries the site's argument. Hero with the **unanimated `<h1>`**,
aurora backdrop, proof strip with counters, three asymmetric featured projects,
capability grid, selected writing, current focus, contact CTA, code editor,
`Person` + `WebSite` JSON-LD.

**Exit:** Lighthouse ≥ 95/100/100/100 on the mobile profile; JS within the hard
limit with its real measured number recorded in
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §2; LCP is the `<h1>` text.

**H-01 has landed** — the hero, as a Server Component, over the static backdrop.
Two of the three exit conditions have moved: LCP **is** the `<h1>` text, verified
with a `PerformanceObserver` against the served export rather than asserted; and
Home's real measured number is **108.72 KB gz, 11.28 KB under the hard limit**,
recorded in §2 of the performance plan. The Lighthouse condition is untouched
and cannot be claimed — `pnpm lh` currently fails its LCP assertion on every
route including the 404 page, which is the pre-existing Q-07/H-10 finding.

**The 9.79 KB that Home just gave back is the more important result**, because
the reason it existed was documented wrongly. It was never React's hydration
runtime; it was `tailwind-merge` reaching the client through `lib/cn.ts` in the
one client component that imports it. §1 and §2 of the performance plan are
corrected against the probe builds, and [TASK_BACKLOG.md](../TASK_BACKLOG.md)'s
H-01 note carries the table.

**H-04…H-08 have landed, and Home now carries five of the seven sections.**
"What I do", selected writing, current focus, the contact CTA, and the
`Person` + `WebSite` JSON-LD pair. Every one is a Server Component; the whole
milestone cost **+0.69 KB gz** (110.88 → **111.57 KB**, 8.43 KB of headroom),
which is the H-01 correction paying out — five sections of Home fit inside what
one `import { cn }` in a client leaf used to cost.

**Two of the seven sections did not ship, and both are blocked on content
rather than deferred.** The proof strip (H-02) needs metrics that are
"verifiable elsewhere on the site" and nothing on this site verifies anything
yet; featured projects (H-03) needs `/projects/` to link to. Neither is
scaffolded with sample data, which is §7 of this document applied rather than
quoted. `src/app/page.tsx` carries the table.

**The exit criteria stand where H-01 left them.** LCP is still the `<h1>` text
and the measured JS number is recorded in
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §2. The Lighthouse condition is
still unclaimable: `pnpm lh` fails its LCP assertion on every route including
the 404, which is the pre-existing Q-07/H-10 environment finding and is not
introduced or fixed here.

---

## 4. Dependencies to be added

Each needs a [TECH_STACK.md](../TECH_STACK.md) §2 entry — justification, rejected
alternatives, byte cost — before it enters `package.json`.

| Package | Milestone | Client cost | State |
| --- | --- | --- | --- |
| `zod` | M7 | **0** — build-time only | installed |
| `@next/mdx` + remark/rehype + `shiki` | M7 | **0** — build-time only | installed |
| `clsx` + `tailwind-merge` | M2 | ~1.2 KB gz | installed |
| `class-variance-authority` | M2 | ~0.6 KB gz | installed, not yet used |
| `lucide-react` | M5 | Per-icon, ~0.1 KB each | not installed |
| `motion` | M5 | 0 on Home; ~16 KB lazy chunk | not installed |
| `gsap` | M8/M10 | 0 on Home; ~40 KB on two routes | not installed |
| `lenis` | M5 | ~9 KB, dynamic, gated | not installed |
| `cmdk` | M12 | ~4 KB, dynamic | not installed |
| `satori` + `@resvg/resvg-js` | M13 | **0** — build-time only | not installed |

Note how many are zero: the content pipeline, validation, highlighting, and OG
generation all run at build. That is the architecture doing its job.

**`@radix-ui/react-dialog` was on this table at ~4.5 KB and is not installed —
it was never needed.** M4 built the mobile sheet on the native `<dialog>` and
`showModal()`, which supplies the focus trap, Escape, focus restoration, and
background inertness from the browser. The saving is the whole 4.5 KB, and the
behaviour is *better* than the library's on the cases a `keydown` handler misses:
screen-reader virtual cursors and find-in-page. `dialog.tsx` and `sheet.tsx` in
[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §2 were rewritten
against this; the palette (M12) is the only remaining candidate for a vendored
Radix primitive, and it should be checked against `<dialog>` first.

**The general lesson, since this is the second time it has paid:** a platform
feature that has landed everywhere in the support matrix beats a vendored
component, and the byte budget is what makes anyone go and look.

---

## 5. The gate, run before every commit

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm check:export && pnpm check:links && pnpm check:contrast && pnpm size
```

Plus `pnpm test:e2e` and `pnpm lh` on any milestone that changes a route's
payload.

**Three rules that do not bend** ([CLAUDE.md](../../CLAUDE.md) §15.3):

1. No budget in [PERFORMANCE.md](../PERFORMANCE.md) §2 is raised to make CI pass.
2. No `lighthouserc.json` assertion is loosened or added to the skip list.
3. No test is skipped. A skipped test is a lie in the suite.

If a milestone cannot pass the gate, the **feature** is cut, not the gate. That
is recorded in the commit body.

---

## 6. Verification is against the export, never the dev server

`pnpm build && pnpm start`. The dev server hides `basePath`, trailing-slash
resolution, the real 404, and production bundling — the four things that break on
GitHub Pages. `playwright.config.ts` already encodes this the hard way: its
comment records a run where the suite bound to an unrelated dev server on port
3000 and reported someone else's page as this site's.

---

## 7. Content: what is real and what is not

**Nothing about Rahul Rocket's career is known to this plan.** No employers, no
dates, no metrics, no project details, no talks, no testimonials.

The rule for every content-bearing milestone:

| Real | Placeholder |
| --- | --- |
| Zod schemas | Employer names, titles, dates |
| Loaders and validation | Outcome metrics |
| Page templates and layouts | Case-study narratives |
| Routing, SEO, feeds | Blog post bodies |
| The design system | Testimonials — **omitted entirely** |

Placeholders are marked at three levels so none can ship unnoticed:

1. Every placeholder content file carries `placeholder: true` in frontmatter.
2. `pnpm content:validate` **fails** when a `placeholder: true` file is present
   and `NODE_ENV=production` — so the cutover build cannot succeed while any
   remains.
3. Pages render a visible banner for placeholder records in development.

**Testimonials are omitted rather than placeheld.** The brief asked for them.
A fabricated quote attributed to a named person is a different category of thing
from lorem ipsum, and the `noindex` on this branch is not a sufficient guard
against it ever being read as real. They arrive when there are real ones.

This is the honest reading of [CLAUDE.md](../../CLAUDE.md) §15.8: the site's whole
argument is engineering integrity, and inventing a career history under a real
person's name would undermine it more thoroughly than any missing feature.

---

## 8. Documentation is updated in the same commit

[CLAUDE.md](../../CLAUDE.md) §15.6. Specifically:

- **[TASK_BACKLOG.md](../TASK_BACKLOG.md) status** moves in the commit that moves
  the code. A task done in a branch and marked done later is invisible to
  planning.
- **A canonical `docs/` file is amended** when a delta here contradicts it —
  never left to disagree. The ledger, with what is actually paid:

  | Owed amendment | State |
  | --- | --- |
  | `ANIMATION_GUIDELINES.md` §3 gains inventory entries 15–25 | **paid** — and items 11 and 14 corrected against what M4 built |
  | `DESIGN_SYSTEM.md` §2 gains the `surfaces.css` tier | **paid** at M1 |
  | `WEBSITE_STRUCTURE.md` §1 gains `/now` | **paid** — with C-12 as its owning task |
  | `TECH_STACK.md` §2 gains an entry per dependency in §4 | paid for what is installed; owed for each of the rest at the milestone that adds it |
  | `PERFORMANCE.md` §2 records Home's real measured number after M6 and M14 | outstanding by design — M6 has not run |

  Three of those five went unpaid for two milestones, which is how
  `WEBSITE_STRUCTURE.md` ended up without the `/now` that this plan set calls a
  locked decision. The ledger is here so the debt is visible rather than
  remembered.
- **`design/hero-directions.html`** is reduced to direction B at M1. **Done** —
  it is `design/hero.html`.

---

## 9. Honest risks

| Risk | Standing |
| --- | --- |
| **Home's JS headroom — now 11.28 KB, and the diagnosis was wrong** | **Superseded at H-01.** Home measures **108.72 KB against the 120 KB gate**. The 9.79 KB that made this "the tightest constraint in the project" was `tailwind-merge` crossing the client boundary via `lib/cn.ts` inside `<Reveal>`, not React's hydration runtime; a client component that does not import `cn` costs **0.27 KB**. It is still the tightest constraint on the site, and H-10 still owns it — but the lever is `cn`, not the feature list. The superseded reasoning is preserved below because it is what the rest of this table was written against. |
| ~~**Home's 2.21 KB of JS headroom**~~ | The tightest constraint in the project, and it has tightened twice. M2 measured the first client component as a one-time **+9.79 KB** hydration tax, moving the floor from 105.40 to 115.19 KB. M4's shell then spent 2.60 KB of what was left, and Home now measures **117.79 KB against the 120 KB gate**. [PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §1–2 has the build-by-build breakdown. Every remaining Home feature — counter, magnetic, spotlight, parallax, code editor, back-to-top — competes for 2.21 KB, and they cannot all fit. H-10 owns the choice. |
| **DS-04 fonts blocked on licensing** | Unresolved and outside this plan. Everything renders in a metric-matched fallback; §3's M1 makes the eventual swap zero-CLS. A premium type identity is genuinely waiting on it. |
| **The 75 KB Home target may be unreachable** | It is 30 KB under the *empty* baseline. Resolving it means reducing what the route loads or revising the target in `PERFORMANCE.md` §2 with the reason — never relaxing what CI checks. |
| **Placeholder content** | Every content-bearing page is a template until real facts arrive. Stated plainly rather than presented as finished. |
| **Scope** | Five roadmap phases. Milestones land incrementally and each is independently green; the site is never left broken between them. |

## Related

[README.md](./README.md) · [docs/ROADMAP.md](../ROADMAP.md) ·
[docs/TASK_BACKLOG.md](../TASK_BACKLOG.md) ·
[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) ·
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md)
