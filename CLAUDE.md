# CLAUDE.md

This file gives Claude Code context for working in this repository.

The full working guide lives in [AGENTS.md](./AGENTS.md) — read it first. It covers the
monorepo layout, commands, import conventions, and the strict-TypeScript rules that apply to
every change here.

## Quick reference

```bash
pnpm install          # pnpm only -- npm/yarn will produce the wrong lockfile
pnpm dev              # web on http://localhost:3000, web-v2 on http://localhost:3001
pnpm check-types      # must pass before you call a change done
pnpm build            # must pass before you call a change done
pnpm lint
pnpm test             # web-v2's Vitest suite (web has no tests)

pnpm pages:assemble   # build the Pages artifact into _pages/ (needs both builds first)
pnpm pages:serve      # assemble, then serve it -- the only faithful preview of both sites
```

## Deployment

Both apps publish to **one** GitHub Pages site from `develop`, via
[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml):

| Source | URL | Output |
| --- | --- | --- |
| `apps/web` | `https://rahul-rocket.github.io/` | `apps/web/out/` → `_pages/` |
| `apps/web-v2` | `https://rahul-rocket.github.io/v2/` | `apps/web-v2/out/` → `_pages/v2/` |

The two builds are independent — neither reads the other's output — and are
joined only by [scripts/assemble-pages.mjs](scripts/assemble-pages.mjs), which
also asserts that V2 did not overwrite any of V1's root-level files (`_next/`,
`404.html`, `robots.txt`, `sitemap.xml`). Nothing publishes unless both builds
and all gates pass.

Two things to know before editing either app:

- **`apps/web` is a static export now** (`output: 'export'`). There are no API
  routes and no request-time database access; `/blog` reads Postgres once, during
  the build. See the notes below.
- **`apps/web-v2` is served from `/v2`**, and its `basePath` does not cover its
  hand-written `<a href>` navigation — a post-build script does. Read
  [apps/web-v2/CLAUDE.md](./apps/web-v2/CLAUDE.md) §0 before touching its URLs.

The Pages **source setting** (Settings → Pages → Source = "GitHub Actions") is
manual and the workflow cannot set it. If it is wrong, deploys report success and
the live site never changes.

## Shape of the repo

- `apps/web` — the Next.js 16 App Router site, statically exported to GitHub Pages at the apex.
  Postgres-backed at **build time** only. Alias `@/*` points at the app root.
- `apps/web-v2` — the Next.js 15 statically exported site moved over from the `rahul-rocket.github.io`
  repo. Self-contained: its own Biome/Vitest/Playwright toolchain, its own docs, no shared
  packages. **Read [apps/web-v2/CLAUDE.md](./apps/web-v2/CLAUDE.md) before editing it** — the
  notes below describe `apps/web`.
- `packages/ui` — `@portfolio/ui`, the shared shadcn/ui library. Ships TS source; Next transpiles
  it. Import as `@portfolio/ui/button`, `@portfolio/ui/lib/utils`. Used by `web` only.
- `packages/typescript-config`, `packages/eslint-config` — shared presets. Used by `web` only.

The two apps share the repository, the lockfile and Turborepo — nothing else. One constraint
crosses the boundary: both must pin the **same `@types/react`/`@types/react-dom` version**, or
`web-v2` fails to typecheck against two copies of the React types. See AGENTS.md.

## Things worth knowing before editing

- TypeScript runs with `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, and
  `noUnusedParameters`. Array and record indexing yields `T | undefined`; handle it rather
  than asserting. Reach for a real type before reaching for `any`.
- Inside `packages/ui` the `@/*` alias does not resolve — use relative imports.
- Tailwind is **v4 and configured in CSS** — the theme is the `@theme` block in
  `apps/web/app/globals.css`, and the `@source` directive there covers `packages/ui/src`, so a
  class that only appears in the UI package is still scanned. There is no `tailwind.config.ts`.
- Data lives in **Neon Postgres, accessed through Drizzle** (`apps/web/lib/db/`). Migrations
  are generated: `pnpm db:generate` then `pnpm db:migrate`, both run from `apps/web`.
  **The read happens at build time only** — `/blog` is rendered during `next build` and baked
  into `out/`, so publishing a post is a deploy, not a database write.
- `apps/web/.env` is git-ignored; copy `apps/web/.env.example`. With `DATABASE_URL` unset,
  `/blog` falls back to the seeded posts in `lib/posts.ts` and the build still succeeds.
- **`apps/web` has no API routes.** A static export cannot accept a POST, so `/api/contact`,
  `/api/posts` and `lib/rate-limit.ts` are gone. The contact form POSTs to a third-party
  endpoint (`NEXT_PUBLIC_CONTACT_ENDPOINT`) and falls back to a prefilled `mailto:` when that
  is unset. Do not add a `route.ts` here without also removing `output: 'export'`.
