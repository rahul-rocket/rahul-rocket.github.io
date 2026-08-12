# PROJECT CASE STUDIES

The case study is the site's core artifact. Everything else supports it. This
document defines what a case study is, what it must contain, and the standard it
is held to.

## 1. The thesis

A project card says *what was built*. A case study says *what was hard, what was
chosen, and what it cost*. Only the second one distinguishes an engineer from a
résumé.

The structural commitment that follows: **the Problem section must be longer than
the Tech Stack section.** If it is not, the case study is describing rather than
demonstrating, and it goes back for revision. This is a review rule, not a
metaphor.

## 2. What qualifies

A project earns a case study if **all four** hold:

1. **A real constraint existed** — scale, deadline, legacy system, budget,
   compliance, team size, or an inherited decision.
2. **A genuine decision was made** — at least two viable options, with a
   defensible reason for the one taken.
3. **The outcome is measurable** — a number, or an honestly stated qualitative
   result with its measurement method.
4. **It can be published** — no NDA breach, no unpermitted client detail
   ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §6).

If a project fails (1) or (2), it belongs in a compact "Other work" list. **Three
strong case studies beat twelve entries** — and a weak one placed next to strong
ones drags the average down, which is how the reader forms an impression.

## 3. Required structure

Fixed section order. Consistency lets a reader who has read one case study skim
the next in 40 seconds and land exactly where they want.

| # | Section | Purpose | Length |
| --- | --- | --- | --- |
| 1 | **Header** | Title, role, period, team size, stack, live/repo links | — |
| 2 | **Overview** | What it is, in three sentences, for someone with no context | 60–80 words |
| 3 | **The Problem** | The business and technical situation. What was actually broken and who it hurt. | 200–400 words |
| 4 | **Constraints** | Time, budget, team, legacy, compliance, non-negotiables | List |
| 5 | **Options Considered** | 2–4 real alternatives, each with why it was plausible | 150–300 words |
| 6 | **The Decision** | What was chosen and the reasoning. **Name what was given up.** | 150–300 words |
| 7 | **Architecture** | A diagram plus its prose equivalent. Data flow, boundaries, failure modes. | Diagram + 150–250 words |
| 8 | **Implementation Highlights** | The 2–3 genuinely interesting technical parts, with code where it helps | 200–400 words |
| 9 | **Challenges & Solutions** | What went wrong and how it was handled | 200–300 words |
| 10 | **Outcome** | Measured results, before and after | Metric list + 100 words |
| 11 | **What I'd Do Differently** | Honest retrospective | 100–200 words |
| 12 | **Footer** | Stack detail, links, prev/next project | — |

**Section 11 is mandatory.** A case study without a retrospective reads as
marketing, and every experienced reader in the audience knows it. Admitting a
mistake is the strongest credibility signal available, and it is free.

## 4. Frontmatter contract

```yaml
---
title: "Settlement reconciliation for a payments platform"
summary: "Manual reconciliation consumed six hours a day and still missed breaks. A deterministic matching engine cut it to twenty minutes."
role: "Lead engineer — architecture, data layer, delivery"
period: { start: 2024-02, end: 2024-11 }
teamSize: 4
industry: fintech
featured: true
order: 1
stack: [typescript, node, postgres, redis, aws-ecs]   # ids from skills.ts
metrics:
  - { label: "Daily manual review", before: "6h", after: "20m" }
  - { label: "Unmatched breaks", before: "3.1%", after: "0.2%" }
  - { label: "Reconciliation runtime", before: "48m", after: "90s" }
links:
  live: https://…          # optional
  repo: https://…          # optional
  writeup: /blog/…         # optional
confidential: false         # true ⇒ anonymized; enforces client-name absence
draft: false
---
```

