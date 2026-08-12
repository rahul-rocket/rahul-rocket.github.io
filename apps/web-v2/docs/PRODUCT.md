# PRODUCT

> Personal portfolio for **Rahul Rocket** — Full Stack Software Engineer, Software Architect, AI Builder.
> Live at <https://rahul-rocket.github.io>, portable to a custom domain.

## 1. What this is

A statically exported Next.js site that functions as a professional record and a
demonstration piece. The premise: a portfolio for an engineer should itself be
evidence of engineering ability. Every claim on the site is backed by something
inspectable — a case study, a repository, an article, a running demo.

It is a *product*, not a page. It has a design system, a content model, a
release process, budgets that gate merges, and a backlog. That framing is the
point: the artifact demonstrates how its author builds software.

## 2. Status

| Phase | Scope | State |
| --- | --- | --- |
| 0 | Legacy CRA site (React 18, `react-scripts`, `react-router-dom`) | **Live in `master`** |
| 1 | Planning, documentation, architecture, roadmap, backlog | **This phase** |
| 2+ | Implementation per [ROADMAP.md](./ROADMAP.md) | Not started |

### Important: the legacy app is still deployed

`src/` contains a Create React App project (`App.js`, `Pages/Home.js`,
`Pages/About.js`) built by `.github/workflows/deploy.yml`. This documentation
phase deliberately does **not** touch it — replacing `package.json` with a
Next.js manifest would break the live deployment before a replacement exists.

The rewrite is a **fresh start**: no legacy source is reused, migrated, or
preserved. The old tree is deleted in a single commit during the Phase 10
cutover, as the last step of a single changeover, so the site is never
half-migrated. Exact config files are specified in
[TECH_STACK.md](./TECH_STACK.md) and [DEPLOYMENT.md](./DEPLOYMENT.md); the
sequence is `Q-12` in [TASK_BACKLOG.md](./TASK_BACKLOG.md).

## 3. The user problem

Three audiences arrive with three different jobs-to-be-done, and a single page
usually serves only one of them.

| Audience | Job | Time budget | What failure looks like |
| --- | --- | --- | --- |
| Hiring manager / senior engineer | "Is this person's depth real?" | 30s skim, then 5 min on one artifact | Bounces because the first screen is a logo wall |
| Collaborator / client | "Can they ship a product end to end?" | 2 min | Finds no live links, no outcomes, no numbers |
| Peer from search / social | "Is this article worth my time?" | 15s | Lands on a blog post that assumes site context |
| Recruiter filtering keywords | "Does the stack match the req?" | 20s | Cannot find a skills list or a resume |

The product's job is to serve all four without compromising the first. The
information architecture in [WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) is derived directly from
this table: Home optimizes for the 30-second skim, case studies for the
5-minute read, every blog post stands alone as a landing page, and Resume plus
structured data serve keyword filtering without polluting the other three.

## 4. Product principles

1. **Evidence over adjectives.** Replace every "passionate about performance"
   with a number and a link. If a claim cannot be linked, cut it.
2. **The medium is the message.** Performance, accessibility, and interaction
   quality are product requirements, not polish. A slow portfolio is a
   counter-argument to its own content.
3. **Fewer, deeper, verifiable.** Three real case studies beat twelve entries.
   When choosing between adding a section and improving one, improve.
4. **Content is data, code is a renderer.** Publishing must never require a code
   change. See [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md).
5. **Boring where it counts.** Novelty in interaction and copy; conventional in
   architecture, tooling, and navigation. Nobody is impressed by a custom router.

## 5. Success criteria

The project is done when all of the following hold.

**Quality**
- Lighthouse ≥ 95 on all four categories, mobile profile, for Home, a project
  case study, and a blog post. Accessibility, Best Practices, SEO = 100.
- Core Web Vitals in the "good" band on real-device throttling (exact budgets in
  [PERFORMANCE.md](./PERFORMANCE.md)).
- Zero WCAG 2.2 AA violations from automated scans, plus a passing manual
  keyboard and screen-reader walkthrough ([ACCESSIBILITY.md](./ACCESSIBILITY.md)).
- `tsc --noEmit` and `biome check` clean; no `any` outside declared shims.

