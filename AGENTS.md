# AGENTS.md

Guidance for coding agents (Codex and friends) working in this repository.

## What this is

A personal portfolio site, built as a **Turborepo monorepo** using **pnpm workspaces**.
Everything is TypeScript in `strict` mode — there is no JavaScript source left, and new
code should not introduce any.

```
apps/
  web/                    Next.js 14 App Router site (the only app)
packages/
  ui/                     @portfolio/ui — shared shadcn/ui component library
  eslint-config/          @portfolio/eslint-config — shared ESLint presets
  typescript-config/      @portfolio/typescript-config — shared tsconfig bases
```

## Commands

Run these from the repo root; Turborepo fans them out to the workspaces.

```bash
pnpm install          # install everything (pnpm only -- do not use npm or yarn)
pnpm dev              # start the dev server on http://localhost:3000
pnpm build            # production build
pnpm check-types      # tsc --noEmit across all workspaces
pnpm lint             # eslint across all workspaces
pnpm format           # prettier --write
```

To target one workspace: `pnpm --filter web <script>` or `pnpm --filter @portfolio/ui <script>`.

## Conventions

**Package manager is pnpm.** The root `packageManager` field pins the version. Adding a
dependency with npm or yarn will produce a lockfile the repo does not use.

**TypeScript is strict.** `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and
`noUnusedParameters` are all on (see `packages/typescript-config/base.json`). Prefer fixing
the type over reaching for `any` or a non-null assertion. Indexed access returns
`T | undefined` — handle it rather than asserting it away.

**Imports.**
- Inside `apps/web`, the `@/*` alias maps to the app root (`@/lib/types`, `@/components/navbar`).
- Shared UI comes from the workspace package: `import { Button } from "@portfolio/ui/button"`,
  `import { cn } from "@portfolio/ui/lib/utils"`. Do **not** deep-import into `packages/ui/src`.
- Inside `packages/ui`, use relative imports (`../lib/utils`) — the `@/*` alias does not
  resolve there.

**`packages/ui` ships TypeScript source, not a build.** Next compiles it via
`transpilePackages: ["@portfolio/ui"]` in `apps/web/next.config.js`. Adding a new component means
adding a file under `packages/ui/src/components/` — the `exports` map picks it up by wildcard.

**Tailwind** config lives at `apps/web/tailwind.config.ts` and its `content` globs already
include `../../packages/ui/src/**`. Class names in the UI package are scanned from there.

**Components are shadcn/ui (new-york style).** `components.json` is configured with
`"tsx": true` and aliases pointing at `@portfolio/ui`, so `pnpm dlx shadcn@latest add <name>` will
land new components in the right place.

## Before you finish

Run `pnpm check-types` and `pnpm build`. Both must pass. `pnpm lint` should not introduce new
warnings.

## Deployment

**This deploys to Vercel, not GitHub Pages** — despite the `rahul-rocket-v2.github.io`
repository name. The repo is the source of truth; GitHub Pages is not enabled on it.

That distinction is load-bearing. The site needs a server: `/api/contact` and `/api/posts`
are route handlers, `/blog` is `force-dynamic` and reads from Postgres, and rate limiting
writes to the database on every request. Setting `output: 'export'` would drop the API routes
at build time and the contact form would go back to silently discarding messages.

The sibling repo `rahul-rocket.github.io` (v1) *is* a static export on GitHub Pages. Do not
carry its `next.config.js` patterns — `output: 'export'`, `trailingSlash`, `images.unoptimized`
— into this one. They solve a problem this repo does not have.

On Vercel, set **Root Directory** to `apps/web`; the build then runs inside the workspace and
Turborepo resolves `@portfolio/*` from the repo root. `DATABASE_URL` and `IP_HASH_SALT` must
be set as project environment variables.

## Notes and gotchas

- **Database is Neon Postgres via Drizzle**, not MongoDB. Schema lives in
  `apps/web/lib/db/schema.ts`, the client in `apps/web/lib/db/index.ts`, migrations in
  `apps/web/drizzle/`. Two tables: `contact_submissions` and `posts`. After changing the
  schema run `pnpm db:generate` (writes SQL) then `pnpm db:migrate` (applies it) from
  `apps/web`. Never hand-edit a generated migration that has already been applied.
- `apps/web/.env` is git-ignored; `apps/web/.env.example` is the tracked template. Add any new
  variable to the template in the same change that introduces it. Use Neon's **pooled**
  connection string (host contains `-pooler`).
- With `DATABASE_URL` unset, `/blog` falls back to `seedPosts` in `apps/web/lib/posts.ts` so
  dev and build work offline. That fallback only covers *missing config* — a query that fails
  against a configured database is left to throw. Do not widen it into a `try/catch`.
- `POST /api/contact` has no such fallback; it returns 500 without a database. That is
  deliberate, not a bug to "fix".
- **Both API routes are rate limited** by `apps/web/lib/rate-limit.ts` — a fixed-window
  counter in the `rate_limits` table, keyed by a salted hash of the client IP. Contact is
  5/hour, posts 60/minute (`RATE_LIMITS`). The increment is a single `INSERT ... ON CONFLICT
  DO UPDATE`, which is what makes it atomic; do not rewrite it as read-then-write. It **fails
  open** on database errors by design — a broken counter must not take the contact form down.
  With `DATABASE_URL` unset it is skipped entirely, so limits do not apply in local dev.
- `IP_HASH_SALT` should be set in production. Without it the stored IP hashes are reversible
  by brute force, since the IPv4 space is small enough to enumerate.
- `tests/` currently holds only an empty Python `__init__.py`. There is no test runner wired
  up; do not assume `pnpm test` exists.