`stack` entries are **ids validated against `content/skills.ts`** — an unknown id
fails the build. That is what makes "all projects using Postgres" a free feature
and guarantees the Skills page and the case studies never disagree
([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §3).

`metrics` are structured, not prose, so the index card, the OG image, and the
Outcome section all render from one source.

## 5. Writing standards

- **Lead with the problem, not the technology.** "Reconciliation took six hours a
  day" — not "Built with Node and Postgres."
- **Every number states its measurement.** "p95 measured over 30 days in
  production via Datadog," not a bare figure.
- **Name the trade-off explicitly.** Every Decision section contains a sentence
  beginning "The cost of this was…".
- **Attribution is precise.** Team size is in the frontmatter and the role line
  states scope. "I designed X; a team of four built the product around it."
- **No unexplained jargon.** Domain terms (settlement, break, netting) get a
  clause on first use — the hiring manager reading this may not be a payments
  person.
- **Code samples are illustrative, not exhaustive.** 5–25 lines, showing the idea,
  not the file.

### Confidential projects

When `confidential: true`: anonymize the client ("a mid-size logistics
platform"), round metrics to a defensible precision, redraw diagrams
generically, and omit anything proprietary. A build check asserts that no string
from a private `confidential-terms` list appears in the rendered output. **When
in doubt, leave it out.**

## 6. Diagrams

Diagrams are a first-class deliverable, not an afterthought.

**Rules**
- **SVG, authored as source**, not exported bitmaps — they must be crisp,
  themeable via `currentColor` and CSS variables, and small.
- Every diagram has `<title>` and `<desc>` **and** a prose equivalent immediately
  following it. The prose is the source of truth; the diagram is the aid. A
  reader on a screen reader loses nothing.
- Theme-aware: strokes and fills use design tokens, so the diagram is legible in
  both themes.
- ≤ 12 nodes. A diagram that needs more is two diagrams.
- Consistent visual language across all case studies: rectangle = service,
  cylinder = datastore, solid arrow = synchronous, dashed = asynchronous, dotted
  boundary = trust/network boundary. A legend appears on the first diagram of
  each case study.

**Animation.** The draw-on effect (GSAP ScrollTrigger, sanctioned usage #2) is
scroll-scrubbed and renders complete under reduced motion or without JS
([ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §3).

## 7. Page implementation

- Route: `/projects/[slug]/`, statically generated via `generateStaticParams`
  over `content/projects/*.mdx`.
- Sticky TOC on ≥ 1280px (`<nav aria-label="On this page">`, `aria-current` on
  the active section).
- Reading progress indicator in the header.
- Metrics render as a compact stat row near the top **and** in the Outcome
  section — the skimmer sees the result immediately; the reader sees it in
  context.
- Prev/next by `order`.
- `Article` + `TechArticle` structured data, per-project OG image generated at
  build from title + headline metric.

## 8. The index page

`/projects` derives entirely from the case-study frontmatter — no second list to
maintain. Each entry shows the **problem in one line**, not a description; the
role; the headline metric; and the stack. Filtering by stack id via URL search
params. Layout is deliberately asymmetric to avoid the template card-grid look
([WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.6).

## 9. Screenshots (future)

Deferred to Phase 7+, gated on permission per project.

When added: `public/content/projects/<slug>/`, source ≤ 2000px and ≤ 500 KB,
build-generated AVIF/WebP responsive variants, `<figure>` with a caption
explaining *what to look at*, click-to-enlarge in a focus-trapped dialog, and
`alt` text describing the interface's purpose. Any screenshot containing real
user data is redacted before it enters Git history — redaction after the fact is
not possible in a public repo.

## 10. Quality checklist

- [ ] Meets all four qualification criteria (§2)
- [ ] Problem section longer than the stack list
- [ ] 2+ real options considered
- [ ] A trade-off explicitly named, with the phrase "the cost of this was"
- [ ] "What I'd do differently" is present and honest
- [ ] Every metric has a measurement method
- [ ] Diagram has `<title>`, `<desc>`, and a prose equivalent
- [ ] All `stack` ids resolve in `skills.ts`
- [ ] Confidentiality reviewed; `confidential` flag correct
- [ ] Attribution accurate (I vs we, team size present)
- [ ] Links live and correct
- [ ] `pnpm content:validate` passes

## 11. Extensibility

- **Video walkthroughs** — a `video` frontmatter field and a lazy, click-to-play
  facade (never autoplay, never an eagerly loaded embed).
- **Interactive demos** — a `/playground` route already exists in the
  architecture for client-heavy demos, keeping them off content routes' budgets.
- **A "Other work" compact list** — a `featured: false` flag already excludes an
  entry from the index feature area; rendering the tail list is a small component.

## Related

[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.7 ·
[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) · [PERSONAL_BRAND.md](./PERSONAL_BRAND.md) ·
[ACCESSIBILITY.md](./ACCESSIBILITY.md)
