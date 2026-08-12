# AGENTS.md

Guidance for coding agents (Codex and friends) working in this repository.

## What this is

A personal portfolio site, built as a **Turborepo monorepo** using **pnpm workspaces**.
Everything is TypeScript in `strict` mode — there is no JavaScript source left, and new
code should not introduce any.

```
apps/
  web/                    Next.js 16 App Router site, Postgres-backed, deploys to Vercel
  web-v2/                 Next.js 15 statically exported site, moved here from the v1 repo
packages/
  ui/                     @portfolio/ui — shared shadcn/ui component library
  eslint-config/          @portfolio/eslint-config — shared ESLint presets
  typescript-config/      @portfolio/typescript-config — shared tsconfig bases
```

**The two apps are independent.** They share the repository, the lockfile, and Turborepo —
nothing else. `web-v2` does not consume `@portfolio/ui`, the shared ESLint preset, or the
shared tsconfig bases; it carries the toolchain it arrived with. Read
[apps/web-v2/CLAUDE.md](./apps/web-v2/CLAUDE.md) before editing anything under `apps/web-v2`,
and treat the conventions in *this* file as describing `apps/web` unless stated otherwise.

## Commands

Run these from the repo root; Turborepo fans them out to the workspaces.

```bash
pnpm install          # install everything (pnpm only -- do not use npm or yarn)
pnpm dev              # start the dev server on http://localhost:3000
pnpm build            # production build
pnpm check-types      # tsc --noEmit across all workspaces
pnpm lint             # lint across all workspaces (ESLint in web, Biome in web-v2)
pnpm test             # unit tests -- only web-v2 has any
pnpm format           # prettier --write (skips apps/web-v2; Biome formats that one)
```

To target one workspace: `pnpm --filter web <script>`, `pnpm --filter web-v2 <script>`, or
`pnpm --filter @portfolio/ui <script>`.

`pnpm dev` starts both apps: `web` on **3000**, `web-v2` on **3001**. The port split is the
only reason `web-v2`'s `dev` and `start` scripts differ from the ones it had as a standalone
repo — do not "restore" them to 3000.

`apps/web-v2` also carries gates that are not wired into the Turborepo task graph, because
each needs a completed export in `apps/web-v2/out/` first. Run them from that directory after
`pnpm build`: `pnpm check:export`, `pnpm check:links`, `pnpm check:contrast`, `pnpm size`,
`pnpm test:e2e`, `pnpm lh`.

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

**Tailwind is v4, configured in CSS.** There is no `tailwind.config.ts` — the theme lives in
the `@theme` block of `apps/web/app/globals.css`, and an `@source` directive there points at
`../../packages/ui/src/**` so class names in the UI package are still scanned. Add design
tokens as CSS custom properties inside `@theme`, not as a JS config object. The enter/exit
animation utilities (`animate-in`, `slide-in-from-*`) come from `tw-animate-css`, imported at
the top of that file — Tailwind v4 has no `tailwindcss-animate` plugin.

**Components are shadcn/ui (new-york style).** `components.json` is configured with
`"tsx": true` and aliases pointing at `@portfolio/ui`, so `pnpm dlx shadcn@latest add <name>` will
land new components in the right place.

## Before you finish

Run `pnpm check-types` and `pnpm build`. Both must pass. `pnpm lint` should not introduce new
warnings.

## Deployment

Two apps, two deployment models. Keep them straight — the configs are not interchangeable,
and they now sit in the same repository where they can be copied between by accident.

### apps/web — Vercel

**This deploys to Vercel, not GitHub Pages** — despite the `rahul-rocket-v2.github.io`
repository name. The repo is the source of truth; GitHub Pages is not enabled on it.

That distinction is load-bearing. The site needs a server: `/api/contact` and `/api/posts`
are route handlers, `/blog` is `force-dynamic` and reads from Postgres, and rate limiting
writes to the database on every request. Setting `output: 'export'` would drop the API routes
at build time and the contact form would go back to silently discarding messages.

`apps/web-v2` *is* a static export, and its `next.config.mjs` sets `output: 'export'`,
`trailingSlash: true` and `images.unoptimized`. Those settings are correct there and wrong
here. Do not copy them into `apps/web`: this app needs a server — `/api/contact` and
`/api/posts` are route handlers, `/blog` is `force-dynamic`, and rate limiting writes to the
database on every request. Under `output: 'export'` the API routes are dropped at build time
and the contact form goes back to silently discarding messages.

On Vercel, set **Root Directory** to `apps/web`; the build then runs inside the workspace and
Turborepo resolves `@portfolio/*` from the repo root. `DATABASE_URL` and `IP_HASH_SALT` must
be set as project environment variables.

### apps/web-v2 — static export

