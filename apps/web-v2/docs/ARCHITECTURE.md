# ARCHITECTURE

How the code is organized, why it is organized that way, and what the static
export constraint does to every one of those decisions.

## 1. One-paragraph summary

A single Next.js application using the App Router, compiled to static HTML/CSS/JS
by `output: 'export'` and served by GitHub Pages. Code is organized **feature-first**:
each domain (projects, blog, experience, playground) owns its components, types,
and data access, and exposes a small public surface through a barrel. Routes are
thin — a route file composes feature sections and defines metadata, nothing else.
Content lives in MDX files parsed at build time. There is no runtime backend, no
client-side data fetching, and no global state manager.

## 2. The three-layer model

```
┌──────────────────────────────────────────────────────┐
│  app/          Routes. Metadata, params, composition. │  ← thin
├──────────────────────────────────────────────────────┤
│  features/     Domain logic + domain UI.              │  ← thick
│  components/   Cross-domain UI (ui/, layout/, motion/)│
├──────────────────────────────────────────────────────┤
│  lib/  content/  config/   Primitives, data, tokens.  │  ← stable
└──────────────────────────────────────────────────────┘
```

Dependencies point **downward only**. `app/` may import from anything;
`features/` may import from `components/`, `lib/`, `config/`; `components/` may
import from `lib/` and `config/` but never from `features/`. `lib/` imports
nothing from the layers above it.

**Why layers rather than a flat `src/components`:** at ~120 components, a flat
folder makes it impossible to tell what is safe to change. The layer rule
answers "who can break if I edit this?" in one glance at the path.

## 3. Feature-first, not type-first

Rejected structure (type-first):

```
components/   ← 120 files, unrelated
hooks/        ← 30 files, unrelated
types/        ← every type in the app
```

Chosen structure (feature-first):

```
features/projects/
  components/ProjectCard.tsx
  components/ProjectFilter.tsx
  lib/get-projects.ts
  lib/project-schema.ts
  types.ts
  index.ts          ← the ONLY public surface
```

**Rationale.** Work arrives as features ("improve the project filter"), not as
types ("edit all hooks"). Feature-first means a change touches one directory.
Deleting a feature is `rm -rf` plus removing one route. Onboarding is
directory-shaped: read `features/blog/` and you understand the blog.

**Trade-off accepted.** Some duplication across features (two slightly different
card layouts) is *preferred* to a prematurely generalized `<Card variant>` with
nine props. The promotion rule is in §4.

**Alternatives considered.**
- *Type-first* — rejected above.
- *Atomic Design (atoms/molecules/organisms)* — rejected. The atom/molecule
  boundary is unresolvable in practice and generates naming debates with no
  payoff. `ui/` vs `features/` captures the only distinction that matters:
  domain-agnostic vs domain-aware.
- *Package-per-feature monorepo* — rejected. Explicitly a non-goal
  ([PRODUCT.md](./PRODUCT.md) §6); the coordination cost of workspaces buys
  nothing for a single-maintainer static site.

## 4. The promotion rule

A component starts local to the feature that needs it. It moves to
`components/ui/` when **all three** hold:

1. It is used by ≥ 2 features.
2. It has no domain vocabulary in its props (no `project`, no `post`).
3. Its API is stable — no prop added in the last two changes to it.

Corollary: never create a component in `components/ui/` speculatively. The
directory is a *destination*, not a starting point.

## 5. Import boundaries (enforced)

| From | May import | Must not import |
| --- | --- | --- |
| `app/**` | anything | — |
| `features/x/**` | `components/**`, `lib/**`, `config/**`, own files | `features/y/**` internals, `app/**` |
| `components/**` | `components/**`, `lib/**`, `config/**` | `features/**`, `app/**` |
| `lib/**`, `config/**` | `lib/**`, `config/**` | everything above |

Cross-feature use goes through the barrel: `import { ProjectCard } from '@/features/projects'`
is allowed; `@/features/projects/components/ProjectCard` from another feature is
not. Enforced by a Biome `noRestrictedImports` rule with path patterns
(`TASK_BACKLOG.md` → `F0-07`). Barrels are used **only** at feature roots, never
inside them — deep barrels defeat tree-shaking and create import cycles.

## 6. Server and client components

Default to Server Components. A `'use client'` boundary is added only for:
interaction state, browser APIs, animation hooks, or context providers.

**Placement rule:** push `'use client'` as deep as possible. A page that needs
one interactive filter marks the *filter* as a client component, not the page.
A common failure is a client-marked layout that pulls the entire tree into the
bundle; the review checklist explicitly looks for this.

