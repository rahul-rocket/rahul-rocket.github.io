# PROJECT STRUCTURE

The concrete file and directory layout, and the rule that decides where any new
file goes. The reasoning behind the layering is in
[ARCHITECTURE.md](./ARCHITECTURE.md); this document is the map.

## 1. Root

```
rahul-rocket.github.io/
├── .github/workflows/     CI and deployment
├── .husky/                Git hooks
├── content/               All content (MDX + typed records)
├── docs/                  This documentation set
├── public/                Static assets served as-is
├── scripts/               Build-time generators
├── src/                   Application source
├── tests/                 E2E specs and fixtures
├── biome.json
├── commitlint.config.mjs
├── lighthouserc.json      ← Phase 3, F0-14
├── next.config.mjs
├── package.json
├── playwright.config.ts   ← Phase 3, F0-11
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── .npmrc                 strict peers, isolated node_modules
├── .nvmrc                 22
├── CLAUDE.md              Development guide
└── README.md
```

**`scripts/` as built so far.** `check-contrast.mjs` (DS-09),
`check-export.mjs` (F0-05 — the `out/` assertions), `check-image-size.mjs`
(F0-09 — the pre-commit weight gate). Written in `.mjs` rather than `.ts`
deliberately: they run before and independently of the application's build, so
giving them a compile step of their own would mean a broken build could take the
checks that diagnose it down with it.

**`content/` is at the root, not under `src/`.** It is authored data, not code —
keeping it out of `src/` means content commits are visually distinct from code
commits in every diff and `git log --stat`, and the boundary is obvious to
tooling.

## 2. `src/`

```
src/
├── app/                          Routes only — thin
│   ├── layout.tsx                Root: fonts, theme script, providers, metadata
│   ├── page.tsx                  /
│   ├── error.tsx  not-found.tsx
│   ├── about/page.tsx
│   ├── journey/page.tsx
│   ├── skills/page.tsx
│   ├── experience/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── open-source/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── tags/[tag]/page.tsx
│   ├── uses/page.tsx
│   ├── resume/page.tsx
│   ├── contact/page.tsx
│   ├── sitemap.ts   robots.ts
│   └── manifest.ts
│
├── features/                     Domain logic + domain UI — thick
│   ├── projects/
│   │   ├── components/
│   │   ├── lib/get-projects.ts  lib/project-schema.ts
│   │   ├── types.ts
│   │   └── index.ts              ← the only public surface
│   ├── blog/
│   ├── experience/
│   ├── skills/
│   ├── open-source/
│   ├── contact/
│   └── resume/
│
├── components/                   Cross-domain UI
│   ├── ui/                       shadcn-derived primitives (button, dialog, …)
│   ├── layout/                   header, footer, nav, skip-link, container
│   ├── motion/                   reveal, stagger, progress, lazy-motion-provider
│   ├── mdx/                       callout, figure, code-group, diagram, steps
│   └── seo/                      json-ld builders
│
├── lib/                          Framework-agnostic primitives
│   ├── cn.ts  format-date.ts  reading-time.ts
│   ├── mdx/                      compile, plugins, component map
│   ├── content/                  loaders + Zod schemas (shared)
│   └── seo/                      metadata builders
│
├── config/
│   ├── site.ts                   Identity — the single source (§4)
│   ├── nav.ts                    Route manifest, nav and footer groups
│   └── copy.ts                   UI microcopy
│
├── hooks/                        Cross-feature hooks only
│   └── use-media-query.ts  use-mounted.ts  use-scroll-progress.ts
│
├── styles/
│   ├── tokens.css                :root primitives (color, type, space, motion)
│   ├── themes.css                semantic tokens per theme
│   ├── globals.css               @import tailwind; @theme inline bridge
│   └── typography.css            MDX prose styles
│
└── types/
    └── global.d.ts               Ambient declarations only
```

## 3. The placement rule

One question, asked in order:

```
Is it a route?                          → app/
Does it know about a domain concept
  (project, post, role, skill)?         → features/<domain>/
Is it UI used by ≥ 2 features with no
  domain vocabulary in its props?       → components/
Is it a pure function with no React?    → lib/
Is it a constant the site is configured by? → config/
Otherwise                               → it stays local to its feature
```

Default to **local**. `components/ui/` is a destination reached by the promotion
rule ([ARCHITECTURE.md](./ARCHITECTURE.md) §4), never a starting point.

## 4. `config/site.ts` — the single source

