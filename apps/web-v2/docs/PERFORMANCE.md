# PERFORMANCE

## 1. Why budgets, not intentions

Performance regresses one reasonable-looking commit at a time. A budget that
fails a build is the only mechanism that survives contact with a deadline.

Every number below is enforced in CI on the pull request. Exceeding one blocks
the merge. Raising a budget requires editing this document in the same PR, with
the reason — which makes the trade-off visible and deliberate rather than
accidental.

## 2. Targets

### Lighthouse (mobile preset, throttled)

| Category | Target | Gate |
| --- | --- | --- |
| Performance | ≥ 95 | Hard fail below 95 |
| Accessibility | 100 | Hard fail below 100 |
| Best Practices | 100 | Hard fail below 100 |
| SEO | 100 | Hard fail below 100 |

Measured on four representative routes: `/`, `/projects/[a-case-study]`,
`/blog/[a-post]`, `/contact`. Three runs, median reported — a single run's
variance is large enough to produce false failures.

### Core Web Vitals (mobile, 4× CPU slowdown, throttled 4G)

| Metric | Target | Hard limit |
| --- | --- | --- |
| LCP | ≤ 1.5s | 1.8s |
| CLS | ≤ 0.01 | 0.02 |
| INP | ≤ 100ms | 200ms |
| TTFB | ≤ 200ms | 400ms (CDN-served static) |
| TBT | ≤ 100ms | 200ms |

### Byte budgets (gzipped, per route)

| Resource | Home | Blog post | Case study | Hard limit |
| --- | --- | --- | --- | --- |
| JS | 75 KB | 85 KB | 95 KB | 120 KB |
| CSS | 20 KB | 22 KB | 22 KB | 30 KB |
| Fonts | 90 KB | 120 KB | 120 KB | 120 KB |
| Images (above fold) | 100 KB | 60 KB | 100 KB | 150 KB |
| **Total (initial)** | **≤ 300 KB** | **≤ 320 KB** | **≤ 350 KB** | **400 KB** |

Home is the strictest because it is the entry point for the recruiter persona on
mobile ([TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) P1).

**What CI enforces, and where the site actually stands (measured, F0-15).**
`size-limit` gates on the **hard limit** column; the per-route figures are the
design target that Phase 5's H-10 has to hit. No number in this table has been
changed to make CI green, and none may be.

As of this measurement, Home ships **105 KB gz of JavaScript** — over the 75 KB
target, under the 120 KB hard limit — on a page with *zero* client components:
one `<h1>`, two paragraphs, no interactivity. That is Next.js's App Router
baseline runtime, not a regression, and it means the 75 KB target has roughly
**−30 KB of headroom before a single feature is written**. Three consequences,
recorded now so Phase 5 does not discover them:

1. Every client component added to Home is spent from an already-overdrawn
   budget. `'use client'` on Home needs a reason in the PR.
2. If H-10 cannot close the gap, the honest resolutions are to reduce what the
   route loads or to revise this target here, with the reason — not to relax
   what CI checks.
3. The gap is the strongest available argument for the "Server Components by
   default" rule in [ARCHITECTURE.md](./ARCHITECTURE.md) §5. It is not a
   stylistic preference; it is the only remaining lever.

CSS measures 4.9 KB gz against a 20 KB budget, which is the expected shape: the
token layer is small and the utility engine only emits what is used.

**Home's real number, at H-01 — the measurement the redesign plan owed here.**
With the hero built, Home ships **108.72 KB gz of JavaScript and 8.71 KB gz of
CSS**: 11.28 KB under the 120 KB hard limit, and still ~34 KB over the 75 KB
target. Consequence 2 above is therefore live and unchanged — H-10 either
reduces what the route loads or revises the target here with the reason.