`pnpm --filter web-v2 build` runs `next build`, then generates OG cards and the RSS/Atom/JSON
feeds, all into `apps/web-v2/out/`. That directory is the entire deployable artifact; there is
no server and no database.

**No deployment is wired up for it in this repository.** The v1 repo published it to GitHub
Pages from a workflow, and that workflow was deliberately *not* copied here — pointing a Pages
deployment at this repo would publish `web-v2` at a URL this repo does not own, and
`apps/web-v2/src/config/site.ts` still declares `url: 'https://rahul-rocket.github.io'`.
Choosing where this app lives now is an open decision, not an oversight; the original repo
keeps serving it in the meantime. Whoever makes that call must update `site.url` in the same
change, because canonicals, feeds, sitemap and OG tags are all built from it.

Note that `site.indexable` is `false`, which is what keeps `noindex` on every route. It is an
editorial switch, not a build flag — see the comment on it before touching it.

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
- **Brand logos are local, in `apps/web/components/brand-icons.tsx`.** lucide-react removed its
  brand icon set in v1, so `Github`, `Linkedin`, and `Twitter` are hand-rolled SVGs there.
  Everything else still comes from `lucide-react`. Do not re-import the brand names from lucide
  — they do not exist.
- **`next lint` was removed in Next 16.** `apps/web` lints through `eslint` directly. The web
  workspace deliberately does *not* pass `--max-warnings 0` (it carries pre-existing
  `react/no-unescaped-entities` and `no-img-element` warnings); `packages/ui` does.
- **ESLint is held at 8.** `eslint-config-next` is therefore pinned to `^15`, because v16
  requires ESLint >= 9. Moving to ESLint 9/10 means converting `packages/eslint-config` from
  `.eslintrc` objects to flat config; do the two together or not at all.
- The root `tests/` directory holds only an empty Python `__init__.py`. `apps/web` has no test
  runner wired up — `pnpm test` runs `apps/web-v2`'s Vitest suite and nothing else.

## apps/web-v2 gotchas

The full guide for that app is [apps/web-v2/CLAUDE.md](./apps/web-v2/CLAUDE.md), carried over
from the v1 repository. What follows is only what changed by moving it into this monorepo.

- **Both apps must pin the same `@types/react` and `@types/react-dom` version.** This is not a
  style preference, it is a build constraint. pnpm hoists one copy of each type package into
  `node_modules/.pnpm/node_modules/@types`, and Next's own `.d.ts` files resolve `react` from
  there rather than from the workspace that imported them. With two versions installed, one
  program ends up with two `React.Ref` / `VoidOrUndefinedOnly` types of the same name and every
  prop spread onto an intrinsic element fails to typecheck — nine errors in components that are
  correct. `web-v2` arrived pinned to 19.0.7/19.0.3 and was moved onto `web`'s 19.2.18/19.2.4
  for exactly this reason. Bump them together or not at all.
- **Biome formats and lints `apps/web-v2`; Prettier and ESLint do not touch it.** Tabs, single
  quotes, 80 columns, semicolons as needed. `apps/web-v2` is listed in `.prettierignore` — the
  two formatters disagree on every one of those settings, so running both would rewrite the
  whole app on each `pnpm format`. Its four `noDescendingSpecificity` CSS warnings are
  pre-existing and identical to what the v1 repo reports; `biome check` still exits 0.
- **It does not use the shared packages.** No `@portfolio/ui`, no `@portfolio/eslint-config`,
  no `@portfolio/typescript-config`. Its `@/*` alias points at `apps/web-v2/src` (not the app
  root, as in `web`), and it has a second alias `@content/*` for the typed content records.
  Its tsconfig is stricter than the shared base in places — `verbatimModuleSyntax` and
  `noImplicitOverride` are on.
- **Repo-level tooling from v1 was left behind on purpose:** its `.npmrc`, `.nvmrc`,
  `pnpm-lock.yaml`, `.husky/`, `commitlint.config.mjs`, the `lint-staged` block, and
  `.github/workflows/`. Those are the monorepo root's concern, and this root does not use
  husky or commitlint. Note that v1's `.npmrc` set `strict-peer-dependencies=true` and
  `node-linker=isolated` while this root sets the opposite, so `web-v2` now installs under
  looser peer resolution than it was developed with.
- **CI is not wired up for it.** v1's `ci.yml` and `deploy-pages.yml` were not copied. Nothing
  runs its E2E suite, Lighthouse budgets, or export gates automatically — run them by hand
  (see Commands) until a workflow exists.
- **Its E2E suite needs a matching browser build.** `@playwright/test` is pinned to 1.49.1 and
  expects Chromium 1148. A container with a different build fails at launch with
  `Executable doesn't exist`, which is an environment mismatch, not a broken suite. The
  `command palette › the theme action…` spec is timing-sensitive and flakes roughly one run in
  three; it is not a regression from the move.