**Substance**
- ≥ 3 projects written as full case studies (problem → decision → outcome).
- ≥ 3 published articles.
- ≥ 2 working Playground demos.
- Every page renders correct metadata, Open Graph image, and JSON-LD.

**Maintainability**
- Adding a blog post is: create one `.mdx` file. No code edits.
- Adding a project is: create one `.mdx` file. No code edits.
- A new page can be added without editing global layout or navigation code more
  than once (a single route manifest).

## 6. Non-goals

Explicitly out of scope, recorded so they are not relitigated:

- A CMS, database, or any server runtime. The output is static files.
- Authentication, comments, or user accounts.
- A monorepo, or any build orchestrator (Turborepo, Nx).
- A design-system package published to npm.
- i18n. English only until there is a reason otherwise.
- Analytics that require a cookie banner ([SEO.md](./SEO.md) covers the
  privacy-preserving alternative).
- A "3D everything" experience. React Three Fiber is admitted only where it
  carries information ([TECH_STACK.md](./TECH_STACK.md) §2).

## 7. Constraints

- **Static export only.** GitHub Pages serves files. No middleware, no route
  handlers, no ISR, no server actions, no `next/image` optimization loader.
  This constrains the architecture more than any other single fact — see
  [ARCHITECTURE.md](./ARCHITECTURE.md) §7 and [GITHUB_PAGES.md](./GITHUB_PAGES.md).
- **Domain portability.** All URLs derive from one `siteConfig.url` constant.
  Moving to a custom domain is a one-line change plus a `CNAME` file.
- **Single maintainer.** Favor conventions that survive a six-month gap between
  sessions over clever abstractions.
- **Dependency discipline.** Every dependency needs a written justification in
  [TECH_STACK.md](./TECH_STACK.md). "Popular" is not a justification.

## 8. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep into an infinite polish loop | Never ships | Phase exit criteria in [ROADMAP.md](./ROADMAP.md); Phase 11 is the ship gate, everything after is optional |
| Animation budget erodes performance | Fails the core claim | CI Lighthouse budget gate ([PERFORMANCE.md](./PERFORMANCE.md)) |
| Content never gets written | A beautiful empty site | Content is a *phase deliverable*, not a follow-up |
| Static-export limits discovered late | Rework | Export-first: `output: 'export'` is set before any page exists |
| Six-month gap between sessions | Lost context | [CLAUDE.md](../CLAUDE.md) plus this docs set is the handoff |
| Ecosystem churn (Tailwind v4, Motion, Next majors) | Broken upgrades | Pin exact versions; upgrade one dependency per PR |

## 9. Document map

| Document | Answers |
| --- | --- |
| [VISION.md](./VISION.md) | Why this exists and what it should feel like |
| [PERSONAL_BRAND.md](./PERSONAL_BRAND.md) | Positioning, voice, visual identity |
| [TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) | Personas and what each one forces |
| [GOALS.md](./GOALS.md) | Measurable targets and how they are verified |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the code is organized and why |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | The literal folder tree |
| [TECH_STACK.md](./TECH_STACK.md) | What each dependency is for |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens: color, type, space, elevation, motion |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Component inventory and usage rules |
| [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) | Motion principles and the budget |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG AA commitments and test plan |
| [SEO.md](./SEO.md) | Metadata, structured data, feeds |
| [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) | Content model and voice |
| [WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) | Every page, its purpose and layout |
| [BLOG_SYSTEM.md](./BLOG_SYSTEM.md) | MDX pipeline for articles |
| [PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) | The case-study format |
| [GITHUB_PAGES.md](./GITHUB_PAGES.md) | Static export constraints and workarounds |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD pipeline |
| [PERFORMANCE.md](./PERFORMANCE.md) | Budgets and enforcement |
| [TESTING.md](./TESTING.md) | Test strategy and pyramid |
| [ROADMAP.md](./ROADMAP.md) | Phases with deliverables and exit criteria |
| [TASK_BACKLOG.md](./TASK_BACKLOG.md) | The executable task list |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Workflow, conventions, commands |
| [CLAUDE.md](../CLAUDE.md) | Standing instructions for AI-assisted sessions |