**One correction to consequence 1, and it is worth more than the number.**
"Every client component added to Home is spent from an already-overdrawn budget"
is true but was being applied to the wrong quantity. A client component on this
site costs about **0.27 KB** — unless it imports `lib/cn.ts`, which pulls
`tailwind-merge` across the client boundary for **9.37 KB**. Home carried that
cost from M2 until H-01 through a single `<Reveal>`, and it was recorded for
three milestones as React's unavoidable hydration runtime. It is not: React's
runtime has been in the shared layout chunk since Phase 4 and every route pays
it already. The probe table is in
[redesign/PERFORMANCE_PLAN.md](./redesign/PERFORMANCE_PLAN.md) §1.

So the rule that actually protects this budget is narrower and much cheaper than
"justify every client component": **keep `cn` out of client leaves.** H-10 owns
deciding how — a `clsx`-only client variant is the obvious candidate, but `cn`'s
`extendTailwindMerge` config exists to stop `cn('text-h1', 'text-text-muted')`
silently dropping the size, so the split has to be deliberate rather than a
deletion.

**Lighthouse is measured in CI, not on a developer machine.** Recorded because it
was nearly mis-diagnosed: a local run showed LCP at ~1.83s against the 1.8s hard
limit, which looks like a clear breach. Re-running the *previous* commit on the
same machine produced LCP anywhere from 0.9s to 1.7s across three runs and failed
a different assertion (`interactive`, 2150ms vs 2000ms) that passes in CI. A
Windows laptop under simulated throttling, with a browser and a dev server
competing for the same cores, has a noise band wider than the margin being
measured. Use `pnpm lh` locally to find *large* regressions and to read the
diagnostics; treat the CI job as the only authority on pass/fail.

The one local finding that was real, and was fixed: the theme toggle originally
swapped its label text in an effect after hydration, which registers a **new LCP
candidate at hydration time**. Lighthouse showed FCP at 0.8s and LCP at 1.8s on
pages whose largest element is a heading painted in the first frame. Rendering
both labels and letting `:root[data-theme]` choose between them makes the served
markup final. The general rule this produces: **a component must not change its
rendered text after hydration**, or it moves LCP to whenever hydration finishes.

**Lighthouse audits deliberately skipped** (`lighthouserc.json`): `canonical`
and `is-crawlable`. The Phase 3 layout sets `robots: noindex` on purpose so a
crawler cannot index a half-built export under the real URLs, and canonicals are
Q-01. Both are re-enabled by the cutover, and Q-01 owns removing them from the
skip list — a skipped audit that nobody owns is how a gate rots.

### Other

- Time to Interactive ≤ 2.0s on the mobile profile
- No single long task > 50ms during load
- Build time ≤ 3 minutes at 30 content items
- Total static export size ≤ 15 MB

### Measured, M7 — every route built

`pnpm build && pnpm size`, gzipped, over exactly the scripts each route's own
`index.html` references:

| Route | JS | CSS | Hard limit |
| --- | --- | --- | --- |
| `/` | **114.01 KB** | 10.67 KB | 120 / 20 KB |
| `/projects/[slug]` | **115.65 KB** | 10.71 KB | 120 / 22 KB |
| `/blog/[slug]` | **115.65 KB** | 10.71 KB | 120 / 22 KB |
| `/projects/`, `/skills/` | 113.59 KB | 10.71 KB | 120 / 22 KB |
| everything else | 111.84 KB | 10.71 KB | 120 / 20 KB |

**Every route is inside its hard limit; no route is near the 75 KB target.**
The distinction matters and is worth stating precisely rather than as a
shortfall: the site's OWN client code is under 5 KB on its heaviest route —
a table of contents, a code-block copy button, a filter, a theme toggle, a
command palette, one `<Reveal>` per section. The remaining ~105 KB is Next's
shared runtime, present on a route with zero client components.

So the 75 KB target is not reachable by optimising this codebase. It is
reachable by changing framework, or by revising the number here with the reason
attached. H-10 owns that decision and it is a decision, not a task — which is
why the target has not been quietly raised to match the measurement. **Never
weaken a budget to make CI pass** (CLAUDE.md §10) cuts both ways: it also means
not pretending a target is met.

