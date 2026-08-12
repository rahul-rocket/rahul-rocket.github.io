# TESTING

## 1. What is worth testing here

This is a static content site with one maintainer. Chasing a coverage percentage
would produce a large suite of tests asserting that JSX renders JSX — expensive
to maintain, and it would catch nothing.

Tests are written where a failure would be **silent, expensive, or embarrassing**:

| Risk | Would it be silent? | Tested |
| --- | --- | --- |
| Malformed content breaks a page | No — build fails via Zod | Schema tests only |
| A route stops existing | Yes | E2E |
| Accessibility regression | **Yes** | E2E + axe, every route |
| Performance regression | **Yes** | Lighthouse CI budgets |
| Broken internal link | **Yes** | Link checker over `out/` |
| Metadata/OG regression | **Yes** | Build assertions |
| Date/reading-time/slug logic wrong | **Yes** | Unit |
| A button's hover color changed | No — visible immediately | Not tested |

**The build is the largest test.** Because content is Zod-validated and types are
strict, an entire class of bugs is a compile or build failure rather than a
runtime one. That is why the unit suite is deliberately small.

**No coverage target.** A number would drive tests toward what is easy to cover
rather than what is risky.

## 2. Layers

```
Lighthouse CI   ── budgets, 4 routes                     ~90s
E2E + axe       ── journeys, a11y, no-JS, keyboard        ~60s
Unit (Vitest)   ── content pipeline, lib/, schemas         ~5s
Type + build    ── the foundation, always running          ~60s
```

## 3. Unit tests — Vitest

**Scope:** `lib/**`, content loaders and schemas, and any feature `lib/` with
real logic.

What is tested:
- Every Zod schema: valid input parses; each constraint rejects; defaults apply.
- Content loaders: draft filtering, future-date filtering, sort order, tag
  grouping, prev/next resolution at list boundaries.
- `format-date`, `reading-time`, `slugify` — including timezone edge cases,
  which are a classic source of an off-by-one-day bug on a blog.
- Metadata and JSON-LD builders: given a post, the correct absolute canonical,
  OG image, and schema shape come out.
- Feed generation: valid XML, absolute URLs, correct ordering.

Convention: `*.test.ts` beside the source
([PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) §8). Tests use the same fixtures
as the pipeline, in `tests/fixtures/`.

**Components are largely not unit tested.** The exceptions are components with
real logic: the project filter's URL-param serialization, and the contact form's
validation and error-association behavior. Both are tested through Testing
Library, querying **by role and accessible name only** — never by test id or
class — so a test that passes is also evidence the component is accessible.

## 4. E2E — Playwright

**Projects:** Chromium desktop, WebKit desktop, Mobile Chrome (Pixel 5). Run
against a production build served from `out/`, never the dev server — the same
reasoning as everywhere else in this project
([GITHUB_PAGES.md](./GITHUB_PAGES.md) §11).

| Spec | Asserts |
| --- | --- |
| `navigation.spec.ts` | Every route in the manifest loads with a 200, a correct `<h1>`, and a unique title |
| `a11y.spec.ts` | axe over every route, in **both themes**, zero violations |
| `keyboard.spec.ts` | Skip link works; tab order is sensible; the mobile sheet traps and restores focus; Escape closes overlays |
| `no-js.spec.ts` | With JS disabled: all content is present, nav works, no element is stuck at `opacity: 0` |
| `smooth-scroll.spec.ts` | Lenis's three hard rules: off under reduced motion and on touch (and torn down when the preference changes mid-session); find-in-page, keyboard scroll and `scroll-margin-top` anchors all still work |
| `contact.spec.ts` | Validation errors are announced and associated; the `mailto:` fallback exists |
| `content.spec.ts` | Every case study renders all required sections; every post has a TOC and working anchors |
| `seo.spec.ts` | Title, description, canonical, absolute `og:image`, and valid JSON-LD on every route |
| `404.spec.ts` | An unknown path serves the custom 404 |