```ts
export const siteConfig = {
  name: 'Rahul Rocket',
  role: 'Full Stack Software Engineer & Software Architect',
  description: '…',
  url: 'https://rahul-rocket.github.io',
  basePath: '',                       // '' for a user site; set for project sites
  email: '…',
  locale: 'en_US',
  socials: { github: '…', linkedin: '…', x: '…' },
  ogImage: '/og/default.png',
} as const;
```

Consumed by metadata, structured data, feeds, sitemap, footer, contact page, and
the résumé. A custom-domain migration is a change to `url` and
nothing else ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §7).

## 5. `content/`

```
content/
├── blog/<slug>.mdx
├── projects/<slug>.mdx
├── experience.ts  journey.ts  skills.ts  achievements.ts
├── certifications.ts  open-source.ts  tags.ts  testimonials.ts
├── uses.mdx
└── generated/repos.json        ← build-time GitHub data; gitignored
```

Format rationale per type is in [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §2.

## 6. `public/`

```
public/
├── brand/          portrait, logo, icon sources (the only hand-managed images)
├── content/<slug>/ per-content images, co-located by slug
├── og/             generated OG images (gitignored)
├── fonts/          self-hosted woff2 subsets
├── favicon.ico  icon.svg  apple-touch-icon.png
├── site.webmanifest  robots.txt  humans.txt
├── rss.xml  atom.xml  feed.json     (generated, gitignored)
└── .nojekyll                        ← required; see GITHUB_PAGES.md §3
```

## 7. `scripts/`

| Script | Purpose |
| --- | --- |
| `generate-og.ts` | Build-time OG images (Satori + resvg) |
| `generate-feeds.ts` | RSS, Atom, JSON Feed |
| `optimize-images.ts` | Responsive AVIF/WebP variants |
| `fetch-github-data.ts` | Repo metadata → `content/generated/repos.json` |
| `generate-resume-pdf.ts` | Playwright print-to-PDF of `/resume` |
| `check-contrast.mjs` | Token contrast pairs, every theme × direction |
| `validate-content.ts` | Zod over all content without a full build |
| `check-links.ts` | Internal link integrity over `out/` |

All run in the build or in CI. None runs at request time — there is no request
time.

## 8. `tests/`

```
tests/
├── e2e/            navigation, a11y (axe), no-js, keyboard, forms
├── fixtures/       sample MDX for pipeline tests
└── setup/
```

Unit tests live **beside their source** (`format-date.test.ts` next to
`format-date.ts`) so a deleted module takes its tests with it. Only E2E, which
has no single source file, lives in `tests/`. Scope is in
[TESTING.md](./TESTING.md).

## 9. Import conventions

```ts
import { ProjectCard } from '@/features/projects';          // ✅ via barrel
import { Button } from '@/components/ui/button';            // ✅ direct
import { ProjectCard } from '@/features/projects/components/project-card'; // ❌
import { getPosts } from '../../../lib/content/posts';      // ❌ relative escape
```

- `@/*` maps to `src/*`. Relative imports only within the same directory.
- Feature barrels at feature roots only — never nested, since deep barrels defeat
  tree-shaking and create cycles.
- Import order (enforced by Biome): node builtins → external → `@/` internal →
  relative → styles → types.
- Boundaries from [ARCHITECTURE.md](./ARCHITECTURE.md) §5 are enforced by a
  Biome `noRestrictedImports` rule, not by convention alone.

## 10. Where things do *not* go

| Anti-pattern | Correct home |
| --- | --- |
| `src/utils/` (a junk drawer) | `lib/`, named by purpose |
| A shared `types/` for domain types | `features/<domain>/types.ts` |
| Business logic in `app/*/page.tsx` | `features/<domain>/lib/` |
| A component in `components/ui/` used by one feature | That feature's `components/` |
| Copy strings inside a component | `config/copy.ts` or content |
| A `constants.ts` at the root | `config/`, split by concern |
| A `helpers/` directory | Anywhere with a real name |

## 11. Extensibility

- **A new feature** = one directory under `features/` + one route + one nav
  manifest entry. Removing it is `rm -rf` plus those two lines.
- **A new content type** = a schema in `lib/content/`, a loader, a route.
- **Extracting a design system package** later: `components/ui/` + `styles/` are
  already dependency-free of `features/`, so the extraction is a move, not a
  refactor.

## Related

[ARCHITECTURE.md](./ARCHITECTURE.md) · [UI_GUIDELINES.md](./UI_GUIDELINES.md) ·
[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) · [CLAUDE.md](../CLAUDE.md)