**Lighthouse, M7.** Categories are 99–100 / 100 / 100 / 100 on all five audited
URLs and **CLS is exactly 0.000 on every one**. The one failing assertion is
LCP against the 1800 ms hard limit, at 1817–2082 ms — including 1823 ms on
`/404.html`, a page with one heading. A limit that a blank page misses by 23 ms
is reporting the measurement environment at least as loudly as it is reporting
the site. Recorded against Q-07 in [TASK_BACKLOG.md](./TASK_BACKLOG.md).

## 3. How the targets are achieved

### The structural wins (already decided)

| Decision | Effect |
| --- | --- |
| Static export | TTFB is CDN-only; no server render time exists |
| Server Components by default | MDX parsing, highlighting, and date formatting cost 0 client bytes |
| Shiki at build time | A syntax highlighter that ships 0 KB (vs ~30 KB for Prism) |
| Tailwind v4 | Only used utilities ship; typically ~15 KB CSS total |
| No state manager, no data-fetching library | Two whole dependency categories absent |
| Self-hosted subset fonts | No third-party connection on the critical path |
| shadcn/ui as copied source | No UI library runtime; unused components are deleted, not shipped |

Most of the performance work was done in [ARCHITECTURE.md](./ARCHITECTURE.md)
and [TECH_STACK.md](./TECH_STACK.md). What remains is discipline.

### JavaScript

- `'use client'` at the deepest node possible. A client-marked layout pulling the
  tree into the bundle is the single most likely regression, and the review
  checklist looks for it explicitly.
- `LazyMotion` + `domAnimation` rather than the full Motion bundle.
- GSAP dynamically imported on exactly two routes; 0 bytes on Home.
- Per-icon imports from Lucide; no barrel imports of third-party libraries.
- Anything > 20 KB that is not immediately visible is `next/dynamic`.
- Zero polyfills for the support matrix in §8.
- **`cn` (clsx + `tailwind-merge`) is banned from Client Components.**
  `tailwind-merge` is **8.7 KB gz** — a table of every conflicting utility group
  — and importing it from anything under `'use client'` puts it in the shared
  chunk of every route. It was measured as the largest single item on Home,
  arriving through `Reveal`'s `className={cn(className)}`: `cn` with one
  argument, merging nothing. Build the class string directly instead; the
  conflict resolution `cn` provides is only worth its weight on a Server
  Component with `cva` variants a caller may need to override.
- **Prefer a CSS scroll timeline to a scroll subscriber.** The progress rail and
  the back-to-top reveal are `animation-timeline: scroll()` behind an `@supports`
  gate: zero bytes, off the main thread, and therefore incapable of contributing
  to INP the way a per-frame handler can.

### Fonts

The most common LCP culprit on a text-first site.

- Self-hosted `woff2`, Latin subset, four files maximum.
- `next/font/local` with `display: swap` and a **metric-matched fallback via
  `size-adjust`**, so the swap produces **zero** layout shift. This is what makes
  the 0.01 CLS target reachable.
- Preload only the two faces used above the fold; mono is loaded only on routes
  with code.
- Variable fonts only if a single file is smaller than the static weights it
  replaces — often it is not.

### Images

- Pre-generated AVIF + WebP responsive variants at build (`images.unoptimized`
  is forced by static export, so the build script *is* the optimizer).
- Explicit `width`/`height` or `aspect-ratio` on every image — no exceptions.
- `priority` on the above-fold image only; everything else lazy with
  `decoding="async"`.
- SVG for all diagrams and icons.
- No image over 500 KB enters Git (pre-commit check).

### CSS

- One stylesheet, both themes included — a theme swap must not cost a request.
- Critical CSS is inlined by Next automatically for the static export.
- No CSS-in-JS runtime.
- `content-visibility: auto` on long below-fold sections (case studies, blog
  index) to skip rendering work.

### Third-party

Currently: **none**. Every third party added must justify its cost against a
route's budget in its PR. The contact form endpoint is invoked on submit only,
never loaded on page load.

## 4. LCP strategy per route

| Route | LCP element | Guarantee |
| --- | --- | --- |
| `/` | The `<h1>` text | Text LCP, font preloaded, no animation gating visibility |
| `/blog/[slug]` | The post `<h1>` | Same |
| `/projects/[slug]` | The case study `<h1>` or hero image | If an image, `priority` + AVIF + explicit dimensions |
| `/about` | Portrait or `<h1>` | Portrait is `priority`, ≤ 60 KB AVIF |