Under `output: 'export'` the practical meaning of "Server Component" is
*build-time component*: it runs once, at build, and its output is baked into
HTML. That is exactly what is wanted — it moves MDX parsing, syntax
highlighting, and date formatting out of the client bundle entirely.

Known client-boundary set (should stay small):
`ThemeProvider`, `CommandPalette`, `SmoothScrollProvider` (Lenis), `MotionSection`,
`ProjectFilter`, `BlogSearch`, `CopyButton`, `ThemeToggle`, playground demos.

## 7. What static export forbids, and the workaround for each

This is the single most constraining fact in the project. Full detail in
[GITHUB_PAGES.md](./GITHUB_PAGES.md); the architectural consequences:

| Unavailable | Consequence | Workaround |
| --- | --- | --- |
| Route Handlers / API routes | No server endpoints at all | Contact form posts to a third-party endpoint (Formspree) or falls back to `mailto:` |
| Middleware | No redirects, no header injection at the edge | Redirects as generated static HTML with `<meta http-equiv="refresh">` + canonical; security headers via `<meta>` where possible |
| ISR / on-demand revalidation | Content is frozen at build | Rebuild on push; GitHub Action cron for time-sensitive data |
| `next/image` default loader | No on-demand resizing | `images.unoptimized: true` + pre-generated responsive AVIF/WebP via a build script |
| Dynamic route params not known at build | Every route must be enumerable | `generateStaticParams` from the MDX file list |
| Server Actions | No form mutations | Same as row 1 |
| `notFound()` dynamic 404 | Custom 404 needs a real file | `app/not-found.tsx` exports to `404.html`, which GitHub Pages serves natively |

**Consequence for design:** any feature idea is checked against this table
*before* it enters the backlog. "Live GitHub contribution graph" becomes "graph
data fetched at build time by the deploy workflow, committed as JSON" — same
visual, zero runtime cost, works offline.

## 8. Data flow

```
content/*.mdx ──► lib/content/*  ──► zod validation ──► typed objects
                     (build time)          │
                                           ▼
                              features/*/components (RSC)
                                           │
                                           ▼
                                    static HTML
```

Three rules:

1. **Validate at the boundary.** Every MDX frontmatter object passes through a
   Zod schema. A malformed post fails the *build*, not the page. This is the
   single highest-value invariant in the codebase — it is why "add a file"
   can be a safe publishing workflow.
2. **Parse once.** Content readers are wrapped in React `cache()` so the file
   system is touched once per build per file, not once per component.
3. **No client fetching.** If a component needs data, it receives it as props
   from a Server Component. There is no SWR/React Query, and no reason for one.

## 9. State management

| Kind of state | Where it lives | Why |
| --- | --- | --- |
| Content | Build-time props | Static |
| Route/UI state (filters, tabs) | URL search params via `nuqs`-style manual parsing | Shareable, back-button correct, survives reload |
| Theme | `next-themes` + `localStorage` + a pre-hydration inline script | Must be resolved before first paint to avoid a flash |
| Ephemeral UI (menu open, palette open) | Local `useState` | Never needed elsewhere |
| Scroll/motion | Refs and imperative handles | Never re-render on scroll — this is a hard rule |

No Redux, Zustand, Jotai, or global context beyond theme and Lenis. If a piece
of state needs a store, that is a signal the component tree is wrong.

## 10. Error and edge handling

- `app/error.tsx` — a styled recovery boundary per segment; never a white screen.
- `app/not-found.tsx` — a real 404 with search and top links, exported to
  `404.html`.
- MDX render failure — impossible at runtime by construction (build-time
  compile), so failures surface in CI.
- JS disabled — all content, navigation, and links work. Animations degrade to
  final state; the command palette is simply absent. This is verified manually
  each phase.

## 11. Extensibility notes

Designed-for, not built-yet:

- **Custom domain:** change `siteConfig.url`, add `public/CNAME`, drop
  `basePath` (already `''` on this user site). Everything else derives.
- **A second content type** (e.g. `/talks`): copy `features/blog/`, swap the
  schema, add one route and one manifest entry. ~1 hour.
- **Moving off GitHub Pages:** remove `output: 'export'` and the unoptimized
  image flag. Because nothing depends on the absence of a server, the app
  becomes a normal Next.js app; only the image pipeline changes.
- **i18n:** would require a route-group restructure (`app/[lang]/`). Deliberately
  not pre-built — the abstraction cost is real and the need is hypothetical.
