# rahul-rocket.github.io (apps/web-v2)

The personal website of **Rahul Rocket** — Full Stack Software Engineer &
Software Architect.

**Live:** <https://rahul-rocket.github.io>

> **Moved.** This app was developed as the standalone repository
> `rahul-rocket/rahul-rocket.github.io`, which still exists and still serves the
> live site above. It now also lives here, as `apps/web-v2` of the
> `rahul-rocket-v2.github.io` monorepo. Nothing in the app changed; run its
> commands with `pnpm --filter web-v2 <script>` from the repo root, or directly
> from this directory. See [CLAUDE.md §0](./CLAUDE.md) for what the move
> changed, and the root `AGENTS.md` for how the two apps coexist.

---

## Overview

A statically exported Next.js site that functions as a professional record and a
demonstration piece. The premise: a portfolio for an engineer should itself be
evidence of engineering ability. Every claim on the site links to something
inspectable — a case study, a repository, an article, or a stated metric with its
measurement method.

It is built as a product, not a page: a design system, a typed content model, a
release process, performance and accessibility budgets that gate merges, and a
tracked backlog.

## Purpose

The site answers, for a recruiter, a hiring manager, a founder, or a peer
engineer:

- Who Rahul is and how he works
- What he specializes in, at what depth
- What systems he has designed and delivered
- What problems he solved, what he traded away, and what it cost
- How to work with him

Full audience analysis in [docs/TARGET_AUDIENCE.md](docs/TARGET_AUDIENCE.md).

## Status

> **Phases 2 through 9 are built. The site is complete as software and gated on
> content review as a publication.**
>
> Every route in the manifest ships — 30 pages, from Home through the case
> studies, the blog, the résumé and the contact surface. All merge gates pass:
> typecheck, lint, 160 unit tests, 300 end-to-end tests including axe on every
> route in both themes, per-route byte budgets, 1,909 internal links, and 128
> contrast pairs across 8 composited contexts.
>
> **The export ships `noindex`, and that is deliberate.** `site.indexable` in
> `src/config/site.ts` is `false` because parts of the content layer —
> `content/experience.ts`, `journey.ts`, `about.ts`, `uses.ts`, and two of the
> three case studies — are **drafted to the documented editorial standard and
> are not yet the author's verified record**. Each of those files carries a
> notice saying so, and the two case studies are marked on the page. Replacing
> them and flipping one boolean is what publishes the site.
>
> What is genuinely unfinished, and why, is in
> [docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md)'s M7 note — including the byte
> target that is not met and the six quality tasks that need a human rather
> than a build.

## Features

- **Case studies** — the core artifact: problem, constraints, options, decision,
  architecture, outcome, and an honest retrospective per project. Every metric
  carries its measurement method as a required schema field.
- **Technical blog** — MDX, build-time syntax highlighting, RSS/Atom/JSON feeds
- **Experience, skills, and journey** — from one typed data source, rendered by
  three pages and the résumé
- **Open source** — contributions with context; repo data fetched at build time
- **Résumé** — web and PDF, generated from the same source so they cannot drift
- **Dark and light themes** — both fully designed, resolved before first paint
- **Command palette**, smooth scroll, scroll-choreographed diagrams — all as
  progressive enhancements
- **Accessible by default** — WCAG 2.2 AA, AAA text contrast, full keyboard
  support, reduced-motion paths, and complete function with JavaScript disabled

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, static export) |
| UI | React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui (copied source) |
| Animation | Motion, Lenis, GSAP (two sanctioned uses) |
| Content | MDX + Zod validation |
| Tooling | Biome, Husky, lint-staged, pnpm |
| Testing | Vitest, Testing Library, Playwright, axe |
| Hosting | GitHub Pages via GitHub Actions |

Every dependency's justification, rejected alternatives, and byte cost are in
[docs/TECH_STACK.md](docs/TECH_STACK.md).

## Local setup

```bash
corepack enable
pnpm install
pnpm dev
```

Node 22 (see `.nvmrc`) and pnpm 9+. `npm` and `yarn` are not supported.

> **Preview with `pnpm build && pnpm start`, not the dev server.** The dev server
> hides trailing-slash behavior, the real 404, and production bundling — the
> things that actually break on GitHub Pages.

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Static export to `out/` |
| `pnpm start` | Serve `out/` — the only faithful preview |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `lint:fix` | Biome |
| `pnpm test` / `test:e2e` | Vitest / Playwright |
| `pnpm content:validate` | Zod over all content, without a full build |
| `pnpm lh` | Lighthouse CI against a local `out/` |
| `pnpm og:generate` | Pre-render Open Graph images |
| `pnpm new:post` | Scaffold a post with valid frontmatter |