**`no-js.spec.ts` is the highest-value spec in the suite.** The reveal-animation
pattern makes it structurally possible to ship a page whose content is invisible
without JavaScript ([ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §5).
This test is the mechanism that prevents it, and without it the guarantee is
just an intention.

Specs are data-driven from the route manifest in `config/nav.ts`, so adding a
route automatically adds it to navigation, a11y, and SEO coverage. Forgetting to
test a new page is therefore not possible.

## 5. Accessibility testing

Automated (`@axe-core/playwright`, every route, both themes, zero violations)
covers roughly 30–40% of real issues. The remaining guarantee comes from the
manual checklist in [ACCESSIBILITY.md](./ACCESSIBILITY.md) §9, run before every
phase merge. Automation prevents regressions; the manual pass finds the
problems in the first place. Neither substitutes for the other, and the
automated pass must never be presented as the whole story.

## 6. Performance testing

Lighthouse CI against a served `out/`: 4 routes × 3 runs, median asserted against
the budgets in [PERFORMANCE.md](./PERFORMANCE.md) §2. `size-limit` enforces
per-route byte budgets independently, because it fails faster and points directly
at the offending bundle.

Per phase: a Playwright trace on `/` and `/journey` asserting ≥ 55 fps during
animation, and a manual pass on a real mid-range Android.

## 7. Visual regression — deliberately not automated

Screenshot diffing across three browsers, two themes, and four viewports produces
constant false positives from font rendering and animation timing. For a
single-maintainer site where every visual change is intentional and immediately
visible in review, the maintenance cost exceeds the value.

The substitute: a manual visual pass at 320/768/1440 in both themes on the
release checklist. If the site later grows contributors, this decision is worth
revisiting — the cost/benefit changes when changes come from people who did not
design the page.

## 8. Content testing

- `pnpm content:validate` — Zod over everything, ~1s. Runs in pre-commit for
  staged content and in CI.
- Cross-reference integrity: every `stack` id resolves in `skills.ts`; every tag
  is in the controlled vocabulary; every internal link in MDX resolves to a real
  route ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §3).
- Editorial rules (§6 of CONTENT_STRATEGY) are **not** automated. Prose quality
  is a review judgment; a linter enforcing it would produce false confidence.

## 9. Running tests

```bash
pnpm test              # unit, watch off
pnpm test:watch        # unit, watch
pnpm test:e2e          # Playwright against a built out/
pnpm test:e2e --ui     # interactive debugging
pnpm content:validate  # schemas only, fast
pnpm lh                # Lighthouse against a local out/
```

Pre-commit runs Biome and content validation on staged files only. The full suite
runs in CI. Hooks are a convenience, never the authority
([TECH_STACK.md](./TECH_STACK.md) §2).

## 10. When a test fails

1. **Never delete or skip a test to go green.** A skipped test is a lie in the
   suite. If a test is genuinely wrong, fix or remove it in its own commit, with
   the reason in the message.
2. Reproduce locally with the same command CI ran.
3. For a flaky E2E failure: find the race. Almost always a missing
   `await expect(...)` auto-retry, replaced by a fixed timeout. Retries are set
   to 1 in CI and 0 locally, so flakiness surfaces rather than hides.
4. For a budget failure: read the bundle-size diff comment on the PR — it names
   the route and the delta.

## 11. Writing a good test here

- Query by role and accessible name; never by class or test id.
- Assert user-visible outcomes, not implementation details.
- One behavior per test, with a name that states the behavior.
- No shared mutable state between tests; no ordering dependencies.
- Prefer a real fixture MDX file over a mock — the pipeline is the thing under
  test.

## Related

[ACCESSIBILITY.md](./ACCESSIBILITY.md) · [PERFORMANCE.md](./PERFORMANCE.md) ·
[DEPLOYMENT.md](./DEPLOYMENT.md) · [CONTRIBUTING.md](./CONTRIBUTING.md)
