# ROADMAP

Twelve phases from an empty repository to a launched site. Each phase has a
goal, deliverables, an exit criterion, and a rough size. Phases are sequential
where the dependency is real and parallel where it is not.

## Principles

1. **Every phase ends deployable.** No phase leaves the site in a broken state,
   because the legacy site stays live until the Phase 10 cutover
   ([DEPLOYMENT.md](./DEPLOYMENT.md) §7).
2. **Quality gates come early, not last.** Lighthouse, axe, and budget checks are
   wired into CI in Phase 3 — before there is anything to regress. Retrofitting
   budgets after eight phases of features means discovering that the design does
   not fit them.
3. **Content blocks launch, not layout.** Phases 5–9 build the containers;
   launch requires the real content minimums from
   [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §8.
4. **An exit criterion is a fact, not a feeling.** Each is objectively checkable.

Sizes are relative effort, not calendar time: **S** ≈ a session, **M** ≈ a few
sessions, **L** ≈ a week of focused evenings.

---

## Phase 0 — Project Initialization ✅ Complete

**Goal.** Establish the repository, the branch strategy, and the legacy-site
constraint.

**Deliverables.** Repository exists; `docs/` branch created; legacy CRA
deployment identified and documented as untouched until cutover; documentation
scope agreed.

**Exit criterion.** The team knows what is live and what may not be broken.

---

## Phase 1 — Documentation & Planning ✅ Complete

**Goal.** Every significant decision is made and written down before code exists,
so implementation is execution rather than discovery.

**Deliverables.** The 24-document set in `docs/`, plus `CLAUDE.md` and `README.md`.
Vision, audience, brand, information architecture, architecture, stack, design
system, UI/animation/accessibility/performance rules, content model, blog and
case-study specs, deployment plan, this roadmap, and the backlog.

**Exit criterion.** Documentation PR reviewed and approved. Zero contradictions
between documents. Every cross-reference resolves.
**Size:** L. **Blocks:** everything.

---

## Phase 2 — Design System

**Goal.** The visual language exists as tokens before any component consumes it.

**Deliverables.** Color scales in OKLCH with both themes mapped semantically ·
type scale, self-hosted subset fonts with metric-matched fallbacks · space,
radius, elevation, motion tokens · the contrast-check script running green in
both themes · a `/playground/tokens` route rendering every token · one designed
key screen (Home hero) proving the system produces something distinctive.

**Exit criterion.** The contrast script passes for every semantic pair in both
themes, and the Home hero mockup is agreed to look like nothing else.
**Size:** M. **Depends on:** Phase 1.

**Risk.** This is where "premium and memorable"
([VISION.md](./VISION.md)) is either achieved or lost. If the token set produces
something generic, iterate here — it is ten times cheaper than iterating in
Phase 5.

---

## Phase 3 — Application Foundation

**Goal.** A deployable, empty, fully instrumented Next.js application.

**Deliverables.** Next.js 15 App Router with `output: 'export'`,
`trailingSlash: true`, `.nojekyll` · TypeScript strict config with `@/*` paths ·
Tailwind v4 consuming Phase 2 tokens · Biome with import-boundary rules · Husky +
lint-staged + commitlint · Vitest and Playwright configured · the full CI
pipeline including Lighthouse, axe, `size-limit`, and link checking · the MDX
pipeline with Zod validation and a fixture post rendering end to end · theme
provider with the pre-paint script.

**Exit criterion.** A PR containing a deliberate accessibility violation and a
deliberate 200 KB bundle addition is **blocked by CI**. Verifying that the gates
actually fail is the point of this phase; a gate never observed failing is not
known to work.
**Size:** L. **Depends on:** Phase 2 (tokens), Phase 1 (architecture).

---

## Phase 4 — Core Layout & Navigation

**Goal.** The shell every page composes.

**Deliverables.** Root layout with fonts, providers, and metadata defaults ·
header with scroll condensation · desktop nav and mobile sheet with focus trap ·
footer with the full site map · skip link · theme toggle · command palette ·
scroll progress rail · back-to-top · breadcrumb · page container · Lenis provider
with its three hard rules · error boundary · 404 page exporting to `404.html` ·
reveal/stagger motion primitives with reduced-motion paths · route-change focus
management and announcement · command palette (⌘K) as a lazy-loaded pure
enhancement.

**Exit criterion.** Keyboard-only navigation of the shell is complete; axe passes
in both themes; the 404 works on a served `out/` build; content is present with
JavaScript disabled.
**Size:** M. **Depends on:** Phase 3.

**Status: complete**, except L-01's fonts half, which is blocked on DS-04's
licensing decision rather than on anything in this phase. Every exit criterion is
asserted by a spec rather than reviewed by eye — `e2e/keyboard.spec.ts`,
`a11y.spec.ts` (both themes, and now both overlays while open), `no-js.spec.ts`,
`shell.spec.ts` and `command-palette.spec.ts`. See
[TASK_BACKLOG.md](./TASK_BACKLOG.md) L-13/L-15 for the measurements, including
why the shell got *smaller* as it was completed.

---

## Phase 5 — Home Page

**Goal.** The 30-second impression.

**Deliverables.** Hero (LCP is unanimated `<h1>` text) · proof strip · featured
projects (asymmetric, three) · what-I-do · selected writing · current focus ·
contact CTA · `Person` and `WebSite` structured data · OG image generation.

**Exit criterion.** Lighthouse ≥ 95/100/100/100 on mobile; JS ≤ 75 KB gz;
LCP ≤ 1.5s; five hallway-test readers can name the role and primary stack after
30 seconds ([GOALS.md](./GOALS.md) O1).
**Size:** M. **Depends on:** Phase 4.

**Status: built, not exited.** All seven sections ship (H-01…H-08), the OG
generator ships (H-09), and Home measures **114.01 KB gz** — inside the 120 KB
hard limit and over the 75 KB target. The exit criterion is therefore **not
met**, and the two open halves are honest about why: the byte gap is Next's
~105 KB baseline rather than this page's code, and the hallway test needs five
humans. Both are recorded against H-10 and H-11 in
[TASK_BACKLOG.md](./TASK_BACKLOG.md) rather than quietly rounded to done.

---

## Phase 6 — About & Experience

**Goal.** The professional record and the person behind it.

**Deliverables.** `/about` with the sticky facts rail · `/experience` from
`content/experience.ts` · `/skills` with depth ratings and URL-param filtering ·
`/journey` with the GSAP scrubbed timeline (dynamically imported, reduced-motion
static) · the real content for all four.

**Exit criterion.** The timeline renders complete under reduced motion and
without JS; GSAP contributes 0 bytes to the Home route; experience data drives
both `/experience` and the résumé with no duplication.
**Size:** M. **Depends on:** Phase 4. **Parallel with:** Phase 7.

**Status: complete, with the middle criterion met more strongly than written.**
GSAP contributes 0 bytes to Home because **it contributes 0 bytes to every
route — it was never installed.** The spine is a CSS scroll-driven animation
behind an `@supports` gate whose fallback is a fully drawn line, so reduced
motion, no JavaScript and an unsupporting engine all land on the finished state.
`experience.ts` drives `/experience`, `/resume` and the print output with no
second copy. The content itself is drafted rather than verified — see the M7
note in the backlog and `site.indexable`.

---

## Phase 7 — Projects & Case Studies

**Goal.** The site's core artifact. **The most important phase.**

**Deliverables.** Case-study MDX schema and pipeline · `/projects` index derived
from frontmatter, asymmetric layout, stack filtering · `/projects/[slug]` with
the twelve fixed sections, sticky TOC, reading progress, metric rows · the SVG
diagram system with `title`/`desc`, prose equivalents, and the scrubbed draw-on ·
`stack`-id cross-validation against `skills.ts` · per-project OG images ·
**three real case studies written**.

**Exit criterion.** Three case studies pass the §10 quality checklist in
[PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) — including a Problem
section longer than the stack list, a named trade-off, and an honest
retrospective in each.
**Size:** L. **Depends on:** Phase 4.

**Note.** The writing is the long pole, not the code. Budget accordingly; a
finished template with placeholder case studies is a failed phase.

**Status: built; the exit criterion is met by one of three.** The pipeline, the
index, the twelve sections, the sticky TOC, the diagram system, the metric rows,
prev/next, per-project cards and the `stack` cross-validation all ship. Case
study #1 is about this repository and every claim in it is checkable against the
code. #2 and #3 are drafted to the §10 standard and carry `needsReview: true`,
which renders as a warning on the card *and* on the page — the site does not
present unreviewed work as a verified record. Replacing them with the author's
own projects is what closes this phase, and it is content work, not code.

---

## Phase 8 — Blog

**Goal.** Publishing works and posts read well.

**Deliverables.** Post pipeline with the full plugin set · `/blog` index with
search and tag filtering over in-HTML data · `/blog/[slug]` with TOC, progress,
code blocks with copy buttons · `/blog/tags/[tag]` archives · RSS, Atom, and
JSON feeds with full content · the MDX component set · `pnpm new:post` ·
**four real posts written**.

**Exit criterion.** Feeds validate in a real reader; a post page ships 0 KB of
syntax highlighter; publishing a post is `add file → validate → commit → push`
with no other step.

**Status: complete, with one criterion unverified.** The three feeds are
generated with full content and absolute URLs and are asserted by
`e2e/seo.spec.ts`; **"validate in a real reader" has not been done** — that
needs a human with a feed reader, and it is recorded as such rather than
inferred from well-formed XML. The 0 KB highlighter claim is asserted: Shiki
runs at build time and no route's chunk list contains it. Publishing is one
file: the schema, the index, the tags, the sitemap and the feeds all derive
from it.
**Size:** M. **Depends on:** Phase 4. **Parallel with:** Phase 7.

---

## Phase 9 — Contact, Resume, Uses & Open Source

**Goal.** Close the loop from interest to contact.

**Deliverables.** `/contact` with a Formspree-backed form, `mailto:` fallback,
honeypot, announced validation · `/resume` rendered from the same data as
`/experience`, with print styles and CI-generated PDF · `/uses` · `/open-source`
with build-time-fetched repo data · the nightly cron refreshing it.

**Exit criterion.** The form works, and works with JS disabled via the fallback;
the résumé PDF matches the HTML because both derive from one source; a recruiter
can reach the PDF in ≤ 2 interactions from a cold mobile load.
**Size:** M. **Depends on:** Phase 4.

**Status: built, with two deliverables reshaped and one deferred.**

The form is built — inline validation on blur, errors associated by
`aria-describedby` and announced, focus to the status after submit, honeypot and
a time-to-submit floor, no CAPTCHA. It **renders only once
`site.formspreeEndpoint` is set**, and until then the page is the address, the
guidance and a pre-filled `mailto:`. That is deliberate: a form posting nowhere
discards a message silently, which is worse than not offering one, and the
`mailto:` path is the no-JavaScript path anyway — so nothing about the page as
it ships is a degraded state.

**There is no generated PDF, and the exit criterion is met more completely for
it.** "The PDF matches the HTML because both derive from one source" is
strongest when there is no second document at all: the reader prints the page,
`print.css` makes the output a clean single-column résumé, and a recruiter
reaches it in two interactions from a cold load — open `/resume/`, press the
button. The reasoning, including why a committed artifact fights the link
checker, is in `features/experience/print-button.tsx`.

**`/open-source` ships without live repo metrics.** C-08's build-time fetch is
not written, so entries render without stars rather than with a zero — a zero is
a claim and an absence is not. C-10's nightly cron waits on it and nothing on
the site currently changes without a push, so there is nothing for it to do yet.

---

## Phase 10 — SEO, Performance, Accessibility & Cutover

**Goal.** Meet every stated target, then replace the legacy site.

**Deliverables.** Metadata and JSON-LD audited on every route · sitemap, robots,
manifest, icons · full manual accessibility audit (NVDA, VoiceOver, 400% zoom,
high contrast, keyboard-only) · performance tuning to budget on all routes · a
real mid-range Android pass · link-preview verification on six platforms · **the
cutover PR** (delete CRA, replace the workflow, switch the Pages source to
GitHub Actions).

**Exit criterion.** All four Lighthouse targets met on all four representative
routes; the manual a11y checklist is fully green; production serves the new site
and the post-deploy smoke checklist passes.
**Size:** L. **Depends on:** Phases 5–9.

**Highest-risk step:** the Pages source setting must change at merge time, or the
deploy succeeds while the site does not change
([DEPLOYMENT.md](./DEPLOYMENT.md) §7).

**Status: the mechanical half is done; the human half is not, and cannot be
faked.** Q-01…Q-03 and Q-05 ship: one metadata builder used by every route,
canonical and absolute `og:image` on all of them, generated `sitemap.xml` and
`robots.txt` driven by the same `site.indexable` flag as the meta tag, JSON-LD
that parses and is asserted, and a build assertion that every `og:image`
resolves inside the export. Q-04's `manifest.ts` and full icon set, Q-11's
redirect stubs and Q-13's smoke workflow remain.

**Q-06, Q-08, Q-09 and Q-10 need a person.** A screen reader, a real mid-range
Android, six link-preview platforms and Windows High Contrast Mode are not
things a build can produce, and an automated pass is roughly a third of the
accessibility story — [ACCESSIBILITY.md](./ACCESSIBILITY.md) §9 is where the
guarantee comes from. Zero axe violations across thirteen routes in both themes,
with both overlays open, is what is actually established.

**Q-12's remaining risk is unchanged and is one repository setting.** The
workflow is in place and `master` deploys; the Pages *source* is a manual
setting the workflow cannot set for itself, and a mismatch presents as "deploy
succeeded, site unchanged".

---

## Phase 11 — Final Polish & Launch

**Goal.** The difference between "done" and "good."

**Deliverables.** Micro-interaction pass · copy edit of every page, read aloud ·
empty and error states verified · cross-browser pass (Chrome, Firefox, Safari,
Samsung Internet) · real-device checks · Search Console verification and sitemap
submission · a `humans.txt` · the launch announcement.

**Exit criterion.** Nothing on the release checklist is open, and the site has
been read end to end by someone who is not the author.
**Size:** M. **Depends on:** Phase 10.

**Status: X-03 is done early and structurally.** Empty states are in the served
HTML from the start and hidden until a filter needs them, on every filtered view
— rendering them on demand would mean the one state nobody sees in review is
also the one that has never been rendered. `e2e/content.spec.ts` asserts it.
Everything else in this phase requires a human, by design.

---

## Post-launch (not scheduled)

Candidates, ranked by value, none committed:

| Item | Gate |
| --- | --- |
| Custom domain | Whenever desired — a one-string change |
| More case studies and posts | Continuous; the site's real product |
| `/speaking`, `/certifications` | Promoted at 5+ substantial entries ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §7) |
| `/playground` interactive demos | Must not touch content-route budgets |
| Assistive-technology user testing | The largest stated gap in the a11y guarantee |
| Full-text search | When the client-side index exceeds ~50 KB |
| Post series support | At 3+ related posts |
| A move to a host with real headers | If security headers or PR previews become important |
| i18n | Only on a real need; a route-group restructure |

## Dependency graph

```
0 ──► 1 ──► 2 ──► 3 ──► 4 ──┬──► 5 ──┐
                            ├──► 6 ──┤
                            ├──► 7 ──┼──► 10 ──► 11
                            ├──► 8 ──┤
                            └──► 9 ──┘
```

Phases 5–9 are parallelizable once Phase 4 lands. In practice they are best
sequenced 5 → 7 → 8 → 6 → 9, front-loading the two phases (Home and case
studies) that carry the most of the site's purpose, so that if energy runs low
the most valuable work is already done.

## Related

[TASK_BACKLOG.md](./TASK_BACKLOG.md) · [GOALS.md](./GOALS.md) ·
[DEPLOYMENT.md](./DEPLOYMENT.md) · [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)
