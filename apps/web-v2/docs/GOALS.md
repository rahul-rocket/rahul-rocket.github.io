# GOALS

Every goal here is **measurable** and has a **verification method**. A goal
without a number is a mood, and moods do not gate merges.

## 1. Goal hierarchy

```
Outcome goals      ← what the site must achieve for its reader
   ↑ supported by
Quality goals      ← performance, a11y, SEO — enforced in CI
   ↑ supported by
Engineering goals  ← maintainability properties of the codebase
```

If a lower-tier goal conflicts with a higher-tier one, the higher tier wins.
Example: a 3D hero that improves "memorability" (outcome) but breaks the LCP
budget (quality) is cut — because the LCP budget exists to serve the *same*
outcome for the 80% of readers on mid-range mobile.

## 2. Outcome goals

| ID | Goal | Metric | Target | How verified |
| --- | --- | --- | --- | --- |
| O1 | The 30-second skim conveys role, depth, and proof | Reader can name 3 projects + the primary stack after 30s | 4/5 test readers | Manual: 5-person hallway test before launch |
| O2 | At least one case study gets read end to end | Scroll depth to "Outcome" section | Qualitative | Analytics ([SEO.md](./SEO.md) §9) |
| O3 | The site is forwardable | Link previews render correctly everywhere | 100% of surfaces | Manual check: Slack, X, LinkedIn, iMessage, Discord |
| O4 | Blog posts stand alone | A post entered cold needs no other page | Every post | Editorial review checklist ([BLOG_SYSTEM.md](./BLOG_SYSTEM.md)) |
| O5 | Contact is frictionless | Email reachable in ≤ 2 interactions from any page | Always | Manual: keyboard-only walkthrough |

O1 and O3 are the two that most portfolios fail. They are checked before every
release, not once.

## 3. Quality goals (CI-enforced)

| ID | Goal | Target | Enforcement |
| --- | --- | --- | --- |
| Q1 | Lighthouse Performance (mobile) | ≥ 95 | `lhci autorun` in CI, `assert` fails the build |
| Q2 | Lighthouse Accessibility | 100 | same |
| Q3 | Lighthouse Best Practices | 100 | same |
| Q4 | Lighthouse SEO | 100 | same |
| Q5 | LCP (mobile, throttled 4G) | ≤ 1.5s (hard limit 1.8s) | Lighthouse assertion |
| Q6 | CLS | ≤ 0.01 (hard limit 0.02) | Lighthouse assertion |
| Q7 | INP | ≤ 100ms (hard limit 200ms) | Lab profiling only — no field data by design ([PERFORMANCE.md](./PERFORMANCE.md) §6) |
| Q8 | First-load JS, Home route | ≤ 75 KB gzip (hard limit 120 KB) | `size-limit` in CI |
| Q9 | Total transferred, Home, cold | ≤ 300 KB | Lighthouse assertion |
| Q10 | Axe violations (serious/critical) | 0 | `@axe-core/playwright` in E2E |
| Q11 | Contrast ratio | Body text ≥ 7:1 (AAA); large text and UI ≥ 4.5:1; non-text ≥ 3:1 | `check-contrast.ts` over tokens, both themes + axe |
| Q12 | Broken internal links | 0 | `pnpm check:links` over `out/` in CI |
| Q13 | Type errors | 0 | `tsc --noEmit` |
| Q14 | Lint/format violations | 0 | `biome ci` |

Budgets are defined once in [PERFORMANCE.md](./PERFORMANCE.md) and referenced
here; if the two disagree, PERFORMANCE.md is authoritative.

**Why 100 and not 95 for a11y/SEO/BP:** those three are checklist-based and
deterministic. A score below 100 means a specific box is unchecked, and there is
always a specific fix. Performance is continuous and hardware-sensitive, so 95
is the honest bar.

## 4. Engineering goals

| ID | Goal | Verification |
| --- | --- | --- |
| E1 | Adding a blog post = 1 new `.mdx` file, 0 code changes | Demonstrated in Phase 8 acceptance |
| E2 | Adding a project = 1 new `.mdx` file, 0 code changes | Demonstrated in Phase 7 acceptance |
| E3 | Adding a nav item = 1 edit to the route manifest | Code review |
| E4 | No component file exceeds 200 lines | Biome rule / review |
| E5 | No feature imports from another feature's internals | Import-boundary lint rule ([ARCHITECTURE.md](./ARCHITECTURE.md) §5) |
| E6 | Every color, space, radius, and duration comes from a token | Review: literal hex/px in components is a blocker |
| E7 | A cold `pnpm install && pnpm build` succeeds on a clean machine | CI runs with no cache weekly |
| E8 | Site builds with zero warnings | CI treats Next.js build warnings as errors |

## 5. Explicit non-goals

Stated so they cannot be smuggled in as "goals" later:

- **Traffic volume.** This is not a content business. A post read by 40 of the
  right people beats 40,000 of the wrong ones.
- **Framework benchmarks.** Not competing with a static HTML file on TTFB.
- **100% test coverage.** See [TESTING.md](./TESTING.md) for the coverage
  philosophy — targeted tests on logic, not on markup.
- **Supporting IE or non-evergreen browsers.** Baseline is the last 2 versions
  of Chrome, Safari, Firefox, and Edge, plus iOS Safari 16+.

## 6. Trade-offs accepted

| We accept | To get | Rejected alternative |
| --- | --- | --- |
| No image optimization service | Zero-cost static hosting | Vercel hosting (loses the "it's just files" property, adds a vendor) |
| Manual `<img>` sizing discipline | CLS ≤ 0.02 on static export | `next/image` with a loader (needs a runtime or a paid service) |
| Client-side search only | No backend | Algolia (cost, vendor, cookie/consent burden) |
| Hand-authored MDX | No CMS to maintain | Contentlayer (unmaintained), Sanity/Notion (network dependency at build) |
| A smaller number of pages | Every page is genuinely good | A large sitemap of thin pages |

## 7. Review cadence

- **Per PR:** Q1–Q14 run automatically. A failure blocks merge.
- **Per phase:** O1–O5 reviewed manually against the phase's exit
  criteria in [ROADMAP.md](./ROADMAP.md).
- **Quarterly (post-launch):** re-run the hallway test, re-check link previews,
  prune stale content, review dependency majors.