**Rule: the LCP element is never animated in.** A hero headline that fades in
over 400ms has an LCP 400ms worse than a headline that is simply there. The hero
stagger animates *around* the `<h1>`, and the `<h1>` itself starts visible.

## 5. Enforcement in CI

| Gate | Tool | When |
| --- | --- | --- |
| Lighthouse scores + CWV assertions | Lighthouse CI against a served `out/` | Every PR |
| Per-route byte budgets | `size-limit` with a `.size-limit.json` per route | Every PR |
| Bundle composition diff | `@next/bundle-analyzer` artifact | Every PR (informational) |
| Animation frame rate | Playwright trace on `/` and `/journey` | Per phase |
| Export size | Build script assertion | Every build |

Lighthouse CI runs against `pnpm start` serving `out/` — **not** the dev server.
The dev server hides `basePath`, trailing-slash behavior, and production bundling,
which are exactly the things that break ([TECH_STACK.md](./TECH_STACK.md) §5).

## 6. Measurement discipline

- **Always three runs, median.** Single-run Lighthouse variance is ±5 points.
- **Always the mobile preset with throttling.** Desktop numbers on a dev machine
  are meaningless — they measure the machine.
- **Test on a real mid-range Android** each phase. Emulated throttling
  approximates CPU but not memory pressure, thermal throttling, or the real GPU.
- **Field data is absent by design** (no analytics). Lab data is therefore the
  only signal, which is a stated limitation of this approach: real-world
  variance is invisible here. Accepted, because the alternative is a consent
  banner on every page ([SEO.md](./SEO.md) §9).

## 7. Common regressions and their fixes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| JS budget jumps | A layout or provider gained `'use client'` | Push the boundary deeper |
| JS budget jumps on **every** route at once | A Client Component imported something server-only-by-habit — most often `cn`, i.e. `tailwind-merge` at 8.7 KB | Check the new shared chunk's contents before assuming the feature is at fault; build class strings directly in client leaves |
| CLS appears | An image or embed without dimensions | Add `width`/`height` or `aspect-ratio` |
| LCP regresses | Font preload lost, or the `<h1>` got an entrance animation | Restore preload; unanimate the LCP element |
| INP regresses | A scroll or resize handler setting React state | Move to refs and CSS variables |
| Fonts grow | A weight or a face added | Justify against the 120 KB budget or subset harder |
| Build slows | An unbounded content loop, or missing `cache()` on a reader | Memoize the content readers |

## 8. Support matrix

| Browser | Support |
| --- | --- |
| Chrome / Edge | Last 2 versions — full |
| Firefox | Last 2 versions — full |
| Safari (macOS/iOS) | Last 2 versions — full |
| Samsung Internet | Last 2 versions — full |
| Older / unknown | Content and navigation work; enhancements may be absent |

Baseline features assumed: OKLCH, container queries, `:has()`, CSS nesting,
`content-visibility`, `size-adjust`. All are Baseline-available across the
matrix; none is polyfilled. Where a feature is genuinely absent, the site
degrades to a plainer but complete experience — a progressive enhancement
posture, applied to CSS as well as JS.

**No IE, no legacy Edge, no polyfill bundle.** Shipping polyfills for browsers no
one in the audience uses would cost every real reader bytes.

## 9. Extensibility

- **Adding a heavy feature** (a 3D demo): it goes on `/playground`, which has its
  own budget, keeping content routes untouched. The gate is in
  [TECH_STACK.md](./TECH_STACK.md) §2.
- **Growing content:** build time is the metric to watch. At ~200 items, content
  reading moves to a generated manifest rather than a per-build directory walk.
- **Moving off GitHub Pages:** budgets do not change; only TTFB improves.

## Related

[ARCHITECTURE.md](./ARCHITECTURE.md) · [TECH_STACK.md](./TECH_STACK.md) ·
[ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) · [GOALS.md](./GOALS.md)