## Project structure

```
content/     MDX posts and case studies; typed records
docs/        Architecture, design, and planning documentation
public/      Static assets, fonts, generated feeds and OG images
scripts/     Build-time generators (OG, feeds, images, PDF, checks)
src/
  app/         Routes — thin
  features/    Domain logic and domain UI — thick
  components/  Cross-domain UI (ui, layout, motion, mdx, seo)
  lib/         Framework-agnostic primitives
  config/      site.ts, nav.ts, copy.ts
  styles/      Tokens and themes
tests/       E2E specs and fixtures
```

Full map and the rule for where a new file goes:
[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Quality targets

Enforced in CI on every pull request — a failure blocks the merge.

| Metric | Target |
| --- | --- |
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| LCP (mobile, throttled 4G) | ≤ 1.5s |
| CLS | ≤ 0.01 |
| JS (Home, gzipped) | ≤ 75 KB |
| axe violations | 0 |

Details in [docs/PERFORMANCE.md](docs/PERFORMANCE.md) and
[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Deployment

Push to `master` → CI quality gates → static export → GitHub Pages, in about two
minutes. A nightly cron rebuild publishes scheduled content and refreshes
build-time GitHub data. Rollback is a `git revert`, live in two minutes.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and
[docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Project initialization | ✅ |
| 1 | Documentation & planning | ◀ current |
| 2 | Design system | — |
| 3 | Application foundation | — |
| 4 | Core layout & navigation | — |
| 5 | Home | — |
| 6 | About & experience | — |
| 7 | Projects & case studies | — |
| 8 | Blog | — |
| 9 | Contact & resume | — |
| 10 | SEO, performance, accessibility & cutover | — |
| 11 | Final polish & launch | — |

Deliverables and exit criteria per phase: [docs/ROADMAP.md](docs/ROADMAP.md).
Task-level detail: [docs/TASK_BACKLOG.md](docs/TASK_BACKLOG.md).

## Documentation

| Document | Covers |
| --- | --- |
| [VISION.md](docs/VISION.md) | Why this site exists and what makes it different |
| [PRODUCT.md](docs/PRODUCT.md) | What is being built, scope and non-goals |
| [GOALS.md](docs/GOALS.md) | Measurable goals and how each is verified |
| [PERSONAL_BRAND.md](docs/PERSONAL_BRAND.md) | Positioning, voice, visual identity |
| [TARGET_AUDIENCE.md](docs/TARGET_AUDIENCE.md) | Personas and what each forces |
| [WEBSITE_STRUCTURE.md](docs/WEBSITE_STRUCTURE.md) | Every route, spec'd |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, boundaries, data flow, constraints |
| [TECH_STACK.md](docs/TECH_STACK.md) | Every dependency, justified |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens: color, type, space, motion |
| [UI_GUIDELINES.md](docs/UI_GUIDELINES.md) | Component practice |
| [ANIMATION_GUIDELINES.md](docs/ANIMATION_GUIDELINES.md) | Motion inventory and laws |
| [CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) | Content model and editorial standards |
| [BLOG_SYSTEM.md](docs/BLOG_SYSTEM.md) | Blog pipeline and rules |
| [PROJECT_CASE_STUDIES.md](docs/PROJECT_CASE_STUDIES.md) | The case study standard |
| [SEO.md](docs/SEO.md) | Metadata, structured data, feeds |
| [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | WCAG commitments and audit process |
| [PERFORMANCE.md](docs/PERFORMANCE.md) | Budgets and how they are met |
| [TESTING.md](docs/TESTING.md) | What is tested and why |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | File layout and placement rules |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Pipeline, cutover, rollback |
| [GITHUB_PAGES.md](docs/GITHUB_PAGES.md) | Static hosting constraints |
| [ROADMAP.md](docs/ROADMAP.md) | Phases and exit criteria |
| [TASK_BACKLOG.md](docs/TASK_BACKLOG.md) | 134 tracked tasks |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Workflow, commits, PR checklist |
| [CLAUDE.md](CLAUDE.md) | Development guide for AI sessions |

## Contributing

This is a personal site, so redesigns and feature additions are not accepted.
Genuinely welcome: accessibility bug reports (especially from assistive-technology
users), broken links, factual corrections, and browser-specific rendering bugs.
See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

Security issues: email rather than opening a public issue.

## License

Code is available for reference and learning. **Content — writing, case studies,
and images — is not licensed for reuse.** Please do not redeploy this site as
your own portfolio; building your own is the more useful exercise.
